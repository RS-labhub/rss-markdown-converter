"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw, Settings } from 'lucide-react'

interface ErrorStateProps {
  title: string
  description: string
  onRetry?: () => void
  onConfigure?: () => void
  showConfigure?: boolean
}

export function ErrorState({ 
  title, 
  description, 
  onRetry, 
  onConfigure, 
  showConfigure = false 
}: ErrorStateProps) {
  return (
    <Card className="border-destructive/20 bg-destructive/5">
      <CardContent className="p-6 text-center">
        <div className="flex flex-col items-center space-y-4">
          <div className="p-3 bg-destructive/10 rounded-full">
            <AlertTriangle className="w-8 h-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-medium text-destructive">{title}</h3>
            <p className="text-sm text-muted-foreground max-w-md">{description}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            {onRetry && (
              <Button variant="outline" onClick={onRetry} className="flex items-center gap-2">
                <RefreshCw className="w-4 h-4" />
                Try Again
              </Button>
            )}
            {showConfigure && onConfigure && (
              <Button variant="default" onClick={onConfigure} className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Configure API Keys
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
