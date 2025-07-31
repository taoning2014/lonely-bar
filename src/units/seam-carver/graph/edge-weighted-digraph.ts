import DirectedEdge from './directed-edge';

export default class EdgeWeightedDigraph {
    #V: number;
    #E: number;
    #adj: DirectedEdge[][];

    constructor(V: number) {
        if (!Number.isInteger(V) || V < 0) {
            throw new Error('Number of vertices must be a non-negative integer');
        }
        this.#V = V;
        this.#E = 0;
        this.#adj = [];
        for (let v = 0; v < V; v++) {
            this.#adj[v] = [];
        }
    }

    get V(): number {
        return this.#V;
    }

    get E(): number {
        return this.#E;
    }

    addEdge(e: DirectedEdge): void {
        if (!(e instanceof DirectedEdge)) {
            throw new Error('Invalid edge object');
        }
        if (e.from < 0 || e.from >= this.#V || e.to < 0 || e.to >= this.#V) {
            throw new Error('Vertex indices out of bounds');
        }
        if (e.weight < 0) {
            throw new Error('Edge weight must be non-negative');
        }

        const v = e.from;
        const w = e.to;
        this.#adj[v].push(e);
        this.#E++;
    }

    adj(v: number): DirectedEdge[] {
        if (v < 0 || v >= this.#V) {
            throw new Error('Vertex index out of bounds');
        }
        return this.#adj[v];
    }

    toString(): string {
        let result = `EdgeWeightedDigraph with ${this.#V} vertices and ${this.#E} edges:\n`;
        for (let v = 0; v < this.#V; v++) {
            result += `  ${v}: ${this.adj(v).join(', ')}\n`;
        }
        return result;
    }

}