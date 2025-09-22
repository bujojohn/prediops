"use client";

import * as React from "react";
import { DollarSign, XCircle, AlertCircle, Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

export type ValueBetState =
  | "loading"
  | "value"
  | "no-value"
  | "unavailable"
  | "error";

export interface ValueBetIconProps {
  state: ValueBetState;
  className?: string;
  size?: "sm" | "md" | "lg";
  title?: string;
  showGlow?: boolean;
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

const buttonSizeClasses = {
  sm: "h-6 w-6 p-0",
  md: "h-7 w-7 p-0",
  lg: "h-8 w-8 p-0",
};

const stateClasses = {
  loading:
    "text-gray-400 animate-pulse bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700",
  value:
    "text-green-700 dark:text-green-300 bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 shadow-sm",
  "no-value":
    "text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 border-gray-300 dark:border-gray-600",
  unavailable:
    "text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/30 border-gray-200 dark:border-gray-700 opacity-60",
  error:
    "text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20 border-red-300 dark:border-red-700",
};

const glowClasses = {
  value:
    "drop-shadow-[0_0_4px_rgba(34,197,94,0.4)] dark:drop-shadow-[0_0_4px_rgba(34,197,94,0.6)]",
  "no-value": "",
  unavailable: "",
  error: "",
  loading: "",
};

const stateIcons = {
  loading: DollarSign,
  value: Zap,
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

function getValueBetTooltip(
  state: ValueBetState,
  valueBetData?: ValueBetIconProps["valueBetData"]
): string {
  if (state === "value" && valueBetData) {
    const { bestOdd, bookmaker, betName } = valueBetData;
    let tooltip = "Value Bet Available";

    if (betName) {
      tooltip += ` - ${betName}`;
    }

    if (bestOdd) {
      tooltip += ` (${bestOdd})`;
    }

    if (bookmaker) {
      tooltip += ` @ ${bookmaker}`;
    }

    return tooltip;
  }

  return stateTitles[state];
}

export function ValueBetIcon({
  state,
  className,
  size = "md",
  title,
  showGlow = false,
  valueBetData,
}: ValueBetIconProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const IconComponent = stateIcons[state];
  const tooltipContent = title || getValueBetTooltip(state, valueBetData);

  // Always render an icon to prevent layout shifts

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className={cn(
            "border rounded-md flex items-center justify-center font-medium transition-all duration-200 hover:scale-105 active:scale-95",
            buttonSizeClasses[size],
            stateClasses[state],
            showGlow && state === "value" && glowClasses.value,
            className
          )}
          aria-label={tooltipContent}
        >
          <IconComponent className={cn(sizeClasses[size])} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        className="max-w-xs text-center p-3 text-sm"
        align="center"
        sideOffset={8}
      >
        <div className="space-y-2">
          <div className="font-medium text-sm">{tooltipContent}</div>
          {valueBetData && state === "value" && valueBetData.count > 1 && (
            <div className="text-xs text-gray-600 dark:text-gray-400">
              {valueBetData.count} value bets available
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export default ValueBetIcon;
