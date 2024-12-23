import { Box, Button, Center, Flex, MantineProvider, Paper, rem, Text, Title } from "@mantine/core";
import defaultTheme from "../assets/themes/default-theme";
import bgImage from "../assets/images/not-found-bg.jpeg"
import { useNavigate } from "react-router-dom";
import { SmallLogo } from "../components/SmallLogo";

export default function Error() {
    const navigate = useNavigate();

    function navigateHome() {
        navigate("/");
    }

    return (<MantineProvider theme={defaultTheme}>
        <Center >
            <Flex direction="column" w="100%" align="center">
                <Box mt={rem(36)} mb="md">
                    <SmallLogo linkToHome />
                </Box>

                <Paper shadow="xl" px="xl" py="lg" style={{backgroundImage: `url(${bgImage})`,  width: "100%", height: "480px", maxWidth: "768px", backgroundPosition: "center", backgroundRepeat: "no-repeat", backgroundSize: "cover", backgroundClip: "border-box", position: "relative", overflow: "hidden"}} mx={rem(8)}>
                    <Box style={{width: "100%", height: "100%", backgroundColor: "var(--mantine-color-patina-9)", position: "absolute", top: 0, left: 0, opacity: 0.7, zIndex: 0}}></Box>
                    <Box style={{width: "100%", height: "100%", position: "absolute", top: 0, left: 0, opacity: 1, zIndex: 1}}>
                        <Center h="100%" opacity={1}>
                            <Flex direction="column" align="center" px="xs">
                                <Title c="neutral.1" opacity={0.9} size={rem(42)} mb="xs">Not Found</Title>
                                <Text c="gray.1" size="lg" fw="bold" lh={1.15} style={{textAlign: "center"}} mb="xs">
                                    Please accept our sincere apologies.
                                </Text>
                                <Text c="gray.1" size="lg" lh={1.15} mb="xl" style={{textAlign: "center"}} fw="bold">
                                    We could not find the resource you are looking for.
                                </Text>
                                <Button variant="filled" bg="softer-warm.9" size="lg" onClick={navigateHome}>
                                    Home
                                </Button>
                            </Flex>
                        </Center>
                    </Box>
                </Paper>
            </Flex>
        </Center>
    </MantineProvider>)
}
