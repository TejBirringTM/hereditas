import { IToken } from "ebnf";
import parseAstToFamilyTreeContext from "../../../libs/parse-ast-to-ft-context/main.ts";
import { makeContext } from "./libs/context/main.ts";
import { declareTransformationStep } from "../../../../../../common/transformation-pipeline.ts";

export default declareTransformationStep("develop-context", (ast: IToken) => {
  const basicContext = parseAstToFamilyTreeContext(ast);
  const context = makeContext(basicContext);
  return context;
});
