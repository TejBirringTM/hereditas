import {StrictObjectSchema, ObjectEntries, ErrorMessage, StrictObjectIssue, InferOutput, parse} from "@valibot/valibot";
import { HttpError, Router, Status } from "@oak/oak";
import { ValiError } from "@valibot/valibot";
import ApiRequestErrors from "./request-errors.ts";
import { declareErrorResponse, type ApiErrorResult, type ApiSuccessResult } from "./response.ts";
export {declareSuccessResponse, declareErrorResponse} from "./response.ts";
import { type TServicePath, type TRequestPath, servicePath as _servicePath, requestPath as _requestPath, type TVersionMajor } from "./paths.ts";

export function declareJsonApi(servicePath: TServicePath) {
    const __servicePath = _servicePath(servicePath);
    const router = new Router({sensitive: true, strict: true, prefix: __servicePath});

    const declareRequest = <
        TRequestEntries extends ObjectEntries,
        TRequestParserErrorMessage extends ErrorMessage<StrictObjectIssue> | undefined,
        TResponse extends object
    >(
        requestPath: TRequestPath,
        versionMajor: TVersionMajor,
        requestSchema:  StrictObjectSchema<TRequestEntries, TRequestParserErrorMessage>,
        requestHandler: (request: InferOutput<StrictObjectSchema<TRequestEntries, TRequestParserErrorMessage>>) => Promise<ApiSuccessResult<TResponse> | ApiErrorResult>
    )=>{
        const __requestPath = _requestPath(requestPath, versionMajor);
        
        console.debug(`✅ Registered request ===> \n${__servicePath}${__requestPath}`);

        return router.post(__requestPath, async (ctx) => {
            // try parse request body as a JSON object
            let requestBody;
            try {
                requestBody = await ctx.request.body.json();
            } catch (e) {
                if (e instanceof HttpError && e.status === Status.BadRequest) {
                    ctx.response.body = ApiRequestErrors.requestBodyNotJsonError;
                }
                return;
            }
            // try parse request body using route- and method-specific schema
            let request : InferOutput<typeof requestSchema>;
            try {
                request = parse(requestSchema, requestBody);
            } catch (e) {
                if (e instanceof ValiError) {
                    ctx.response.body = ApiRequestErrors.requestBodyNotValidError(e.issues);
                }
                return;
            }
            // get response
            try {
                const response = await requestHandler(request);
                ctx.response.body = response;
                if (response.error) {
                    ctx.response.status = response.status;
                } else {
                    ctx.response.status = Status.OK;
                }
            } catch (_e) {
                const genericErrorResponse = declareErrorResponse(Status.InternalServerError, "An unknown error occurred.");
                ctx.response.body = genericErrorResponse;
                ctx.response.status = genericErrorResponse.status;
            }
        });
    };

    return Object.freeze({
        path: __servicePath,
        router,
        declareRequest,
    });
}

export type JsonApiDeclaration = ReturnType<typeof declareJsonApi>;

export const registerServices = (services: JsonApiDeclaration[]) => Object.freeze(services);