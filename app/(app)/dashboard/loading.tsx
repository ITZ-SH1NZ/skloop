export default function DashboardLoading() {
    return (
        <div className="p-4 md:p-6 xl:p-8 space-y-4 animate-pulse">
            <div className="h-24 bg-gray-100 rounded-[1.5rem]" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="h-40 bg-gray-100 rounded-[1.5rem] md:col-span-2" />
                <div className="h-40 bg-gray-100 rounded-[1.5rem]" />
            </div>
            <div className="h-64 bg-gray-100 rounded-[1.5rem]" />
        </div>
    )
}
