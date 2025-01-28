import { Anchor, Box, Button, Flex, rem, Text, Textarea } from "@mantine/core";
import { setActa, processActa, initialiseFamilyTreeEntry} from "./slice";
import { Alert } from '@mantine/core';
import ErrorIcon from "../../assets/icons/uicons-thin-straight/fi-ts-octagon-xmark.svg?react"
import WarningIcon from "../../assets/icons/uicons-thin-straight/fi-ts-triangle-warning.svg?react"
import type { FamilyTreeEntryGraphFunctions } from "./components/family-tree-graph/FamilyTreeGraph";
import FamilyTreeEntryGraph  from "./components/family-tree-graph/FamilyTreeGraph";
import type { ChangeEvent} from "react";
import { useEffect, useRef, useState } from "react";
import { useViewportSize } from "@mantine/hooks";
import ShareModal from "./components/ShareModal";
import ResetMenu from "./components/ResetMenu";
import { usePostHog } from "posthog-js/react";
import defaultTheme from "../../assets/themes/default-theme";
import { useAppDispatch, useAppSelector } from "../../hooks";

export default function Acta() {
   const dispatch = useAppDispatch();

   const acta = useAppSelector((state)=>{
      return state.familyTreeEntry.acta;
   });

   const graph = useAppSelector((state)=>{
    return state.familyTreeEntry.graph;
   });

   const state = useAppSelector((state)=>{
    return state.familyTreeEntry.state;
   });

   const errorMessage = useAppSelector((state)=>{
    return state.familyTreeEntry.errorMessage;
   });

   const refTextArea = useRef<HTMLTextAreaElement>(null);

   const { height: _viewportHeight, width: viewportWidth } = useViewportSize();
   const [svgHeight, setSvgHeight] = useState(0);

   const posthog = usePostHog();

   function updateActa(event: ChangeEvent<HTMLTextAreaElement>) {
        dispatch(setActa({acta: event.currentTarget.value, persistToLocalStorage: false}))
   }

   function processEntry() {
        void dispatch(processActa({persistTextEntryToLocalStorage: true}));
        posthog.capture("process (scribe, then parse to graph and tokenise) family tree entry");
   }

   useEffect(()=>{
        if (state === "start") {
            posthog.capture("navigate to home page");
            void dispatch(initialiseFamilyTreeEntry());
        }
   })

   useEffect(()=>{
    if (graph) {
        setSvgHeight(Math.max(...(graph).nodes.map((node)=>(node.generationInTree))) * 350);
    }
   }, [graph])

   const ftree = useRef<FamilyTreeEntryGraphFunctions>(null);

    return (<Box px={{base: rem(10), sm: rem(20)}}>
        <Alert variant="light" color="orange" title="Experimental Feature" icon={<WarningIcon style={{fill: "var(--mantine-color-orange-light-color)"}} />}>
            <Text size="sm" my="xs">This feature is in active development and may produce unexpected results.</Text>
            <Text size="sm" my="xs">While we welcome you to explore this section, please report any issues to our team.</Text>
            <Text size="sm" my="xs" fw="bold">For consistent and reliable results, use <Anchor href="/codex" underline="always" fw="bold">Codex</Anchor> notation.</Text>
        </Alert>

         <Text size="md" my="md">
            Describe a lineage in plain English, then click &lsquo;Visualise&rsquo; to reveal family tree.
         </Text>

         <Flex direction="column" gap="lg">
            <Textarea ref={refTextArea} autosize onChange={updateActa} value={acta} disabled={state === "drawn"} fw={500} styles={{input: {fontFamily: defaultTheme.fontFamilyMonospace, fontSize: "1.05rem", lineHeight: 1.35, paddingTop: "0.85rem", paddingBottom: "0.85rem"}}} />
            
            <Flex direction={{base: "column-reverse", sm: "row"}} justify="end" gap="md">
                <ResetMenu />

                {/*  */}
                <ShareModal disabled={state !== "drawn"} buttonSize="lg" />

                {/*  */}
                <Button 
                    size="lg" 
                    disabled={acta.length === 0} 
                    onClick={processEntry}
                    color="softer-warm.9"
                >
                    Visualise
                </Button>
            </Flex>

            { state === "error" &&
                <Alert variant="light" color="red" title="Error" icon={<ErrorIcon style={{fill: "var(--mantine-color-red-light-color)"}} />}>
                    { errorMessage }
                </Alert>
            }

            <FamilyTreeEntryGraph graph={graph} width={viewportWidth} height={svgHeight} ref={ftree} />
         </Flex>
    </Box>)
}
