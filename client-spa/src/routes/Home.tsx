import { Box, Divider, Flex, Grid, Highlight, rem, Text, Title } from "@mantine/core";
import TheNovitates from "../components/TheNovitates";
import Feature from "../components/Feature";
import CodexFeatureImage from "../assets/feature-images/codex-feature.jpg"
import CodexFeatureHighlightedImage from "../assets/feature-images/codex-feature-selected.jpg"
import AtriumFeatureImage from "../assets/feature-images/atrium-feature.jpg"
import AtriumFeatureHighlightedImage from "../assets/feature-images/atrium-feature-selected.jpg"
import Symbol from "../assets/images/hereditas.svg?react";

export default function Home(){
    return (
        <Box px={{base: 0, sm:"1rem"}}>
            <Flex direction={{base: "column", sm: "row"}} align="center" mt="md" mb="xl">
                <Box mr={{base: "xs"}}>
                    <Symbol height="3.8rem" width="3.8rem" />
                </Box>
                
                <Box ta={{base: "center", sm: "left"}}>
                    <Title c="navy.9" order={2} fz={{base: "1.5939rem", md: "2.579rem"}} lh={0.8} mb={rem(5)}>
                        Write Once. Share Forever.
                    </Title>
                    <Text c="teal.5" size="xl" fw="bold" lh="1">
                        Transform ancestral histories from text to timeless, interactive legacies.
                    </Text>
                </Box>
            </Flex>

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
