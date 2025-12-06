import TopNav from "@/components/TopNav";
import FolderSidebar from "@/components/FolderSidebar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <TopNav />
      <div className="mx-auto w-full max-w-screen-2xl flex-1 flex min-h-0">
        <FolderSidebar />
        <main className="flex-1 min-w-0 overflow-y-auto flex flex-col">
          {children}
        </main>
      </div>
    </div>
  );
}