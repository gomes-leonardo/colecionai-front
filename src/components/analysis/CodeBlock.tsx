'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/cjs/styles/prism';

interface CodeBlockProps {
  language: string;
  children: string;
}

export function CodeBlock({ language, children }: CodeBlockProps) {
  return (
    <div className="relative my-4 group">
      <div className="absolute top-2 right-2 flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <span className="uppercase bg-background/80 px-2 py-1 rounded">{language}</span>
      </div>
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          fontSize: '0.875rem',
          background: '#1e1e1e',
        }}
        PreTag="div"
      >
        {String(children).replace(/\n$/, '')}
      </SyntaxHighlighter>
    </div>
  );
}
