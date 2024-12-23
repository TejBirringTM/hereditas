import { Box, Divider, Flex, Grid, Highlight, Text, Title } from "@mantine/core";
import TheNovitates from "../components/TheNovitates";
import Feature from "../components/Feature";
import CodexFeatureImage from "../assets/feature-images/codex-feature.jpg"
import CodexFeatureHighlightedImage from "../assets/feature-images/codex-feature-selected.jpg"
import AtriumFeatureImage from "../assets/feature-images/atrium-feature.jpg"
import AtriumFeatureHighlightedImage from "../assets/feature-images/atrium-feature-selected.jpg"

export default function Home(){
    return (
        <Box px={{base: 0, sm:"1rem"}}>
            <Box mt="md" mb="xl">
                <Title c="navy.9" order={2} size="2.579rem" lh={0.8} mb="xs">
                    Write Once. Share Forever.
                </Title>
                <Text c="teal.5" size="xl" fw="bold" lh="1">
                    Transform ancestral histories from text to timeless, interactive legacies.
                </Text>
            </Box>

            <Grid>
                <Grid.Col span={{base: 12, lg: 6}}>
                    <Feature image={CodexFeatureImage} highlightImage={CodexFeatureHighlightedImage} to="/codex">
                        <Flex direction="column" align="center">
                            <Title size="3rem" c="navy.9" style={{fontVariant: "small-caps"}}>
                                Compile
                            </Title>
                            <Box bg="white" py="sm" px="lg" style={{borderRadius: "5rem"}}>
                                <Highlight highlight={["compile", "visualise", "share"]} fw="bold">
                                    Compile, visualise, and share an ancestral lineage
                                </Highlight>
                            </Box>
                        </Flex>
                    </Feature>
                </Grid.Col>
                <Grid.Col span={{base: 12, lg: 6}}>
                    <Feature image={AtriumFeatureImage} highlightImage={AtriumFeatureHighlightedImage} to="/atrium">
                        
                    <Flex direction="column" align="center">
                            <Title size="3rem" c="navy.9" style={{fontVariant: "small-caps"}}>
                                Discover
                            </Title>
                            <Box bg="white" py="sm" px="lg" style={{borderRadius: "5rem"}}>
                            <Highlight highlight={["explore"]} fw="bold">
                                Explore precompiled ancestral lineages
                            </Highlight>
                            </Box>
                        </Flex>  
                    </Feature>
                  
                </Grid.Col>
            </Grid>
            <Divider my="xl" />
            <TheNovitates />
        </Box>
    )
}
