import assert from "node:assert";
import type { IToken } from "ebnf";
import {
  ADOPTED_PROGENY_DECLARATION,
  APPEND_TEXT_DECLARATION,
  FEMALE_DECLARATION,
  FEMALE_EXPRESSION,
  FEMALE_REFERENCE,
  type inferToken,
  MALE_DECLARATION,
  MALE_EXPRESSION,
  MALE_REFERENCE,
  MARRIAGE_DECLARATION,
  MARRIAGE_REFERENCE,
  PERSON_EXPRESSION,
  PROGENY_DECLARATION,
  START_DECLARATION,
} from "../parse-text-to-ast/ast-token-parsers.ts";
import {
  FamilyTreeContext,
  LAdoptedChild,
  LAdoptedDaughter,
  LAdoptedMaritalProgeny,
  LAdoptedSon,
  LAdoptiveFather,
  LAdoptiveMaritalProgenitor,
  LAdoptiveMother,
  LAdoptiveParent,
  LBride,
  LChild,
  LDaughter,
  LFather,
  LGroom,
  LHusband,
  LMaritalProgenitor,
  LMaritalProgeny,
  LMaritalSpouse,
  LMarriage,
  LMother,
  LParent,
  LSon,
  LWife,
  NFemale,
  NMale,
  NMarriage,
  NPerson,
} from "./types.ts";
import { DuplicateDeclarationError, InvalidReferenceError, UnimplementedSyntaxError } from "../../../../../errors/parse-ft.ts";

type StatementParser = (
  FamilyTreeContext: FamilyTreeContext,
  token: IToken,
) => void;
const declareStatementParser = <T>(parser: StatementParser) => parser;

type Reference =
  | inferToken<typeof MALE_REFERENCE>
  | inferToken<typeof FEMALE_REFERENCE>
  | inferToken<typeof MARRIAGE_REFERENCE>;
type Expression =
  | inferToken<typeof MALE_EXPRESSION>
  | inferToken<typeof FEMALE_EXPRESSION>
  | inferToken<typeof PERSON_EXPRESSION>;

function resolveReference<T extends Reference>(
  context: FamilyTreeContext,
  reference: T,
): T extends inferToken<typeof MALE_REFERENCE> ? NMale
  : T extends inferToken<typeof FEMALE_REFERENCE> ? NFemale
  : T extends inferToken<typeof MARRIAGE_REFERENCE> ? NMarriage
  : never {
  // deno-lint-ignore no-explicit-any
  let ret: any;
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
    throw InvalidReferenceError.create(`Could not find referenced node: ${reference.key}`);
  }
  return ret;
}

function resolveExpression<T extends Expression>(
  context: FamilyTreeContext,
  expression: T,
): T extends inferToken<typeof MALE_EXPRESSION> ? NMale
  : T extends inferToken<typeof FEMALE_EXPRESSION> ? NFemale
  : T extends inferToken<typeof PERSON_EXPRESSION> ? NMale | NFemale
  : never {
  // deno-lint-ignore no-explicit-any
  let ret: any;
  if (expression.type === "MALE_DECLARATION") {
    ret = declareMale(context, expression.key, expression.title);
  } else if (expression.type === "FEMALE_DECLARATION") {
    ret = declareFemale(context, expression.key, expression.title);
  } else if (
    expression.type === "MALE_REFERENCE" ||
    expression.type === "FEMALE_REFERENCE"
  ) {
    ret = resolveReference(context, expression);
  }
  return ret;
}

function declareMale(context: FamilyTreeContext, key: string, title: string) {
  const identity = `male:${key}` as NMale["identity"];
  if (context.maleNodes.has(identity)) {
    throw DuplicateDeclarationError.create(`Family tree already has node with identity: ${identity}`)
  }
  const maleNode = {
    type: "Male",
    identity,
    title: title,
    text: [],
  } satisfies NMale;
  context.maleNodes.set(maleNode.identity, maleNode);
  return maleNode;
}

function declareFemale(context: FamilyTreeContext, key: string, title: string) {
  const identity = `female:${key}` as NFemale["identity"];
  if (context.femaleNodes.has(identity)) {
    throw DuplicateDeclarationError.create(`Family tree already has node with identity: ${identity}`);
  }
  const femaleNode = {
    type: "Female",
    identity,
    title: title,
    text: [],
  } satisfies NFemale;
  context.femaleNodes.set(femaleNode.identity, femaleNode);
  return femaleNode;
}

function declareMarriage(
  context: FamilyTreeContext,
  key: string,
  groom: NMale,
  bride: NFemale,
) {
  const marriageIdentity = `marriage:${key}` as NMarriage["identity"];
  if (context.marriageNodes.has(marriageIdentity)) {
    throw DuplicateDeclarationError.create(`Family tree already has node with identity: ${marriageIdentity}`);
  }
  // create marriage node and links
  const marriageNode = {
    type: "Marriage",
    identity: marriageIdentity,
    text: [],
  } satisfies NMarriage;
  const linkGroom = {
    type: "Groom",
    fromNodeIdentity: marriageIdentity,
    toNodeIdentity: groom.identity,
  } satisfies LGroom;
  const linkBride = {
    type: "Bride",
    fromNodeIdentity: marriageIdentity,
    toNodeIdentity: bride.identity,
  } satisfies LBride;
  const linkGroom1 = {
    type: "Marriage",
    fromNodeIdentity: groom.identity,
    toNodeIdentity: marriageIdentity,
  } satisfies LMarriage;
  const lBride1 = {
    type: "Marriage",
    fromNodeIdentity: bride.identity,
    toNodeIdentity: marriageIdentity,
  } satisfies LMarriage;
  context.marriageNodes.set(marriageIdentity, marriageNode);
  context.links.push(linkGroom, linkBride, linkGroom1, lBride1);
  // create spousal links
  const linkWife = {
    type: "Wife",
    fromNodeIdentity: groom.identity,
    toNodeIdentity: bride.identity,
  } satisfies LWife;
  const linkHusband = {
    type: "Husband",
    fromNodeIdentity: bride.identity,
    toNodeIdentity: groom.identity,
  } satisfies LHusband;
  const linkWife1 = {
    type: "MaritalSpouse",
    fromNodeIdentity: groom.identity,
    toNodeIdentity: bride.identity,
  } satisfies LMaritalSpouse;
  const linkHusband1 = {
    type: "MaritalSpouse",
    fromNodeIdentity: bride.identity,
    toNodeIdentity: groom.identity,
  } satisfies LMaritalSpouse;
  context.links.push(linkWife, linkHusband, linkWife1, linkHusband1);
}

function declareProgeny(
  context: FamilyTreeContext,
  marriage: NMarriage,
  child: NPerson,
) {
  // resolve parents (groom and bride of marriage)
  const father = (() => {
    const linkGroom = context.links.find((
      link,
    ) => (link.type === "Groom" &&
      link.fromNodeIdentity === marriage.identity)
    ) as LGroom | undefined;
    assert(linkGroom);
    const maleIdentity = linkGroom.toNodeIdentity;
    const male = context.maleNodes.get(maleIdentity);
    assert(male);
    return male;
  })();
  assert(father);
  const mother = (() => {
    const linkBride = context.links.find((
      link,
    ) => (link.type === "Bride" &&
      link.fromNodeIdentity === marriage.identity)
    ) as LBride | undefined;
    assert(linkBride);
    const femaleIdentity = linkBride.toNodeIdentity;
    const female = context.femaleNodes.get(femaleIdentity);
    assert(female);
    return female;
  })();
  assert(mother);
  // create progenitor/progeny links
  const linkMaritalProgeny = {
    type: "MaritalProgeny",
    fromNodeIdentity: marriage.identity,
    toNodeIdentity: child.identity,
  } satisfies LMaritalProgeny;
  const linkMaritalProgenitor = {
    type: "MaritalProgenitor",
    fromNodeIdentity: child.identity,
    toNodeIdentity: marriage.identity,
  } satisfies LMaritalProgenitor;
  // create parentage links
  const linkMother = {
    type: "Mother",
    fromNodeIdentity: child.identity,
    toNodeIdentity: mother.identity,
  } satisfies LMother;
  const linkFather = {
    type: "Father",
    fromNodeIdentity: child.identity,
    toNodeIdentity: father.identity,
  } satisfies LFather;
  const linkMother1 = {
    type: "Parent",
    fromNodeIdentity: child.identity,
    toNodeIdentity: mother.identity,
  } satisfies LParent;
  const linkFather1 = {
    type: "Parent",
    fromNodeIdentity: child.identity,
    toNodeIdentity: father.identity,
  } satisfies LParent;
  context.links.push(
    linkMaritalProgeny,
    linkMaritalProgenitor,
    linkMother,
    linkMother1,
    linkFather,
    linkFather1,
  );
  // create child links
  const linkChildToMother = {
    type: "Child",
    fromNodeIdentity: mother.identity,
    toNodeIdentity: child.identity,
  } satisfies LChild;
  const linkChildToFather = {
    type: "Child",
    fromNodeIdentity: father.identity,
    toNodeIdentity: child.identity,
  } satisfies LChild;
  context.links.push(linkChildToMother, linkChildToFather);
  if (child.type === "Male") {
    const linkSonToMother = {
      type: "Son",
      fromNodeIdentity: mother.identity,
      toNodeIdentity: child.identity,
    } satisfies LSon;
    const linkSonToFather = {
      type: "Son",
      fromNodeIdentity: father.identity,
      toNodeIdentity: child.identity,
    } satisfies LSon;
    context.links.push(linkSonToMother, linkSonToFather);
  } else if (child.type === "Female") {
    const linkDaughterToMother = {
      type: "Daughter",
      fromNodeIdentity: mother.identity,
      toNodeIdentity: child.identity,
    } satisfies LDaughter;
    const linkDaughterToFather = {
      type: "Daughter",
      fromNodeIdentity: father.identity,
      toNodeIdentity: child.identity,
    } satisfies LDaughter;
    context.links.push(linkDaughterToMother, linkDaughterToFather);
  }
}

function declareAdoptiveProgeny(
  context: FamilyTreeContext,
  marriageOrIndividual: NMarriage | NPerson,
  child: NPerson,
) {
  // resolve parents (groom and bride of marriage)
  const father = (() => {
    if (marriageOrIndividual.type === "Male") {
      return marriageOrIndividual;
    } else {
      const linkGroom = context.links.find((
        link,
      ) => (link.type === "Groom" &&
        link.fromNodeIdentity === marriageOrIndividual.identity)
      ) as LGroom | undefined;
      assert(linkGroom);
      const maleIdentity = linkGroom.toNodeIdentity;
      const male = context.maleNodes.get(maleIdentity);
      assert(male);
      return male;
    }
  })() satisfies NMale;

  const mother = (() => {
    if (marriageOrIndividual.type === "Female") {
      return marriageOrIndividual;
    } else {
      const linkBride = context.links.find((
        link,
      ) => (link.type === "Bride" &&
        link.fromNodeIdentity === marriageOrIndividual.identity)
      ) as LBride | undefined;
      assert(linkBride);
      const femaleIdentity = linkBride.toNodeIdentity;
      const female = context.femaleNodes.get(femaleIdentity);
      assert(female);
      return female;
    }
  })() satisfies NFemale;

  // create progenitor/progeny links
  if (marriageOrIndividual.type === "Marriage") {
    const linkMaritalProgeny = {
      type: "AdoptedMaritalProgeny",
      fromNodeIdentity: marriageOrIndividual.identity,
      toNodeIdentity: child.identity,
    } satisfies LAdoptedMaritalProgeny;
    const linkMaritalProgenitor = {
      type: "AdoptiveMaritalProgenitor",
      fromNodeIdentity: child.identity,
      toNodeIdentity: marriageOrIndividual.identity,
    } satisfies LAdoptiveMaritalProgenitor;
    context.links.push(linkMaritalProgeny, linkMaritalProgenitor);
  }

  // create parentage links
  const linkMother = {
    type: "AdoptiveMother",
    fromNodeIdentity: child.identity,
    toNodeIdentity: mother.identity,
  } satisfies LAdoptiveMother;
  const linkFather = {
    type: "AdoptiveFather",
    fromNodeIdentity: child.identity,
    toNodeIdentity: father.identity,
  } satisfies LAdoptiveFather;
  const linkMother1 = {
    type: "AdoptiveParent",
    fromNodeIdentity: child.identity,
    toNodeIdentity: mother.identity,
  } satisfies LAdoptiveParent;
  const linkFather1 = {
    type: "AdoptiveParent",
    fromNodeIdentity: child.identity,
    toNodeIdentity: father.identity,
  } satisfies LAdoptiveParent;
  context.links.push(linkMother, linkMother1, linkFather, linkFather1);

  // create child links
  const linkChildToMother = {
    type: "AdoptedChild",
    fromNodeIdentity: mother.identity,
    toNodeIdentity: child.identity,
  } satisfies LAdoptedChild;
  const linkChildToFather = {
    type: "AdoptedChild",
    fromNodeIdentity: father.identity,
    toNodeIdentity: child.identity,
  } satisfies LAdoptedChild;
  context.links.push(linkChildToMother, linkChildToFather);

  if (child.type === "Male") {
    const linkSonToMother = {
      type: "AdoptedSon",
      fromNodeIdentity: mother.identity,
      toNodeIdentity: child.identity,
    } satisfies LAdoptedSon;
    const linkSonToFather = {
      type: "AdoptedSon",
      fromNodeIdentity: father.identity,
      toNodeIdentity: child.identity,
    } satisfies LAdoptedSon;
    context.links.push(linkSonToMother, linkSonToFather);
  } else if (child.type === "Female") {
    const linkDaughterToMother = {
      type: "AdoptedDaughter",
      fromNodeIdentity: mother.identity,
      toNodeIdentity: child.identity,
    } satisfies LAdoptedDaughter;
    const linkDaughterToFather = {
      type: "AdoptedDaughter",
      fromNodeIdentity: father.identity,
      toNodeIdentity: child.identity,
    } satisfies LAdoptedDaughter;
    context.links.push(linkDaughterToMother, linkDaughterToFather);
  }
}

const statementParsers = {
  MALE_DECLARATION: declareStatementParser((context, token) => {
    const parsedToken = MALE_DECLARATION(token);
    declareMale(context, parsedToken.key, parsedToken.title);
  }),
  FEMALE_DECLARATION: declareStatementParser((context, token) => {
    const parsedToken = FEMALE_DECLARATION(token);
    declareFemale(context, parsedToken.key, parsedToken.title);
  }),
  MARRIAGE_DECLARATION: declareStatementParser((context, token) => {
    const parsedToken = MARRIAGE_DECLARATION(token);
    const from = resolveExpression(context, parsedToken.from);
    const to = resolveExpression(context, parsedToken.to);
    const groom = (from.type === "Male" ? from : to) as NMale;
    const bride = (from.type === "Female" ? from : to) as NFemale;
    declareMarriage(context, parsedToken.key, groom, bride);
  }),
  PROGENY_DECLARATION: declareStatementParser((context, token) => {
    const parsedToken = PROGENY_DECLARATION(token);
    // resolve marriage
    const marriage = resolveReference(context, parsedToken.from);
    // resolve child
    const child = resolveExpression(context, parsedToken.to);
    // add progeny links
    declareProgeny(context, marriage, child);
  }),
  ADOPTED_PROGENY_DECLARATION: declareStatementParser((context, token) => {
    const parsedToken = ADOPTED_PROGENY_DECLARATION(token);
    // resolve marriage
    const marriageOrIndividual = parsedToken.from.type === "MARRIAGE_REFERENCE"
      ? resolveReference(context, parsedToken.from)
      : resolveExpression(context, parsedToken.from);
    // resolve child
    const child = resolveExpression(context, parsedToken.to);
    // add adoptive progeny links
    declareAdoptiveProgeny(context, marriageOrIndividual, child);
  }),
  COMMENT: declareStatementParser(() => {
    // do nothing with comments!
  }),
  START_DECLARATION: declareStatementParser((context, token) => {
    const parsedToken = START_DECLARATION(token);
    const treeRoot = resolveExpression(context, parsedToken.treeRoot);
    context.startNode = treeRoot;
  }),
  APPEND_TEXT_DECLARATION: declareStatementParser((context, token) => {
    const parsedToken = APPEND_TEXT_DECLARATION(token);
    const to = parsedToken.to.type === "MARRIAGE_REFERENCE" ? resolveReference(context, parsedToken.to) : resolveExpression(context, parsedToken.to);
    const textLines = parsedToken.textLines;
    to.text.push(...textLines);
  })
} as Record<string, StatementParser>;

const statementParserKeys = Object.keys(statementParsers);

export function processStatement(context: FamilyTreeContext, token: IToken) {
  assert(token.type === "STATEMENT");
  const statement = token.children[0];
  assert(!!statement);
  // ensure there is a parser for the statement
  if (!statementParserKeys.includes(statement.type)) {
    throw UnimplementedSyntaxError.create(`The following statement is defined but not implemented: ${statement.type}`);
  } // parse the statement
  else {
    const parser = statementParsers[statement.type];
    parser(context, statement);
  }
}
