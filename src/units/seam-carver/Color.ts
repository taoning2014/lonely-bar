export default class Color {
    private red!: number;
    private green!: number;
    private blue!: number;

    constructor(red: number, green: number, blue: number) {
        this.red = red;
        this.green = green;
        this.blue = blue;
    }
    get r(): number {
        return this.red;
    }

    get g(): number {
        return this.green;
    }

    get b(): number {
        return this.blue;
    }
}