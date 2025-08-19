"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

// Components
import { DashboardLayout } from "./components/layout/DashboardLayout"
import { OverviewTab } from "./components/overview/OverviewTab"
import { FormBuilder } from "./components/forms/FormBuilder"
import { ProductsTab } from "./components/products/ProductsTab"
import { InsightsTab } from "./components/insights/InsightsTab"
import { AudienceTab } from "./components/audience/AudienceTab"
import { ProfileModal } from "./components/profile/ProfileModal"

// Hooks and Types
import { useDashboardData } from "./hooks/useDashboardData"
import type { DashboardTab } from "./types/dashboard"

export default function DashboardPage() {
  const router = useRouter()
  const { data, loading, error, refreshData, setData } = useDashboardData()
  const [activeTab, setActiveTab] = useState<DashboardTab>("overview")
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)

  const handleLogout = () => {
    localStorage.removeItem("token")
    toast.success("Logged out successfully")
    router.push("/login")
  }

  const handlePreviewClick = () => {
    if (data?.business.slug) {
      window.open(`/${data.business.slug}`, '_blank')
    }
  }

  const handleDataUpdate = (newData: typeof data) => {
    if (newData) {
      setData(newData)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Loading Dashboard</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Data Available</h1>
          <p className="text-gray-600 mb-4">Unable to load dashboard data</p>
          <button
            onClick={refreshData}
            className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90"
          >
            Refresh
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <DashboardLayout
        business={data.business}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onLogout={handleLogout}
      >
      {activeTab === "overview" && (
        <OverviewTab
          data={data}
          onTabChange={setActiveTab}
          onPreviewClick={handlePreviewClick}
        />
      )}

      {activeTab === "forms" && (
        <FormBuilder
          data={data}
          onDataUpdate={handleDataUpdate}
        />
      )}

      {activeTab === "products" && (
        <ProductsTab
          data={data}
          onDataUpdate={refreshData}
        />
      )}

      {activeTab === "insights" && (
        <InsightsTab data={data} />
      )}

      {activeTab === "audience" && (
        <AudienceTab />
      )}
    </DashboardLayout>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        data={data}
        onDataUpdate={handleDataUpdate}
      />
    </>
  )
}
