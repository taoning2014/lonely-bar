import EdgeWeightedDigraph from './edge-weighted-digraph';

export default class TopologicalSort {
    #marked: boolean[];
    #reversePost: number[];

    constructor(digraph: EdgeWeightedDigraph) {
        this.#marked = new Array(digraph.V).fill(false);
        this.#reversePost = [];

        for (let v = 0; v < digraph.V; v++) {
            if (!this.#marked[v]) {
                this.dfs(digraph, v);
            }
        }
    }

    dfs(digraph: EdgeWeightedDigraph, v: number) {
        this.#marked[v] = true;
        for (const edge of digraph.adj(v)) {
            const w = edge.to;
            if (!this.#marked[w]) {
                this.dfs(digraph, w);
            }
        }
        this.#reversePost.push(v);
    }

    get order(): number[] {
        return this.#reversePost.reverse();
    }
}