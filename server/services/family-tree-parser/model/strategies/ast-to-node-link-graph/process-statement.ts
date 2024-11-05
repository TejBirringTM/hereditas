import assert from "node:assert";
import type { IToken } from "ebnf";
import type { AdoptedHeirLink, FemaleNode, Graph, MaleNode, MarriageBrideLink, MarriageGroomLink, MarriageNode, ProgenyLink } from "./graph.ts";
import { ADOPTED_HEIR_DECLARATION, MALE_DECLARATION, MARRIAGE_DECLARATION, PROGENY_DECLARATION, type inferToken, MALE_REFERENCE, FEMALE_REFERENCE, MARRIAGE_REFERENCE, MALE_EXPRESSION, FEMALE_EXPRESSION, PERSON_EXPRESSION } from "../../ast-token-parsers.ts";
import { FEMALE_DECLARATION } from "../../ast-token-parsers.ts";
import familyTreeParserErrors from "../../errors.ts";

type StatementParser = (graph: Graph, token: IToken) => void;
const declareStatementParser = <T>(parser: StatementParser) => parser;

type Reference = inferToken<typeof MALE_REFERENCE> | inferToken<typeof FEMALE_REFERENCE> | inferToken<typeof MARRIAGE_REFERENCE>; 
// export function resolveReference(graph: Graph, reference: inferToken<typeof MALE_REFERENCE>) : MaleNode;
// export function resolveReference(graph: Graph, reference: inferToken<typeof FEMALE_REFERENCE>) : FemaleNode;
// export function resolveReference(graph: Graph, reference: inferToken<typeof MARRIAGE_REFERENCE>) : MarriageNode;
function resolveReference<T extends Reference>(graph: Graph, reference: T) :
    T extends inferToken<typeof MALE_REFERENCE> ? MaleNode :
    T extends inferToken<typeof FEMALE_REFERENCE> ? FemaleNode :
    T extends inferToken<typeof MARRIAGE_REFERENCE> ? MarriageNode : never
{
    // deno-lint-ignore no-explicit-any
    let ret : any;
    switch (reference.type) {
        case "MALE_REFERENCE":
            ret = graph.nodes.find((node)=>node.identity === `male:${reference.key}`) as MaleNode;
            break;
        case "FEMALE_REFERENCE":
            ret = graph.nodes.find((node)=>node.identity === `female:${reference.key}`) as FemaleNode;
            break;
        case "MARRIAGE_REFERENCE":
            ret = graph.nodes.find((node)=>node.identity === `marriage:${reference.key}`) as MarriageNode;
            break;
    }
    if (!ret) {
        throw familyTreeParserErrors.InvalidReference.create(`Could not find referenced: ${reference.key}`);
    }
    return ret;
}

type Expression = inferToken<typeof MALE_EXPRESSION> | inferToken<typeof FEMALE_EXPRESSION> | inferToken<typeof PERSON_EXPRESSION>;
function resolveExpression<T extends Expression>(graph: Graph, expression: T) : 
    T extends inferToken<typeof MALE_EXPRESSION> ? MaleNode :
    T extends inferToken<typeof FEMALE_EXPRESSION> ? FemaleNode :
    T extends inferToken<typeof PERSON_EXPRESSION> ? MaleNode | FemaleNode : never
{
    // deno-lint-ignore no-explicit-any
    let ret : any;
    if (expression.type === "MALE_DECLARATION") {
        ret = declareMale(graph, expression.key, expression.title);
    } else if (expression.type === "FEMALE_DECLARATION") {
        ret = declareFemale(graph, expression.key, expression.title);
    } else if (expression.type === "MALE_REFERENCE" || expression.type === "FEMALE_REFERENCE") {
        ret = resolveReference(graph, expression);
    }
    return ret;
}

function declareMale(graph: Graph, key: string, title: string) {
    const maleNode = {
        type: "Male",
        identity: `male:${key}`,
        title: title,
    } satisfies MaleNode;
    graph.nodes.push(maleNode);
    return maleNode;
}

function declareFemale(graph: Graph, key: string, title: string) {
    const femaleNode = {
        type: "Female",
        identity: `female:${key}`,
        title: title
    } satisfies FemaleNode;
    graph.nodes.push(femaleNode);
    return femaleNode;
}

const statementParsers = {
    MALE_DECLARATION: declareStatementParser((graph, token)=>{
        const parsedToken = MALE_DECLARATION(token);
        declareMale(graph, parsedToken.key, parsedToken.title)
    }),
    FEMALE_DECLARATION: declareStatementParser((graph, token)=>{
        const parsedToken = FEMALE_DECLARATION(token);
        declareFemale(graph, parsedToken.key, parsedToken.title);
    }),
    ADOPTED_HEIR_DECLARATION: declareStatementParser((graph, token)=>{
        const parsedToken = ADOPTED_HEIR_DECLARATION(token);
        const from = resolveExpression(graph, parsedToken.from);
        const to = resolveExpression(graph, parsedToken.to);
        const adoptedHeirLink = {
            type: "AdoptedHeir",
            fromNodeIdentity: from.identity,
            toNodeIdentity: to.identity,
        } satisfies AdoptedHeirLink;
        graph.links.push(adoptedHeirLink);
    }),
    MARRIAGE_DECLARATION: declareStatementParser((graph, token)=>{
        const parsedToken = MARRIAGE_DECLARATION(token);
        const from = resolveExpression(graph, parsedToken.from);
        const to = resolveExpression(graph, parsedToken.to);
        const marriageIdentity = `marriage:${parsedToken.key}` as const;
        // create
        const marriageNode = {
            type: "Marriage",
            identity: marriageIdentity,
        } satisfies MarriageNode;
        // create links
        const groomLink = {
            type: "Groom",
            fromNodeIdentity: from.identity,
            toNodeIdentity: marriageIdentity,
        } satisfies MarriageGroomLink;
        const brideLink = {
            type: "Bride",
            fromNodeIdentity: to.identity,
            toNodeIdentity: marriageIdentity,
        } satisfies MarriageBrideLink;
        // apply to graph
        graph.nodes.push(marriageNode);
        graph.links.push(groomLink, brideLink);
    }),
    PROGENY_DECLARATION: declareStatementParser((graph, token)=>{
        const parsedToken = PROGENY_DECLARATION(token);
        const from = resolveReference(graph, parsedToken.from);
        const to = resolveExpression(graph, parsedToken.to);
        const progenyLink = {
            type: "Progeny",
            fromNodeIdentity: from.identity,
            toNodeIdentity: to.identity,
        } satisfies ProgenyLink;
        graph.links.push(progenyLink);
    }),
} as Record<string, StatementParser>;

const statementParserKeys = Object.keys(statementParsers);

export default function processStatement(graph: Graph, token: IToken) {
    assert(token.type === "STATEMENT");
    const statement = token.children[0];
    assert(!!statement);
    // ensure there is a parser for the statement
    if (!statementParserKeys.includes(statement.type)) {
        throw familyTreeParserErrors.UnimplementedSyntax.create(`The following statement is defined but not implemented: ${statement.type}`);
    } 
    // parse the statement
    else {
        const parser = statementParsers[statement.type];
        parser(graph, statement);
    }
}
