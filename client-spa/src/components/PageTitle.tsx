import { Box, DefaultMantineColor, StyleProp, Text, Title } from "@mantine/core";

interface PageTitleProps {
    title: string,
    titleColour?: StyleProp<DefaultMantineColor> | undefined,
    description?: string,
    descriptionColour?: StyleProp<DefaultMantineColor> | undefined,
    top?: string,
    topColour?: StyleProp<DefaultMantineColor> | undefined,
}

export default function PageTitle(props: PageTitleProps) {
    return (
        <Box my="sm">
            {
                props.top &&
                <Text size="xl" c={props.topColour}  opacity={0.45} lh={1.15} style={{letterSpacing: "-0.033rem"}}>{props.top}</Text>
            }
            <Title c={props.titleColour} order={1} opacity={0.65} size="2.579rem" lh={0.8} mb="xs" >{props.title}</Title>
            { props.description &&
                <Text size="sm" c={props.descriptionColour} mt="-0.15rem" opacity={0.8} lh={1.2}>
                    {props.description}
                </Text>
            }
        </Box>
    )
}
