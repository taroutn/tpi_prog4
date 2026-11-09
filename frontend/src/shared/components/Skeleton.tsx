interface SkeletonProps {
  count?: number;
  className?: string;
}

export const Skeleton = ({ count = 6, className = 'h-64' }: SkeletonProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`animate-pulse bg-stone-200 rounded-xl border border-stone-200/60 ${className}`}
        />
      ))}
    </div>
  );
};