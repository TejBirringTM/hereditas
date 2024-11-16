import Color from "colorjs.io";

type ManipulationFunction = (colour: Color) => Color;

// https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl

export class Colour {
    private readonly colour: Color;
    /**
     * 
     * See:
     *      * https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl
     *      * https://colorjs.io/docs/spaces#oklch
     * 
     * @param l - perceived lightness, from 0% to 100% as decimal 0 to 1 (inclusive)
     * @param c - chroma (the saturation of the colour), from gray to the most saturated, range from 0 to 0.4 (inclusive; the exact acceptable range depends on the lightness and hue angle variables!)
     * @param h - hue angle, from 0 degrees to 360 degrees (inclusive)
     * @param alpha - alpha, the opacity, from 0% to 100% as decimal 0 to 1 (inclusive)
     */
    constructor(l: number, c: number, h: number, alpha?: number) {
        // if (l < 0 || l > 1) {
        //     throw new Error("Invalid lightness!");
        // }
        if (c < 0 || c > 0.4) {
            throw new Error("Invalid chroma!");
        }
        if (h < 0 || h > 360) {
            throw new Error("Invalid hue!");
        }
        if (alpha && (alpha < 0 || alpha > 1)) {
            throw new Error("Invalid alpha value!");
        }
        this.colour = new Color("oklch", [l, c, h], alpha ?? 1);
    }
    get hex() {
        return this.colour.toString({format: "hex"});
    }
    manipulate(fn: ManipulationFunction) {
        const newColour = fn(this.colour.clone());
        const l = newColour.oklch.l;
        const c = newColour.oklch.c;
        const h = newColour.oklch.h;
        const alpha = newColour.alpha;
        return new Colour(l, c, h, alpha);
    }
}
