export default function UsersHeader() {
  return (
    <div className="relative rounded-lg overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 opacity-90 blur-lg transform -skew-y-1 scale-105"></div>
      <div className="relative px-6 py-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Users Management
            </h1>
            <p className="mt-1 text-sm opacity-90">
              Manage jobseekers and company admins
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
