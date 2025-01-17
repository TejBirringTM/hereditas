import { AspectRatio, Box, Button, Card, Flex, Grid, Image, Menu, rem, Skeleton, Text } from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import { fetchContent } from "../content/slice";
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store";
import { useEffect } from "react";
import ImagesIcon from "../assets/icons/uicons-solid-straight/fi-ss-images.svg?react";
import DownloadsIcon from "../assets/icons/uicons-solid-straight/fi-ss-file-download.svg?react";
import CalendarIcon from "../assets/icons/uicons-solid-straight/fi-ss-calendar-day.svg?react";
import DownCaretIcon from "../assets/icons/uicons-solid-straight/fi-ss-caret-down.svg?react";
import PageTitle from "./PageTitle";
import { useNavigate } from "react-router-dom";
import { downloadFile } from "../libs/download-file";

export default function TheNovitates() {
    const dispatch = useDispatch<AppDispatch>();
    const navigate = useNavigate();

    const records = useSelector((state: RootState)=>{
        return state.content.content;
     });

     useEffect(()=>{
        void dispatch(fetchContent());
     });

    function navigateToItem(recordId: string) {
        navigate(`/novitas/${recordId}`);
    }

    return (
        <Box>
            <PageTitle
                title="Novitates"
                titleColour="softer-warm.9"
                description="Recent updates and announcements from Hereditas." 
                descriptionColour="navy.7"
            />

            <Grid mt="lg" gutter={{base: "lg", md: "lg"}} mb="1rem">
            {
                (!records || records.length === 0) && (
                    Array.from({length: 6}).map((_, idx)=>(
                        <Grid.Col span={{base: 12, md: 6, xl: 4}} key={`novitas-sk-#${idx}`}>
                            <Skeleton h={300} w={"100%"} />
                        </Grid.Col>
                    ))
                )
            }                
            {
                records?.map((r)=>(
                    <Grid.Col span={{base: 12, md: 6, xl: 4}} key={r.id}>

                    <Card shadow="sm" bg="gray.1">
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
                            !r["Feature Image"]?.[0] && r.Images && r.Images.length > 0 &&
                            <Card.Section bg="neutral.1">
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

                        <Card.Section inheritPadding bg="softer-warm.9" c="neutral.1">
                            <Box mt="md" mb="lg">
                                {
                                    r.Type &&
                                    <Text opacity={0.75} lh={1.15} style={{letterSpacing: "-0.033rem"}}>New {r.Type}</Text>
                                }
                                <Text fw="bold" lh={0.89} ff="heading" size="xl" c="white">{r.Title}</Text>
                                {
                                    r.Content && r.Content.trim().length > 0 && (r.Images && r.Images.length > 0 || r.Downloads && r.Downloads.length > 0) && (
                                        <Flex mt="md" gap="lg">
                                        { 
                                           r.Images && r.Images.length > 0 &&
                                            <Flex direction="row" align="center" gap="0.3rem" opacity={0.75}>
                                                <ImagesIcon fill="currentColor" height={16} width={16} opacity={0.76} />
                                                <Text size="xs">{r.Images.length}</Text>
                                            </Flex>
                                        }
                                        { 
                                            r.Downloads && r.Downloads.length > 0 &&
                                            <Flex direction="row" align="center" gap="0.3rem" opacity={0.75}>
                                                <DownloadsIcon fill="currentColor" height={16} width={16} opacity={0.76} />
                                                <Text size="xs" >{r.Downloads.length}</Text>
                                            </Flex>
                                        }
                                    </Flex>
                                    )
                                }

                            </Box>
                        </Card.Section>

                        <Card.Section py="xs" pl="lg" pr="md">
                            <Flex gap="lg" justify="start" align="center">

                                <Flex direction="column" style={{flexGrow: 1}}>
                                    <Flex direction="row" gap="sm" >
                                        <Flex direction="row" align="center" gap="0.3rem" c="neutral.9" opacity={0.9}>
                                            <CalendarIcon fill="currentColor" height={18} width={18} opacity={0.76} />
                                            <Text size="sm">{new Date(r.Created).toLocaleDateString()}</Text>
                                        </Flex>
                                        {/* Can add more sections here */}
                                    </Flex>
                                </Flex>
                                {
                                    r.Content && r.Content.trim().length > 0 ? 
                                        <Button size="xs" variant="filled" color="softer-warm.9" style={{flexShrink: 0}} onClick={()=>navigateToItem(r.id)}>Read</Button> :
                                    r.Downloads && r.Downloads.length > 0 ?
                                        <Menu shadow="md" width={250}>
                                            <Menu.Target>
                                                <Button size="xs" variant="filled" color="softer-warm.9" style={{flexShrink: 0}} rightSection={<DownCaretIcon width={14} fill="currentColor"/> }>
                                                    Downloads
                                                </Button>
                                            </Menu.Target>
                                            <Menu.Dropdown>
                                                {
                                                    r.Downloads.map((download, idx)=>(
                                                        <Menu.Item leftSection={<DownloadsIcon style={{ width: rem(14), height: rem(14) }} fill="currentColor" />} onClick={()=>downloadFile(download.url, {filename: download.filename, newTab: true})} key={`${r.id}-dload#${idx+1}`} lh={1.15}>
                                                            {download.filename}
                                                        </Menu.Item>   
                                                    ))
                                                }
                                            </Menu.Dropdown>
                                        </Menu>
                                    : null
                                }
                                
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