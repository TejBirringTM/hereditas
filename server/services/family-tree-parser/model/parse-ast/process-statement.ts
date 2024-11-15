import assert from "node:assert";
import type { IToken } from "ebnf";
import { MALE_DECLARATION, type inferToken, MALE_REFERENCE, FEMALE_REFERENCE, MARRIAGE_REFERENCE, MALE_EXPRESSION, FEMALE_EXPRESSION, PERSON_EXPRESSION, FEMALE_DECLARATION, MARRIAGE_DECLARATION, PROGENY_DECLARATION, ADOPTED_HEIR_DECLARATION } from "../ast-token-parsers.ts";
import familyTreeParserErrors from "../errors.ts";
import { FamilyTreeContext, LBride, LGroom, LHusbandTo, LWifeTo, NFemale, NMale, NMarriage, LProgeny, LExplicitParentTo, LExplicitChildTo, LAdoptedHeir } from "./types.ts";

type StatementParser = (FamilyTreeContext: FamilyTreeContext, token: IToken) => void;
const declareStatementParser = <T>(parser: StatementParser) => parser;

type Reference = inferToken<typeof MALE_REFERENCE> | inferToken<typeof FEMALE_REFERENCE> | inferToken<typeof MARRIAGE_REFERENCE>; 
type Expression = inferToken<typeof MALE_EXPRESSION> | inferToken<typeof FEMALE_EXPRESSION> | inferToken<typeof PERSON_EXPRESSION>;

function resolveReference<T extends Reference>(context: FamilyTreeContext, reference: T) :
    T extends inferToken<typeof MALE_REFERENCE> ? NMale :
    T extends inferToken<typeof FEMALE_REFERENCE> ? NFemale :
    T extends inferToken<typeof MARRIAGE_REFERENCE> ? NMarriage : never
{
    // deno-lint-ignore no-explicit-any
    let ret : any;
    switch (reference.type) {
        case "MALE_REFERENCE":
            ret = context.maleNodes.get(`male:${reference.key}`);
            break;
        case "FEMALE_REFERENCE":
            ret = context.femaleNodes.get(`female:${reference.key}`);
            break;
        case "MARRIAGE_REFERENCE":
            ret = context.marriageNodes.get(`marriage:${reference.key}`);
            break;
    }
    if (!ret) {
        throw familyTreeParserErrors.InvalidReference.create(`Could not find referenced: ${reference.key}`);
    }
    return ret;
}

function resolveExpression<T extends Expression>(context: FamilyTreeContext, expression: T) : 
    T extends inferToken<typeof MALE_EXPRESSION> ? NMale :
    T extends inferToken<typeof FEMALE_EXPRESSION> ? NFemale :
    T extends inferToken<typeof PERSON_EXPRESSION> ? NMale | NFemale : never
{
    // deno-lint-ignore no-explicit-any
    let ret : any;
    if (expression.type === "MALE_DECLARATION") {
        ret = declareMale(context, expression.key, expression.title);
    } else if (expression.type === "FEMALE_DECLARATION") {
        ret = declareFemale(context, expression.key, expression.title);
    } else if (expression.type === "MALE_REFERENCE" || expression.type === "FEMALE_REFERENCE") {
        ret = resolveReference(context, expression);
    }
    return ret;
}

function declareMale(context: FamilyTreeContext, key: string, title: string) {
    const identity = `male:${key}` as NMale["identity"];
    if (context.maleNodes.has(identity)) {
        throw familyTreeParserErrors.DuplicateDeclaration.create(`Family tree already has node with identity: ${identity}`)
    }
    const maleNode = {
        type: "Male",
        identity,
        title: title,
    } satisfies NMale;
    context.maleNodes.set(maleNode.identity, maleNode);
    return maleNode;
}

function declareFemale(context: FamilyTreeContext, key: string, title: string) {
    const identity = `female:${key}` as NFemale["identity"];
    if (context.femaleNodes.has(identity)) {
        throw familyTreeParserErrors.DuplicateDeclaration.create(`Family tree already has node with identity: ${identity}`)
    }
    const femaleNode = {
        type: "Female",
        identity,
        title: title
    } satisfies NFemale;
    context.femaleNodes.set(femaleNode.identity, femaleNode);
    return femaleNode;
}

function declareMarriage(context: FamilyTreeContext, key: string, groom: NMale, bride: NFemale) {
    const identity = `marriage:${key}` as NMarriage["identity"];
    if (context.marriageNodes.has(identity)) {
        throw familyTreeParserErrors.DuplicateDeclaration.create(`Family tree already has node with identity: ${identity}`)
    }
    // create marriage node and links
    const marriageNode = {
        type: "Marriage",
        identity,
    } satisfies NMarriage;
    const linkGroom = {
        type: "Groom",
        fromNodeIdentity: groom.identity,
        toNodeIdentity: identity,
    } satisfies LGroom;
    const linkBride = {
        type: "Bride",
        fromNodeIdentity: bride.identity,
        toNodeIdentity: identity,
    } satisfies LBride;
    context.marriageNodes.set(identity, marriageNode);
    context.links.push(linkGroom, linkBride);
    // create spousal links
    const linkHusbandTo = {
        type: "HusbandTo",
        fromNodeIdentity: groom.identity,
        toNodeIdentity: bride.identity
    } satisfies LHusbandTo;
    const linkWifeTo = {
        type: "WifeTo",
        fromNodeIdentity: bride.identity,
        toNodeIdentity: groom.identity
    } satisfies LWifeTo;
    context.links.push(linkHusbandTo, linkWifeTo);
}

const statementParsers = {
    MALE_DECLARATION: declareStatementParser((context, token)=>{
        const parsedToken = MALE_DECLARATION(token);
        declareMale(context, parsedToken.key, parsedToken.title)
    }),
    FEMALE_DECLARATION: declareStatementParser((context, token)=>{
        const parsedToken = FEMALE_DECLARATION(token);
        declareFemale(context, parsedToken.key, parsedToken.title);
    }),
    MARRIAGE_DECLARATION: declareStatementParser((context, token)=>{
        const parsedToken = MARRIAGE_DECLARATION(token);
        const from = resolveExpression(context, parsedToken.from);
        const to = resolveExpression(context, parsedToken.to);
        declareMarriage(context, parsedToken.key, from, to);
    }),
    PROGENY_DECLARATION: declareStatementParser((context, token)=>{
        const parsedToken = PROGENY_DECLARATION(token);
        // resolve marriage
        const marriage = resolveReference(context, parsedToken.from);
        // resolve parents (groom and bride of marriage)
        const father = (()=>{
            const linkGroom = context.links.find((link)=>(link.type === 'Groom' && link.toNodeIdentity === marriage.identity)) as LGroom | undefined;
            assert(linkGroom);
            const maleIdentity = linkGroom.fromNodeIdentity;
            const male = context.maleNodes.get(maleIdentity);
            assert(male);
            return male;
        })();
        assert(father);
        const mother = (()=>{
            const linkBride = context.links.find((link)=>(link.type === 'Bride' && link.toNodeIdentity === marriage.identity)) as LBride | undefined;
            assert(linkBride);
            const femaleIdentity = linkBride.fromNodeIdentity;
            const female = context.femaleNodes.get(femaleIdentity);
            assert(female);
            return female;
        })();
        assert(mother);
        // resolve child 
        const child = resolveExpression(context, parsedToken.to);
        // add progeny link
        const linkProgeny = {
            type: "Progeny",
            fromNodeIdentity: marriage.identity,
            toNodeIdentity: child.identity,
        } satisfies LProgeny;
        context.links.push(linkProgeny);
        // add child links
        const linkFatherToChild = {
            type: "ParentTo",
            fromNodeIdentity: father.identity,
            toNodeIdentity: child.identity,
         } satisfies LExplicitParentTo;
        const linkMotherToChild = { 
            type: "ParentTo",
            fromNodeIdentity: mother.identity,
            toNodeIdentity: child.identity,
        } satisfies LExplicitParentTo;
        context.links.push(linkFatherToChild, linkMotherToChild);
        // add parent links
        const linkChildToFather = {
            type: "ChildTo",
            fromNodeIdentity: child.identity,
            toNodeIdentity: father.identity,
        } satisfies LExplicitChildTo;
        const linkChildToMother = {
            type: "ChildTo",
            fromNodeIdentity: child.identity,
            toNodeIdentity: mother.identity
        } satisfies LExplicitChildTo;
        context.links.push(linkChildToFather, linkChildToMother );
    }),
    ADOPTED_HEIR_DECLARATION: declareStatementParser((context, token)=>{
        const parsedToken = ADOPTED_HEIR_DECLARATION(token);
        const from = resolveExpression(context, parsedToken.from);
        const to = resolveExpression(context, parsedToken.to);
        const linkAdoptedHeir = {
            type: "AdoptedHeir",
            fromNodeIdentity: from.identity,
            toNodeIdentity: to.identity,
        } satisfies LAdoptedHeir;
        context.links.push(linkAdoptedHeir);
    }),    
} as Record<string, StatementParser>;

const statementParserKeys = Object.keys(statementParsers);

export default function processStatement(context: FamilyTreeContext, token: IToken) {
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
        parser(context, statement);
    }
}
