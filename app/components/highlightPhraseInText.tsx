import React from 'react';
// personalityInsight 내에서 highlightPhrase 부분만 강조 스타일로 감싸는 함수
export function highlightPhraseInText(text: string, phrase: string, className: string): (string | JSX.Element)[] {
  if (!phrase) return [text];
  const parts = text.split(phrase);
  if (parts.length === 1) return [text];
  return parts.flatMap((part, idx) =>
    idx < parts.length - 1
      ? [part, <span className={className} key={idx}>{phrase}</span>]
      : [part]
  );
}
