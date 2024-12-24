import { useEffect } from 'react';
import { useRemark } from 'react-remark';
import { Box } from '@mantine/core';

interface MarkdownContentProps {
    content: string | Promise<{default: string}>
}

export default function MarkdownContent({content}: MarkdownContentProps) {
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
  
    return <Box>
        {reactContent}
    </Box>;
}
