import Color from './Color';

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
}