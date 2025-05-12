
"use client";

import { useState } from "react";
import Image from "next/image";
import type { GenerateSystemDesignProblemOutput } from "@/ai/flows/generate-system-design-problem";
import { AppHeader } from "@/components/layout/header";
import { ConfigPanel, type VisibilityState } from "@/components/config-panel";
import { ProblemSection } from "@/components/problem-section";
import { generateProblemAction } from "@/app/actions"; 
import type { ProblemGenerationFormValues } from "@/lib/schemas"; 
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import {
  FileText,
  Lightbulb,
  Sparkles, 
  BookOpenText,
  Projector,
  AlertTriangle,
  Info,
  Scaling, 
  Calculator,
  Download,
  FileDown, // Icon for generic download
  FileCode, // Icon for Markdown
  FileDigit, // Icon for TXT (closest match)
  FileX, // Icon for PDF (disabled)
} from "lucide-react";
import { generateMarkdownContent, generatePlainTextContent } from "@/lib/downloadUtils"; // Import download utils

export default function HomePage() {
  const [problemData, setProblemData] = useState<GenerateSystemDesignProblemOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const [visibility, setVisibility] = useState<VisibilityState>({
    problem: true,
    scaleEstimates: true, 
    solution: true,
    capacityPlanning: true, 
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

  const handleDownload = (format: 'md' | 'txt' | 'pdf') => {
    if (!problemData) return;

    let content = "";
    let mimeType = "";
    let filename = `system-design-${problemData.generatedProblemType?.toLowerCase().replace(/\s+/g, '-') || 'problem'}`;

    try {
      if (format === 'md') {
        content = generateMarkdownContent(problemData);
        mimeType = "text/markdown";
        filename += ".md";
      } else if (format === 'txt') {
        content = generatePlainTextContent(problemData);
        mimeType = "text/plain";
        filename += ".txt";
      } else if (format === 'pdf') {
        // PDF generation is complex client-side, not implemented yet
        toast({
            title: "PDF Download Unavailable",
            description: "PDF download functionality is not yet implemented.",
            variant: "destructive",
        });
        return; // Exit early
      }

      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

       toast({
        title: "Download Started",
        description: `Your ${format.toUpperCase()} file is downloading.`,
      });

    } catch (e) {
        console.error("Download failed:", e);
         toast({
            title: "Download Failed",
            description: `Could not generate the ${format.toUpperCase()} file.`,
            variant: "destructive",
        });
    }
  };


  const sections = problemData ? [
    { id: 'problem', title: "Problem Statement", content: problemData.problemStatement, icon: <FileText className="text-primary" />, isVisible: visibility.problem, problemType: problemData.generatedProblemType, isMarkdown: false },
    { id: 'scaleEstimates', title: "Scale Estimates", content: problemData.scaleEstimates, icon: <Scaling className="text-primary" />, isVisible: visibility.scaleEstimates, isMarkdown: true },
    { id: 'solution', title: "Solution", content: problemData.solution, icon: <Lightbulb className="text-primary" />, isVisible: visibility.solution, isMarkdown: true },
    { id: 'capacityPlanning', title: "Capacity Planning", content: problemData.capacityPlanning, icon: <Calculator className="text-primary" />, isVisible: visibility.capacityPlanning, isMarkdown: true },
    { id: 'reasoning', title: "Reasoning", content: problemData.reasoning, icon: <Sparkles className="text-primary" />, isVisible: visibility.reasoning, isMarkdown: true },
    { id: 'keyConcepts', title: "Key Concepts", content: problemData.keyConcepts, icon: <BookOpenText className="text-primary" />, isVisible: visibility.keyConcepts, isMarkdown: false },
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
            {/* Initial Welcome Message */}
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
            {/* Loading State */}
            {isLoading && (
               <Card className="text-center py-12">
                <CardHeader>
                  <CardTitle className="text-2xl">Generating Problem...</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Please wait while we craft a system design challenge for you. This might take a moment, especially if generating a diagram.
                  </p>
                </CardContent>
              </Card>
            )}
            {/* Error State */}
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
            
            {/* Problem Data Display */}
            {problemData && (
                <>
                 {/* Download Button Dropdown */}
                 <div className="flex justify-end mb-4">
                    <TooltipProvider>
                        <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                            <Download className="mr-2 h-4 w-4" /> Download
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleDownload('md')}>
                                <FileCode className="mr-2 h-4 w-4" /> Markdown (.md)
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDownload('txt')}>
                                <FileDigit className="mr-2 h-4 w-4" /> Plain Text (.txt)
                            </DropdownMenuItem>
                             <Tooltip delayDuration={100}>
                                <TooltipTrigger asChild>
                                    {/* Wrap disabled item in span for tooltip to work */}
                                    <span tabIndex={0} className="w-full"> 
                                        <DropdownMenuItem onSelect={() => handleDownload('pdf')} disabled>
                                            <FileX className="mr-2 h-4 w-4" /> PDF (.pdf)
                                        </DropdownMenuItem>
                                    </span>
                                </TooltipTrigger>
                                <TooltipContent side="left" align="center">
                                    <p>PDF download is not yet available.</p>
                                </TooltipContent>
                             </Tooltip>
                        </DropdownMenuContent>
                        </DropdownMenu>
                    </TooltipProvider>
                 </div>

                {/* System Design Focus Info Card */}
                {problemData.generatedProblemType && (
                    <Card className="bg-secondary/50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-lg">
                                <Info className="text-primary h-5 w-5" />
                                System Design Focus
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-md">
                                <span className="font-semibold">Problem Type:</span> {problemData.generatedProblemType}
                            </p>
                        </CardContent>
                    </Card>
                )}

                {/* Sections */}
                {sections.map(section => (
                <ProblemSection
                    key={section.id}
                    title={section.title}
                    content={section.content}
                    icon={section.icon}
                    isVisible={section.isVisible}
                    isMarkdown={section.isMarkdown}
                />
                ))}

                {/* Diagram Section */}
                {problemData.diagramImageUri && visibility.diagram && (
                <Card>
                    <CardHeader>
                    <CardTitle className="flex items-center gap-2 text-xl">
                        <Projector className="text-primary" /> Diagram
                    </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                    <div>
                        <h4 className="font-medium mb-2 text-muted-foreground">Generated Schematic Diagram:</h4>
                        <div className="flex justify-center p-4 border rounded-md bg-secondary/30">
                        <Image 
                            src={problemData.diagramImageUri} 
                            alt="Generated System Design Diagram" 
                            width={800} 
                            height={600}
                            className="rounded-md border object-contain max-w-full h-auto"
                            data-ai-hint="system architecture"
                            priority={false} 
                        />
                        </div>
                    </div>
                    {problemData.diagramDescription && ( 
                        <div>
                            <h4 className="font-medium mt-4 mb-2 text-muted-foreground">Diagram Description (Used for Generation):</h4>
                            <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{problemData.diagramDescription}</p>
                        </div>
                    )}
                    </CardContent>
                </Card>
                )}
                {/* Fallback if image generation failed but description exists */}
                {problemData && !problemData.diagramImageUri && problemData.diagramDescription && visibility.diagram && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <Projector className="text-primary" /> Diagram Description
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="whitespace-pre-wrap text-sm md:text-base leading-relaxed">{problemData.diagramDescription}</p>
                            <p className="mt-2 text-sm text-muted-foreground">
                            A visual diagram could not be generated. Displaying the textual description instead.
                            </p>
                        </CardContent>
                    </Card>
                )}
                </>
            )}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}

