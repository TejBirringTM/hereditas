import { declareTransformation } from "../../strategy.ts";
import { Graph } from "../graph.ts";
import generateShallowAdjacencyMaps from "./generate-shallow-adjacency-maps.ts";
import { traverseGraphBreadthFirst, traverseGraphDepthFirst } from "../../../../../../libs/graph-computation/traverse-graph-2.ts";
import {assert} from "@std/assert";

type Input = ReturnType<typeof generateShallowAdjacencyMaps["fn"]>;
export default declareTransformation("Assign generation number to nodes", (input: Input)=>{
    // initialise the working/output graph
    type TransformedGraph = {
        nodes: (Graph["nodes"][0] & { generation: number })[],
        links: Graph["links"]
    }
    const workingGraph : TransformedGraph = {
        nodes: input.nodes.map((node)=>({...node, generation: -1})),
        links: input.links
    }; 

    // 
    const nodesPerson = workingGraph.nodes.filter((node)=>node.type === "Male" || node.type === "Female");
    const nodesMarriage = workingGraph.nodes.filter((node)=>node.type === "Marriage");
    type NPerson = typeof nodesPerson[0];
    const getPersons = (...identities: NPerson["identity"][]) => nodesPerson.filter((node)=>identities.includes(node.identity));
    const getMarriages = (...identities: NMarriage["identity"][]) => nodesMarriage.filter((node)=>identities.includes(node.identity));
    const getPerson = (identity: NPerson["identity"]) => nodesPerson.find((node)=>node.identity === identity);
    type NMale = NPerson & { type: "Male" };
    type NFemale = NPerson & { type: "Female" };
    type NMarriage = typeof nodesMarriage[0];
    type AnyNode = NPerson | NMarriage;

    // find the true root node, that is the root node with the largest max depth
    const rootNode = (()=>{
        // find males with no recorded parents as root node candidates
        const rootNodes = nodesPerson
            .filter((node)=>{
                const parents = input.adjacencyMaps.byPerson.parents.get(node.identity);
                const adoptiveParents = input.adjacencyMaps.byPerson.adoptiveParents.get(node.identity);
                return (parents.length === 0 && adoptiveParents.length === 0);
            })
            .filter((node)=>node.type==="Male");

        // traverse root nodes to find node with max depth of traversal
        const rootNode = rootNodes
            .map((rootNode)=>{
                let maxDepth = 0;
                const generations : NPerson[][] = [];

                traverseGraphBreadthFirst(
                    rootNode as NPerson,
                    (node)=>{
                        const descendantIdentities = [
                            ...input.adjacencyMaps.byPerson.children.get(node.identity), 
                            ...input.adjacencyMaps.byPerson.adoptedChildren.get(node.identity)
                        ];
                        const persons = getPersons(...descendantIdentities);
                        return persons;
                    },
                    {
                        // debug: true,
                        beforeEnqueue(context) {
                            generations.push(context.currentNode.neighbours.new as NPerson[]);
                            maxDepth = generations.length;
                        },
                    }
                );

                return {
                    node: rootNode,
                    maxDepth: maxDepth,
                }
            })
            .sort((a, b)=>(b.maxDepth - a.maxDepth))[0];

        // return the true root node
        rootNode.node.generation = 1;
        return rootNode;
        })();
    
    console.debug("root node", rootNode);

    // traverse the true root node to assign generations to its lineage of successors
    let generations : NPerson[][] = [];
    traverseGraphBreadthFirst(
        rootNode.node as NPerson, 
        (node)=>{
            const descendantIdentities = [
                ...input.adjacencyMaps.byPerson.children.get(node.identity), 
                ...input.adjacencyMaps.byPerson.adoptedChildren.get(node.identity)
            ];
            const persons = getPersons(...descendantIdentities);
            return persons;
        },
        {
            // debug: true,
            beforeEnqueue(context) {
                generations.push(context.currentNode.neighbours.new as NPerson[]);
                context.currentNode.neighbours.new.forEach((n)=>{
                    n.generation = generations.length + 1;
                });
            },
            visit(context) {
                const currentNode = context.currentNode.node;
                // 
                const marriagesIdentities = input.adjacencyMaps.byPerson.marriages.get(currentNode.identity);
                const marriages = getMarriages(...marriagesIdentities);
                marriages.forEach((m)=>{
                    m.generation = currentNode.generation;
                });
                // 
                if (currentNode.type === "Male") {
                    const brideIdentities = marriagesIdentities.map((m)=>input.adjacencyMaps.byMarriage.bride.get(m)).filter((b)=>!!b);
                    const brides = getPersons(...brideIdentities);
                    brides.forEach((b)=>{
                        b.generation = currentNode.generation;
                    })
                } 
                else if (currentNode.type === "Female") {
                    const groomIdentities = marriagesIdentities.map((m)=>input.adjacencyMaps.byMarriage.groom.get(m)).filter((g)=>!!g);
                    const grooms = getPersons(...groomIdentities);
                    grooms.forEach((g)=>{
                        g.generation = currentNode.generation;
                    })
                }
            }
        }
    )

    // find 'intersection nodes' - nodes that are assigned a generation number, but parents are not
    // const intersectingNodes = nodesPerson.filter((node)=>{
    //     const assignedGenerationNumber = node.generation > 0;
    //     const parentIdentities = input.adjacencyMaps.byPerson.parents.get(node.identity);
    //     const parents = getPersons(...parentIdentities);
    //     const parentsAssignedGenerationNumber = parents.every((p)=>p.generation > 0);
    //     return (assignedGenerationNumber && !parentsAssignedGenerationNumber);
    // });
    // console.debug("intersecting nodes", intersectingNodes)
    
    // // traverse intersecting nodes to find root node as assign it a generation number WITH RESPECT TO intersecting node's generation number
    // const insectingNodesRootNodes = intersectingNodes.map((node)=>{
    //     const root = {
    //         node,
    //         gen: node.generation
    //     }
    //     traverseGraphDepthFirst(
    //         node,
    //         (currentNode) => {
    //             const fatherIdentity = input.adjacencyMaps.byPerson.father.get(currentNode.identity);
    //             if (fatherIdentity) {
    //                 const father = getPerson(fatherIdentity);
    //                 assert(father);
    //                 return [father];
    //             } else {
    //                 return [];
    //             }
    //         },
    //         {
    //             visit(context) {
    //                 if (context.currentNode.neighbours.all.length === 0) {
    //                     root.node = context.currentNode.node;
    //                 } else {
    //                     root.gen--;
    //                 }
    //             }
    //         }
    //     );
    //     root.node.generation = root.gen;
    //     return root.node;
    // });

    // console.debug("intersecting nodes' root nodes", insectingNodesRootNodes);
    
    // traverse down, breadth-first, the intersecting nodes' root node(s) to assign generation numbers successively
    // for (const node of insectingNodesRootNodes) {
    //     console.debug("Starting generation number assignment for node", node.identity)
    //     let generation = node.generation + 1;
    //     traverseGraphBreadthFirst(
    //         node,
    //         (node) => {
    //             const descendantIdentities = [
    //                 ...input.adjacencyMaps.byPerson.children.get(node.identity), 
    //                 ...input.adjacencyMaps.byPerson.adoptedChildren.get(node.identity)
    //             ];
    //             const persons = getPersons(...descendantIdentities);
    //             return persons;
    //         },
    //         {
    //             debug: true,
    //             beforeEnqueue(context) {
    //                 context.currentNode.neighbours.new.forEach((n)=>{
    //                     n.generation = generation;
    //                 });
    //                 generation++;
    //             },
    //             visit(context) {
    //                 const currentNode = context.currentNode.node;
    //                 // 
    //                 const marriagesIdentities = input.adjacencyMaps.byPerson.marriages.get(currentNode.identity);
    //                 const marriages = getMarriages(...marriagesIdentities);
    //                 marriages.forEach((m)=>{
    //                     m.generation = currentNode.generation;
    //                 });
    //                 // 
    //                 if (currentNode.type === "Male") {
    //                     const brideIdentities = marriagesIdentities.map((m)=>input.adjacencyMaps.byMarriage.bride.get(m)).filter((b)=>!!b);
    //                     const brides = getPersons(...brideIdentities);
    //                     brides.forEach((b)=>{
    //                         b.generation = currentNode.generation;
    //                     })
    //                 } 
    //                 else if (currentNode.type === "Female") {
    //                     const groomIdentities = marriagesIdentities.map((m)=>input.adjacencyMaps.byMarriage.groom.get(m)).filter((g)=>!!g);
    //                     const grooms = getPersons(...groomIdentities);
    //                     grooms.forEach((g)=>{
    //                         g.generation = currentNode.generation;
    //                     })
    //                 }
    //             }
    //         }
    //     )
    // }
    

    // traverseGraphDepthFirst(
    //     rootNode.node,
    //     (node) => {

    //     },
    //     {
    //         debug: true,

    //     }
    // )
    // traverse down from root node to assign generation numbers to its lineage of successors (and kinship ties)
    // traverseGraph(
    //     rootNode.node as AnyNode,
    //     (node)=>{
    //         const descendantIdentities = node.type === "Marriage" ? [] : [
    //             ...input.adjacencyMaps.byPerson.getChildren.get(node.identity), 
    //             ...input.adjacencyMaps.byPerson.getAdoptedChildren.get(node.identity), 
    //         ];

    //         const descendants = getPersons(...descendantIdentities)
    //             .map((node)=>({
    //                 ...node,
    //                 generation: -1
    //              })
    //         );

    //         const descendantsMarriages = descendants.reduce<NMarriage[]>((prev, curr)=>{
    //             const marriagesIdentities = input.adjacencyMaps.byPerson.getMarriages.get(curr.identity);
    //             const marriages = getMarriages(...marriagesIdentities);
    //             return [...prev, ...marriages]
    //                 .map((node)=>({
    //                     ...node,
    //                     generation: -1
    //                 }));
    //         }, []);

    //         const descendantsMarriagesBrideAndGroom = descendantsMarriages.reduce<NPerson[]>((prev, curr)=>{
    //             const brideIdentity = input.adjacencyMaps.byMarriage.getBride.get(curr.identity);
    //             assert(brideIdentity);
    //             const bride = getPerson(brideIdentity);
    //             assert(bride);
    //             const groomIdentity = input.adjacencyMaps.byMarriage.getGroom.get(curr.identity);
    //             assert(groomIdentity);
    //             const groom = getPerson(groomIdentity);
    //             assert(groom);
    //             return [
    //                 ...prev,
    //                 ...[bride, groom]
    //                     .map((node)=>({
    //                         ...node,
    //                         generation: -1
    //                     }))
    //             ];
    //         }, []);

    //         // console.log(...descendants, ...descendantsMarriages, ...descendantsMarriagesBrideAndGroom, ..."\n\n\n");

    //         return [...descendants, /*...descendantsMarriages, ...descendantsMarriagesBrideAndGroom*/];
    //     },
    //     (history)=>{
    //         const currentGeneration = history.depth+1;
    //         console.log(currentGeneration);
    //         const currentNode = history.currentNode;
    //         // assign generation to the current node
    //         currentNode.generation = currentGeneration;
    //         console.log(currentNode);
    //     },
    //     "dfs"
    // )


    return workingGraph;
});
