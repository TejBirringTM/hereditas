import { Button, Flex, Modal, rem, Text, TextInput } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import ShareIcon from "../../../assets/icons/uicons-solid-straight/fi-ss-share-square.svg?react"
import { useEffect, useRef, useState } from 'react';
import { usePostHog } from 'posthog-js/react';
import { shareLink as _shareLink } from '../libs/share-link';
import { useAppSelector } from '../../../hooks';

interface ShareModalProps {
    disabled?: boolean
}

export default function ShareModal({disabled}: ShareModalProps) {
    const [opened, {open, close}] = useDisclosure();
    const [urlCopied, setCopiedUrl] = useState(false);
    
    const textInputRef = useRef<HTMLInputElement>(null);

    const shareLink = useAppSelector((state)=>{
        const activeContent = state.content.activeContent;
        const token = state.familyTreeEntry.token;
        return _shareLink(
            {
                token,
                recordId: activeContent?.id
            },
            false
        );
    });

    const posthog = usePostHog();

    useEffect(()=>{
        if (opened) {
            void navigator.clipboard.writeText(shareLink)
            .then(()=>{
                setCopiedUrl(true);
                console.debug("Share link copied to clipboard.");
                posthog.capture("share link copied to clipboard");
            });
        } else {
            setCopiedUrl(false);
        }
    }, [opened, shareLink, posthog])


    useEffect(()=>{
        if (textInputRef.current) {
            textInputRef.current.select();
        }
    }, [textInputRef.current]);

    return <>
        <Modal opened={opened} onClose={close} title="Share">
            <Text>Use the link below to share the current view.</Text>
            {
                urlCopied && <Text fs="italic" fw="600">The share link has been copied to your clipboard.</Text>
            }
            <TextInput value={shareLink} mt="xs" mb="lg" readOnly ref={textInputRef} />
            <Flex justify="flex-end">
                <Button onClick={close} color="softer-warm.9">Done</Button>
            </Flex>
        </Modal> 

        <Button
            size="lg" 
            disabled={disabled} 
            leftSection={<ShareIcon style={{ width: "fit-content", height: rem(16), fill: "currentColor"}} />}
            onClick={open} 
            color="softer-warm.9"
        >
            Share
        </Button>
    </>
}
