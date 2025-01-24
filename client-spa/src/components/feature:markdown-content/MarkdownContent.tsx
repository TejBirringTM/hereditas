import { useEffect } from 'react';
import { useRemark } from 'react-remark';
import { Box, type BoxComponentProps } from '@mantine/core';

type MarkdownContentProps = {
    content: string | Promise<{default: string}>,
} & BoxComponentProps;

export default function MarkdownContent({content, ...props}: MarkdownContentProps) {
    const [reactContent, setMarkdownSource] = useRemark();
      
    useEffect(() => {
      if (typeof content === "string") {
        setMarkdownSource(content);
      } else {
        void content.then(({default: _content})=>{
            setMarkdownSource(_content);
        });
      }
    }, [content, setMarkdownSource]);
  
    return <Box {...props}>
        {reactContent}
    </Box>;
}
