type Node<Type extends string> = {
  identity: `${Lowercase<Type>}:${string}`;
  type: Type;
};

type Relationship<
  Type extends string,
  FromNodeType extends string,
  ToNodeType extends string,
> = {
  // identity: `link(${Lowercase<Type>}):${string}`,
  fromNodeIdentity: `${Lowercase<FromNodeType>}:${string}`;
  toNodeIdentity: `${Lowercase<ToNodeType>}:${string}`;
  type: Type;
};

// Nodes:

export type NMale = Node<"Male"> & {
  title: string;
};
export type NFemale = Node<"Female"> & {
  title: string;
};
export type NMarriage = Node<"Marriage">;

export type NPerson = NMale | NFemale;

export type AnyNode = NMale | NFemale | NMarriage;

// Links:

// Marital
export type LGroom = Relationship<"Groom", "Marriage", "Male">;
export type LBride = Relationship<"Bride", "Marriage", "Female">;
export type LMarriage = Relationship<"Marriage", "Male" | "Female", "Marriage">;

export type LWife = Relationship<"Wife", "Male", "Female">;
export type LHusband = Relationship<"Husband", "Female", "Male">;
export type LMaritalSpouse = Relationship<
  "MaritalSpouse",
  "Male" | "Female",
  "Male" | "Female"
>;

// Marital Progeny
export type LMaritalProgeny = Relationship<
  "MaritalProgeny",
  "Marriage",
  "Male" | "Female"
>;
export type LAdoptedMaritalProgeny = Relationship<
  "AdoptedMaritalProgeny",
  "Marriage",
  "Male" | "Female"
>;

export type LMaritalProgenitor = Relationship<
  "MaritalProgenitor",
  "Male" | "Female",
  "Marriage"
>;
export type LAdoptiveMaritalProgenitor = Relationship<
  "AdoptiveMaritalProgenitor",
  "Male" | "Female",
  "Marriage"
>;

// Parentage
export type LMother = Relationship<"Mother", "Male" | "Female", "Female">;
export type LFather = Relationship<"Father", "Male" | "Female", "Male">;
export type LParent = Relationship<
  "Parent",
  "Male" | "Female",
  "Male" | "Female"
>;

export type LSon = Relationship<"Son", "Male" | "Female", "Male">;
export type LDaughter = Relationship<"Daughter", "Male" | "Female", "Female">;
export type LChild = Relationship<
  "Child",
  "Male" | "Female",
  "Male" | "Female"
>;

// Adoptive Parentage
export type LAdoptiveMother = Relationship<
  "AdoptiveMother",
  "Male" | "Female",
  "Female"
>;
export type LAdoptiveFather = Relationship<
  "AdoptiveFather",
  "Male" | "Female",
  "Male"
>;
export type LAdoptiveParent = Relationship<
  "AdoptiveParent",
  "Male" | "Female",
  "Male" | "Female"
>;

export type LAdoptedSon = Relationship<"AdoptedSon", "Male" | "Female", "Male">;
export type LAdoptedDaughter = Relationship<
  "AdoptedDaughter",
  "Male" | "Female",
  "Female"
>;
export type LAdoptedChild = Relationship<
  "AdoptedChild",
  "Male" | "Female",
  "Male" | "Female"
>;

// Sibling
export type LFullSibling = Relationship<
  "FullSibling",
  "Male" | "Female",
  "Male" | "Female"
>;
export type LAdoptiveFullSibling = Relationship<
  "AdoptiveFullSibling",
  "Male" | "Female",
  "Male" | "Female"
>;

// All Links
export type AnyLink =
  | LGroom
  | LBride
  | LMarriage
  | LWife
  | LHusband
  | LMaritalSpouse
  | LMaritalProgeny
  | LMaritalProgenitor
  | LAdoptedMaritalProgeny
  | LAdoptiveMaritalProgenitor
  | LMother
  | LAdoptiveMother
  | LFather
  | LAdoptiveFather
  | LParent
  | LAdoptiveParent
  | LSon
  | LAdoptedSon
  | LDaughter
  | LAdoptedDaughter
  | LChild
  | LAdoptedChild
  | LFullSibling
  | LAdoptiveFullSibling;

export type AnyLinkKey = AnyLink["type"];

export type FamilyTreeContext = {
  maleNodes: Map<NMale["identity"], NMale>;
  femaleNodes: Map<NFemale["identity"], NFemale>;
  marriageNodes: Map<NMarriage["identity"], NMarriage>;
  startNode: NMale | null;
  links: Array<AnyLink>;
};
