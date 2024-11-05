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
        graph: v.object({
            nodes: v.array(v.object({})),
            links: v.array(v.object({})),
        })
    })
});

const responseBodySchema = v.union([successResponseBodySchema, errorResponseBodySchema]);

export type FamilyTreeGraph = v.InferInput<typeof successResponseBodySchema>["data"]["graph"];

export default function parseFamilyTreeEntry(text: string) {
    return fetch(`${import.meta.env.VITE_SERVER_URL ?? "*"}/services/family-tree-parser/parse/v1`, {
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
        console.debug("json", json);
        const parseResult = v.safeParse(responseBodySchema, json);
        if (!parseResult.success) {
            throw new Error("Failed to parse family tree entry");
        } else if (!parseResult.output.success) {
            throw new Error(parseResult.output.message);
        } else {
            return parseResult.output.data.graph;
        }
    })
}
