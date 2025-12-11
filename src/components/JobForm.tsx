import React, { useState } from "react";
import { Button } from "./ui/button";
import { Textarea } from "./ui/textarea";
import { Input } from "./ui/input";
import { Play, Loader2, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface JobFormProps {
  onSubmit: (name: string, story: string) => void;
  isRunning: boolean;
}

const EXAMPLE_STORIES = [
  "Build a REST API with Express that has CRUD endpoints for managing a todo list with MongoDB",
  "Create a CLI tool that generates boilerplate code for React components with TypeScript",
  "Build a real-time chat server using Socket.IO with rooms and private messaging",
];

export function JobForm({ onSubmit, isRunning }: JobFormProps) {
  const [name, setName] = useState("");
  const [story, setStory] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim() && story.trim() && !isRunning) {
      onSubmit(name.trim(), story.trim());
    }
  };

  const handleExample = (example: string) => {
    setStory(example);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          Project Name
        </label>
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="my-awesome-project"
          className="font-mono bg-input border-border"
          disabled={isRunning}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2 text-foreground">
          User Story
        </label>
        <Textarea
          value={story}
          onChange={(e) => setStory(e.target.value)}
          placeholder="Describe what you want to build..."
          className="min-h-[120px] font-mono bg-input border-border resize-none"
          disabled={isRunning}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {EXAMPLE_STORIES.map((example, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleExample(example)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border border-border",
              "hover:border-primary/50 hover:bg-primary/5 transition-colors",
              "text-muted-foreground hover:text-foreground"
            )}
            disabled={isRunning}
          >
            <Sparkles className="h-3 w-3 inline-block mr-1.5" />
            Example {index + 1}
          </button>
        ))}
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        variant={isRunning ? "secondary" : "default"}
        disabled={!name.trim() || !story.trim() || isRunning}
      >
        {isRunning ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Agents Working...
          </>
        ) : (
          <>
            <Play className="h-4 w-4" />
            Generate Project
          </>
        )}
      </Button>
    </form>
  );
}
