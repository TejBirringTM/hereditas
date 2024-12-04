
import * as v from "@valibot/valibot";
import parseFamilyTree from "./model/main.ts";
import { RuntimeError } from "../../common/runtime-error.ts";
import { Status } from "@oak/oak";
import { declareJsonApi, declareErrorResponse, declareSuccessResponse } from "../../framework/main.ts";

const familyTreeParserService = declareJsonApi("family-tree-parser");

familyTreeParserService.declareRequest(
    ["parse"], 1, 
    v.strictObject({text: v.string()}), 
    // deno-lint-ignore require-await
    async (request)=>{
        let inputText;
        try {
            inputText = request.text;
            const output = parseFamilyTree(inputText, "astToNodeLinkGraph");
            return declareSuccessResponse({
                ...output
            });
        } catch (e) {
            if (e instanceof Error) {
                console.error(e.stack)
            }
            if (e instanceof RuntimeError) {
                return declareErrorResponse(Status.BadRequest, e.message);
            } else {
                const errorMessage = e instanceof Error ? e.message : undefined;
                if (errorMessage) {
                    console.error(errorMessage);
                }
                return declareErrorResponse(Status.InternalServerError, "An unknown error occurred.");
            }
        }
    }
)

export default familyTreeParserService;
