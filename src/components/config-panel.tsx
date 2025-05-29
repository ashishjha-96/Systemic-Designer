
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useState, useEffect } from "react"; // Added useState, useEffect
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { ProblemGenerationSchema, type ProblemGenerationFormValues } from "@/lib/schemas";
// import { supportedModels } from '@/lib/models'; // Removed supportedModels
import { fetchAvailableModels } from '@/lib/models'; // Import fetchAvailableModels
import { Wand2, Settings2, Eye, EyeOff, Cpu } from "lucide-react"; // Added Cpu icon
import type { Dispatch, SetStateAction } from "react";

export interface VisibilityState {
  problem: boolean;
  scaleEstimates: boolean;
  solution: boolean;
  capacityPlanning: boolean;
  reasoning: boolean;
  keyConcepts: boolean;
  diagram: boolean;
}

interface ConfigPanelProps {
  onSubmit: (values: ProblemGenerationFormValues) => Promise<void>;
  isLoading: boolean;
  visibility: VisibilityState;
  setVisibility: Dispatch<SetStateAction<VisibilityState>>;
}

const visibilityOptions: { key: keyof VisibilityState; label: string }[] = [
  { key: "problem", label: "Problem Statement" },
  { key: "scaleEstimates", label: "Scale Estimates" },
  { key: "solution", label: "Solution" },
  { key: "capacityPlanning", label: "Capacity Planning" },
  { key: "reasoning", label: "Reasoning" },
  { key: "keyConcepts", label: "Key Concepts" },
  { key: "diagram", label: "Diagram" },
];

export function ConfigPanel({ onSubmit, isLoading, visibility, setVisibility }: ConfigPanelProps) {
  const [models, setModels] = useState<string[]>([]);
  const [isLoadingModels, setIsLoadingModels] = useState(true);
  const [modelsError, setModelsError] = useState<string | null>(null);

  const form = useForm<ProblemGenerationFormValues>({
    resolver: zodResolver(ProblemGenerationSchema),
    defaultValues: {
      difficultyLevel: "Medium",
      problemType: "",
      modelName: '', // Default model set to empty initially
    },
  });

  useEffect(() => {
    async function loadModels() {
      setIsLoadingModels(true);
      setModelsError(null);
      try {
        const fetchedModels = await fetchAvailableModels();
        if (fetchedModels.length > 0) {
          setModels(fetchedModels);
          // Set the first model as default if no model is currently selected
          if (!form.getValues('modelName') && fetchedModels.length > 0) {
            form.setValue('modelName', fetchedModels[0], { shouldValidate: true });
          }
        } else {
          setModelsError("No AI models available. Check API key or network.");
          setModels([]); // Ensure models array is empty
        }
      } catch (error) {
        console.error("Failed to fetch models:", error);
        setModelsError("Failed to load AI models. Please check your API key and network connection.");
        setModels([]); // Ensure models array is empty
      } finally {
        setIsLoadingModels(false);
      }
    }
    loadModels();
  // eslint-disable-next-line react-hooks/exhaustive-deps 
  }, [form.setValue, form.getValues]); // Dependencies for form interaction

  const handleFormSubmit: SubmitHandler<ProblemGenerationFormValues> = async (values) => {
    await onSubmit(values);
  };

  const toggleVisibility = (key: keyof VisibilityState) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside className="w-full md:w-96 p-6 bg-card md:border-r border-border space-y-6">
      <div className="flex items-center gap-2">
        <Settings2 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-semibold">Configuration</h2>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="difficultyLevel"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Difficulty Level</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select difficulty" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Easy">Easy</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Hard">Hard</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="problemType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Problem Type (Optional)</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Design a URL shortener (AI will generate if blank)" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="modelName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <Cpu className="h-4 w-4" /> AI Model (Text Generation)
                  {isLoadingModels && <Spinner className="ml-2 h-4 w-4 text-muted-foreground" />}
                </FormLabel>
                <Select
                  onValueChange={field.onChange}
                  value={field.value} // Use value for controlled component
                  disabled={isLoadingModels || !!modelsError || models.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        isLoadingModels ? "Loading models..." :
                        modelsError ? "Error loading models" :
                        models.length === 0 ? "No models available" :
                        "Select a model"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {models.map(model => (
                      <SelectItem key={model} value={model}>
                        {model.startsWith('models/') ? model.substring('models/'.length) : model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {modelsError && <p className="text-sm font-medium text-destructive">{modelsError}</p>}
                 <p className="text-[0.8rem] text-muted-foreground">
                  Note: Diagram generation always uses a specific model optimized for images.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full" 
            disabled={isLoading || isLoadingModels || !!modelsError || models.length === 0 || !form.watch('modelName')}
          >
            {isLoading || isLoadingModels ? <Spinner className="mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />}
            Generate Problem
          </Button>
        </form>
      </Form>

      <Separator />

      <div>
        <h3 className="text-lg font-medium mb-4">Toggle Sections</h3>
        <div className="space-y-3">
          {visibilityOptions.map(option => (
            <div key={option.key} className="flex items-center justify-between p-3 rounded-md border">
              <Label htmlFor={`visibility-${option.key}`} className="flex items-center gap-2 cursor-pointer">
                {visibility[option.key] ? <Eye className="h-4 w-4 text-primary"/> : <EyeOff className="h-4 w-4 text-muted-foreground"/>}
                {option.label}
              </Label>
              <Switch
                id={`visibility-${option.key}`}
                checked={visibility[option.key]}
                onCheckedChange={() => toggleVisibility(option.key)}
              />
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
