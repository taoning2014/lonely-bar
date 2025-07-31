import Cropper from 'cropperjs';
import { SeamCarver } from './seam-carver';
import Picture from './picture';

export function removeHorizontalSeam(cropper: Cropper) {
    console.log('Removing horizontal seam');
    
    // 1. Convert cropper's canvas to a Picture object
    const canvas = cropper.getCroppedCanvas({ imageSmoothingEnabled: false });
    const picture = new Picture(canvas);
    const seamCarver = new SeamCarver(picture);
    
    // 2. Find the horizontal seam
    const horizontalSeam = seamCarver.findHorizontalSeam();
    console.log('Horizontal seam:', horizontalSeam);
    
    // 3. Remove the horizontal seam from the Picture
    seamCarver.removeHorizontalSeam(horizontalSeam);
    
    // 4. Convert the modified picture back to canvas
    const modifiedCanvas = picture.toCanvas();
    
    // 5. Update the cropper with the new image
    const dataURL = modifiedCanvas.toDataURL();
    cropper.replace(dataURL);
    
    console.log(`Removed horizontal seam. New dimensions: ${picture.width}x${picture.height}`);
}

export function removeVerticalSeam(cropper: Cropper) {
    console.log('Removing vertical seam');
    
    // 1. Convert cropper's canvas to a Picture object
    const canvas = cropper.getCroppedCanvas({ imageSmoothingEnabled: false });
    const picture = new Picture(canvas);
    const seamCarver = new SeamCarver(picture);
    
    // 2. Find the vertical seam
    const verticalSeam = seamCarver.findVerticalSeam();
    console.log('Vertical seam:', verticalSeam);
    
    // 3. Remove the vertical seam from the Picture
    seamCarver.removeVerticalSeam(verticalSeam);
    
    // 4. Convert the modified picture back to canvas
    const modifiedCanvas = picture.toCanvas();
    
    // 5. Update the cropper with the new image
    const dataURL = modifiedCanvas.toDataURL();
    cropper.replace(dataURL);
    
    console.log(`Removed vertical seam. New dimensions: ${picture.width}x${picture.height}`);
}