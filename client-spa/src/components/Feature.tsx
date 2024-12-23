import { Box, Center, Paper } from "@mantine/core";
import React, { useRef } from "react";
import { useNavigate, type To } from "react-router-dom";

interface FeatureProps {
    image: string,
    highlightImage: string,
    children?: React.ReactNode,
    to?: To
}

export default function Feature(props: FeatureProps) {
    const ref = useRef<HTMLDivElement>(null);
    const navigate = useNavigate();

    function setHighlightBackground() {
        if(ref.current) {
            ref.current.style.backgroundImage = `url(${props.highlightImage})`
        }
    }

    function setNormalBackground() {
        if(ref.current) {
            ref.current.style.backgroundImage = `url(${props.image})`
        }
    }

    function navigateToRoute() {
        if (props.to) {
            navigate(props.to);
        }
    }

    return (
        <Paper shadow="xl" p="xl" style={{backgroundImage: `url(${props.image})`,  width: "100%", height: "480px", maxWidth: "768px", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundClip: "border-box", position: "relative", overflow: "hidden", cursor: "pointer"}} ref={ref} onMouseEnter={setHighlightBackground} onMouseLeave={setNormalBackground} onClick={navigateToRoute}>
            <Box style={{width: "100%", height: "100%", backgroundColor: "var(--mantine-color-neutral-1)", position: "absolute", top: 0, left: 0, opacity: 0.7, zIndex: 0}}></Box>
            <Box style={{width: "100%", height: "100%", position: "absolute", top: 0, left: 0, opacity: 1, zIndex: 1}}>
                <Center h="100%" opacity={1}>
                    {props.children}
                </Center>
            </Box>
        </Paper>
    )
}
