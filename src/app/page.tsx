
"use client";

import { useState } from "react";
import type { GenerateSystemDesignProblemOutput } from "@/ai/flows/generate-system-design-problem";
import { AppHeader } from "@/components/layout/header";
import { ConfigPanel, type VisibilityState } from "@/components/config-panel";
import { ProblemSection } from "@/components/problem-section";
import { generateProblemAction } from "@/app/actions";
import { MermaidDiagram } from "@/components/mermaid-diagram";
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
import { TooltipProvider } from "@/components/ui/tooltip";
import {
  FileText,
  Lightbulb,
  Sparkles,
  BookOpenText,
  Projector,
  AlertTriangle,
  Scaling,
  Calculator,
  Download,
  FileCode,
  FileDigit,
  FileX,
  LayoutDashboard,
  Zap,
  Target,
  Boxes,
} from "lucide-react";
import { generateMarkdownContent, generatePlainTextContent, generatePdfContent } from "@/lib/downloadUtils";

export default function HomePage() {
  const [problemData, setProblemData] = useState<GenerateSystemDesignProblemOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const handleDownload = async (format: 'md' | 'txt' | 'pdf') => {
    if (!problemData || isDownloading) return;

    setIsDownloading(true);
    let filename = `system-design-${problemData.generatedProblemType?.toLowerCase().replace(/\s+/g, '-') || 'problem'}`;

    try {
      if (format === 'md') {
        const content = generateMarkdownContent(problemData);
        const mimeType = "text/markdown";
        filename += ".md";
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'txt') {
        const content = generatePlainTextContent(problemData);
        const mimeType = "text/plain";
        filename += ".txt";
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      } else if (format === 'pdf') {
        filename += ".pdf";
        await new Promise<void>(resolve => {
            generatePdfContent(problemData, filename);
            resolve();
        });
      }

       toast({
        title: "Download Started",
        description: `Your ${format.toUpperCase()} file is downloading.`,
      });

    } catch (e) {
        console.error("Download failed:", e);
         toast({
            title: "Download Failed",
            description: `Could not generate the ${format.toUpperCase()} file. Check console for details.`,
            variant: "destructive",
        });
    } finally {
       setIsDownloading(false);
    }
  };


  const sections = problemData ? [
    { id: 'problem', title: "Problem Statement", content: problemData.problemStatement, icon: <FileText className="h-5 w-5 text-primary" />, isVisible: visibility.problem, isMarkdown: true },
    { id: 'scaleEstimates', title: "Scale Estimates", content: problemData.scaleEstimates, icon: <Scaling className="h-5 w-5 text-primary" />, isVisible: visibility.scaleEstimates, isMarkdown: true },
    { id: 'solution', title: "Solution", content: problemData.solution, icon: <Lightbulb className="h-5 w-5 text-primary" />, isVisible: visibility.solution, isMarkdown: true },
    { id: 'capacityPlanning', title: "Capacity Planning", content: problemData.capacityPlanning, icon: <Calculator className="h-5 w-5 text-primary" />, isVisible: visibility.capacityPlanning, isMarkdown: true },
    { id: 'reasoning', title: "Reasoning", content: problemData.reasoning, icon: <Sparkles className="h-5 w-5 text-primary" />, isVisible: visibility.reasoning, isMarkdown: true },
    { id: 'keyConcepts', title: "Key Concepts", content: problemData.keyConcepts, icon: <BookOpenText className="h-5 w-5 text-primary" />, isVisible: visibility.keyConcepts, isMarkdown: false },
  ] : [];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <AppHeader
        sidebarCollapsed={sidebarCollapsed}
        onToggleSidebar={() => setSidebarCollapsed(prev => !prev)}
      />
      <div className="flex flex-1 flex-col md:flex-row">
        <ConfigPanel
          onSubmit={handleGenerateProblem}
          isLoading={isLoading}
          visibility={visibility}
          setVisibility={setVisibility}
          isCollapsed={sidebarCollapsed}
        />
        <ScrollArea className="flex-1">
          <main className="p-6 md:p-8 lg:p-10 max-w-5xl mx-auto">
            {/* Welcome Screen */}
            {!problemData && !isLoading && !error && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="mb-8">
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight leading-tight">
                    Design systems
                    <br />
                    <span className="text-primary">like an architect.</span>
                  </h1>
                  <p className="mt-4 text-muted-foreground text-lg max-w-md mx-auto">
                    Configure your options on the left and generate a system design challenge to get started.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl">
                  <div className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-default">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground/80">Practice scalability patterns & trade-offs</span>
                  </div>
                  <div className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-default">
                    <Zap className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground/80">AI-generated diagrams & capacity plans</span>
                  </div>
                  <div className="flex flex-col items-start gap-2 p-4 rounded-xl border border-border/60 bg-card hover:border-primary/30 hover:shadow-sm transition-all cursor-default">
                    <Boxes className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm text-foreground/80">Export to Markdown, PDF, or plain text</span>
                  </div>
                </div>
              </div>
            )}

            {/* Loading State */}
            {isLoading && (
              <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="relative mb-6">
                  <div className="h-12 w-12 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
                </div>
                <h2 className="text-xl font-semibold tracking-tight">Generating your challenge...</h2>
                <p className="mt-2 text-muted-foreground text-sm max-w-sm">
                  Crafting a system design problem with solution, capacity planning, and architecture diagram.
                </p>
              </div>
            )}

            {/* Error State */}
            {error && !isLoading && (
              <div className="flex flex-col items-center justify-center min-h-[40vh] text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 mb-4">
                  <AlertTriangle className="h-6 w-6 text-destructive" />
                </div>
                <h2 className="text-xl font-semibold">Something went wrong</h2>
                <p className="mt-2 text-muted-foreground text-sm max-w-sm">{error}</p>
              </div>
            )}

            {/* Problem Data Display */}
            {problemData && (
              <div className="space-y-6">
                {/* Top bar: Problem type + download */}
                <div className="flex items-center justify-between">
                  {problemData.generatedProblemType && (
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
                        <LayoutDashboard className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground font-medium">System Design Focus</p>
                        <p className="text-sm font-semibold">{problemData.generatedProblemType}</p>
                      </div>
                    </div>
                  )}

                  <TooltipProvider>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 border-border/60" disabled={isDownloading}>
                          {isDownloading ? (
                            <span className="animate-spin mr-1.5 h-3 w-3 border-b-2 border-current rounded-full" />
                          ) : (
                            <Download className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          {isDownloading ? 'Exporting...' : 'Export'}
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onSelect={() => handleDownload('md')} disabled={isDownloading}>
                          <FileCode className="mr-2 h-4 w-4" /> Markdown
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDownload('txt')} disabled={isDownloading}>
                          <FileDigit className="mr-2 h-4 w-4" /> Plain Text
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleDownload('pdf')} disabled={isDownloading}>
                          <FileX className="mr-2 h-4 w-4" /> PDF
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TooltipProvider>
                </div>

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
                {problemData.mermaidDiagram && visibility.diagram && (
                  <Card className="border-border/60 shadow-sm">
                    <CardHeader className="pb-4">
                      <CardTitle className="flex items-center gap-2 text-base font-semibold">
                        <Projector className="h-5 w-5 text-primary" /> Architecture Diagram
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="p-6 rounded-lg bg-secondary/30 border border-border/40">
                        <MermaidDiagram chart={problemData.mermaidDiagram} />
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </main>
        </ScrollArea>
      </div>
    </div>
  );
}
