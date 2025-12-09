import TopNav from "@/components/TopNav";
import AppLayout from "@/components/AppLayout"; // Import the wrapper
import { authenticate } from "@/lib/auth";
import { redirect } from "next/navigation";
import { RepoProvider } from "@/lib/RepoContext";

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
      <RepoProvider>
        <TopNav user={auth.user} />
        
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden w-full">
          {/* UPDATED: Wrap children in AppLayout to manage Sidebar persistence */}
          <AppLayout>
            {children}
          </AppLayout>
        </main>
      </RepoProvider>
    </div>
  );
}