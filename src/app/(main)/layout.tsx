import TopNav from "@/components/TopNav";
import AppLayout from "@/components/AppLayout"; 
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
      {/* Pass the user to the provider */}
      <RepoProvider user={auth.user}>
        <TopNav user={auth.user} />
        
        <main className="flex-1 flex flex-col min-h-0 overflow-hidden w-full">
          <AppLayout>
            {children}
          </AppLayout>
        </main>
      </RepoProvider>
    </div>
  );
}