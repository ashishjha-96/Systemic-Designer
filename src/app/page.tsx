
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TooltipProvider } from "@/components/ui/tooltip"; 
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
  FileCode, // Icon for Markdown
  FileDigit, // Icon for TXT
  FileX, // Icon for PDF
  NotebookText, // Icon for Notion
  Pocket, // Icon for Pocket
} from "lucide-react";
// Removed exportToNotion and exportToPocket, kept other utils
import { generateMarkdownContent, generatePlainTextContent, generatePdfContent } from "@/lib/downloadUtils"; 

export default function HomePage() {
  const [problemData, setProblemData] = useState<GenerateSystemDesignProblemOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false); // State for download loading
  const [isExportingToNotion, setIsExportingToNotion] = useState(false);
  const [isExportingToPocket, setIsExportingToPocket] = useState(false);
  const [showNotionModal, setShowNotionModal] = useState(false);
  const [notionApiKeyInput, setNotionApiKeyInput] = useState("");
  const [notionPageIdInput, setNotionPageIdInput] = useState("");
  const [showPocketModal, setShowPocketModal] = useState(false);
  const [pocketConsumerKeyInput, setPocketConsumerKeyInput] = useState("");
  const [pocketAccessTokenInput, setPocketAccessTokenInput] = useState("");
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

    setIsDownloading(true); // Start download loading state
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
        // Use a promise or async/await if generatePdfContent is async internally
        await new Promise<void>(resolve => {
            generatePdfContent(problemData, filename);
            resolve();
        });
        // PDF generation handled by jspdf's save method within the utility function
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
       setIsDownloading(false); // End download loading state regardless of success/failure
    }
  };

  const handleExportToNotion = async () => {
    if (!problemData) {
      toast({
        title: "No Problem Data",
        description: "Please generate a problem before exporting.",
        variant: "destructive",
      });
      return;
    }
    // Reset input fields when opening the modal
    setNotionApiKeyInput("");
    setNotionPageIdInput("");
    setShowNotionModal(true);
  };

  const submitNotionExport = async () => {
    if (!problemData) { // Should ideally not happen if modal is opened after problemData check
      toast({ title: "Error", description: "No problem data available for export.", variant: "destructive" });
      setShowNotionModal(false);
      return;
    }
    if (!notionApiKeyInput.trim() || !notionPageIdInput.trim()) {
      toast({
        title: "Missing Information",
        description: "Notion API Key and Parent Page ID are required.",
        variant: "destructive",
      });
      return;
    }

    setIsExportingToNotion(true);
    try {
      const apiResponse = await fetch('/api/export/notion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemData,
          notionApiKey: notionApiKeyInput.trim(),
          pageId: notionPageIdInput.trim(),
        }),
      });

      const responseData = await apiResponse.json();

      if (apiResponse.ok && responseData.success) {
        toast({
          title: "Export Successful!",
          description: `Successfully exported to Notion. Page URL: ${responseData.pageUrl || 'N/A'}`,
        });
      } else {
        toast({
          title: "Export Failed",
          description: responseData.error || "An unknown error occurred while exporting to Notion.",
          variant: "destructive",
        });
      }
    } catch (e: any) {
      console.error("Error calling /api/export/notion:", e);
      toast({
        title: "Export Error",
        description: e.message || "An unexpected error occurred while trying to export to Notion.",
        variant: "destructive",
      });
    } finally {
      setIsExportingToNotion(false);
      setShowNotionModal(false);
      // Optionally clear fields after attempt, or let them persist for next try
      // setNotionApiKeyInput(""); 
      // setNotionPageIdInput("");
    }
  };

  const handleExportToPocket = async () => {
    if (!problemData) {
      toast({
        title: "No Problem Data",
        description: "Please generate a problem before exporting to Pocket.",
        variant: "destructive",
      });
      return;
    }
    // Reset input fields when opening the modal
    setPocketConsumerKeyInput("");
    setPocketAccessTokenInput("");
    setShowPocketModal(true);
  };

  const submitPocketExport = async () => {
    if (!problemData) { // Should ideally not happen
      toast({ title: "Error", description: "No problem data available for Pocket export.", variant: "destructive" });
      setShowPocketModal(false);
      return;
    }
    if (!pocketConsumerKeyInput.trim() || !pocketAccessTokenInput.trim()) {
      toast({
        title: "Missing Information",
        description: "Pocket Consumer Key and Access Token are required.",
        variant: "destructive",
      });
      return;
    }

    setIsExportingToPocket(true);
    try {
      const apiResponse = await fetch('/api/export/pocket', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          problemData,
          pocketConsumerKey: pocketConsumerKeyInput.trim(),
          pocketAccessToken: pocketAccessTokenInput.trim(),
        }),
      });

      const responseData = await apiResponse.json();

      if (apiResponse.ok && responseData.success) {
        toast({
          title: "Export Successful!",
          description: "Successfully exported to Pocket.", 
          // Pocket API response might have item details in responseData.data, 
          // but the API route currently returns the whole 'result' object from exportToPocket,
          // so responseData itself is that result object.
        });
      } else {
        toast({
          title: "Export Failed",
          description: `${responseData.error || "An unknown error occurred"}${responseData.details ? ' Details: ' + JSON.stringify(responseData.details) : ''}`.trim(),
          variant: "destructive",
        });
      }
    } catch (e: any) {
      console.error("Error calling /api/export/pocket:", e);
      toast({
        title: "Export Error",
        description: e.message || "An unexpected error occurred while trying to export to Pocket.",
        variant: "destructive",
      });
    } finally {
      setIsExportingToPocket(false);
      setShowPocketModal(false);
      // Optionally clear fields
      // setPocketConsumerKeyInput("");
      // setPocketAccessTokenInput("");
    }
  };

  const sections = problemData ? [
    { id: 'problem', title: "Problem Statement", content: problemData.problemStatement, icon: <FileText className="text-primary" />, isVisible: visibility.problem, problemType: problemData.generatedProblemType, isMarkdown: true }, // Assume markdown
    { id: 'scaleEstimates', title: "Scale Estimates", content: problemData.scaleEstimates, icon: <Scaling className="text-primary" />, isVisible: visibility.scaleEstimates, isMarkdown: true },
    { id: 'solution', title: "Solution", content: problemData.solution, icon: <Lightbulb className="text-primary" />, isVisible: visibility.solution, isMarkdown: true },
    { id: 'capacityPlanning', title: "Capacity Planning", content: problemData.capacityPlanning, icon: <Calculator className="text-primary" />, isVisible: visibility.capacityPlanning, isMarkdown: true },
    { id: 'reasoning', title: "Reasoning", content: problemData.reasoning, icon: <Sparkles className="text-primary" />, isVisible: visibility.reasoning, isMarkdown: true },
    { id: 'keyConcepts', title: "Key Concepts", content: problemData.keyConcepts, icon: <BookOpenText className="text-primary" />, isVisible: visibility.keyConcepts, isMarkdown: false }, // Typically comma-separated string
  ] : [];

  const isAnyOperationInProgress = isDownloading || isExportingToNotion || isExportingToPocket;

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
                  {/* Optional: Add a spinner here */}
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
                            <Button variant="outline" disabled={isAnyOperationInProgress}>
                             {isAnyOperationInProgress ? (
                                <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-current rounded-full" />
                             ) : (
                                <Download className="mr-2 h-4 w-4" />
                             )}
                             {isAnyOperationInProgress ? 'Processing...' : 'Download / Export'}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleDownload('md')} disabled={isAnyOperationInProgress}>
                                <FileCode className="mr-2 h-4 w-4" /> Markdown (.md)
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDownload('txt')} disabled={isAnyOperationInProgress}>
                                <FileDigit className="mr-2 h-4 w-4" /> Plain Text (.txt)
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDownload('pdf')} disabled={isAnyOperationInProgress}>
                                <FileX className="mr-2 h-4 w-4" /> PDF (.pdf)
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleExportToNotion} disabled={isAnyOperationInProgress}>
                                <NotebookText className="mr-2 h-4 w-4" /> Export to Notion
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={handleExportToPocket} disabled={isAnyOperationInProgress}>
                                <Pocket className="mr-2 h-4 w-4" /> Export to Pocket
                            </DropdownMenuItem>
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
                            priority={false} // Keep false unless above the fold
                        />
                        </div>
                    </div>
                    {problemData.diagramDescription && (
                        <div>
                            <h4 className="font-medium mt-4 mb-2 text-muted-foreground">Diagram Description (Used for Generation):</h4>
                            {/* Render diagram description as plain text */}
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
                           {/* Render diagram description as plain text */}
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

      {/* Notion Export Modal */}
      <Dialog open={showNotionModal} onOpenChange={setShowNotionModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export to Notion</DialogTitle>
            <DialogDescription>
              Please enter your Notion API Key and the Parent Page ID where the content should be added.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notionApiKey" className="text-right">
                API Key
              </Label>
              <Input
                id="notionApiKey"
                value={notionApiKeyInput}
                onChange={(e) => setNotionApiKeyInput(e.target.value)}
                placeholder="Enter your Notion API Key"
                className="col-span-3"
                type="password"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notionPageId" className="text-right">
                Parent Page ID
              </Label>
              <Input
                id="notionPageId"
                value={notionPageIdInput}
                onChange={(e) => setNotionPageIdInput(e.target.value)}
                placeholder="Enter the Notion Parent Page ID"
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNotionModal(false)} disabled={isExportingToNotion}>
              Cancel
            </Button>
            <Button onClick={submitNotionExport} disabled={isExportingToNotion}>
              {isExportingToNotion ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-current rounded-full" />
                  Exporting...
                </>
              ) : (
                'Export'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pocket Export Modal */}
      <Dialog open={showPocketModal} onOpenChange={setShowPocketModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export to Pocket</DialogTitle>
            <DialogDescription>
              Please enter your Pocket Consumer Key and Access Token.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pocketConsumerKey" className="text-right">
                Consumer Key
              </Label>
              <Input
                id="pocketConsumerKey"
                value={pocketConsumerKeyInput}
                onChange={(e) => setPocketConsumerKeyInput(e.target.value)}
                placeholder="Enter your Pocket Consumer Key"
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="pocketAccessToken" className="text-right">
                Access Token
              </Label>
              <Input
                id="pocketAccessToken"
                value={pocketAccessTokenInput}
                onChange={(e) => setPocketAccessTokenInput(e.target.value)}
                placeholder="Enter your Pocket Access Token"
                className="col-span-3"
                type="password" // Optional: mask token input
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPocketModal(false)} disabled={isExportingToPocket}>
              Cancel
            </Button>
            <Button onClick={submitPocketExport} disabled={isExportingToPocket}>
              {isExportingToPocket ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-b-2 border-current rounded-full" />
                  Exporting...
                </>
              ) : (
                'Export'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
