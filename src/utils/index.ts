import Cropper from 'cropperjs';
import { SeamCarver } from './seam-carver';
import Picture from './picture/picture';

type SeamDirection = 'horizontal' | 'vertical';

function removeSeam(cropper: Cropper, direction: SeamDirection) {
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
}

export function removeHorizontalSeam(cropper: Cropper) {
    removeSeam(cropper, 'horizontal');
}

export function removeVerticalSeam(cropper: Cropper) {
    removeSeam(cropper, 'vertical');
}