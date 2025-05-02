
import React from "react";
import { cn } from "@/lib/utils";

interface StepProps {
  title: string;
  description?: string;
  completed?: boolean;
  current?: boolean;
}

interface StepsProps {
  steps: StepProps[];
  currentStep?: number;
}

export function Steps({ steps, currentStep }: StepsProps) {
  return (
    <div className="relative">
      <div className="absolute left-6 top-0 h-full w-px bg-muted-foreground/15 dark:bg-muted-foreground/10"></div>
      <div className="space-y-2">
        {steps.map((step, index) => {
          const isCompleted = currentStep !== undefined && index < currentStep;
          const isCurrent = currentStep !== undefined && index === currentStep;
          return (
            <div key={step.title} className="relative flex gap-3">
              <div className="relative flex h-6 w-6 shrink-0 items-center justify-center">
                <div
                  className={cn(
                    "h-6 w-6 rounded-full flex items-center justify-center",
                    isCompleted
                      ? "bg-primary"
                      : isCurrent
                      ? "bg-primary/20 text-primary"
                      : "bg-muted"
                  )}
                >
                  {isCompleted ? (
                    <svg
                      className="h-4 w-4 text-primary-foreground"
                      viewBox="0 0 24 24"
                    >
                      <path
                        fill="currentColor"
                        d="m9.55 18l-5.7-5.7l1.425-1.425L9.55 15.15l9.175-9.175L20.15 7.4L9.55 18Z"
                      />
                    </svg>
                  ) : (
                    <span className="text-xs font-medium">{index + 1}</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col pb-4">
                <div className="text-sm font-medium">{step.title}</div>
                {step.description && (
                  <div className="text-xs text-muted-foreground">
                    {step.description}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
