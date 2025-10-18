import LogoApp from "@/components/LogoApp";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Logo at top left */}
      <div className="absolute top-6 left-6">
        <LogoApp href="/s/hub" clickable={true} />
      </div>

      {children}
    </div>
  );
}
