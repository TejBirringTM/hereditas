import { Box, Button, type DefaultMantineColor, Flex, px, rem, type StyleProp, Text, Title } from "@mantine/core";
import { To, useNavigate } from "react-router-dom";
import CaretLeft from "../assets/icons/uicons-solid-straight/fi-ss-caret-left.svg?react";

interface PageTitleProps {
    title: string,
    titleColour?: StyleProp<DefaultMantineColor> | undefined,
    description?: string,
    descriptionColour?: StyleProp<DefaultMantineColor> | undefined,
    top?: string,
    topColour?: StyleProp<DefaultMantineColor> | undefined,
    backRoute?: To | undefined,
    infoBox?: React.ReactNode
}

export default function PageTitle(props: PageTitleProps) {
    const navigate = useNavigate();
    function navigateBack() {
        if (props.backRoute) {
            navigate(props.backRoute);
        }
    }
    return (
        <Flex direction="row" align="center">
            { props.backRoute &&
                <Button onClick={navigateBack} bg={props.titleColour} opacity={0.65} h={rem(30)} w={rem(30)} p={0} style={{flexShrink: 0}} mr="sm">
                    <CaretLeft fill="currentColor" height={px(20)} />
                </Button>
            }
            <Box my="sm">
                {
                    props.top &&
                    <Text size="xl" c={props.topColour}  opacity={0.45} lh={1.15} style={{letterSpacing: "-0.033rem"}}>{props.top}</Text>
                }
                <Title c={props.titleColour} order={1} opacity={0.65} size="2.579rem" lh={0.8} mb="0.6rem" >{props.title}</Title>
                { props.description &&
                    <Text size="sm" c={props.descriptionColour} mt="-0.15rem" opacity={0.8} lh={1.2}>
                        {props.description}
                    </Text>
                }
                { props.infoBox }
            </Box>
        </Flex>
        
    )
}
