import TopNav from "@/components/TopNav";
import { authenticate } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RepoProvider } from "@/lib/RepoContext"; // Import Provider

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await authenticate();

  if (!auth.ok || !auth.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      {/* Wrap everything in RepoProvider */}
      <RepoProvider>
        <TopNav user={auth.user} />
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden w-full">
          {children}
        </main>
      </RepoProvider>
    </div>
  );
}