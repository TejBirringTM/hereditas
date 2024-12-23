import { Flex, rem, Text } from "@mantine/core";
import Symbol from "../assets/images/hereditas.svg?react";
import { useNavigate } from "react-router-dom";

interface SmallLogoProps {
    linkToHome?: boolean
}

export function SmallLogo({linkToHome}: SmallLogoProps) {
    const navigate = useNavigate();

;    function navigateToHome() {
        if (linkToHome) {
            navigate("/");
        }
    }

    return (
        <Flex h={rem(27)} align="center" gap={rem(6)} onClick={navigateToHome} style={{cursor: linkToHome ? "pointer" : undefined}}>
            <Symbol />
            <Text ff="heading" size={rem(27)} fw={600} c="navy.9">
                    Hereditas
            </Text>
        </Flex>
    )
}