import { declareStrategies } from "../../../../libs/strategy-map.ts";
import pipelineDefault from "../transformation-strategies/default/main.ts";

/**
 * Strategies can be used to parameterise various stages of the parsing process...
 */

/**
 * transformationPipelines enumerates pipelines (as strategies) that transform the AST parsed
 * from the raw text entry using the EBNF-defined grammar to something that the user (of the API)
 * will find useful.
 */
export const transformationPipelines = declareStrategies({
  default: pipelineDefault,
});
