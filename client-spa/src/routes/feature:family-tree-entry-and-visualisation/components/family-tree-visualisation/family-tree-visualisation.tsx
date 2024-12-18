// import { useRef } from "react";
// import { Graph as FamilyTreeGraph } from "../../libs/parse-family-tree-entry";

// interface FamilyTreeEntryGraphProps {
//     graph?: FamilyTreeGraph | null,
//     width: number,
//     height: number,
// }

// type Node = FamilyTreeGraph["nodes"][0] & {
//     children?: Node[]
// };

// type Link = FamilyTreeGraph["links"][0];

// function transformData(nodes: Node[], links: Link[]) {
//     // Find root nodes (nodes that are not targets in any link)
//     const targetIds = new Set(links.map(l => l.toNodeIdentity));
//     const rootNodes = nodes.filter(n => !targetIds.has(n.identity));

//     // Create a map of nodes by ID
//     const nodeMap = new Map(nodes.map(n => [n.identity, { ...n, children: [] }]));

//     // Build the tree structure
//     links.forEach(link => {
//       const parent = nodeMap.get(link.fromNodeIdentity);
//       const child = nodeMap.get(link.toNodeIdentity);
//       if (parent && child) {
//         if (!parent.children) parent.children = [];
//         parent.children.push(child);
//       }
//     });

//     // Return the first root node (assuming there's only one)
//     return rootNodes[0];
//   }

// export default function FamilyTreeEntryGraph({graph, width, height}: FamilyTreeEntryGraphProps) {
//   const root = useRef<HTMLDivElement>(null);

//   return <div ref={root} style={{height: "fit-content", overflowX: "auto"}}>
//     {/* <FamilyTreeGraphPopup
//         node={selectedNode}
//         left={selectedNodePosition?.[0]}
//         top={selectedNodePosition?.[1]}
//     /> */}
//   </div>
// }