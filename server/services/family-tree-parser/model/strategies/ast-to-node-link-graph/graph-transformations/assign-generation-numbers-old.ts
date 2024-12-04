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

    // create adjacency maps
    const createEmptyAdjacencyMap = <T>() => {
        const mapEntries = nodesPerson.map((person)=>([person.identity, new Array<NPerson>()] as const));
        return new Map<NPerson["identity"], NPerson[]>(mapEntries);
    }
    const mapParents = createEmptyAdjacencyMap();
    const mapChildren = createEmptyAdjacencyMap();
    const mapAdopters = createEmptyAdjacencyMap();
    const mapAdoptees = createEmptyAdjacencyMap();

    // populate adjacency maps - parents and children
    const linksParentTo = workingGraph.links.filter((link)=>link.type==="ParentTo");
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

    // populate adjacency maps - adopter and adoptees
    const linksAdopterTo = workingGraph.links.filter((link)=>link.type==="AdopterTo");
    linksAdopterTo.forEach((link)=>{
        const adopterIdentity = link.fromNodeIdentity;
        const adopteeIdentity = link.toNodeIdentity;
        const adopter = getPersonNode(adopterIdentity);
        assert(adopter);
        const adoptee = getPersonNode(adopteeIdentity);
        assert(adoptee);
        // add adoptee entry
        mapAdoptees.get(adopter.identity)?.push(adoptee);
        // add adopter entry
        mapAdopters.get(adoptee.identity)?.push(adopter);
    })

    // identify root nodes (nodes with no parents)
    const nodesRoot = nodesPerson.filter((person)=>{
        const parents = mapParents.get(person.identity);
        assert(parents);
        return parents.length === 0;
    });

    // initialise pre-loop context
    let currentGeneration = 1;
    let currentNodes = nodesRoot;
    let nextNodes = [] as typeof currentNodes;
    const pushNode = (nodeToPush: typeof nextNodes[0]) => {
        if (!nextNodes.find((node)=>node.identity===nodeToPush.identity)) {
            nextNodes.push(nodeToPush);
        }
    }
    // loop
    while(currentNodes.length > 0) {
        currentNodes.forEach((node)=>{
            // 1. assign generation
            node.generation = currentGeneration;
            // 2. if the 
            // 2. iterate over children to populate nodes for the next generation to process
            const children = mapChildren.get(node.identity);
            assert(children);
            children.forEach((child)=>{
                // identify all parents for the child
                const parents = mapParents.get(child.identity);
                assert(parents);
                // if all parents have already been assigned a generation, add it to the next wave of nodes to process
                const allParentsHaveBeenAssignedGeneration = parents.every((parent)=>(parent.generation > -1));
                if (allParentsHaveBeenAssignedGeneration) {
                    console.debug(`Adding ${child.identity} as child`);
                    pushNode(child);
                }
            });
            // 3. iterate over adoptees to populate nodes for the next generation to process
            const adoptees = mapAdoptees.get(node.identity);
            assert(adoptees);
            adoptees.forEach((adoptee)=>{
                // identify all adopters for the adoptee
                const adopters = mapAdopters.get(adoptee.identity);
                assert(adopters);
                // identify all parents for the adoptee
                const parents = mapParents.get(adoptee.identity);
                assert(parents);
                // if the adoptee has no recorded parents and all adopters have already been assigned a generation, 
                // add it to the next wave of nodes to process]
                const noRecordedParents = parents.length === 0;
                const allAdoptersHaveBeenAssignedGeneration = adopters.every((adopter)=>(adopter.generation > -1));
                if (noRecordedParents && allAdoptersHaveBeenAssignedGeneration) {
                    console.debug(`Adding ${adoptee.identity} as adoptee`);
                    pushNode(adoptee);
                }
            });
        });
        // 3. update loop context
        currentGeneration++;
        currentNodes = nextNodes;
        nextNodes = [];
    }

    // assign marriages and wives same generation as the groom
    // const nodesMale = nodesPerson.filter((person)=>(person.type === "Male"));
    // const nodesFemale = nodesPerson.filter((person)=>(person.type === "Female"));
    // const nodesMarriage = workingGraph.nodes.filter((node)=>(node.type === "Marriage"));
    // const linksGroom = workingGraph.links.filter((link)=>(link.type === "Groom"));
    // const linksHusbandTo = workingGraph.links.filter((link)=>(link.type === "HusbandTo"));
    // const getMarriagesByGroom = (groomIdentity: NMale["identity"]) => {
    //     const links = linksGroom.filter((link)=>(link.fromNodeIdentity === groomIdentity));
    //     const marriages = links.map((link)=>{
    //         const marriage = nodesMarriage.find((marriage)=>marriage.identity === link.toNodeIdentity);
    //         assert(marriage);
    //         return marriage;
    //     });
    //     return marriages;
    // };
    // const getWivesByHusband = (husbandIdentity: NMale["identity"]) => {
    //     const links = linksHusbandTo.filter((link)=>(link.fromNodeIdentity === husbandIdentity));
    //     const wives = links.map((link)=>{
    //         const wife = nodesFemale.find((female)=>(female.identity === link.toNodeIdentity));
    //         assert(wife);
    //         return wife;
    //     });
    //     return wives;
    // };
    
    // nodesMale.forEach((male)=>{
    //     const marriages = getMarriagesByGroom(male.identity);
    //     const wives = getWivesByHusband(male.identity);
    //     marriages.forEach((marriage)=>{
    //         marriage.generation = male.generation;
    //     });
    //     wives.forEach((wife)=>{
    //        wife.generation = male.generation; 
    //     }) 
    // });

    return workingGraph;
});
