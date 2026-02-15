import type { ReactNode } from 'react';
import ReactMarkdown from 'react-markdown';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProblemSectionProps {
  title: string;
  content: string | ReactNode;
  icon: ReactNode;
  isVisible: boolean;
  className?: string;
  isMarkdown?: boolean;
}

export function ProblemSection({ title, content, icon, isVisible, className, isMarkdown }: ProblemSectionProps) {
  if (!isVisible) {
    return null;
  }

  return (
    <Card className={`border-border/60 shadow-sm ${className ?? ''}`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          {icon}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isMarkdown && typeof content === 'string' ? (
          <ReactMarkdown className="prose dark:prose-invert max-w-none prose-sm md:prose-base leading-relaxed prose-headings:font-semibold prose-headings:tracking-tight">
            {content}
          </ReactMarkdown>
        ) : typeof content === 'string' ? (
          <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed text-foreground/80">{content}</p>
        ) : (
          content
        )}
      </CardContent>
    </Card>
  );
}
