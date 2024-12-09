import * as v from "@valibot/valibot";
import parseFamilyTree from "./model/main.ts";
import { isRuntimeError } from "../../common/runtime-error.ts";
import { Status } from "@oak/oak";
import {
  declareErrorResponse,
  declareJsonApi,
  declareSuccessResponse,
} from "../../framework/main.ts";

const familyTreeParserService = declareJsonApi("family-tree-parser");

familyTreeParserService.declareRequest(
  ["parse"],
  1,
  v.strictObject({ text: v.string() }),
  // (remove brackets to apply, if required) deno-lint-ignore require-await
  async (request) => {
    let inputText;
    try {
      inputText = request.text;
      const output = await parseFamilyTree(inputText, {
        grammarFile:
          "services/family-tree-parser/model/libs/parse-text-to-ast/grammar/ebnf.ebnf",
        transformationStrategy: "default",
      });
      return declareSuccessResponse({
        ...output,
      });
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.stack);
      }
      if (isRuntimeError(e)) {
        return declareErrorResponse(Status.BadRequest, e.message);
      } else {
        const errorMessage = e instanceof Error ? e.message : undefined;
        if (errorMessage) {
          console.error(errorMessage);
        }
        return declareErrorResponse(
          Status.InternalServerError,
          "An unknown error occurred.",
        );
      }
    }
  },
);

export default familyTreeParserService;
