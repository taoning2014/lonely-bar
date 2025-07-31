export default class DirectedEdge {
    #v: number;
    #w: number;
    #weight: number;

    constructor(v: number, w: number, weight: number) {
        if (!Number.isInteger(v) || !Number.isInteger(w) || !Number.isFinite(weight)) {
            throw new Error('Invalid parameters: v and w must be integers, weight must be a non-negative finite number');
        }

        if (v < 0 || w < 0 || weight < 0) {
            throw new Error('Vertex indices and weight must be non-negative');
        }

        this.#v = v;
        this.#w = w;
        this.#weight = weight;
    }

    get from(): number {
        return this.#v;
    }

    get to(): number {
        return this.#w;
    }

    get weight(): number {
        return this.#weight;
    }

    toString(): string {
        return `${this.#v} -> ${this.#w} (${this.#weight})`;
    }
}   