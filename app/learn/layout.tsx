import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { MobileNav } from "@/components/layout/MobileNav";

export default async function LearnLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (session) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:ml-64">
          <Header user={session.user} />
          <main className="p-4 md:p-6 pb-24 lg:pb-8">{children}</main>
        </div>
        <MobileNav />
      </div>
    );
  }

  return <div className="min-h-screen bg-background">{children}</div>;
}
