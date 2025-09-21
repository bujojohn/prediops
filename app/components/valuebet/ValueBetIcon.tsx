"use client";

import * as React from "react";
import { DollarSign, TrendingUp, XCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

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
    betName?: string;
  };
}

const sizeClasses = {
  sm: "h-3 w-3",
  md: "h-4 w-4", 
  lg: "h-5 w-5",
};

const pillSizeClasses = {
  sm: "h-5 px-2 text-xs",
  md: "h-6 px-2 text-xs", 
  lg: "h-7 px-3 text-sm",
};

const stateClasses = {
  loading: "text-gray-400 animate-pulse",
  value: "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800",
  "no-value": "text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
  unavailable: "text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800/50 border-gray-200 dark:border-gray-700",
  error: "text-red-700 dark:text-red-300 bg-red-100 dark:bg-red-900/20 border-red-200 dark:border-red-800",
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

const pillLabels = {
  loading: "Loading...",
  value: "Value",
  "no-value": "No Value",
  unavailable: "N/A",
  error: "Error",
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
    const { count, bestOdd, fairOdd, bookmaker, betName } = valueBetData;
    let tooltip = explanation;
    
    if (count > 0) {
      tooltip += `\n\n📊 ${count} value bet${count > 1 ? 's' : ''} available`;
    }
    
    if (betName) {
      tooltip += `\n🎯 Bet: ${betName}`;
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
  const [isOpen, setIsOpen] = React.useState(false);
  const IconComponent = stateIcons[state];
  const tooltipContent = title || getValueBetTooltip(state, valueBetData, showExplanations);
  const pillLabel = pillLabels[state];
  
  // Don't render anything for unavailable state to keep it minimal
  if (state === "unavailable") {
    return null;
  }
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "border rounded-full flex items-center gap-1 font-medium transition-all duration-200",
            pillSizeClasses[size],
            stateClasses[state],
            showGlow && state === "value" && glowClasses.value,
            className
          )}
          aria-label={tooltipContent}
        >
          <IconComponent className={cn(sizeClasses[size])} />
          <span>{pillLabel}</span>
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="top" 
        className="max-w-xs whitespace-pre-line text-center p-3"
        align="center"
      >
        <div className="space-y-2">
          <div className="font-medium text-sm">
            {tooltipContent.split('\n')[0]}
          </div>
          {valueBetData && state === "value" && (
            <div className="space-y-1 text-xs">
              {valueBetData.count > 0 && (
                <div className="flex items-center justify-center gap-1">
                  <Badge variant="secondary" className="text-xs">
                    {valueBetData.count} value bet{valueBetData.count > 1 ? 's' : ''}
                  </Badge>
                </div>
              )}
              {valueBetData.betName && (
                <div className="text-gray-600 dark:text-gray-400">
                  🎯 {valueBetData.betName}
                </div>
              )}
              {valueBetData.bestOdd && valueBetData.fairOdd && (
                <div className="text-gray-600 dark:text-gray-400">
                  💰 Best: {valueBetData.bestOdd} | Fair: {valueBetData.fairOdd}
                </div>
              )}
              {valueBetData.bookmaker && (
                <div className="text-gray-600 dark:text-gray-400">
                  🏦 {valueBetData.bookmaker}
                </div>
              )}
            </div>
          )}
          {tooltipContent.includes('\n') && (
            <div className="text-xs text-gray-600 dark:text-gray-400 pt-1 border-t">
              {tooltipContent.split('\n').slice(1).join('\n')}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ValueBetIcon;
