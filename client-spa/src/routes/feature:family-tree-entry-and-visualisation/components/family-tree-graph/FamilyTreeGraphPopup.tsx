import { Box, Text } from "@mantine/core";
import type { Node } from "../../libs/parse-family-tree";
import styles from "./FamilyTreeGraph.module.css"
import appendOrdinalSuffix from "../../../../libs/append-ordinal-suffix";

interface FamilyTreeGraphPopupProps {
    node?: Node | null,
    top?: number | null,
    left?: number | null,
}

export default function FamilyTreeGraphPopup({node, top, left}: FamilyTreeGraphPopupProps) {
    if (!node || !top || !left) {
        return null;
    } else {
        return <div
            className={styles.popup}
            style={{top, left}}
        >
            <Text fz="lg" fw="bold" lh="1.25" mb="xs">
                {node.title && node.title.length > 0 ? node.title : "(No name recorded)"}
            </Text>

            <div>
                {
                    node.patrilineage && node.patrilineage.nodes.length > 0 &&
                        <Text fw="bold" fz="xs" fs={"italic"} lh="1.25">
                            {appendOrdinalSuffix(node.patrilineage.nodes.filter((n)=>n.startsWith("male")).length + 1)} generation of clan
                            {node.rootAncestor && <span>, from {node.rootAncestor.title}</span>}
                        </Text>
                }
                
                {
                    (node.generationInClan !== node.generationInTree) &&
                    <Text fz="xs" fs={"italic"}>({appendOrdinalSuffix(node.generationInTree)} generation in tree)</Text>
                }
            </div>
            
            {
                node.attributes?.redacted && <Text size="sm" fw="bold" my="xs">Redacted for brevity (out of scope)</Text>
            }

            {
                (node.text.length > 0) &&
                <Box mt="xs">
                {
                    node.text.map((t, idx)=>(
                        <Text fz="xs" lh="1.25" mb="xs" key={`txt-${idx}`}>{t}</Text>
                    ))
                }
                </Box>
            }
        </div>
    }
}
