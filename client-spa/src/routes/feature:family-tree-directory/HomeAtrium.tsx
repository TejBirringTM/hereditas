import { AspectRatio, Box, Button, Card, Divider, Flex, Grid, Image, Pill, Skeleton, Text, Title } from "@mantine/core";
import { useEffect } from "react";
import { fetchContent } from "../../content/slice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store";
import CalendarIcon from "../../assets/icons/uicons-solid-straight/fi-ss-calendar-day.svg?react";
import UserIcon from "../../assets/icons/uicons-solid-straight/fi-ss-user.svg?react";
import PageTitle from "../../components/PageTitle";
import { Carousel } from "@mantine/carousel";
import { useNavigate } from "react-router-dom";

export default function HomeAtrium() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const records = useSelector((state: RootState)=>{
        return state.content.content?.filter((item)=>item.Type === "Lineage");
     });

     useEffect(()=>{
        void dispatch(fetchContent());
     });

    function navigateToItem(recordId: string) {
        navigate(`/novitas/${recordId}`);
    }

    return (
        <Box px={{base: 0, sm:"1rem"}}>
            <PageTitle 
                title="Atrium Familiarum"
                titleColour="softer-warm.9"
                description="Explore ancestries compiled and curated by distinguished Hereditas scholars and visitors." 
                descriptionColour="navy.7"
            />
            
            <Divider my="lg" />

            <Grid gutter={{base: "lg", md: "lg"}} mb="lg">
            {
                (!records || records.length === 0) && (
                    Array.from({length: 9}).map((_,idx)=>(
                        <Grid.Col span={{base: 12, md: 6, xl: 4}} key={`example-codex-sk-#${idx}`}>
                            <Skeleton h={300} w={"100%"} />
                        </Grid.Col>
                    ))
                )
            }
            {
                records?.map((r)=>(
                    <Grid.Col span={{base: 12, lg: 6, xl: 4}} key={`example-codex-${r.id}`}>

                        <Card shadow="md" bg="softer-warm.9" c="white">
                            {
                                r["Feature Image"]?.[0] && 
                                <Card.Section bg="neutral.1">
                                    <AspectRatio ratio={1080 / 720} mx="auto">
                                        <Image
                                            src={r["Feature Image"][0].url}
                                            alt={r.Title}
                                            fit="cover"
                                        />
                                    </AspectRatio>
                                </Card.Section>
                            }                                
                            {
                                (!r["Feature Image"]?.[0] && r.Images && r.Images.length > 0) &&
                                <Card.Section mb="md" bg="neutral.1">
                                        <Carousel withIndicators style={{cursor: "ew-resize"}}>
                                        { 
                                            r.Images.map((image, idx)=>(
                                                <Carousel.Slide key={`${r.id}-img#${idx+1}`}>
                                                    <AspectRatio ratio={1080 / 720} mx="auto">
                                                        <Image
                                                            src={image.url}
                                                            alt={`${r.Title} Image ${idx+1}`}
                                                            fit="cover"
                                                        />
                                                    </AspectRatio>
                                                </Carousel.Slide>
                                            ))
                                        }
                                        </Carousel>
                                </Card.Section>
                            }
                            <Card.Section py="sm" px="md">
                                <Title order={5} fw="bold" lh={0.89} style={{textAlign: "center"}}>{r.Title}</Title>
                                {/* {   r["Alternative Titles"] &&
                                    <Text size="xs" style={{textAlign: "center"}}>
                                        <em>Alt. </em>
                                        {r['Alternative Titles']}
                                    </Text>
                                } */}
                            </Card.Section>


                            <Card.Section bg="gray.1" p="lg" withBorder>
                                <Text lh={1.25} size="sm" c="navy.9" pb="xs">
                                    {r.Content}
                                </Text>                                
                                
                                    {r.Tags && r.Tags.length > 0 &&
                                        <Flex gap="xs" mt="sm">
                                            {r.Tags.map((tag, idx)=>(
                                                <Pill size="xs" bg="navy.5" c="white" key={`example-codex-${r.id}-tag-#${idx}`}>{tag}</Pill>
                                            ))}
                                        </Flex>
                                    }
                                
                            </Card.Section>


                            <Card.Section bg="gray.1">
                            <Flex direction="row" justify="space-between" align="center" py="xs" pl="lg" pr="md">     
                                    <Flex direction="row" gap="sm">    
                                        <Flex direction="row" align="center" gap="0.3rem" c="neutral.9" opacity={0.9}>
                                            <CalendarIcon fill="currentColor" height={20} width={20} opacity={0.76} />
                                            <Flex direction="column">
                                                <Text size="xs" lh={1} style={{fontVariant: "small-caps"}} fw="bold">Published</Text>
                                                <Text size="xs">{new Date(r.Created).toLocaleDateString()}</Text>
                                            </Flex>
                                        </Flex>
                                        {
                                            r["Author Names"] &&
                                            <Flex direction="row" align="center" gap="0.3rem" c="neutral.9" opacity={0.9}>
                                                <UserIcon fill="currentColor" height={20} width={20} opacity={0.76} />
                                                <Flex direction="column">
                                                    <Text size="xs" lh={1} style={{fontVariant: "small-caps"}} fw="bold">Author(s)</Text>
                                                    <Text size="xs">{
                                                        r["Author Names"].join(", ")
                                                    }</Text>
                                                </Flex>
                                            </Flex>
                                        }
                                    </Flex>

                                    <Button size="xs" variant="filled" color="softer-warm.9" onClick={()=>navigateToItem(r.id)}>View</Button>
                                </Flex>
                            </Card.Section>
                            
                        </Card>

                    </Grid.Col>
                ))
            }
            </Grid>
        </Box>
    )
}
