import React from "react"
import * as TabsPrimitives from "@radix-ui/react-tabs"
import { cn } from "@/lib/utils"

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitives.Root>
>(({ className, ...props }, ref) => (
  <TabsPrimitives.Root
    ref={ref}
    className={cn("w-full", className)}
    {...props}
  />
))
Tabs.displayName = TabsPrimitives.Root.displayName

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitives.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitives.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitives.List
    ref={ref}
    className={cn(
      "inline-flex items-center justify-center border-b border-gray-200",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitives.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitives.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitives.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitives.Trigger
    ref={ref}
    className={cn(
      "-mb-px inline-flex items-center justify-center whitespace-nowrap border-b-2 border-transparent px-4 py-2 text-sm font-medium text-gray-500 transition-all hover:text-gray-700",
      "focus:outline-none disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:border-blue-500 data-[state=active]:text-blue-500",
      className
    )}
    {...props}
  />
))
TabsTrigger.displayName = TabsPrimitives.Trigger.displayName

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitives.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitives.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitives.Content
    ref={ref}
    className={cn("mt-4 focus:outline-none", className)}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitives.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent } 