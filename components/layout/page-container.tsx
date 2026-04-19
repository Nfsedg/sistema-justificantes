"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  className?: string;
  headerAction?: React.ReactNode;
}

export function PageContainer({
  children,
  title,
  description,
  className,
  headerAction,
}: PageContainerProps) {
  return (
    <div className={cn("max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500", className)}>
      {(title || description || headerAction) && (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {title && (
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                {title}
              </h1>
            )}
            {description && (
              <p className="mt-2 text-lg text-muted-foreground">
                {description}
              </p>
            )}
          </div>
          {headerAction && (
            <div className="flex items-center gap-3">
              {headerAction}
            </div>
          )}
        </div>
      )}
      <div className="w-full">
        {children}
      </div>
    </div>
  );
}
