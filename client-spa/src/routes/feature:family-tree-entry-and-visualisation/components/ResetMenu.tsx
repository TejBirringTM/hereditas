import { Button, Menu, rem } from "@mantine/core";
import UndoIcon from "../../../assets/icons/uicons-thin-straight/fi-ts-undo.svg?react"
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { resetFamilyTreeEntry } from "../slice";
import { usePostHog } from "posthog-js/react";

interface ResetMenuProps {
    resetPanAndZoom?: (()=>void) | undefined
}

export default function ResetMenu({resetPanAndZoom}: ResetMenuProps) {
    const dispatch = useDispatch();
    const posthog = usePostHog();

    const familyTreeTextEntry = useSelector((state: RootState)=>{
       return state.familyTreeEntry.textEntry;
    });
 
    const state = useSelector((state: RootState)=>{
     return state.familyTreeEntry.state;
    });
 
    function clearVisualisation() {
        dispatch(resetFamilyTreeEntry({clearTextEntry: false}));
        posthog.capture("reset family tree entry (visualisation only)");
    }

    function clearVisualisationAndTextEntry() {
        dispatch(resetFamilyTreeEntry({clearTextEntry: true}));
        posthog.capture("reset family tree entry (everything)");
    }

    function clearPanAndZoom() {
      if (resetPanAndZoom) {
        resetPanAndZoom();
      }
    }

    return (
        <Menu shadow="md" width={250}>
        <Menu.Target>
            <Button 
                size="lg" 
                disabled={familyTreeTextEntry.length === 0}
                leftSection={<UndoIcon style={{ width: "fit-content", height: rem(16), stroke: "currentColor"}} />}
                color="teal.3"
            >
                Reset
            </Button>
        </Menu.Target>
  
        <Menu.Dropdown>
          {resetPanAndZoom && 
            <Menu.Item disabled={state !== "drawn"} onClick={clearPanAndZoom}>
              Clear zoom
            </Menu.Item>
          } 
          <Menu.Item disabled={state !== "drawn"} onClick={clearVisualisation}>
            Clear visualisation
          </Menu.Item>
          <Menu.Divider />
          <Menu.Item disabled={familyTreeTextEntry.length === 0} onClick={clearVisualisationAndTextEntry}>
            Clear everything
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    )
}
