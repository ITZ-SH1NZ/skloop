export default function Loading() {
    return (
        <div className="p-4 md:p-6 xl:p-8 space-y-6 animate-pulse">
            {/* Page header skeleton */}
            <div className="space-y-3">
                <div className="h-9 w-48 bg-gray-100 rounded-2xl" />
                <div className="h-4 w-72 bg-gray-100 rounded-xl" />
            </div>
            {/* Card skeletons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                    <div key={i} className="h-36 bg-gray-100 rounded-3xl" />
                ))}
            </div>
        </div>
    );
}
