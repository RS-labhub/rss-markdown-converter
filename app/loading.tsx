export default function Loading() {
  return (
    <div className="app-shell min-h-screen">
      {/* Header skeleton */}
      <div className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 pb-10 sm:px-6">
        {/* Hero Shimmer */}
        <div className="mb-8 mt-8 text-center">
          <div className="mx-auto mb-3 h-6 w-40 animate-pulse rounded-full bg-muted" />
          <div className="mx-auto mb-3 h-9 w-2/3 animate-pulse rounded bg-muted" />
          <div className="mx-auto h-5 w-1/2 animate-pulse rounded bg-muted" />
        </div>

        <div className="mb-6 h-11 w-full max-w-md animate-pulse rounded-full bg-muted" />

        <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
          {/* Left Sidebar Shimmer */}
          <div className="xl:col-span-1">
            <div className="rounded-lg border border-border/60 bg-card p-6 animate-pulse">
              {/* Header */}
              <div className="mb-2 h-4 w-12 rounded bg-muted" />
              <div className="mb-4 h-5 w-24 rounded bg-muted" />

              {/* Input */}
              <div className="mb-4 flex gap-2">
                <div className="h-10 flex-1 rounded bg-muted" />
                <div className="h-10 w-16 rounded bg-muted" />
              </div>

              {/* Articles List */}
              <div className="space-y-2">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="rounded-lg border border-border/60 p-3">
                    <div className="mb-2 h-4 w-3/4 rounded bg-muted" />
                    <div className="mb-2 h-3 w-1/2 rounded bg-muted" />
                    <div className="flex items-center justify-between">
                      <div className="h-3 w-16 rounded bg-muted" />
                      <div className="h-3 w-12 rounded bg-muted" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Shimmer */}
          <div className="xl:col-span-3">
            <div className="rounded-lg border border-border/60 bg-card p-6 animate-pulse">
              <div className="mb-6 flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-4 w-12 rounded bg-muted" />
                  <div className="h-5 w-32 rounded bg-muted" />
                </div>
                <div className="h-6 w-24 rounded bg-muted" />
              </div>

              <div className="mb-6 flex gap-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-10 w-24 rounded bg-muted" />
                ))}
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="h-7 w-1/2 rounded bg-muted" />
                  <div className="h-8 w-32 rounded bg-muted" />
                </div>
                <div className="h-96 w-full rounded bg-muted" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
