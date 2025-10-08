import UI_AdminSidebar from "@/components/admin-sidebar";

export default function Layout_Admin({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="">
          {/* Sidebar */}
          <UI_AdminSidebar />

          {/* Main content */}
          <main>{children}</main>
        </div>
      </div>
    </div>
  );
}
