import { Button, Menu, rem } from "@mantine/core";
import UndoIcon from "../../../assets/icons/uicons-solid-straight/fi-ss-undo.svg?react"
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../../../store";
import { resetFamilyTreeEntry } from "../slice";
import { usePostHog } from "posthog-js/react";
import { useNavigate } from "react-router-dom";

interface ResetMenuProps {
    resetPanAndZoom?: (()=>void) | undefined
}

export default function ResetMenu({resetPanAndZoom}: ResetMenuProps) {
    const dispatch = useDispatch();
    const posthog = usePostHog();
    const navigate = useNavigate();

    const acta = useSelector((state: RootState)=>{
      return state.familyTreeEntry.acta;
   });

    const codex = useSelector((state: RootState)=>{
       return state.familyTreeEntry.codex;
    });
 
    const state = useSelector((state: RootState)=>{
     return state.familyTreeEntry.state;
    });
 
    function clearVisualisation() {
        dispatch(resetFamilyTreeEntry({clearTextEntry: false}));
        navigate("/codex");
        posthog.capture("reset family tree entry (visualisation only)");
    }

    function clearVisualisationAndTextEntry() {
        dispatch(resetFamilyTreeEntry({clearTextEntry: true}));
        navigate("/codex");
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
                disabled={codex.length === 0 && acta.length === 0}
                leftSection={<UndoIcon style={{ width: "fit-content", height: rem(16), fill: "currentColor"}} />}
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
          <Menu.Item disabled={codex.length === 0 && acta.length === 0} onClick={clearVisualisationAndTextEntry}>
            Clear everything
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    )
}
