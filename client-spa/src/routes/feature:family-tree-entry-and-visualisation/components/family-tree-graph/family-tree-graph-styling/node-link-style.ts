import Color from "colorjs.io";
import { Colour } from "../../../../../libs/colour";
import { declareLinkStyler, declareNodeStyler } from "./types";
import type { SimulationLink, SimulationNode } from "../../types";

const defaultMaleNodeColour = new Colour(0.3801, 0.2079, 280.58);
const defaultFemaleNodeColour = new Colour(0.5413, 0.1337, 45.59);
const defaultMarriageNodeColour = new Colour(0.7634, 0.0513, 53.9);

const defaultMarriageLinksColour = new Colour(0.6504, 0.0346, 53.23);
const defaultProgenyLinksColour = new Colour(0.596, 0.0415, 222.26);

const nodeHoverStrokeColour = new Colour(0.8981, 0.0421, 187.16);
const nodeSelectedStrokeColour = new Colour(0.8347, 0.1472, 83.01);
const nodeHighlightedStrokeColour = nodeSelectedStrokeColour; //new Colour(0.8832, 0.0901, 86.14);
const linkHighlightedStrokeColour = nodeHighlightedStrokeColour;

export const nodeStrokeColour = (node: SimulationNode) => {
    switch (node.state) {
        case "hovered":
            return nodeHoverStrokeColour.hex;
        case "selected":
            return nodeSelectedStrokeColour.hex;
        case "highlighted":
            return nodeHighlightedStrokeColour.hex;
        case "normal":
        default:
            return null;

    }
}

export const nodeStrokeWidth = (node: SimulationNode) => {
    switch (node.state) {
        case "hovered":
        case "highlighted":
            return 8;
        case "selected":
            return 12;
        case "normal":
        default:
            return null;
    }
}

export const linkStrokeColour = (link: SimulationLink, defaultStrokeColour: Colour) => {
    switch (link.state) {
        case "highlighted":
            return linkHighlightedStrokeColour.hex;
        case "normal":
        default:
            return defaultStrokeColour.hex;
    }
}

export const getNodeStyle = declareNodeStyler((node)=>{
    if (!node) {
        return {
            r: null,
            fill: null,
            stroke: null,
            "stroke-width": null,
            text: null,
            "font-size": null,
            "font-weight": null,
            "text-colour": null
        };
    }
    if (node.type === "Male") {
        return {
            r: 39,
            fill: defaultMaleNodeColour.hex,
            "font-size": "13pt", // "26pt",
            "font-weight": "bold",
            text: node.identity.slice(5), //node.type[0].toUpperCase(),
            "text-colour": defaultMaleNodeColour.manipulate((color)=>{
                const newColour = color.lighten(1.5);
                return new Color(newColour)
            }).hex,
            "stroke-width": nodeStrokeWidth(node),
            stroke: nodeStrokeColour(node)
        }
    } 
    else if (node.type === "Female") {
        return {
            r: 39,
            fill: defaultFemaleNodeColour.hex,
            "font-size": "13pt", // "26pt",
            "font-weight": "bold",
            text: node.identity.slice(7), // node.type[0].toUpperCase(),
            "text-colour": defaultFemaleNodeColour.manipulate((color)=>{
                const newColour = color.lighten(1.5);
                return new Color(newColour)
            }).hex,
            "stroke-width": nodeStrokeWidth(node),
            stroke: nodeStrokeColour(node)
        }
    }
    else if (node.type === "Marriage") {
        return {
            r: 22,
            fill: defaultMarriageNodeColour.hex,
            "font-size": "10pt",
            "font-weight": "normal",
            text: "mrg", // node.type[0].toLowerCase(),
            "text-colour": defaultMarriageNodeColour.manipulate((color)=>{
                const newColour = color.darken(1.5);
                return new Color(newColour)
            }).hex,
            "stroke-width": nodeStrokeWidth(node),
            stroke: nodeStrokeColour(node)
        }
    }
    else {
        throw Error("Unrecognised node type!");
    }
});

export const getLinkStyle = declareLinkStyler((link)=>{
    if (!link) {
        return {
            "stroke-width": null,
            fill: null,
            stroke: null,
            "marker-end": null,
            "marker-start": null,
            "stroke-dasharray": null,
        }
    }
    if (link.type === "Bride" || link.type === "Groom") {
        return {
            stroke: linkStrokeColour(link, defaultMarriageLinksColour),
            "stroke-width": 4,
            fill: null,
            "marker-start": null,
            "marker-end": null,
            "stroke-dasharray": null,
        }
    }
    else if (link.type === "MaritalProgeny" || link.type === "AdoptedMaritalProgeny" || link.type === "AdoptedChild") {
        return {
            stroke: linkStrokeColour(link, defaultProgenyLinksColour),
            "stroke-width": link.state === "highlighted" ? 6 : 4,
            "stroke-dasharray": (link.type === "AdoptedMaritalProgeny" || link.type === "AdoptedChild") ? "10 10" : null,
            fill: null,
            "marker-start": null,
            "marker-end": "url(#filledArrow)"
        }
    }
    else {
        throw Error(`Unrecognised link type! ${link.type}`);
    }
})