import { declareRuntimeError } from "./runtime-error.ts";

export const StrategyNotFoundError = declareRuntimeError(
  "StrategyMap:StrategyNotFound",
);
