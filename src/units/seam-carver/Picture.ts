import Color from './color';

export default class Picture {
    private w!: number;
    private h!: number;
    private pixArray!: [number, number, number][][]; // pixArray[y][x] = [r, g, b]

    constructor(croppedCanvas: HTMLCanvasElement) {
        this.w = croppedCanvas.width;
        this.h = croppedCanvas.height;

        const ctx = croppedCanvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get canvas context');
        }

        const imageData = ctx.getImageData(0, 0, this.w, this.h);
        const data = imageData.data;

        this.pixArray = new Array(this.h);
        for (let y = 0; y < this.h; y++) {
            this.pixArray[y] = [];
            for (let x = 0; x < this.w; x++) {
                const index = (y * this.w + x) * 4;
                const r = data[index];
                const g = data[index + 1];
                const b = data[index + 2];
                this.pixArray[y][x] = [r, g, b];
            }
        }
    }

    get width(): number {
        return this.w;
    }

    get height(): number {
        return this.h;
    }

    get(x: number, y: number): Color {
        const [r, g, b] = this.pixArray[y][x];
        return new Color(r, g, b);
    }

    getRGB(x: number, y: number): void {
    }

    setRGB(x: number, y: number, rgb: number): void {
    }

    // Remove horizontal seam from the picture
    removeHorizontalSeam(seam: number[]): void {
        if (seam.length !== this.w) {
            throw new Error('Invalid seam length for horizontal seam removal');
        }

        // Create new pixel array with reduced height
        const newPixArray: [number, number, number][][] = new Array(this.h - 1);
        
        for (let x = 0; x < this.w; x++) {
            const seamRow = seam[x]; // Row to remove for this column
            let newY = 0;
            
            for (let y = 0; y < this.h; y++) {
                if (y !== seamRow) {
                    if (!newPixArray[newY]) {
                        newPixArray[newY] = [];
                    }
                    newPixArray[newY][x] = this.pixArray[y][x];
                    newY++;
                }
            }
        }

        this.pixArray = newPixArray;
        this.h = this.h - 1;
    }

    // Remove vertical seam from the picture
    removeVerticalSeam(seam: number[]): void {
        if (seam.length !== this.h) {
            throw new Error('Invalid seam length for vertical seam removal');
        }

        // Create new pixel array with reduced width
        const newPixArray: [number, number, number][][] = new Array(this.h);
        
        for (let y = 0; y < this.h; y++) {
            const seamCol = seam[y]; // Column to remove for this row
            newPixArray[y] = [];
            let newX = 0;
            
            for (let x = 0; x < this.w; x++) {
                if (x !== seamCol) {
                    newPixArray[y][newX] = this.pixArray[y][x];
                    newX++;
                }
            }
        }

        this.pixArray = newPixArray;
        this.w = this.w - 1;
    }

    // Convert picture back to canvas
    toCanvas(): HTMLCanvasElement {
        const canvas = document.createElement('canvas');
        canvas.width = this.w;
        canvas.height = this.h;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
            throw new Error('Failed to get canvas context');
        }

        const imageData = ctx.createImageData(this.w, this.h);
        const data = imageData.data;

        for (let y = 0; y < this.h; y++) {
            for (let x = 0; x < this.w; x++) {
                const index = (y * this.w + x) * 4;
                const [r, g, b] = this.pixArray[y][x];
                data[index] = r;     // Red
                data[index + 1] = g; // Green
                data[index + 2] = b; // Blue
                data[index + 3] = 255; // Alpha (fully opaque)
            }
        }

        ctx.putImageData(imageData, 0, 0);
        return canvas;
    }
}