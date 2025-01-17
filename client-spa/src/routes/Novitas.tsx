import { AspectRatio, Box, Button, Card, Flex, Grid, Image, Menu, Text, rem, useMatches } from "@mantine/core";
import type { AppDispatch, RootState } from "../store";
import { useLoaderData, useNavigate } from "react-router-dom";
import PageTitle from "../components/PageTitle";
import MarkdownContent from "../components/feature:markdown-content/MarkdownContent";
import DownloadsIcon from "../assets/icons/uicons-solid-straight/fi-ss-file-download.svg?react";
import UserIcon from "../assets/icons/uicons-solid-straight/fi-ss-user.svg?react";
// import ImagesIcon from "../assets/icons/uicons-solid-straight/fi-ss-images.svg?react";
import DownCaretIcon from "../assets/icons/uicons-solid-straight/fi-ss-caret-down.svg?react";
import CalendarIcon from "../assets/icons/uicons-solid-straight/fi-ss-calendar-day.svg?react";
import { Carousel } from "@mantine/carousel";
import { downloadFile } from "../libs/download-file";
import { useDispatch } from "react-redux";
import { processCodex, setCodex } from "./feature:family-tree-entry-and-visualisation/slice";
import posthog from "posthog-js";

interface NovitasProps {
    record: NonNullable<RootState["content"]["content"]>[0]
}

export default function Novitate() {
    const {record} = useLoaderData() as NovitasProps;
    const showImagesCol = useMatches({
        base: false,
        lg: true
      });
    const navigate = useNavigate();
    const dispatch = useDispatch<AppDispatch>();;

    async function visualiseCodex(recordId: string, codex: string) {
        void dispatch(setCodex({codex, persistToLocalStorage: false}));
        await dispatch(processCodex({persistTextEntryToLocalStorage: false}));
        posthog.capture("process family tree entry from content", {
            recordId,
        });
        navigate("/codex");
     }

    return (<Box px={{base: 0, sm:"1rem"}}>
        <PageTitle 
            backRoute={"/"}
            top={`${record.Type}:`}
            topColour="softer-warm.9"
            title={record.Title ?? ''}
            titleColour="softer-warm.9"
            descriptionColour="navy.7"
            infoBox={<>
                <Flex direction="row" align="center" gap="1rem">
                    <Flex direction="row" align="center" gap="0.3rem" c="neutral.9" opacity={0.8}>
                        <CalendarIcon fill="currentColor" height={16} width={16} opacity={0.76} />
                        <Text size="xs" >{new Date(record.Created).toLocaleDateString()}</Text>
                    </Flex>
                    {
                        record["Author Names"] && record["Author Names"].length > 0 &&
                        (
                            <Flex direction="row" align="center" gap="0.3rem" c="neutral.9" opacity={0.8}>
                                <UserIcon fill="currentColor" height={16} width={16} opacity={0.76} />
                                <Text size="xs" >{record["Author Names"]?.join(", ")}</Text>
                            </Flex>
                        )
                    }
                </Flex>                
            </>}
        />
        
        <Flex direction="row" gap={{base: "md", sm: "xl"}} mb="lg" mt="md">
            { 
                // record.Images && record.Images.length > 0 &&
                // <Flex direction="row" align="center" gap="0.3rem" c="navy.7" opacity={0.8}>
                //     <ImagesIcon fill="currentColor" height={16} width={16} opacity={0.8} />
                //     <Text size="xs">{record.Images.length}</Text>
                // </Flex>
            }
            { 
                // record.Downloads && record.Downloads.length > 0 &&
                // <Flex direction="row" align="center" gap="0.3rem" c="navy.7" opacity={0.8}>
                //     <DownloadsIcon fill="currentColor" height={16} width={16} opacity={0.8} />
                //     <Text size="xs">{record.Downloads.length}</Text>
                // </Flex>
            }
            {
                record.Downloads && record.Downloads.length > 0 &&
                <Menu shadow="md" width={250}>
                    <Menu.Target>
                        <Button size="xs" variant="filled" bg="softer-warm.9" style={{flexShrink: 0}} rightSection={<DownCaretIcon width={14} style={{fill: "white"}} />}>
                            Downloads ({record.Downloads.length})
                        </Button>
                    </Menu.Target>
                    <Menu.Dropdown>
                        {
                            record.Downloads?.map((download, idx)=>(
                                <Menu.Item leftSection={<DownloadsIcon style={{ width: rem(14), height: rem(14) }} fill="currentColor" />} onClick={()=>downloadFile(download.url, {filename: download.filename, newTab: true})} key={`${record.id}-dload#${idx+1}`} lh={1.15} >
                                    {download.filename}
                                </Menu.Item>   
                            ))
                        }
                    </Menu.Dropdown>
                </Menu>   
            }
            {
                record.Codex &&
                (
                    <Button size="xs" variant="filled" bg="softer-warm.9" style={{flexShrink: 0}} onClick={()=>void visualiseCodex(record.id, record.Codex ?? "")}>
                            View Lineage
                    </Button>
                )   
            }
        </Flex>

        <Grid gutter="lg" mb="lg"> 

            <Grid.Col span={{base:12, lg: 8}} >
                {
                    record.Content &&
                    <Card withBorder shadow="sm">
                        <Card.Section>
                        {
                            record["Feature Image"]?.[0] && 
                            <AspectRatio ratio={1080 / 720} mx="auto" mt="lg" mb="sm">
                                <Image
                                    src={record["Feature Image"][0].url}
                                    alt={record.Title}
                                    fit="contain"
                                />
                            </AspectRatio>
                        }
                        </Card.Section>
                        <Box px={{base: "0", sm: "sm", lg: "lg"}}>
                            <MarkdownContent content={record.Content} />
                        </Box>
                    </Card>
                }
            </Grid.Col>

            <Grid.Col span={{base:12, lg: 4}}>
                <Box hidden={!showImagesCol}>
                    <Flex direction="column" gap="md">
                        {
                            record.Images?.map((image, idx)=>(
                                // <AspectRatio ratio={1080 / 720} mx="auto">
                                    <Image
                                        src={image.url}
                                        alt={image.filename}
                                        fit="cover"
                                        radius="lg"
                                        key={`col-img-#${idx}`}
                                    />
                                // </AspectRatio>
                            ))
                        }
                    </Flex>
                </Box>
                {
                    record.Images && record.Images.length > 0 &&
                    <Box hidden={showImagesCol}>
                        <Card style={{borderRadius: "var(--mantine-radius-default)"}} withBorder shadow="sm">
                            <Carousel withIndicators style={{cursor: "ew-resize"}}>
                            { 
                                record.Images?.map((image, idx)=>(
                                    <Carousel.Slide key={`crsl-img-#${idx}`}>
                                        <AspectRatio ratio={1080 / 720} mx="auto">
                                            <Image
                                                src={image.url}
                                                alt={image.filename}
                                                fit="contain"
                                            />
                                        </AspectRatio>
                                    </Carousel.Slide>
                                ))
                            }
                            </Carousel>
                        </Card>
                    </Box>
                }

            </Grid.Col>
        </Grid>
    </Box>)
}
