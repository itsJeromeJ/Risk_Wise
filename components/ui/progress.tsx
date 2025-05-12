"use client"

import * as React from "react"
import * as ProgressPrimitive from "@radix-ui/react-progress"
import { cn } from "@/lib/utils"

interface ProgressProps extends React.ComponentPropsWithoutRef<typeof ProgressPrimitive.Root> {
  value?: number
  extraStyles?: string
}

const Progress = React.forwardRef<
  React.ElementRef<typeof ProgressPrimitive.Root>,
  ProgressProps
>(({ className, value = 0, extraStyles = "", ...props }, ref) => {
  return (
    <ProgressPrimitive.Root
      ref={ref}
      data-slot="progress"
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className
      )}
      {...props}
    >
      <ProgressPrimitive.Indicator
        data-slot="progress-indicator"
        className={`h-full w-full flex-1 transition-all ${extraStyles}`}
        style={{ 
          transform: `translateX(-${100 - (value || 0)}%)`,
          backgroundColor: 'currentColor'
        }}
      />
    </ProgressPrimitive.Root>
  );
});

Progress.displayName = "Progress";

export { Progress };
export default Progress; 