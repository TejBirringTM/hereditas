import * as v from "valibot";
import { linkSchema, nodeSchema } from "./graph-schema";

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
        nodes: v.array(nodeSchema),
        links: v.array(linkSchema)
    })
});

const responseBodySchema = v.union([successResponseBodySchema, errorResponseBodySchema]);

export function parseFamilyTree(text: string) {
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
        const parseResult = v.safeParse(responseBodySchema, json);
        if (!parseResult.success) {
            console.error(parseResult.issues)
            // console.error(parseResult.issues.map((issue)=>issue.message))
            throw new Error("Failed to parse family tree entry"); // response could not be validated using the above schema
        } else if (!parseResult.output.success) {
            throw new Error(parseResult.output.message);          // server could not parse or process the family tree
        } else {
            return parseResult.output.data;
        }
    })
}

export {type Node, type NodeType, type Link, type LinkType} from "./graph-schema";
export type Graph = v.InferInput<typeof successResponseBodySchema>["data"];
