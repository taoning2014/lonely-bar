import EdgeWeightedDigraph from "./edge-weighted-digraph";
import DirectedEdge from "./directed-edge";
import TopologicalSort from "./topological-sort";

export default class FindShortestPath {
    #edgeTo: DirectedEdge[];
    #distTo: number[];

    constructor(G: EdgeWeightedDigraph, s: number) {
        if (s < 0 || s >= G.V) {
            throw new Error('Source vertex index out of bounds');
        }

        this.#edgeTo = new Array(G.V).fill(null);
        this.#distTo = new Array(G.V).fill(Number.POSITIVE_INFINITY);
        this.#distTo[s] = 0;

        const topologicalOrder = new TopologicalSort(G).order;
        for (const v of topologicalOrder) {
            for (const edge of G.adj(v)) {
                this.relax(edge);
            }
        }
    }

    relax(edge: DirectedEdge) {
        const v = edge.from;
        const w = edge.to;
        if (this.#distTo[w] > this.#distTo[v] + edge.weight) {
            this.#distTo[w] = this.#distTo[v] + edge.weight;
            this.#edgeTo[w] = edge;
        }
    }

    distTo(v: number): number {
        if (v < 0 || v >= this.#distTo.length) {
            throw new Error('Vertex index out of bounds');
        }
        return this.#distTo[v];
    }

    pathTo(v: number): DirectedEdge[] {
        if (v < 0 || v >= this.#edgeTo.length) {
            throw new Error('Vertex index out of bounds');
        }

        const path: DirectedEdge[] = [];
        for (let e = this.#edgeTo[v]; e !== null; e = this.#edgeTo[e.from]) {
            path.push(e);
        }

        return path.reverse();
    }
}