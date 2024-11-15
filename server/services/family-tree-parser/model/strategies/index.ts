import familyTreeParserErrors from "../errors.ts";
import {type StrategyMap} from "../strategies/strategy.ts";
import astToNodeLinkGraph from "./ast-to-node-link-graph/index.ts";

const strategies = {
    astToNodeLinkGraph
    // deno-lint-ignore no-explicit-any
} satisfies StrategyMap<any, any>;

export default strategies;

export type StrategyKey = keyof typeof strategies;

export const getStrategy = (key: StrategyKey) => {
    const strategy = strategies[key];
    if (!strategy) {
        throw familyTreeParserErrors.StrategyNotFound;
    }
    return strategy;
};
