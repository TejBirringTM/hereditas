import { Anchor, Box, Button, Flex, rem, Tabs, Text, Textarea } from "@mantine/core";
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
import FamilyTreeEntryTree from "./components/family-tree-tree/FamilyTreeTree";
import { useAppDispatch, useAppSelector } from "../../hooks";
import { setActiveContent } from "../feature:content/slice";

export default function Codex() {
   const dispatch = useAppDispatch();

   const codex = useAppSelector((state)=>{
      return state.familyTreeEntry.codex;
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
        } else if (state === "editing") {
            void dispatch(setActiveContent({contentRecord: null}));
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
            
            <Flex direction={{base: "column-reverse", sm: "row"}} justify="end"  mb="md" gap="lg">
                <ResetMenu />

                {/*  */}
                <ShareModal disabled={state !== "drawn"} buttonSize="lg" />

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

            {
                graph && 
                <Tabs variant="pills" radius="lg" defaultValue="graph" color="patina.5">
                    <Tabs.List>
                        <Tabs.Tab value="graph">Graph</Tabs.Tab>
                        <Tabs.Tab value="tree">Tree</Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="graph" mt="sm">
                        <FamilyTreeEntryGraph graph={graph} width={viewportWidth} height={svgHeight} ref={ftree} />
                    </Tabs.Panel>

                    <Tabs.Panel value="tree" mt="sm">
                        <FamilyTreeEntryTree graph={graph} />
                    </Tabs.Panel>
                </Tabs>
            }

            
            
         </Flex>
    </Box>)
}
