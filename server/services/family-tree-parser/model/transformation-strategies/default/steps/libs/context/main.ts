import { assert } from "@std/assert";
import { Nullable } from "../../../../../../../../types.ts";
import {
  AnyIdentity,
  AnyLink,
  AnyNode,
  BasicContext,
  FemaleIdentity,
  LinkQuery,
  LinkQueryResultExtraction,
  LinkResolver,
  MaleIdentity,
  MarriageIdentity,
  NodeResolver,
  NodeTypeByIdentity,
  PipelineContext,
  ResolvedLink,
} from "./types.ts";
import { developAdjacencies } from "./adjacencies.ts";

export const makeSingleGetter =
  <N extends AnyNode>(nodes: N[]) => (identity: Nullable<N["identity"]>) =>
    identity
      ? (nodes.find((node) => node.identity === identity) ?? null)
      : null;
export const makeManyGetter =
  <N extends AnyNode>(nodes: N[]) =>
  (...identities: Nullable<N["identity"]>[]) => {
    const _identities = identities.filter((i) => !!i);
    return nodes.filter((node) => _identities.includes(node.identity));
  };

export function makeContext(basicContext: BasicContext) {
  const context = basicContext;

  const nodesMale = [...context.maleNodes.values()];
  const nodesFemale = [...context.femaleNodes.values()];
  const nodesPerson = [...nodesMale, ...nodesFemale];
  const nodesMarriage = [...context.marriageNodes.values()];

  const identitiesMale = [...context.maleNodes.keys()];
  const identitiesFemale = [...context.femaleNodes.keys()];
  const identitiesPerson = [...identitiesMale, ...identitiesFemale];
  const identitiesMarriage = [...context.marriageNodes.keys()];

  const developedNodeContext = {
    persons: {
      all: nodesPerson,
      $one: makeSingleGetter(nodesPerson),
      $many: makeManyGetter(nodesPerson),
      identities: identitiesPerson,

      male: {
        all: nodesMale,
        identities: identitiesMale,
        $one: makeSingleGetter(nodesMale),
        $many: makeManyGetter(nodesMale),
        designatedRootAncestor: context.startNode,
      },
      female: {
        all: nodesFemale,
        identities: identitiesFemale,
        $one: makeSingleGetter(nodesFemale),
        $many: makeManyGetter(nodesFemale),
      },
    },
    marriages: {
      all: nodesMarriage,
      identities: identitiesMarriage,
      $one: makeSingleGetter(nodesMarriage),
      $many: makeManyGetter(nodesMarriage),
    },
  };

  const resolveNode: NodeResolver = <Identity extends AnyIdentity>(
    identity: Identity,
  ) => {
    if (identity.startsWith("male:")) {
      return developedNodeContext.persons.male.$one(
        identity as MaleIdentity,
      ) as NodeTypeByIdentity<Identity>;
    } else if (identity.startsWith("female:")) {
      return developedNodeContext.persons.female.$one(
        identity as FemaleIdentity,
      ) as NodeTypeByIdentity<Identity>;
    } else if (identity.startsWith("marriage:")) {
      return developedNodeContext.marriages.$one(
        identity as MarriageIdentity,
      ) as NodeTypeByIdentity<Identity>;
    } else {
      assert(false);
    }
  };

  const resolveLink: LinkResolver = <L extends AnyLink>(link: L) =>
    ({
      ...link,
      from: resolveNode(link.fromNodeIdentity),
      to: resolveNode(link.toNodeIdentity),
    }) as ResolvedLink<L>;

  const resolvedLinks = context.links.map((link) => resolveLink(link));

  const getLink = <Q extends LinkQuery>(query: Q) =>
    (resolvedLinks.find((l) => {
      const { type, fromNodeIdentity, toNodeIdentity } = query;
      const matchType = l.type ? (l.type === type) : true;
      const matchFrom = fromNodeIdentity
        ? (l.fromNodeIdentity === fromNodeIdentity)
        : true;
      const matchTo = toNodeIdentity
        ? (l.toNodeIdentity === toNodeIdentity)
        : true;
      return (matchType && matchFrom && matchTo);
    }) ?? null) as (ResolvedLink<LinkQueryResultExtraction<Q>> | null);

  const getLinks = <Q extends LinkQuery>(query: Q) =>
    resolvedLinks.filter((l) => {
      const { type, fromNodeIdentity, toNodeIdentity } = query;
      const matchType = l.type ? (l.type === type) : true;
      const matchFrom = fromNodeIdentity
        ? (l.fromNodeIdentity === fromNodeIdentity)
        : true;
      const matchTo = toNodeIdentity
        ? (l.toNodeIdentity === toNodeIdentity)
        : true;
      return (matchType && matchFrom && matchTo);
    }) as ResolvedLink<LinkQueryResultExtraction<Q>>[];

  const developedLinkContext = {
    all: resolvedLinks,
    $one: getLink,
    $many: getLinks,
  };

  const developedAdjacencies = developAdjacencies({
    nodes: developedNodeContext,
    links: developedLinkContext,
  });

  const pipelineContext: PipelineContext = {
    nodes: developedNodeContext,
    links: developedLinkContext,
    adjacencies: developedAdjacencies,
  };

  return pipelineContext;
}

export function unresolveLink<L extends AnyLink>(link: ResolvedLink<L>): L {
  return {
    type: link.type,
    fromNodeIdentity: link.fromNodeIdentity,
    toNodeIdentity: link.toNodeIdentity,
  } as L;
}
