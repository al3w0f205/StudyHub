"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

/**
 * MathText Component
 * Renders text with support for LaTeX mathematical equations.
 * Use $...$ for inline math and $$...$$ for block math.
 */
export default function MathText({ children, className = "" }) {
  if (typeof children !== "string") return children;

  return (
    <div className={`math-text-wrapper ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
