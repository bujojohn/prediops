"use client";

import * as React from "react";
import { DollarSign } from "lucide-react";
import { cn } from "@/lib/utils";

export type ValueBetState = "loading" | "value" | "no-value" | "unavailable" | "error";

export interface ValueBetIconProps {
  state: ValueBetState;
  className?: string;
  size?: "sm" | "md" | "lg";
  title?: string;
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4", 
  lg: "h-5 w-5",
};

const stateClasses = {
  loading: "text-gray-400 animate-pulse",
  value: "text-yellow-500 dark:text-yellow-400",
  "no-value": "text-gray-600 dark:text-gray-300",
  unavailable: "text-gray-400 dark:text-gray-500",
  error: "text-red-500 dark:text-red-400",
};

const stateTitles = {
  loading: "Loading value bet data...",
  value: "Value bet available",
  "no-value": "Value bet data available (not a value bet)",
  unavailable: "No value bet data available",
  error: "Error loading value bet data",
};

export function ValueBetIcon({ 
  state, 
  className, 
  size = "md",
  title 
}: ValueBetIconProps) {
  const iconTitle = title || stateTitles[state];
  
  return (
    <DollarSign
      className={cn(
        sizeClasses[size],
        stateClasses[state],
        className
      )}
      title={iconTitle}
      aria-label={iconTitle}
    />
  );
}

export default ValueBetIcon;
