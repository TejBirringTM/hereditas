import * as v from "valibot";

const errorResponseBodySchema = v.object({
    success: v.literal(false),
    error: v.literal(true),
    status: v.number(),
    message: v.string(),
});

const successResponseBodySchema = v.object({
    success: v.literal(true),
    error: v.literal(false),
    data: v.object({
        result: v.string()
    })
});

const responseBodySchema = v.union([successResponseBodySchema, errorResponseBodySchema]);

export function scribeFamilyTree(text: string) {
    return fetch(`${import.meta.env.VITE_SERVER_URL ?? "*"}/services/family-tree-scribe/scribe/v1`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
        },
        body: JSON.stringify({
            text
        })
    }).then((response)=>{
        return response.json();
    }).then((json)=>{
        const parseResult = v.safeParse(responseBodySchema, json);
        if (!parseResult.success) {
            console.error(parseResult.issues)
            // console.error(parseResult.issues.map((issue)=>issue.message))
            throw new Error("Failed to scribe family tree"); // response could not be validated using the above schema
        } else if (!parseResult.output.success) {
            throw new Error(parseResult.output.message);          // server could not parse or process the family tree
        } else {
            return parseResult.output.data.result + "\n";
        }
    })
}
