import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileNav } from "@/components/layout/MobileNav";
import { ReviewPageClient } from "@/components/learn/ReviewPageClient";

export default async function ReviewPage() {
  const session = await getServerSession(authOptions);
  const isLoggedIn = !!session;

  if (isLoggedIn) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <div className="lg:ml-64">
          <main className="p-4 md:p-6 pb-24 lg:pb-8">
            <ReviewPageClient isLoggedIn={true} />
          </main>
        </div>
        <MobileNav />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <ReviewPageClient isLoggedIn={false} />
    </div>
  );
}
