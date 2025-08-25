export default function CountriesLoading() {
  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <div className="h-8 bg-gray-200 rounded animate-pulse mb-4"></div>
        <div className="h-6 bg-gray-200 rounded animate-pulse w-2/3"></div>
      </div>
      <div className="text-center p-8">
        <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
        <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2 mx-auto"></div>
      </div>
    </div>
  );
}
