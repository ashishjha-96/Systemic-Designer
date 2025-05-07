import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProblemSectionProps {
  title: string;
  content: string | ReactNode;
  icon: ReactNode;
  isVisible: boolean;
  className?: string;
}

export function ProblemSection({ title, content, icon, isVisible, className }: ProblemSectionProps) {
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
        {typeof content === 'string' ? (
          <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{content}</p>
        ) : (
          content
        )}
      </CardContent>
    </Card>
  );
}
