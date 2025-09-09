"use client";

import * as React from "react";
import { DollarSign, TrendingUp, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

export type ValueBetState = "loading" | "value" | "no-value" | "unavailable" | "error";

export interface ValueBetIconProps {
  state: ValueBetState;
  className?: string;
  size?: "sm" | "md" | "lg";
  title?: string;
  showGlow?: boolean;
  showExplanations?: boolean;
  valueBetData?: {
    count: number;
    bestOdd?: number;
    fairOdd?: number;
    bookmaker?: string;
  };
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4", 
  lg: "h-5 w-5",
};

const stateClasses = {
  loading: "text-gray-400 animate-pulse",
  value: "text-green-500 dark:text-green-400",
  "no-value": "text-gray-600 dark:text-gray-300",
  unavailable: "text-gray-400 dark:text-gray-500",
  error: "text-red-500 dark:text-red-400",
};

const glowClasses = {
  value: "drop-shadow-[0_0_4px_rgba(34,197,94,0.4)] dark:drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]",
  "no-value": "",
  unavailable: "",
  error: "",
  loading: "",
};

const stateIcons = {
  loading: DollarSign,
  value: TrendingUp,
  "no-value": DollarSign,
  unavailable: XCircle,
  error: AlertCircle,
};

const stateTitles = {
  loading: "Loading value bet data...",
  value: "Value bet available",
  "no-value": "Value bet data available (not a value bet)",
  unavailable: "No value bet data available",
  error: "Error loading value bet data",
};

const stateExplanations = {
  loading: "⏳ Loading value bet analysis...",
  value: "🟢 Value Bet: Favorable odds detected - profitable betting opportunity",
  "no-value": "⚪ No Value: Data available but odds are not favorable for betting",
  unavailable: "⚫ No Data: Value bet analysis not available for this fixture",
  error: "🔴 Error: Failed to load value bet data",
};

function getValueBetTooltip(
  state: ValueBetState, 
  valueBetData?: ValueBetIconProps['valueBetData'],
  showExplanations?: boolean
): string {
  const explanation = showExplanations ? stateExplanations[state] : stateTitles[state];
  
  if (state === "value" && valueBetData) {
    const { count, bestOdd, fairOdd, bookmaker } = valueBetData;
    let tooltip = explanation;
    
    if (count > 0) {
      tooltip += `\n\n📊 ${count} value bet${count > 1 ? 's' : ''} available`;
    }
    
    if (bestOdd && fairOdd) {
      tooltip += `\n💰 Best odds: ${bestOdd} (Fair: ${fairOdd})`;
    }
    
    if (bookmaker) {
      tooltip += `\n🏦 Bookmaker: ${bookmaker}`;
    }
    
    return tooltip;
  }
  
  return explanation;
}

export function ValueBetIcon({ 
  state, 
  className, 
  size = "md",
  title,
  showGlow = false,
  showExplanations = false,
  valueBetData
}: ValueBetIconProps) {
  const IconComponent = stateIcons[state];
  const iconTitle = title || getValueBetTooltip(state, valueBetData, showExplanations);
  
  return (
    <IconComponent
      className={cn(
        sizeClasses[size],
        stateClasses[state],
        showGlow && state === "value" && glowClasses.value,
        className
      )}
      title={iconTitle}
      aria-label={iconTitle}
    />
  );
}

export default ValueBetIcon;
