import { DeepNullable } from "ts-essentials";
import { SimulationLink, SimulationNode } from "../types";

const strokeTypes = {
    solid: "0",
    dotted: "5,5", 
    shortDashes: "10,10",
    longDashes: "35,10",
} as const;
type StrokeType = keyof typeof strokeTypes;

type LineMarker = "none" | "url(#filledArrow)";

type TextCase = "normal" | "upper" | "lower";
type FontWeight = number | "lighter" | "normal" | "bold" | "bolder";
type FontSize = string;

type HexColour = string;


type BasicNodeStyle = DeepNullable<{
    r: number,
    // fill
    fill: HexColour,
    // stroke
    "stroke-width": number,
    "stroke": HexColour,
    // text style
    "font-size": FontSize,
    "font-weight": FontWeight,
    "text-colour": HexColour,
    // text content
    text: string,
}>;

type BasicLinkStyle = DeepNullable<{
    // stroke
    "stroke-width": number,
    "stroke": HexColour,
    // markers
    "marker-start": LineMarker,
    "marker-end": LineMarker
}>;

export type NodeStyler = (node: SimulationNode | null) => BasicNodeStyle;
export type LinkStyler = (link: SimulationLink | null) => BasicLinkStyle;
export const declareNodeStyler = (nodeStylerImplementation: NodeStyler) => nodeStylerImplementation;
export const declareLinkStyler = (linkStylerImplementation: LinkStyler) => linkStylerImplementation;
