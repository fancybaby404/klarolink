"use client"

import type React from "react"
import { DragDropContext, Droppable, Draggable, type DropResult } from "@hello-pangea/dnd"
import { GripVertical } from "lucide-react"
import { cn } from "@/lib/utils"

interface DragDropItem {
  id: string
  content: React.ReactNode
}

interface DragDropListProps {
  items: DragDropItem[]
  onReorder: (items: DragDropItem[]) => void
  className?: string
}

export function DragDropList({ items, onReorder, className }: DragDropListProps) {
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const newItems = Array.from(items)
    const [reorderedItem] = newItems.splice(result.source.index, 1)
    newItems.splice(result.destination.index, 0, reorderedItem)

    onReorder(newItems)
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="drag-drop-list">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef} className={cn("space-y-2", className)}>
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    className={cn(
                      "flex items-center gap-2 p-3 bg-white border rounded-lg shadow-sm",
                      snapshot.isDragging && "shadow-lg",
                    )}
                  >
                    <div
                      {...provided.dragHandleProps}
                      className="text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing"
                    >
                      <GripVertical className="h-4 w-4" />
                    </div>
                    <div className="flex-1">{item.content}</div>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
