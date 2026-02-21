import React from "react";

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
}) => {
  const blocks = content.split(/\n\n+/);

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => (
        <Block key={i} text={block.trim()} />
      ))}
    </div>
  );
};

const Block: React.FC<{ text: string }> = ({ text }) => {
  // Headings
  const h1Match = text.match(/^# (.+)$/m);
  if (h1Match && text.startsWith("# ")) {
    return (
      <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mt-2">
        <InlineMarkdown text={h1Match[1]} />
      </h2>
    );
  }

  const h2Match = text.match(/^## (.+)$/m);
  if (h2Match && text.startsWith("## ")) {
    return (
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mt-2">
        <InlineMarkdown text={h2Match[1]} />
      </h3>
    );
  }

  const h3Match = text.match(/^### (.+)$/m);
  if (h3Match && text.startsWith("### ")) {
    return (
      <h4 className="text-base font-semibold text-gray-800 dark:text-gray-200 mt-1">
        <InlineMarkdown text={h3Match[1]} />
      </h4>
    );
  }

  // Bullet list (block of lines starting with - or *)
  const lines = text.split("\n");
  const isList = lines.every((l) => /^\s*[-*] /.test(l) || l.trim() === "");
  if (isList) {
    return (
      <ul className="space-y-1.5 ml-1">
        {lines
          .filter((l) => l.trim())
          .map((line, j) => (
            <li key={j} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 flex-shrink-0" />
              <span className="leading-relaxed">
                <InlineMarkdown text={line.replace(/^\s*[-*] /, "")} />
              </span>
            </li>
          ))}
      </ul>
    );
  }

  // Mixed content: heading followed by list items (common in Claude output)
  const firstLine = lines[0];
  const rest = lines.slice(1);
  const headingMatch = firstLine.match(/^(#{1,3}) (.+)$/);
  const restIsList = rest.length > 0 && rest.every((l) => /^\s*[-*] /.test(l) || l.trim() === "");

  if (headingMatch && restIsList) {
    const level = headingMatch[1].length;
    const headingText = headingMatch[2];
    const HeadingTag = level === 1 ? "h2" : level === 2 ? "h3" : "h4";
    const headingClass =
      level === 1
        ? "text-xl font-bold text-gray-900 dark:text-gray-100 mt-2 mb-2"
        : level === 2
          ? "text-lg font-semibold text-gray-900 dark:text-gray-100 mt-2 mb-2"
          : "text-base font-semibold text-gray-800 dark:text-gray-200 mt-1 mb-2";

    return (
      <div>
        <HeadingTag className={headingClass}>
          <InlineMarkdown text={headingText} />
        </HeadingTag>
        <ul className="space-y-1.5 ml-1">
          {rest
            .filter((l) => l.trim())
            .map((line, j) => (
              <li key={j} className="flex items-start space-x-2 text-sm text-gray-700 dark:text-gray-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-400 dark:bg-blue-500 flex-shrink-0" />
                <span className="leading-relaxed">
                  <InlineMarkdown text={line.replace(/^\s*[-*] /, "")} />
                </span>
              </li>
            ))}
        </ul>
      </div>
    );
  }

  // Plain paragraph
  return (
    <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
      <InlineMarkdown text={text} />
    </p>
  );
};

const InlineMarkdown: React.FC<{ text: string }> = ({ text }) => {
  // Split on **bold** and `code` patterns
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);

  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-gray-900 dark:text-gray-100">
              {part.slice(2, -2)}
            </strong>
          );
        }
        if (part.startsWith("`") && part.endsWith("`")) {
          return (
            <code
              key={i}
              className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-xs font-mono text-gray-800 dark:text-gray-200"
            >
              {part.slice(1, -1)}
            </code>
          );
        }
        return <React.Fragment key={i}>{part}</React.Fragment>;
      })}
    </>
  );
};
