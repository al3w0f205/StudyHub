"use client";

import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";
import React, { ReactNode } from "react";

interface MathTextProps {
  children: ReactNode;
  className?: string;
}

/**
 * MathText Component
 * Renders text with support for LaTeX mathematical equations.
 * Use $...$ for inline math and $$...$$ for block math.
 */
export default function MathText({ children, className = "" }: MathTextProps) {
  if (typeof children !== "string") return <>{children}</>;

  // Preprocess text to fix common issues in the data
  const processed = children
    // Replace arrows
    .replace(/->/g, "\\to ")
    .replace(/→/g, "\\to ")
    // Auto-wrap common math patterns that are missing $ delimiters
    // (e.g., lim_{h\to0}, f(x+h), y=1/x)
    .replace(/(?<![\$\\])\blim_\{([^}]*)\}/g, "$\\lim_{$1}$")
    .replace(/(?<![\$\\])\b([a-z]\([a-z]\+h\))(?!\$)/g, "$$1$")
    .replace(/(?<![\$\\])\b([a-z]\([a-z]\))(?!\$)/g, "$$1$")
    // Fix common fractions in text like 1/x
    .replace(/(?<![\$\\])\b(y\s*=\s*[0-9a-z\/]+)(?!\$)/g, "$$1$");

  return (
    <span className={`math-text-wrapper inline-flex items-center align-middle ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          p: ({ node, ...props }) => <span {...props} />,
        }}
      >
        {processed}
      </ReactMarkdown>
    </span>
  );
}
