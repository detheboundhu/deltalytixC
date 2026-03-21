import { DataProvider } from "@/context/data-provider";
import { TemplateProvider } from "@/context/template-provider";
import { TagsProvider } from "@/context/tags-provider";
import Modals from "@/components/modals";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ReactElement, Suspense } from "react";
import { AutoRefreshProvider } from "./components/auto-refresh-provider";
import { SidebarLayout } from "./components/sidebar-layout";
import { MobileBottomNav } from "@/components/ui/mobile-nav";
import { QuickAddFAB } from "@/components/quick-add-fab";
import { CommandPalette } from "@/components/command-palette";
import { GlobalTradeController } from "./components/global-trade-controller";

export default function RootLayout({ children }: { children: ReactElement }) {

  return (
    <TooltipProvider>
      <DataProvider>
        <TagsProvider>
          <TemplateProvider>
            {/* Data syncs via Supabase Realtime - no polling needed */}
            <AutoRefreshProvider>
              <div className="min-h-screen flex flex-col">
                <Suspense fallback={<div className="flex flex-1" />}>
                  <SidebarLayout>
                    {children}
                  </SidebarLayout>
                </Suspense>
                <Modals />
                <MobileBottomNav />
                <QuickAddFAB />
                <CommandPalette />
                <Suspense fallback={null}>
                  <GlobalTradeController />
                </Suspense>
              </div>
            </AutoRefreshProvider>
          </TemplateProvider>
        </TagsProvider>
      </DataProvider>
    </TooltipProvider>
  );
}