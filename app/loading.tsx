export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Header Shimmer */}
        <div className="mb-8 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse" />
            <div className="w-96 h-10 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </div>
          <div className="w-2/3 h-6 bg-gray-200 dark:bg-gray-700 rounded mx-auto animate-pulse" />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Sidebar Shimmer */}
          <div className="xl:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
              {/* Header */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-20 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
              <div className="w-full h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4" />

              {/* Input */}
              <div className="flex gap-2 mb-4">
                <div className="flex-1 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                <div className="w-16 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>

              {/* Articles List */}
              <div className="space-y-3">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="w-full h-16 bg-gray-200 dark:bg-gray-700 rounded mb-3" />
                    <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="w-1/2 h-4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                    <div className="flex justify-between items-center">
                      <div className="w-20 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                      <div className="w-16 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main Content Shimmer */}
          <div className="xl:col-span-3">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 animate-pulse">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="w-32 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="w-24 h-6 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="w-24 h-10 bg-gray-200 dark:bg-gray-700 rounded" />
                ))}
              </div>

              {/* Content Area */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="w-1/2 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                  <div className="w-32 h-8 bg-gray-200 dark:bg-gray-700 rounded" />
                </div>
                <div className="w-full h-96 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
