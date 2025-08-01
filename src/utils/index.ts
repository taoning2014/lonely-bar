import Cropper from 'cropperjs';
import { SeamCarver } from './seam-carver';
import Picture from './picture/picture';

type SeamDirection = 'horizontal' | 'vertical';

async function removeSeam(cropper: Cropper, direction: SeamDirection) {
    return new Promise<void>((resolve) => {
        /**
         * The setTimeout with 0 delay serves an important purpose for UI responsiveness.
         * 
         * When seam carving algorithms run, they perform computationally intensive operations:
         * - Energy function calculations across all pixels
         * - Graph construction and shortest path finding
         * - Canvas manipulation and image processing
         * 
         * Without setTimeout, these synchronous operations would block the main JavaScript thread, meaning:
         * 
         * 1. UI freezes - The spinner icon wouldn't appear because the DOM can't update
         * 2. Button states don't change - The disabled state wouldn't be visible to users
         * 3. Browser becomes unresponsive - No other UI interactions work during processing
         * 
         * The setTimeout(..., 0) creates a microtask that:
         * - Allows the current call stack to complete
         * - Lets Vue update the DOM (show spinner, disable buttons)
         * - Gives the browser a chance to render these changes
         * - Then executes the heavy seam carving computation
         * 
         * This is a common pattern called "yielding to the event loop" that ensures the UI remains responsive during heavy computations.
         * 
         * Without it, users would click the button but see no immediate feedback, making them think it didn't work and click again - exactly the race condition we're trying to prevent.
         * 
         * A more robust solution would be using Web Workers for the heavy computation, but setTimeout is a simpler approach that achieves the same UI responsiveness goal.
         */
        setTimeout(() => {
            const canvas = cropper.getCroppedCanvas({ imageSmoothingEnabled: false });
            const picture = new Picture(canvas);
            const seamCarver = new SeamCarver(picture);

            const seam = direction === 'horizontal'
                ? seamCarver.findHorizontalSeam()
                : seamCarver.findVerticalSeam();

            if (direction === 'horizontal') {
                seamCarver.highlightHorizontalSeam(seam);
            } else {
                seamCarver.highlightVerticalSeam(seam);
            }

            const modifiedCanvas = seamCarver.picture.toCanvas();
            const dataURL = modifiedCanvas.toDataURL();
            cropper.replace(dataURL);
            resolve();
        }, 0);
    });
}

export async function removeHorizontalSeam(cropper: Cropper) {
    return removeSeam(cropper, 'horizontal');
}

export async function removeVerticalSeam(cropper: Cropper) {
    return removeSeam(cropper, 'vertical');
}