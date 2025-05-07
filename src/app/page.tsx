
"use client";

import { useState } from "react";
import Image from "next/image";
import type { GenerateSystemDesignProblemOutput } from "@/ai/flows/generate-system-design-problem";
import { AppHeader } from "@/components/layout/header";
import { ConfigPanel, type VisibilityState } from "@/components/config-panel";
import { ProblemSection } from "@/components/problem-section";
import { generateProblemAction, type ProblemGenerationFormValues } from "@/app/actions";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  Lightbulb,
  Sparkles, // Using Sparkles for Reasoning as a more positive icon
  BookOpenText,
  Projector,
  AlertTriangle
} from "lucide-react";

export default function HomePage() {
  const [problemData, setProblemData] = useState<GenerateSystemDesignProblemOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [visibility, setVisibility] = useState<VisibilityState>({
    problem: true,
    solution: true,
    reasoning: true,
    keyConcepts: true,
    diagram: true,
  });

  const handleGenerateProblem = async (values: ProblemGenerationFormValues) => {
    setIsLoading(true);
    setError(null);
    setProblemData(null);

    const result = await generateProblemAction(values);

    if (result.success && result.data) {
      setProblemData(result.data);
      toast({
        title: "Problem Generated!",
        description: "A new system design problem has been created.",
      });
    } else {
      setError(result.error || "An unknown error occurred.");
      toast({
        title: "Error Generating Problem",
        description: result.error || "Please try again.",
        variant: "destructive",
      });
    }
    setIsLoading(false);
  };

  const sections = problemData ? [
    { id: 'problem', title: "Problem Statement", content: problemData.problemStatement, icon: <FileText className="text-primary" />, isVisible: visibility.problem },
    { id: 'solution', title: "Solution", content: problemData.solution, icon: <Lightbulb className="text-primary" />, isVisible: visibility.solution },
    { id: 'reasoning', title: "Reasoning", content: problemData.reasoning, icon: <Sparkles className="text-primary" />, isVisible: visibility.reasoning },
    { id: 'keyConcepts', title: "Key Concepts", content: problemData.keyConcepts, icon: <BookOpenText className="text-primary" />, isVisible: visibility.keyConcepts },
  ] : [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader />
      <div className="flex flex-1 flex-col md:flex-row">
        <ConfigPanel
          onSubmit={handleGenerateProblem}
          isLoading={isLoading}
          visibility={visibility}
          setVisibility={setVisibility}
        />
        <ScrollArea className="flex-1">
          <main className="p-6 md:p-10 space-y-6">
            {!problemData && !isLoading && !error && (
              <Card className="text-center py-12">
                <CardHeader>
                  <CardTitle className="text-2xl">Welcome to Systematic Designer!</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Configure your options on the left and click "Generate Problem" to get started.
                  </p>
                </CardContent>
              </Card>
            )}
            {isLoading && (
               <Card className="text-center py-12">
                <CardHeader>
                  <CardTitle className="text-2xl">Generating Problem...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Please wait while we craft a system design challenge for you.
                  </p>
                </CardContent>
              </Card>
            )}
            {error && !isLoading && (
              <Card className="border-destructive text-center py-12">
                 <CardHeader>
                  <CardTitle className="flex items-center justify-center gap-2 text-destructive text-2xl">
                    <AlertTriangle /> Error
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-destructive-foreground">{error}</p>
                </CardContent>
              </Card>
            )}
            
            {sections.map(section => (
              <ProblemSection
                key={section.id}
                title={section.title}
                content={section.content}
                icon={section.icon}
                isVisible={section.isVisible}
              />
            ))}

            {problemData && problemData.diagram && visibility.diagram && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Projector className="text-primary" /> Diagram
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2 text-muted-foreground">Textual Description:</h4>
                    <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{problemData.diagram}</p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2 text-muted-foreground">Visual Representation (Placeholder):</h4>
                    <div className="flex justify-center p-4 border rounded-md bg-secondary/30">
                       <Image 
                        src="https://picsum.photos/seed/systemdesign/800/600" 
                        alt="System Design Diagram Placeholder" 
                        width={800} 
                        height={600}
                        className="rounded-md border object-contain max-w-full h-auto"
                        data-ai-hint="system architecture"
                        priority={false} // Not critical for LCP
                       />
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
