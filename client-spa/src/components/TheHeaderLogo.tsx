import { Anchor, Flex, rem, Text } from "@mantine/core";

export default function TheHeaderLogo() {
    return <Anchor href="/" underline="never">
            <Flex direction="column">
                
                <Text ff="heading" size={rem(27)} fw={600} c="navy.9">
                        Tapestry•Family
                </Text>

                <Text ml={rem(7.5)} lh={1.15} c="teal.5" ff="heading" fw={600} size={rem(15.5)} styles={{root: {letterSpacing: "-0.016rem"}}} span visibleFrom="xs">
                        Visualise and share family trees for FREE
                </Text>
                
            </Flex>
    </Anchor>
}