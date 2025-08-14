"use client"

import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { DashboardSidebar } from "./DashboardSidebar"
import { DashboardHeader } from "./DashboardHeader"
import type { Business } from "@/lib/types"
import type { DashboardTab } from "../../types/dashboard"

interface DashboardLayoutProps {
  business: Business
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  onProfileClick: () => void
  onLogout: () => void
  children: React.ReactNode
}

export function DashboardLayout({
  business,
  activeTab,
  onTabChange,
  onProfileClick,
  onLogout,
  children
}: DashboardLayoutProps) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <DashboardSidebar
          business={business}
          activeTab={activeTab}
          onTabChange={onTabChange}
          onProfileClick={onProfileClick}
          onLogout={onLogout}
        />
        
        <SidebarInset className="flex-1">
          <DashboardHeader activeTab={activeTab} />
          
          <div className="p-6">
            {children}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}
