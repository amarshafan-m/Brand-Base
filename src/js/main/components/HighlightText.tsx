import React from 'react';

interface HighlightTextProps {
  text: string;
  highlight?: string;
}

export function HighlightText({ text, highlight }: HighlightTextProps) {
  if (!highlight || !highlight.trim()) {
    return <>{text}</>;
  }
  
  const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) => (
        regex.test(part) ? (
          <mark key={i} style={{ backgroundColor: 'var(--primary)', color: '#ffffff', borderRadius: '2px', padding: '0 2px' }}>
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      ))}
    </>
  );
}
