import { Button, Flex, Modal, rem, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import ShareIcon from "../../../assets/icons/uicons-thin-straight/fi-ts-share-square.svg?react"
import { useSelector } from 'react-redux';
import { RootState } from '../../../store';
import { useEffect, useRef, useState } from 'react';
import { urlSearchKey_familyTreeToken } from '../slice';
import { usePostHog } from 'posthog-js/react';


interface ShareModalProps {
    disabled?: boolean
}

export default function ShareModal({disabled}: ShareModalProps) {
    const [opened, {open, close}] = useDisclosure();
    const [tokenCopied, setTokenCopied] = useState(false);
    
    const textInputRef = useRef<HTMLInputElement>(null);

    const shareLink = useSelector((state: RootState)=>{
        const token = state.familyTreeEntry.token;
        const baseUrl = window.location.origin;
        const url = new URL(baseUrl);
        url.searchParams.append(urlSearchKey_familyTreeToken, token); // ftt = family tree token
        return url.toString();
    });

    const posthog = usePostHog();

    useEffect(()=>{
        if (opened) {
            navigator.clipboard.writeText(shareLink)
            .then(()=>{
                setTokenCopied(true);
                console.debug("Share link copied to clipboard.");
                posthog.capture("share link copied to clipboard");
            });
        } else {
            setTokenCopied(false);
        }
    }, [opened, shareLink])


    useEffect(()=>{
        if (textInputRef.current) {
            textInputRef.current.select();
        }
    }, [textInputRef.current]);

    return <>
        <Modal opened={opened} onClose={close} title="Share">
            <Text>Use the link below to share the current view.</Text>
            {
                tokenCopied && <Text fs="italic" fw="600">The share link has been copied to your clipboard.</Text>
            }
            <TextInput value={shareLink} mt="xs" mb="lg" readOnly ref={textInputRef} />
            <Flex justify="flex-end">
                <Button onClick={close}>Done</Button>
            </Flex>
        </Modal> 

        <Button
            size="lg" 
            disabled={disabled} 
            leftSection={<ShareIcon style={{ width: "fit-content", height: rem(16), fill: "currentColor"}} />}
            onClick={open} 
        >
            Share
        </Button>
    </>
}