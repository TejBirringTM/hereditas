import { declareRuntimeError } from "../common/runtime-error.ts";

export const strategyMapErrors = {
  strategyNotFound: declareRuntimeError("StrategyNotFound"),
};

export type StrategyMap<Key extends string, Strategy> = Record<Key, Strategy>;
export const declareStrategies = <Key extends string, Strategy>(
  strategies: StrategyMap<Key, Strategy>,
) => ({
  strategies,
  getStrategy: (key: Key) => {
    const strategy = strategies[key];
    if (!strategy) {
      throw strategyMapErrors.strategyNotFound.create();
    } else {
      return strategy;
    }
  },
});

// deno-lint-ignore no-explicit-any
export type StrategyKeys<M> = M extends StrategyMap<infer K, any> ? K : never;
