import { Link, Node } from "../libs/parse-family-tree-entry";

export type NodeState = "hovered" | "selected" | "highlighted" | "normal";
export type LinkState = "highlighted" | "normal";

export type SimulationNode = Node & d3.SimulationNodeDatum & {
    state: NodeState
};

export type SimulationLink = Link & d3.SimulationLinkDatum<SimulationNode> & {
    state: LinkState
}

