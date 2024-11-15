import { assert } from "@std/assert";
import { declareTransformation } from "../../strategy.ts";
import { Graph } from "../graph.ts";

export default declareTransformation("Assign generation number to nodes", (graph: Graph)=>{
    // initialise the working/output graph
    type TransformedGraph = {
        nodes: (Graph["nodes"][0] & { generation: number })[],
        links: Graph["links"]
    }
    const workingGraph : TransformedGraph = {
        nodes: graph.nodes.map((node)=>({...node, generation: -1})),
        links: graph.links
    };

    const nodesPerson =  workingGraph.nodes.filter((node)=>(node.type === "Male" || node.type === "Female"));
    type NPerson = typeof nodesPerson[0];
    type NMale = NPerson & { type: "Male" };
    type NFemale = NPerson & { type: "Female" };
    const getPersonNode = (identity: NPerson["identity"]) => (nodesPerson.find((person)=>person.identity === identity));
    const linksParentTo = workingGraph.links.filter((node)=>node.type==="ParentTo");

    const createEmptyAdjacencyMap = <T>() => {
        const mapEntries = nodesPerson.map((person)=>([person.identity, new Array<NPerson>()] as const));
        return new Map<NPerson["identity"], NPerson[]>(mapEntries);
    }

    // create adjacency maps
    const mapParents = createEmptyAdjacencyMap();
    const mapChildren = createEmptyAdjacencyMap();

    // populate adjacency maps
    linksParentTo.forEach((link)=>{
        const parentIdentity = link.fromNodeIdentity;
        const childIdentity = link.toNodeIdentity;
        const parent = getPersonNode(parentIdentity);
        assert(parent);
        const child = getPersonNode(childIdentity);
        assert(child);
        // add child entry
        mapChildren.get(parent.identity)?.push(child);
        // add parent entry
        mapParents.get(child.identity)?.push(parent);
    })

    // identify root nodes
    const nodesRoot = nodesPerson.filter((person)=>{
        const parents = mapParents.get(person.identity);
        assert(parents);
        return parents.length === 0;
    });

    // initialise pre-loop context
    let currentGeneration = 1;
    let currentNodes = nodesRoot;
    let nextNodes = [] as typeof currentNodes;

    // loop
    while(currentNodes.length > 0) {
        currentNodes.forEach((node)=>{
            // 1. assign generation
            node.generation = currentGeneration;
            // 2. iterate over children to populate nodes for next generation
            const children = mapChildren.get(node.identity);
            assert(children);
            children.forEach((child)=>{
                // identify child's parents
                const childsParents = mapParents.get(child.identity);
                assert(childsParents);
                // if child's parents have been assigned a generation, add it to the next wave of nodes to process
                const childsParentsHaveBeenAssignedGeneration = childsParents.every((parent)=>(parent.generation > -1));
                if (childsParentsHaveBeenAssignedGeneration) {
                    nextNodes.push(child);
                }
            });
        });
        // 3. update loop context
        currentGeneration++;
        currentNodes = nextNodes;
        nextNodes = [];
    }

    // assign marriages and wives same generation as the groom
    const nodesMale = nodesPerson.filter((person)=>(person.type === "Male"));
    const nodesFemale = nodesPerson.filter((person)=>(person.type === "Female"));
    const nodesMarriage = workingGraph.nodes.filter((node)=>(node.type === "Marriage"));
    const linksGroom = workingGraph.links.filter((link)=>(link.type === "Groom"));
    const linksHusbandTo = workingGraph.links.filter((link)=>(link.type === "HusbandTo"));
    const getMarriagesByGroom = (groomIdentity: NMale["identity"]) => {
        const links = linksGroom.filter((link)=>(link.fromNodeIdentity === groomIdentity));
        const marriages = links.map((link)=>{
            const marriage = nodesMarriage.find((marriage)=>marriage.identity === link.toNodeIdentity);
            assert(marriage);
            return marriage;
        });
        return marriages;
    };
    const getWivesByHusband = (husbandIdentity: NMale["identity"]) => {
        const links = linksHusbandTo.filter((link)=>(link.fromNodeIdentity === husbandIdentity));
        const wives = links.map((link)=>{
            const wife = nodesFemale.find((female)=>(female.identity === link.toNodeIdentity));
            assert(wife);
            return wife;
        });
        return wives;
    };
    
    nodesMale.forEach((male)=>{
        const marriages = getMarriagesByGroom(male.identity);
        const wives = getWivesByHusband(male.identity);
        marriages.forEach((marriage)=>{
            marriage.generation = male.generation;
        });
        wives.forEach((wife)=>{
           wife.generation = male.generation; 
        }) 
    });

    return workingGraph;
});
