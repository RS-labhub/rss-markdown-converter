import type React from "react"
import { cn } from "@/lib/utils"

interface ShimmerProps {
  className?: string
  children?: React.ReactNode
}

export function Shimmer({ className, children }: ShimmerProps) {
  return (
    <div
      className={cn(
        "animate-pulse bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 dark:from-gray-700 dark:via-gray-600 dark:to-gray-700 bg-[length:200%_100%] animate-shimmer",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function ShimmerCard() {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Shimmer className="w-5 h-5 rounded" />
          <Shimmer className="w-24 h-5 rounded" />
        </div>
        <Shimmer className="w-full h-4 rounded" />
        <div className="flex gap-2">
          <Shimmer className="flex-1 h-10 rounded" />
          <Shimmer className="w-16 h-10 rounded" />
        </div>
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="border rounded-lg p-4">
              <Shimmer className="w-full h-16 rounded mb-3" />
              <Shimmer className="w-3/4 h-4 rounded mb-2" />
              <Shimmer className="w-1/2 h-4 rounded mb-2" />
              <div className="flex justify-between items-center">
                <Shimmer className="w-20 h-6 rounded" />
                <Shimmer className="w-16 h-4 rounded" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ShimmerText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <Shimmer key={i} className={cn("h-4 rounded", i === lines - 1 ? "w-3/4" : "w-full")} />
      ))}
    </div>
  )
}
