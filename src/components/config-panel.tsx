
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler } from "react-hook-form";
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
import { supportedModels } from '@/lib/models'; // Import supported models
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
  const form = useForm<ProblemGenerationFormValues>({
    resolver: zodResolver(ProblemGenerationSchema),
    defaultValues: {
      difficultyLevel: "Medium",
      problemType: "",
      modelName: 'googleai/gemini-2.5-flash', // Default model from schema
    },
  });

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
                </FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select model" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {supportedModels.map(model => (
                      <SelectItem key={model} value={model}>
                        {model.replace('googleai/', '')} {/* Display cleaner name */}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                 <p className="text-[0.8rem] text-muted-foreground">
                  Note: Diagram generation always uses a specific model optimized for images.
                </p>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />}
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
