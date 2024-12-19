import * as v from "@valibot/valibot";
import { declareJsonApi } from "../../common/framework/main.ts";
import { FamilyTreeScribe } from "./model/main.ts";
import { isRuntimeError } from "../../errors/runtime-error.ts";
import { declareErrorResponse, declareSuccessResponse } from "../../common/framework/response.ts";
import { Status } from "@oak/oak";
import { loadTextFile } from "../../common/file.ts";
import path from "node:path";

const tokeniserService = declareJsonApi("family-tree-scribe");

tokeniserService.declareRequest(
  ["scribe"],
  1,
  v.strictObject({
    text: v.string(),
  }),
  async (request) => {
    try {
        const grammar = await loadTextFile(path.resolve("services/family-tree-parser/model/libs/parse-text-to-ast/grammar/ebnf.ebnf"));
        const scribe = new FamilyTreeScribe(grammar);
        const result = await scribe.scribe(request.text);
        return declareSuccessResponse({
            result
        });
    } catch (e) {
      if (e instanceof Error) {
        console.error(e.stack);
      }
      if (isRuntimeError(e)) {
        return declareErrorResponse(Status.BadGateway, e.message);
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


export default tokeniserService;
