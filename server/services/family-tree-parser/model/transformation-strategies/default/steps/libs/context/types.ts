import { AdjacencyMapMultiple, AdjacencyMapSingular } from "../../../../../../../../common/adjacency-map.ts";
import { Nullable } from "../../../../../../../../types.ts";
import {
  AnyLink as _Link,
  AnyNode as _Node,
  FamilyTreeContext as _BasicContext,
  NMale as _NMale
} from "../../../../../libs/parse-ast-to-ft-context/types.ts";

/* Raw Context */
export type BasicContext = _BasicContext;

/* Context */
export type AnyNode = _Node & {
  generationInTree?: number;
  generationInClan?: number;
  patrilineage?: ReferentialSubgraph;
  rootAncestor?: _NMale
};

export type ReferentialSubgraph = {
  nodes: AnyNode["identity"][],
  links: AnyLink[]
}

export type AnyLink = _Link;

export type LinkType = AnyLink["type"];
export type LinkOfType<T extends LinkType> = Extract<AnyLink, { type: T }>;

export type NodeType = AnyNode["type"];
export type NodeOfType<T extends NodeType> = Extract<AnyNode, { type: T }>;

export type NMale = NodeOfType<"Male">;
export type NFemale = NodeOfType<"Female">;
export type NPerson = NMale | NFemale;

export type NMarriage = NodeOfType<"Marriage">;
export type MarriageIdentity = NMarriage["identity"];

export type PersonIdentity = NPerson["identity"];
export type MaleIdentity = NMale["identity"];
export type FemaleIdentity = NFemale["identity"];

export type AnyIdentity = AnyNode["identity"];
export const isMaleIdentity = (
  identity: AnyIdentity,
): identity is MaleIdentity => identity.startsWith("male:");
export const isFemaleIdentity = (
  identity: AnyIdentity,
): identity is FemaleIdentity => identity.startsWith("female:");
export const isMarriageIdentity = (
  identity: AnyIdentity,
): identity is MarriageIdentity => identity.startsWith("marriage:");

/* Getters - Nodes */
export type GetNode<N extends AnyNode> = (
  identity: Nullable<N["identity"]>,
) => N | null;
export type GetNodes<N extends AnyNode> = (
  ...identities: Nullable<N["identity"]>[]
) => N[];

export type NodeTypeByIdentity<Identity extends AnyIdentity> = Identity extends
  MaleIdentity ? NMale
  : Identity extends FemaleIdentity ? NFemale
  : Identity extends MarriageIdentity ? NMarriage
  : never;

export type NodeResolver = <Identity extends AnyIdentity>(
  identity: Identity,
) => NodeTypeByIdentity<Identity>;

/* Getters - Links */
export type ResolvedLink<L extends AnyLink> = L & {
  from: NodeTypeByIdentity<L["fromNodeIdentity"]>;
  to: NodeTypeByIdentity<L["toNodeIdentity"]>;
};

export type LinkResolver = <L extends AnyLink>(link: L) => ResolvedLink<L>;

export type LinkQuery = Partial<AnyLink>;
type LinkQueryResultTypeExtraction<Q extends LinkQuery> = Q["type"] extends
  LinkType ? { type: Q["type"] } : { type: AnyLink["type"] };
type LinkQueryResultFromNodeIdentityExtraction<Q extends LinkQuery> =
  Q["fromNodeIdentity"] extends MaleIdentity
    ? { fromNodeIdentity: MaleIdentity }
    : Q["fromNodeIdentity"] extends FemaleIdentity
      ? { fromNodeIdentity: FemaleIdentity }
    : Q["fromNodeIdentity"] extends MarriageIdentity
      ? { fromNodeIdentity: MarriageIdentity }
    : { fromNodeIdentity: AnyLink["fromNodeIdentity"] };
type LinkQueryResultToNodeIdentityExtraction<Q extends LinkQuery> =
  Q["toNodeIdentity"] extends MaleIdentity ? { toNodeIdentity: MaleIdentity }
    : Q["toNodeIdentity"] extends FemaleIdentity
      ? { toNodeIdentity: FemaleIdentity }
    : Q["toNodeIdentity"] extends MarriageIdentity
      ? { toNodeIdentity: MarriageIdentity }
    : { toNodeIdentity: AnyLink["toNodeIdentity"] };
export type LinkQueryResultExtraction<Q extends LinkQuery> = Extract<
  AnyLink,
  & LinkQueryResultTypeExtraction<Q>
  & LinkQueryResultFromNodeIdentityExtraction<Q>
  & LinkQueryResultToNodeIdentityExtraction<Q>
>;

export type GetLink = <Q extends LinkQuery>(
  query: Q,
) => ResolvedLink<LinkQueryResultExtraction<Q>> | null;
export type GetLinks = <Q extends LinkQuery>(
  query: Q,
) => ResolvedLink<LinkQueryResultExtraction<Q>>[];

/* Context */
export type ContextNodeInterface<N extends AnyNode> = {
  all: N[];
  $one: GetNode<N>;
  $many: GetNodes<N>;
  identities: N["identity"][];
};

export type ContextLinkInterface = {
  all: ResolvedLink<AnyLink>[];
  $one: GetLink;
  $many: GetLinks;
};

export type PipelineContext = {
  nodes: /* DevelopedContextNodeInterface<Node> & */ {
    persons: ContextNodeInterface<NPerson> & {
      male: ContextNodeInterface<NMale> & {
        designatedRootAncestor: NMale | null;
      };
      female: ContextNodeInterface<NFemale>;
    };
    marriages: ContextNodeInterface<NMarriage>;
  };
  links: ContextLinkInterface;
  adjacencies: Adjacencies;
};

export type Adjacencies = {
  byPerson: AdjacenciesByPerson;
  byMarriage: AdjacenciesByMarriage;
};

export type AdjacenciesByPerson = {
  single: {
    mother: AdjacencyMapSingular<PersonIdentity, FemaleIdentity>;
    adoptiveMother: AdjacencyMapSingular<PersonIdentity, FemaleIdentity>;
    father: AdjacencyMapSingular<PersonIdentity, MaleIdentity>;
    adoptiveFather: AdjacencyMapSingular<PersonIdentity, MaleIdentity>;
    progenitor: AdjacencyMapSingular<PersonIdentity, MarriageIdentity>;
    adoptiveProgenitor: AdjacencyMapSingular<PersonIdentity, MarriageIdentity>;
  };
  multiple: {
    parents: AdjacencyMapMultiple<PersonIdentity, PersonIdentity>;
    adoptiveParents: AdjacencyMapMultiple<PersonIdentity, PersonIdentity>;
    marriages: AdjacencyMapMultiple<PersonIdentity, MarriageIdentity>;
    maritalSpouses: AdjacencyMapMultiple<PersonIdentity, PersonIdentity>;
    children: AdjacencyMapMultiple<PersonIdentity, PersonIdentity>;
    adoptedChildren: AdjacencyMapMultiple<PersonIdentity, PersonIdentity>;
    fullSiblings: AdjacencyMapMultiple<PersonIdentity, PersonIdentity>;
    fullSiblingsByAdoption: AdjacencyMapMultiple<
      PersonIdentity,
      PersonIdentity
    >;
  };
};

export type AdjacenciesByMarriage = {
  single: {
    groom: AdjacencyMapSingular<MarriageIdentity, MaleIdentity>;
    bride: AdjacencyMapSingular<MarriageIdentity, FemaleIdentity>;
  };
  multiple: {
    progeny: AdjacencyMapMultiple<MarriageIdentity, PersonIdentity>;
    adoptedProgeny: AdjacencyMapMultiple<MarriageIdentity, PersonIdentity>;
  };
};
