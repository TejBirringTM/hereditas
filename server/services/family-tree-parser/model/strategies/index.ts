import {type StrategyMap} from "../strategies/strategy.ts";
import astToNodeLinkGraph from "./ast-to-node-link-graph/index.ts";

const strategies = {
    astToNodeLinkGraph
} satisfies StrategyMap<any, any>;

export default strategies;

export type StrategyKey = keyof typeof strategies;
export const getStrategy = (key: StrategyKey) => strategies[key];
