import Cropper from 'cropperjs';
import { SeamCarver } from './seam-carver';
import Picture from './picture';

export function removeHorizontalSeam(cropper: Cropper) {
    /**
     * Steps:
     * 1. Convert cropper's canvas to a Picture object.
     * 2. Create a SeamCarver instance with the Picture.
     * 3. Find the horizontal seam using SeamCarver's method.
     * 4. Remove the horizontal seam from the Picture.
     * 5. Update the cropper's canvas with the modified Picture.
     * 6. Refresh the cropper to reflect the changes.
     * 7. Refactor the common code into a utility function for both horizontal and vertical seam removal.
     */
    console.log('Removing horizontal seam');
    const canvas = cropper.getCroppedCanvas({ imageSmoothingEnabled: false, });
    const picture = new Picture(canvas);
    const seamCarver = new SeamCarver(picture);
    seamCarver.debugPrintEnergyMatrix();
    // const horizontalSeam = seamCarver.findHorizontalSeam();
    // console.log('Horizontal seam:', horizontalSeam);
}

export function removeVerticalSeam(cropper: Cropper) {
    console.log('Removing vertical seam');
}