
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
import { Spinner } from "@/components/ui/spinner";
import { ProblemGenerationSchema, type ProblemGenerationFormValues } from "@/lib/schemas";
import { supportedModels } from '@/lib/models';
import { Wand2, Eye, EyeOff, Cpu, SlidersHorizontal } from "lucide-react";
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
  isCollapsed: boolean;
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

export function ConfigPanel({ onSubmit, isLoading, visibility, setVisibility, isCollapsed }: ConfigPanelProps) {
  const form = useForm<ProblemGenerationFormValues>({
    resolver: zodResolver(ProblemGenerationSchema),
    defaultValues: {
      difficultyLevel: "Medium",
      problemType: "",
      modelName: 'googleai/gemini-2.5-flash',
    },
  });

  const handleFormSubmit: SubmitHandler<ProblemGenerationFormValues> = async (values) => {
    await onSubmit(values);
  };

  const toggleVisibility = (key: keyof VisibilityState) => {
    setVisibility(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <aside
      className={`bg-card md:border-r border-border/50 flex flex-col transition-all duration-300 ease-in-out overflow-hidden ${
        isCollapsed ? 'w-0 md:w-0 border-r-0' : 'w-full md:w-80 lg:w-[340px]'
      }`}
    >
      <div className={`p-5 space-y-5 flex-1 overflow-y-auto min-w-[320px] ${isCollapsed ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}>
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
          <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Configuration</h2>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="difficultyLevel"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-medium text-muted-foreground">Difficulty Level</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 bg-secondary/50 border-border/50">
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
                  <FormLabel className="text-xs font-medium text-muted-foreground">Problem Type (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Design a URL shortener"
                      className="h-9 bg-secondary/50 border-border/50"
                      {...field}
                    />
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
                  <FormLabel className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Cpu className="h-3 w-3" /> AI Model
                  </FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger className="h-9 bg-secondary/50 border-border/50">
                        <SelectValue placeholder="Select model" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {supportedModels.map(model => (
                        <SelectItem key={model} value={model}>
                          {model.replace('googleai/', '')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button type="submit" className="w-full h-10 font-medium shadow-sm" disabled={isLoading}>
              {isLoading ? <Spinner className="mr-2 h-4 w-4" /> : <Wand2 className="mr-2 h-4 w-4" />}
              {isLoading ? 'Generating...' : 'Generate Problem'}
            </Button>
          </form>
        </Form>

        <div className="pt-2">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Toggle Sections</h3>
          <div className="space-y-1">
            {visibilityOptions.map(option => (
              <div
                key={option.key}
                className="flex items-center justify-between py-2 px-2.5 rounded-lg hover:bg-secondary/50 transition-colors"
              >
                <Label
                  htmlFor={`visibility-${option.key}`}
                  className="flex items-center gap-2 cursor-pointer text-sm font-normal"
                >
                  {visibility[option.key] ? (
                    <Eye className="h-3.5 w-3.5 text-primary" />
                  ) : (
                    <EyeOff className="h-3.5 w-3.5 text-muted-foreground/50" />
                  )}
                  <span className={visibility[option.key] ? 'text-foreground' : 'text-muted-foreground'}>
                    {option.label}
                  </span>
                </Label>
                <Switch
                  id={`visibility-${option.key}`}
                  checked={visibility[option.key]}
                  onCheckedChange={() => toggleVisibility(option.key)}
                  className="scale-90"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}
