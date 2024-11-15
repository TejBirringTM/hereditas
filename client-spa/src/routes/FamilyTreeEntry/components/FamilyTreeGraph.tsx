import { useEffect, useRef, useState } from "react";
import { Graph as FamilyTreeGraph } from "../libs/parse-family-tree-entry";
import * as d3 from "d3";
import { SimulationNode, SimulationLink } from "./types";
import { getLinkStyle, getNodeStyle } from "./styling/style";
import FamilyTreeGraphPopup from "./FamilyTreeGraphPopup";

interface FamilyTreeEntryGraphProps {
    graph?: FamilyTreeGraph | null,
    width: number,
    height: number,
}



export default function FamilyTreeEntryGraph({graph, width, height}: FamilyTreeEntryGraphProps) {
    const root = useRef<HTMLDivElement>(null);
    const [selectedNode, _selectNode] = useState<SimulationNode|null>(null);
    const [selectedNodePosition, selectNodePosition] = useState<[number, number]|null>(null);

    function selectNode(nodeToSelect: SimulationNode | null, allNodes?: SimulationNode[], allLinks?: SimulationLink[]) {
        // set state
        _selectNode(nodeToSelect);
        if (!nodeToSelect) {
            if (allNodes) {
                allNodes.forEach((node)=>{
                    node.state = "normal";
                })
            }
            return;
        }
        if (allNodes && allLinks) {
            // highlight lineage nodes
            allNodes.forEach((node)=>{
                // unhighlight existing 
                if (node.identity === nodeToSelect.identity) {
                    node.state = "selected";
                } else {
                    node.state = "normal";
                }
                // highlight those associated with the lineage of this node
                if (!nodeToSelect.directLineageHighlightedNodesAndLinks) {
                    return;
                } else {
                    const isLineageNode = nodeToSelect.directLineageHighlightedNodesAndLinks.nodes.includes(node.identity);
                    if (isLineageNode) {
                        node.state = "highlighted";
                    }
                }
            });
            // highlight lineage links
            allLinks.forEach((link)=>{
                // unhighlight existing 
                link.state = "normal";
                // highlight those associated with the lineage of this node
                if (!nodeToSelect.directLineageHighlightedNodesAndLinks) {
                    return
                } else {
                    const isLineageLink = nodeToSelect.directLineageHighlightedNodesAndLinks.links.find((lineageLink)=>(
                        link.type === lineageLink.type &&
                        link.fromNodeIdentity === lineageLink.fromNodeIdentity &&
                        link.toNodeIdentity === lineageLink.toNodeIdentity
                    ));
                    if (isLineageLink) {
                        link.state = "highlighted";
                    }
                }
            })
        }
    }

    // render graph elements and start forces simulation
    useEffect(()=>{
        const svgWidth = width;
        const svgHeight = height;
        const div = d3.select(root.current);
        let svg = div.select("svg");
        if (svg.empty()) {
            div.append('svg')
                .attr("width", svgWidth)
                .attr("height", svgHeight)
                .attr("viewBox", [0, 0, svgWidth, svgHeight])
                .attr("style", "max-width: 100%; height: auto;")
            svg = div.select("svg");            
        } else {
            svg.selectChildren().remove();
            svg.attr("width", svgWidth)
                .attr("height", svgHeight)
                .attr("viewBox", [0, 0, svgWidth, svgHeight])
        }

        if (!graph) {
            console.debug("No graph, therefore nothing to draw.");
            svg.selectChildren().remove();
            selectNode(null);
            selectNodePosition(null);
            return;
        } else {
            console.debug("Drawing graph...");
        }

        function updateNodeStyles() {
            const nodeSelectGroup = svg.selectAll("g");
            const nodeSelectCircle = nodeSelectGroup.selectAll<SVGCircleElement, SimulationNode>("circle");
            const nodeSelectText = nodeSelectGroup.selectAll<SVGTextElement, SimulationNode>("text");

            nodeSelectCircle
                .attr("r", (d)=>getNodeStyle(d).r)
                .attr("fill", (d)=>getNodeStyle(d).fill)
                .attr("stroke", (d)=>getNodeStyle(d).stroke)
                .attr("stroke-width", (d)=>getNodeStyle(d)["stroke-width"]);

            nodeSelectText
                .attr("font-size", (d)=>getNodeStyle(d)["font-size"])
                .attr("font-weight", (d)=>getNodeStyle(d)["font-weight"])
                .attr("fill", (d)=>getNodeStyle(d)["text-colour"])
                .text((d)=>getNodeStyle(d).text)
        }

        function updateLinkStyles() {
            const linkLines = svg.selectAll<SVGLineElement, SimulationLink>("line");
            linkLines
                .attr("stroke", (d)=>getLinkStyle(d).stroke)
                .attr("stroke-width", (d)=>getLinkStyle(d)["stroke-width"])
                .attr("marker-start", (d)=>getLinkStyle(d)["marker-start"])
                .attr("marker-end", (d)=>getLinkStyle(d)["marker-end"])
        }
        
        function updateStyles() {
            updateNodeStyles();
            updateLinkStyles();
        }

        // See https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker
            const filledArrowMarkerBoxSize = 3.5;
            const filledArrowRefX = filledArrowMarkerBoxSize/2;
            const filledArrowRefY = filledArrowMarkerBoxSize/2;
            const filledArrowPoints = [[filledArrowMarkerBoxSize, filledArrowMarkerBoxSize/2], [0, 0], [0, filledArrowMarkerBoxSize]] satisfies [number, number][];
            svg
                .on("click", (event: MouseEvent)=>{
                    event.stopPropagation();
                    nodes.forEach((node)=>{
                        node.state = "normal";
                    });
                    links.forEach((link)=>{
                        link.state = "normal"
                    })
                    selectNode(null, nodes, links);
                    updateStyles();
                })
                .append('defs')
                .append('marker')
                .attr('id', 'filledArrow')
                .attr('viewBox', [0, 0, filledArrowMarkerBoxSize, filledArrowMarkerBoxSize])
                .attr('refX', filledArrowRefX)
                .attr('refY', filledArrowRefY)
                .attr('markerWidth', filledArrowMarkerBoxSize)
                .attr('markerHeight', filledArrowMarkerBoxSize)
                .attr('orient', 'auto-start-reverse')
                .attr('fill', 'context-stroke')
                .append('path')
                .attr('d', d3.line()(filledArrowPoints))

        const nodes : SimulationNode[] = graph.nodes.map((node)=>({
            ...node,
            index: undefined,
            x: undefined,
            y: undefined,
            vx: undefined,
            vy: undefined,
            fx: undefined,
            fy: undefined,
            state: "normal"
        }));

        const links = graph.links.map((link)=>({
            ...link, 
            index: undefined,
            source: link.fromNodeIdentity as unknown as SimulationNode,
            target: link.toNodeIdentity as unknown as SimulationNode,
            state: "normal"
        })) satisfies SimulationLink[];

        const forceChargeNode = d3.forceManyBody();
        const forceCentre = d3.forceCenter(svgWidth/2, svgHeight/2);
        const forceCollide = d3.forceCollide<SimulationNode>((d)=>((d.type === "Marriage") ? 0 : (getNodeStyle(d).r as number) * 1.5));
        const forceLinks = d3.forceLink(links)
                                .strength((d)=>((d.type === "Bride" || d.type === "Groom") ? 1 : 1/75))
                                .distance((d)=>{
                                    switch (d.type) {
                                        case "Bride":
                                            return 0;
                                        case "Groom":
                                            return 0;
                                        case "Progeny":
                                            return 30;
                                        case "AdoptedHeir":
                                            return 30;
                                        default:
                                            return 30;
                                    }
                                });
        const forceY = d3.forceY<SimulationNode>((d) => (d.generation * 250)).strength(0.1);

        const simulation = d3.forceSimulation(nodes)
                            .force("link", forceLinks.id((node)=>(node as typeof nodes[0]).identity))
                            .force("charge", forceChargeNode)
                            .force("centre", forceCentre)
                            .force("collide", forceCollide)
                            .force("y", forceY)
                            .on("tick", onSimulationTick);

        const _nodes = svg.selectAll("g")
            .data(nodes)
            .join(
                (enter)=>{
                    const group = enter.append("g");

                    group.append("circle")
                        .attr("pointer-events", "visibleFill")
                        .attr("cursor", "pointer")
                        .on("mouseenter", (_event, d) => {
                            if ((d.state === "normal") && (d.type === "Male" || d.type === "Female")) {
                                d.state = "hovered";
                            }
                            updateStyles();
                        })
                        .on("mouseleave", (_event, d) => {
                            if (d.type === "Male" || d.type === "Female") {
                                if (d.state === "hovered") {
                                    d.state = "normal";
                                }
                            }
                            updateStyles();
                        })
                        .on("click", (event: MouseEvent, d) => {
                            event.stopPropagation();
                            if (d.type === "Male" || d.type === "Female") {
                                selectNode(d, nodes, links);
                                const position = [event.pageX, event.pageY] as [number, number];
                                selectNodePosition(position);
                            }
                            updateStyles();
                        })

                    group.append("text")
                        .style("user-select", "none")
                        .style("user-drag", "none")
                        .attr("pointer-events", "none")
                        .attr("text-anchor", "middle")
                        .attr("dominant-baseline", "middle");

                    group.call(updateStyles);
                    return group;
                },
                (update)=>{
                    return update;
                },
                (exit)=>{
                    return exit.remove()
                },
            )

            const _links = svg.selectAll("line")
            .data(links)
            .join(
                (enter)=>{
                    const line = enter.append("line")
                        .attr("pointer-events", "none");
                    updateStyles();
                    return line;
                },
                (update)=>{
                    return update
                },
                (exit)=>{
                    return exit.remove()
                },
            )    

        function onSimulationTick() {
            _links
                .attr("x1", (d) => {
                    if (!d.target.x || !d.target.y || !d.source.x || !d.source.y) return null;
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const angle = Math.atan2(dy, dx); // calculate angle between source and target nodes
                    return d.source.x + Math.cos(angle) * (getNodeStyle(d.source).r as number);
                })
                .attr("y1", (d) => {
                    if (!d.target.x || !d.target.y || !d.source.x || !d.source.y) return null;
                    const dx = d.target.x - d.source.x;
                    const dy = d.target.y - d.source.y;
                    const angle = Math.atan2(dy, dx); // calculate angle between source and target nodes
                    return d.source.y + Math.sin(angle) * (getNodeStyle(d.source).r as number);
                })
                .attr("x2", (d) => {
                    if (!d.target.x || !d.target.y || !d.source.x || !d.source.y) return null;
                    const dx = d.source.x - d.target.x;
                    const dy = d.source.y - d.target.y;
                    const angle = Math.atan2(dy, dx); // calculate angle between source and target nodes
                    return d.target.x + Math.cos(angle) * (getNodeStyle(d.target).r as number);
                })
                .attr("y2", (d) => {
                    if (!d.target.x || !d.target.y || !d.source.x || !d.source.y) return null;
                    const dx = d.source.x - d.target.x;
                    const dy = d.source.y - d.target.y;
                    const angle = Math.atan2(dy, dx); // calculate angle between source and target nodes
                    return d.target.y + Math.sin(angle) * (getNodeStyle(d.target).r as number);
                })

            _nodes
                .select("circle")
                .attr("cx", (d) => d.x ?? null)
                .attr("cy", (d) => d.y ?? null);

            _nodes.select("text")
                .attr("x", (d) => d.x ?? null)
                .attr("y", (d) => d.y ?? null);
        }
    }, [graph, width, height]);

    return <div>
        <div ref={root} style={{width: "100%", height: "fit-content"}}></div>        
        <FamilyTreeGraphPopup
            node={selectedNode}
            left={selectedNodePosition?.[0]}
            top={selectedNodePosition?.[1]}
        />
    </div>
}
