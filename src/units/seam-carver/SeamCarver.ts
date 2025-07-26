import Picture from './Picture';
import Color from './Color';

export class SeamCarver {
    #picture!: Picture;

    // create a seam carver object based on the given picture
    constructor(picture: Picture) {
        if (!(picture instanceof Picture)) {
            throw new Error('Invalid picture object');
        }
        this.#picture = picture;
    }

    // current picture
    get picture(): Picture {
        return this.picture;
    }

    // width of current picture
    get width(): number {
        return this.#picture.width;
    }

    // height of current picture
    get height(): number {
        return this.#picture.height;
    }

    // energy of pixel at column x and row y
    public energy(x: number, y: number): number {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            throw new Error('Coordinates out of bounds');
        }

        // case 1: if it is on the border
        if (x === 0 || x === this.width - 1 || y === 0 || y === this.height - 1) {
            return 1000; // border energy
        }

        // case 2: if it is inside the border
        const deltaX = this.#getDelta(this.#picture.get(x - 1, y), this.#picture.get(x + 1, y));
        const deltay = this.#getDelta(this.#picture.get(x, y - 1), this.#picture.get(x, y + 1));
        return Math.sqrt(deltaX + deltay);
    }

    #getDelta(color1: Color, color2: Color): number {
        const rDiff = color1.r - color2.r;
        const gDiff = color1.g - color2.g;
        const bDiff = color1.b - color2.b;
        return rDiff * rDiff + gDiff * gDiff + bDiff * bDiff;
    }

    // sequence of indices for horizontal seam
    public findHorizontalSeam(): number[] {
        return [];
    }

    // sequence of indices for vertical seam
    public findVerticalSeam(): number[] {
        return [];
    }

    // remove horizontal seam from current picture
    public removeHorizontalSeam(seam: number[]): void {

    }

    // remove vertical seam from current picture
    public removeVerticalSeam(seam: number[]): void {

    }
}