"use client"

import { useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import {
  BarChart3,
  FileText,
  BarChart,
  UserCheck,
  User,
  LogOut
} from "lucide-react"
import type { Business } from "@/lib/types"
import type { DashboardTab } from "../../types/dashboard"

interface DashboardSidebarProps {
  business: Business
  activeTab: DashboardTab
  onTabChange: (tab: DashboardTab) => void
  onProfileClick: () => void
  onLogout: () => void
}

export function DashboardSidebar({
  business,
  activeTab,
  onTabChange,
  onProfileClick,
  onLogout
}: DashboardSidebarProps) {
  const router = useRouter()

  const menuItems = [
    {
      id: "overview" as DashboardTab,
      label: "Dashboard",
      icon: BarChart3
    },
    {
      id: "forms" as DashboardTab,
      label: "Forms",
      icon: FileText
    },
    {
      id: "insights" as DashboardTab,
      label: "Analytics",
      icon: BarChart
    },
    {
      id: "audience" as DashboardTab,
      label: "Audience",
      icon: UserCheck
    }
  ]

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-3 px-3 py-3">
          {business.profile_image ? (
            <img
              src={business.profile_image}
              alt={business.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-primary/20"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                {business.name.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <div className="flex-1 min-w-0">
            <button
              onClick={onProfileClick}
              className="text-left w-full hover:bg-shadow rounded-md p-2 -m-2 transition-colors group"
            >
              <h2 className="text-sm font-semibold text-header truncate group-hover:text-primary transition-colors">
                {business.name}
              </h2>
              <p className="text-xs text-subheader truncate">Click to edit profile</p>
            </button>
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent className="px-2">
        <SidebarMenu className="space-y-1">
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.id}>
              <SidebarMenuButton
                onClick={() => onTabChange(item.id)}
                isActive={activeTab === item.id}
                className={`w-full justify-start px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-header hover:bg-shadow hover:text-primary"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        {/* Logout Button at Bottom */}
        <div className="mt-auto p-2 border-t border-shadow">
          <SidebarMenuButton
            onClick={onLogout}
            className="w-full justify-start px-3 py-2.5 rounded-lg text-error hover:text-error hover:bg-error/10 transition-all duration-200"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium">Logout</span>
          </SidebarMenuButton>
        </div>
      </SidebarContent>
    </Sidebar>
  )
}
