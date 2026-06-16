// Skeleton loader for food cards
const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="w-full h-44 bg-gray-200 dark:bg-gray-700" />
    <div className="p-4 space-y-3">
      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-3/4" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full w-1/2" />
      <div className="flex items-center justify-between mt-2">
        <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded-full w-16" />
        <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-xl w-20" />
      </div>
    </div>
  </div>
);

export default SkeletonCard;
