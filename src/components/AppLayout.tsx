import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useIsMobile } from "@/hooks/use-mobile";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const isMobile = useIsMobile();

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="min-h-screen flex flex-row w-full">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {isMobile && (
            <header className="h-12 flex items-center border-b bg-card/80 glass sticky top-0 z-10 px-4">
              <SidebarTrigger className="btn-press" />
            </header>
          )}
          <main className="flex-1">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
