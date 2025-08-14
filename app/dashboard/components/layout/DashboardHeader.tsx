"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import type { DashboardTab } from "../../types/dashboard"

interface DashboardHeaderProps {
  activeTab: DashboardTab
}

const tabTitles: Record<DashboardTab, string> = {
  overview: "Dashboard",
  forms: "Forms Management",
  insights: "Analytics",
  audience: "Audience Management"
}

export function DashboardHeader({ activeTab }: DashboardHeaderProps) {
  return (
    <header className="bg-white border-b border-shadow sticky top-0 z-10">
      <div className="flex items-center gap-4 px-6 py-4">
        <SidebarTrigger className="text-header hover:bg-shadow" />
        <h1 className="text-xl font-semibold text-header">
          {tabTitles[activeTab]}
        </h1>
      </div>
    </header>
  )
}
