"use client";

import { InlineMath } from "react-katex";

import "katex/dist/katex.min.css";

type MathTextProps = {
  text: string;
};

const latexPattern = /\$(.+?)\$/g;

export function MathText({ text }: MathTextProps) {
  const pieces = text.split(latexPattern);

  if (pieces.length === 1) {
    return <span>{text}</span>;
  }

  return (
    <span>
      {pieces.map((piece, index) => {
        if (index % 2 === 1) {
          return <InlineMath key={`math-${index}`}>{piece}</InlineMath>;
        }
        return <span key={`text-${index}`}>{piece}</span>;
      })}
    </span>
  );
}
