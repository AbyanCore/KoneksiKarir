export default function CompaniesHeader({
  onAddCompany,
}: {
  onAddCompany: () => void;
}) {
  return (
    <div className="relative rounded-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 opacity-90 blur-lg transform -skew-y-1 scale-105"></div>
      <div className="relative px-4 py-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight">
              Companies Management
            </h1>
            <p className="mt-0.5 text-xs opacity-90">
              Manage company registrations and profiles
            </p>
          </div>
          <button
            onClick={onAddCompany}
            className="bg-white/20 hover:bg-white/30 text-white border-white/30 px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 4v16m8-8H4"
              />
            </svg>
            Add Company
          </button>
        </div>
      </div>
    </div>
  );
}
