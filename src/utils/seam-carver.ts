import Picture from './picture/picture';
import Color from './picture/color';
import EdgeWeightedDigraph from './graph/edge-weighted-digraph';
import DirectedEdge from './graph/directed-edge';
import FindShortestPath from './graph/find-shortest-path';

export class SeamCarver {
    #picture!: Picture;

    constructor(picture: Picture) {
        if (!(picture instanceof Picture)) {
            throw new Error('Invalid picture object');
        }
        this.#picture = picture.copy();
    }

    get picture(): Picture {
        return this.#picture;
    }

    get width(): number {
        return this.#picture.width;
    }

    get height(): number {
        return this.#picture.height;
    }

    /**
     * Energy calculation is a measure of the importance of each pixel—the higher the energy, the less likely that the
     * pixel will be included as part of a seam. This class implements the dual-gradient energy function. The energy is
     * high for pixels in the image where there is a rapid color gradient (such as the boundary between two objects).
     * The seam-carving technique avoids removing such high-energy pixels.
     * @param x - The x-coordinate of the pixel.
     * @param y - The y-coordinate of the pixel.
     * @returns The energy of the pixel.
     */
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

    /**
     * Seam identification. Find a horizontal seam of minimum total energy. This is similar to the classic shortest path
     * problem in an edge-weighted digraph except for the following:
     * - The weights are on the vertices instead of the edges.
     * - We want to find the shortest path from any of the W pixels in the left most column to any of the W pixels in 
     *   the right most column.
     * - The digraph is acyclic, where there is a right edge from pixel (x, y) to pixels (x + 1, y - 1), (x + 1, y),
     *   and (x + 1, y + 1), assuming that the coordinates are in the prescribed range.
     * @returns sequence of indices for vertical seam
     */
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
        for (let col = 0; col < this.width - 1; col++) {
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
            result[index++] = Math.floor(edge.to / this.width);
        }

        return result;
    }

    /**
     * Seam identification. Find a vertical seam of minimum total energy. This is similar to the classic shortest path
     * problem in an edge-weighted digraph except for the following:
     * - The weights are on the vertices instead of the edges.
     * - We want to find the shortest path from any of the W pixels in the top row to any of the W pixels in the bottom.
     * - The digraph is acyclic, where there is a downward edge from pixel (x, y) to pixels (x − 1, y + 1), (x, y + 1),
     *   and (x + 1, y + 1), assuming that the coordinates are in the prescribed range.
     * @returns sequence of indices for vertical seam
     */
    public findVerticalSeam(): number[] {
        const digraph = new EdgeWeightedDigraph(this.width * this.height + 2);

        const sourceIndex = this.width * this.height;
        const targetIndex = sourceIndex + 1;

        for (let col = 0; col < this.width; col++) {
            // Add source to the first column (top row)
            digraph.addEdge(new DirectedEdge(sourceIndex, col, 0));
            // Add last column (bottom row) to the target
            digraph.addEdge(new DirectedEdge((this.height - 1) * this.width + col, targetIndex, this.energy(col, this.height - 1)));
        }

        // Add the vertex between source and target
        for (let row = 0; row < this.height - 1; row++) {
            for (let col = 0; col < this.width; col++) {
                if (col > 0) {
                    // Connect to the pixel to the left in the next row
                    digraph.addEdge(new DirectedEdge(row * this.width + col, (row + 1) * this.width + col - 1, this.energy(col, row)));
                }
                // Connect to the pixel directly below
                digraph.addEdge(new DirectedEdge(row * this.width + col, (row + 1) * this.width + col, this.energy(col, row)));
                if (col < this.width - 1) {
                    // Connect to the pixel to the right in the next row
                    digraph.addEdge(new DirectedEdge(row * this.width + col, (row + 1) * this.width + col + 1, this.energy(col, row)));
                }
            }
        }

        const result = new Array(this.height).fill(0);
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

    public removeHorizontalSeam(seam: number[]): void {
        console.time('removeHorizontalSeam');

        if (seam.length !== this.width) {
            throw new Error('Invalid seam length for horizontal seam removal');
        }

        this.#picture.removeHorizontalSeam(seam);

        console.timeEnd('removeHorizontalSeam');
    }

    public removeVerticalSeam(seam: number[]): void {
        console.time('removeVerticalSeam');

        if (seam.length !== this.height) {
            throw new Error('Invalid seam length for vertical seam removal');
        }

        this.#picture.removeVerticalSeam(seam);

        console.timeEnd('removeVerticalSeam');
    }

    public highlightHorizontalSeam(seam: number[]): void {
        if (seam.length !== this.width) {
            throw new Error('Invalid seam length for horizontal seam highlighting');
        }

        this.#picture.highlightHorizontalSeam(seam);
    }

    public highlightVerticalSeam(seam: number[]): void {
        if (seam.length !== this.height) {
            throw new Error('Invalid seam length for vertical seam highlighting');
        }

        this.#picture.highlightVerticalSeam(seam);
    }

    /**
     * Prints the energy matrix for debugging purposes.
     */
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