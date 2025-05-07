import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProblemSectionProps {
  title: string;
  content: string | ReactNode;
  icon: ReactNode;
  isVisible: boolean;
  className?: string;
  isMarkdown?: boolean; // Add a new prop to indicate if content is Markdown
}

export function ProblemSection({ title, content, icon, isVisible, className, isMarkdown }: ProblemSectionProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isMarkdown && typeof content === 'string' ? (
          <ReactMarkdown className="prose dark:prose-invert max-w-none prose-sm md:prose-base leading-relaxed">
            {content}
          </ReactMarkdown>
        ) : typeof content === 'string' ? (
          <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{content}</p>
        ) : (
          content
        )}
      </CardContent>
    </Card>
  );
}
