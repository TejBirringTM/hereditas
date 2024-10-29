import type { ErrorMessage, InferIssue, ObjectEntries, StrictObjectIssue, StrictObjectSchema } from "@valibot/valibot";
import { declareErrorResponse } from "./response.ts";
import { Status } from "@oak/oak";

const ApiRequestErrors = {
    requestBodyNotJsonError: declareErrorResponse(Status.BadRequest, "The request body is not a valid JSON object.", undefined),
    requestBodyNotValidError: <
            TRequestEntries extends ObjectEntries,
            TRequestErrorMessage extends ErrorMessage<StrictObjectIssue> | undefined,
        >(
            issues: [InferIssue<StrictObjectSchema<TRequestEntries, TRequestErrorMessage>>, ...InferIssue<StrictObjectSchema<TRequestEntries, TRequestErrorMessage>>[]]
        ) => declareErrorResponse(Status.BadRequest, "The request body is a valid JSON object but it does NOT match the schema.", issues)  
} as const;

export default ApiRequestErrors;

