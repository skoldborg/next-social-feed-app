export const PostListSkeleton = () => {
  return (
    <div data-testid="post-list-skeleton">
      {Array.from({ length: 10 }).map((_, index) => (
        <div
          className="rounded-lg border border-gray-200 bg-gray-200 text-zinc-800 shadow-sm mb-2 transition-transform"
          key={index}
        >
          <div className="flex items-center gap-4 px-4 py-3">
            <div className="self-start shrink-0 w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center overflow-hidden" />
            <div className="flex flex-col gap-y-1 justify-center w-full">
              <div className="w-1/2 h-4 bg-gray-300 rounded" />
              <div className="w-full h-4 bg-gray-300 rounded" />
              <div className="w-full h-4 bg-gray-300 rounded" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
