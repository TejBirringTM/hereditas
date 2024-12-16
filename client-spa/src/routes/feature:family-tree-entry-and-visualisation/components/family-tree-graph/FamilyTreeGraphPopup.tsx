import { Text } from "@mantine/core";
import { Node } from "../../libs/parse-family-tree-entry";
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
            <Text fz="lg" fw="bold">{node.title || "(No name recorded)"}</Text>
            {
                node.patrilineage &&
                    <Text fw="bold" fz="sm" fs={"italic"}>{appendOrdinalSuffix(node.patrilineage.nodes.filter((n)=>n.startsWith("male")).length + 1)} generation of clan.</Text>
            }
            <Text fz="sm" fs={"italic"}>{appendOrdinalSuffix(node.generation)} generation in tree.</Text>
            
        </div>
    }
}
