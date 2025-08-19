'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, X } from 'lucide-react'
import { format } from 'date-fns'
import type { 
  NotificationFilters as FilterType, 
  NotificationPriority, 
  NotificationStatus 
} from '@/lib/types/notifications'

interface NotificationFiltersProps {
  onFilterChange: (filters: FilterType) => void
  initialFilters?: FilterType
}

export function NotificationFilters({ 
  onFilterChange, 
  initialFilters = {} 
}: NotificationFiltersProps) {
  const [filters, setFilters] = useState<FilterType>({
    category: 'Business Intelligence and Analytics',
    is_archived: false,
    ...initialFilters
  })

  const [dateFrom, setDateFrom] = useState<Date | undefined>(
    filters.date_from ? new Date(filters.date_from) : undefined
  )
  const [dateTo, setDateTo] = useState<Date | undefined>(
    filters.date_to ? new Date(filters.date_to) : undefined
  )

  const priorities: NotificationPriority[] = ['low', 'medium', 'high', 'critical']
  const statuses: NotificationStatus[] = ['pending', 'in_progress', 'completed', 'failed', 'cancelled']

  const handleFilterUpdate = (key: keyof FilterType, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFilterChange(newFilters)
  }

  const handlePriorityChange = (priority: NotificationPriority, checked: boolean) => {
    const currentPriorities = filters.priority || []
    const newPriorities = checked
      ? [...currentPriorities, priority]
      : currentPriorities.filter(p => p !== priority)
    
    handleFilterUpdate('priority', newPriorities.length > 0 ? newPriorities : undefined)
  }

  const handleStatusChange = (status: NotificationStatus, checked: boolean) => {
    const currentStatuses = filters.status || []
    const newStatuses = checked
      ? [...currentStatuses, status]
      : currentStatuses.filter(s => s !== status)
    
    handleFilterUpdate('status', newStatuses.length > 0 ? newStatuses : undefined)
  }

  const handleDateFromChange = (date: Date | undefined) => {
    setDateFrom(date)
    handleFilterUpdate('date_from', date ? date.toISOString() : undefined)
  }

  const handleDateToChange = (date: Date | undefined) => {
    setDateTo(date)
    handleFilterUpdate('date_to', date ? date.toISOString() : undefined)
  }

  const clearFilters = () => {
    const clearedFilters: FilterType = {
      category: 'Business Intelligence and Analytics',
      is_archived: false
    }
    setFilters(clearedFilters)
    setDateFrom(undefined)
    setDateTo(undefined)
    onFilterChange(clearedFilters)
  }

  const hasActiveFilters = () => {
    return !!(
      filters.status?.length ||
      filters.priority?.length ||
      filters.is_read !== undefined ||
      filters.business_id ||
      filters.assigned_to ||
      filters.date_from ||
      filters.date_to
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category">Category</Label>
          <Select
            value={filters.category || ''}
            onValueChange={(value) => handleFilterUpdate('category', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Business Intelligence and Analytics">
                Business Intelligence and Analytics
              </SelectItem>
              <SelectItem value="System">System</SelectItem>
              <SelectItem value="User Management">User Management</SelectItem>
              <SelectItem value="Data Processing">Data Processing</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Read Status */}
        <div className="space-y-2">
          <Label htmlFor="read-status">Read Status</Label>
          <Select
            value={filters.is_read === undefined ? 'all' : filters.is_read ? 'read' : 'unread'}
            onValueChange={(value) => 
              handleFilterUpdate('is_read', value === 'all' ? undefined : value === 'read')
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="All" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Business ID */}
        <div className="space-y-2">
          <Label htmlFor="business-id">Business ID</Label>
          <Input
            id="business-id"
            type="number"
            placeholder="Enter business ID"
            value={filters.business_id || ''}
            onChange={(e) => 
              handleFilterUpdate('business_id', e.target.value ? parseInt(e.target.value) : undefined)
            }
          />
        </div>

        {/* Assigned To */}
        <div className="space-y-2">
          <Label htmlFor="assigned-to">Assigned To</Label>
          <Input
            id="assigned-to"
            placeholder="Enter assignee"
            value={filters.assigned_to || ''}
            onChange={(e) => handleFilterUpdate('assigned_to', e.target.value || undefined)}
          />
        </div>

        {/* Date From */}
        <div className="space-y-2">
          <Label>Date From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFrom ? format(dateFrom, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateFrom}
                onSelect={handleDateFromChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Date To */}
        <div className="space-y-2">
          <Label>Date To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateTo ? format(dateTo, 'PPP') : 'Pick a date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0">
              <Calendar
                mode="single"
                selected={dateTo}
                onSelect={handleDateToChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Priority Filters */}
      <div className="space-y-2">
        <Label>Priority</Label>
        <div className="flex flex-wrap gap-4">
          {priorities.map((priority) => (
            <div key={priority} className="flex items-center space-x-2">
              <Checkbox
                id={`priority-${priority}`}
                checked={filters.priority?.includes(priority) || false}
                onCheckedChange={(checked) => 
                  handlePriorityChange(priority, checked as boolean)
                }
              />
              <Label 
                htmlFor={`priority-${priority}`}
                className="capitalize cursor-pointer"
              >
                {priority}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Status Filters */}
      <div className="space-y-2">
        <Label>Status</Label>
        <div className="flex flex-wrap gap-4">
          {statuses.map((status) => (
            <div key={status} className="flex items-center space-x-2">
              <Checkbox
                id={`status-${status}`}
                checked={filters.status?.includes(status) || false}
                onCheckedChange={(checked) => 
                  handleStatusChange(status, checked as boolean)
                }
              />
              <Label 
                htmlFor={`status-${status}`}
                className="capitalize cursor-pointer"
              >
                {status.replace('_', ' ')}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      {hasActiveFilters() && (
        <div className="flex justify-end">
          <Button
            variant="outline"
            size="sm"
            onClick={clearFilters}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
