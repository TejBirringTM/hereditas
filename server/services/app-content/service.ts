import * as v from "@valibot/valibot";
import { declareJsonApi } from "../../common/framework/main.ts";
import {
  declareErrorResponse,
  declareSuccessResponse,
} from "../../common/framework/response.ts";
import { Status } from "@oak/oak";
import { isRuntimeError } from "../../errors/runtime-error.ts";
import { dumpError } from "../../common/error-handling.ts";
// import { tableCodexExamples } from "./model/table-codex-examples.ts";
// import { tableCodexSubmissions } from "./model/table-codex-submissions.ts";
// import { WritableDeep } from "type-fest";
import { tableContent } from "./model/table-content.ts";

const appContentService = declareJsonApi("app-content");

// appContentService.declareRequest(
//   false,
//   ["codex-examples"],
//   1,
//   v.strictObject({}),
//   async (_request) => {
//     try {
//       const records = await tableCodexExamples.records();
//       return declareSuccessResponse({
//         records
//       });
//     } catch (e) {
//       dumpError(e);
//       if (isRuntimeError(e)) {
//         return declareErrorResponse(Status.BadRequest, e.message);
//       } else {
//         return declareErrorResponse(
//           Status.InternalServerError,
//           "An unknown error occurred.",
//         );
//       }
//     }
//   },
// );

// appContentService.declareRequest(
//     false,
//     ["codex-submissions"],
//     1,
//     v.strictObject({}),
//     async (_request) => {
//       try {
//         const records = await tableCodexSubmissions.records();
//         for (const record of records) {
//             const r = record as WritableDeep<typeof record>;
//             if (r["Hide Presenter's Email"]) {
//                 r["Presenter's Email"] = undefined;
//             }
//         }
//         return declareSuccessResponse({
//           records
//         });
//       } catch (e) {
//         dumpError(e);
//         if (isRuntimeError(e)) {
//           return declareErrorResponse(Status.BadRequest, e.message);
//         } else {
//           return declareErrorResponse(
//             Status.InternalServerError,
//             "An unknown error occurred.",
//           );
//         }
//       }
//     },
//   );

  appContentService.declareRequest(
    false,
    ["content"],
    1,
    v.strictObject({}),
    async (_request) => {
      try {
        const records = await tableContent.records();
        return declareSuccessResponse({
          records
        });
      } catch (e) {
        dumpError(e);
        if (isRuntimeError(e)) {
          return declareErrorResponse(Status.BadRequest, e.message);
        } else {
          return declareErrorResponse(
            Status.InternalServerError,
            "An unknown error occurred.",
          );
        }
      }
    },
  );

export default appContentService;