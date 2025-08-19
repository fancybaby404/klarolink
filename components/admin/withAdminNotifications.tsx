'use client'

import React from 'react'
import { usePathname } from 'next/navigation'
import { NotificationBell } from './NotificationBell'

// Higher-order component to add notification bell to admin pages
export function withAdminNotifications<P extends object>(
  WrappedComponent: React.ComponentType<P>
) {
  const WithAdminNotificationsComponent = (props: P) => {
    const pathname = usePathname()
    
    // Check if current path is an admin page
    const isAdminPage = pathname?.startsWith('/admin')
    
    if (!isAdminPage) {
      return <WrappedComponent {...props} />
    }

    return (
      <div className="relative">
        {/* Notification Bell - Fixed Position */}
        <div className="fixed top-4 right-4 z-50">
          <NotificationBell userId="admin" />
        </div>
        
        {/* Original Component */}
        <WrappedComponent {...props} />
      </div>
    )
  }

  WithAdminNotificationsComponent.displayName = `withAdminNotifications(${
    WrappedComponent.displayName || WrappedComponent.name || 'Component'
  })`

  return WithAdminNotificationsComponent
}

// Hook to check if current page is admin page
export function useIsAdminPage() {
  const pathname = usePathname()
  return pathname?.startsWith('/admin') || false
}

// Component to conditionally render notification bell
export function ConditionalNotificationBell({ 
  userId = 'admin',
  className = ''
}: { 
  userId?: string
  className?: string 
}) {
  const isAdminPage = useIsAdminPage()
  
  if (!isAdminPage) {
    return null
  }

  return (
    <div className={className}>
      <NotificationBell userId={userId} />
    </div>
  )
}
