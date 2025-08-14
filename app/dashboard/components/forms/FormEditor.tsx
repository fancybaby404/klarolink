"use client"

import { useState, useEffect, memo } from "react"
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Edit, Save, X, Plus, GripVertical, Trash2 } from "lucide-react"
import type { FormBuilderField } from "../../types/dashboard"

interface FormEditorProps {
  initialTitle: string
  initialDescription: string
  initialFields: FormBuilderField[]
  onSave: (data: { title: string; description: string; fields: FormBuilderField[] }) => void
  onCancel: () => void
  isSaving: boolean
  onEditField: (index: number, field: FormBuilderField) => void
}

export const FormEditor = memo(function FormEditor({
  initialTitle,
  initialDescription,
  initialFields,
  onSave,
  onCancel,
  isSaving,
  onEditField,
}: FormEditorProps) {
  const [localTitle, setLocalTitle] = useState(initialTitle)
  const [localDescription, setLocalDescription] = useState(initialDescription)
  const [localFields, setLocalFields] = useState<FormBuilderField[]>(initialFields)

  // Only update local state when initial values change (new edit session)
  useEffect(() => {
    setLocalTitle(initialTitle)
    setLocalDescription(initialDescription)
    setLocalFields(initialFields)
  }, [initialTitle, initialDescription, initialFields])

  const handleSave = () => {
    onSave({
      title: localTitle,
      description: localDescription,
      fields: localFields,
    })
  }

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) {
      return
    }

    const items = Array.from(localFields)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setLocalFields(items)
  }



  const handleAddField = () => {
    const newField: FormBuilderField = {
      id: `field_${Date.now()}`,
      type: 'text',
      label: 'New Field',
      required: false,
      placeholder: ''
    }
    setLocalFields([...localFields, newField])
  }

  const handleDeleteField = (index: number) => {
    const newFields = localFields.filter((_, i) => i !== index)
    setLocalFields(newFields)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Edit Form</CardTitle>
            <CardDescription>Customize your feedback form</CardDescription>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onCancel}
          >
            <X className="h-4 w-4 mr-2" />
            Close Editor
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="form-title">Form Header</Label>
            <Input
              id="form-title"
              value={localTitle}
              onChange={(e) => setLocalTitle(e.target.value)}
              placeholder="Share Your Experience"
            />
          </div>
          <div>
            <Label htmlFor="form-description">Form Subtext</Label>
            <Input
              id="form-description"
              value={localDescription}
              onChange={(e) => setLocalDescription(e.target.value)}
              placeholder="Your feedback helps us improve our service"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium">Form Fields</h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddField}
              className="gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Field
            </Button>
          </div>
          
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="form-fields">
              {(provided) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className="space-y-3"
                >
                  {localFields.map((field, index) => (
                    <Draggable key={field.id} draggableId={field.id} index={index}>
                      {(provided, snapshot) => (
                        <Card
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`p-4 ${snapshot.isDragging ? 'shadow-lg' : ''}`}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 flex-1">
                              <div
                                {...provided.dragHandleProps}
                                className="cursor-grab active:cursor-grabbing"
                              >
                                <GripVertical className="h-4 w-4 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {field.label}
                                  </span>
                                  {field.required && (
                                    <span className="text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">
                                      Required
                                    </span>
                                  )}
                                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full capitalize">
                                    {field.type}
                                  </span>
                                </div>
                                {field.placeholder && (
                                  <p className="text-xs text-gray-500">
                                    Placeholder: {field.placeholder}
                                  </p>
                                )}
                                {field.options && field.options.length > 0 && (
                                  <div className="text-xs text-gray-500">
                                    <p className="mb-1">Options:</p>
                                    <div className="pl-2 space-y-0.5">
                                      {field.options.slice(0, 3).map((option, idx) => (
                                        <div key={idx}>• {option}</div>
                                      ))}
                                      {field.options.length > 3 && (
                                        <div className="text-gray-400">• (+{field.options.length - 3} more options)</div>
                                      )}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditField(index, field)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteField(index)}
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </Card>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>

          {localFields.length === 0 && (
            <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500 mb-4">No fields added yet</p>
              <Button
                type="button"
                variant="outline"
                onClick={handleAddField}
                className="gap-2"
              >
                <Plus className="h-4 w-4" />
                Add Your First Field
              </Button>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 pt-4 border-t">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="gap-2"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save Form
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})
