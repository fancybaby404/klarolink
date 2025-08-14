"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { StatsCardProps } from "../../types/dashboard"

export function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  iconColor, 
  bgColor, 
  borderColor 
}: StatsCardProps) {
  return (
    <Card className={`${bgColor} ${borderColor}`}>
      <CardContent className="p-6">
        <div className="flex items-center gap-4">
          <div className={`p-3 ${iconColor.replace('text-', 'bg-').replace('-600', '-100')} rounded-lg`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
          <div>
            <p className="text-sm text-gray-600">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
