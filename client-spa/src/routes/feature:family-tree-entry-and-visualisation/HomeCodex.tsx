import { Anchor, Box, Button, Flex, rem, Text, Textarea } from "@mantine/core";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import { setCodex, processCodex, initialiseFamilyTreeEntry} from "./slice";
import { Alert } from '@mantine/core';
import ErrorIcon from "../../assets/icons/uicons-thin-straight/fi-ts-octagon-xmark.svg?react"
import type { FamilyTreeEntryGraphFunctions } from "./components/family-tree-graph/FamilyTreeGraph";
import FamilyTreeEntryGraph  from "./components/family-tree-graph/FamilyTreeGraph";
import type { ChangeEvent} from "react";
import { useEffect, useRef, useState } from "react";
import { useViewportSize } from "@mantine/hooks";
import ShareModal from "./components/ShareModal";
import ResetMenu from "./components/ResetMenu";
import { usePostHog } from "posthog-js/react";
import defaultTheme from "../../assets/themes/default-theme";

export default function Codex() {
   const dispatch = useDispatch<AppDispatch>();

   const codex = useSelector((state: RootState)=>{
      return state.familyTreeEntry.codex;
   });

   const graph = useSelector((state: RootState)=>{
    return state.familyTreeEntry.graph;
   });

   const state = useSelector((state: RootState)=>{
    return state.familyTreeEntry.state;
   });

   const errorMessage = useSelector((state: RootState)=>{
    return state.familyTreeEntry.errorMessage;
   });

   const refTextArea = useRef<HTMLTextAreaElement>(null);

   const { height: _viewportHeight, width: viewportWidth } = useViewportSize();
   const [svgHeight, setSvgHeight] = useState(0);

   const posthog = usePostHog();

   function updateTextEntry(event: ChangeEvent<HTMLTextAreaElement>) {
        void dispatch(setCodex({codex: event.currentTarget.value, persistToLocalStorage: false}));
        // posthog.capture("set family tree text entry (from user input)");
   }

   function processEntry() {
        void dispatch(processCodex({persistTextEntryToLocalStorage: true}));
        posthog.capture("process (parse to graph and tokenise) family tree entry");
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
         <Text size="md" mt="xs" mb="md">
            Enter a lineage using the notation described <Anchor href="/codex/notation" underline="always" target="_blank">here</Anchor>, then click &lsquo;Visualise&rsquo; to reveal family tree.
        </Text>

         <Flex direction="column" gap="lg">
            <Textarea ref={refTextArea} autosize onChange={updateTextEntry} value={codex} disabled={state === "drawn"} fw={500} styles={{input: {fontFamily: defaultTheme.fontFamilyMonospace, fontSize: "1.05rem", lineHeight: 1.35, paddingTop: "0.85rem", paddingBottom: "0.85rem"}}} />
            
            <Flex direction={{base: "column-reverse", sm: "row"}} justify="end" gap="md">
                <ResetMenu />

                {/*  */}
                <ShareModal disabled={state !== "drawn"} />

                {/*  */}
                <Button 
                    size="lg" 
                    disabled={state !== "editing" || codex.length === 0} 
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
