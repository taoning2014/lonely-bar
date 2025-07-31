import Picture from './picture';
import Color from './color';
import EdgeWeightedDigraph from './graph/edge-weighted-digraph';
import DirectedEdge from './graph/directed-edge';
import FindShortestPath from './graph/find-shortest-path';

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
        const digraph = new EdgeWeightedDigraph(this.width * this.height + 2);

        const sourceIndex = this.width * this.height;
        const targetIndex = sourceIndex + 1;

        for (let row = 0; row < this.height; row++) {
            // Add source to the first row
            digraph.addEdge(new DirectedEdge(sourceIndex, row * this.width, 0));
            // Add last row to the target
            digraph.addEdge(new DirectedEdge(row * this.width + this.width - 1, targetIndex, this.energy(this.width - 1, row)));
        }

        // Add the vertex between source and target
        for (let col = 0; col < this.width; col++) {
            for (let row = 0; row < this.height; row++) {
                if (row > 0) {
                    // Connect to the pixel above
                    digraph.addEdge(new DirectedEdge(row * this.width + col, (row - 1) * this.width + col + 1, this.energy(col, row)));
                }
                // Connect to the pixel to the right
                digraph.addEdge(new DirectedEdge(row * this.width + col, row * this.width + col + 1, this.energy(col, row)));
                if (row < this.height - 1) {
                    // Connect to the pixel below
                    digraph.addEdge(new DirectedEdge(row * this.width + col, (row + 1) * this.width + col + 1, this.energy(col, row)));
                }
            }
        }

        const result = new Array(this.width).fill(0);
        let index = 0;
        const shortestPath = new FindShortestPath(digraph, sourceIndex).pathTo(targetIndex);
        for (const edge of shortestPath) {
            if (edge.to === targetIndex) {
                break;
            }
            result[index++] = edge.to % this.width;
        }

        return result;
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

    // debug function to print energy matrix
    public debugPrintEnergyMatrix(): void {
        console.log('Energy Matrix:');
        for (let y = 0; y < this.height; y++) {
            const row = [];
            for (let x = 0; x < this.width; x++) {
                row.push(this.energy(x, y).toFixed(2).padStart(8));
            }
            console.log(row.join(' '));
        }
    }
}