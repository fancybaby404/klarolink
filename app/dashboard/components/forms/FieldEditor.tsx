"use client"

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import type { FormBuilderField } from "../../types/dashboard"

interface FieldEditorProps {
  isOpen: boolean
  onClose: () => void
  field: FormBuilderField | null
  isEditing: boolean
  onFieldChange: (field: FormBuilderField) => void
  onSave: () => void
  onFieldTypeChange: (type: "text" | "email" | "textarea" | "rating" | "select" | "checkbox") => void
}

export function FieldEditor({
  isOpen,
  onClose,
  field,
  isEditing,
  onFieldChange,
  onSave,
  onFieldTypeChange
}: FieldEditorProps) {
  if (!field) return null

  const handleClose = () => {
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent forceMount className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit Field' : 'Add New Field'}
          </DialogTitle>
          <DialogDescription>
            Configure the field properties below.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="field-type">Field Type</Label>
              <Select
                value={field.type}
                onValueChange={onFieldTypeChange}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="text">Text</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                  <SelectItem value="textarea">Textarea</SelectItem>
                  <SelectItem value="rating">Rating</SelectItem>
                  <SelectItem value="select">Select</SelectItem>
                  <SelectItem value="checkbox">Checkbox</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="field-required"
                checked={field.required}
                onCheckedChange={(checked) => {
                  onFieldChange({ ...field, required: checked })
                }}
              />
              <Label htmlFor="field-required">Required</Label>
            </div>
          </div>

          <div>
            <Label htmlFor="field-label">Field Label</Label>
            <Input
              id="field-label"
              value={field.label}
              onChange={(e) => {
                e.stopPropagation()
                onFieldChange({ ...field, label: e.target.value })
              }}
              placeholder="Enter field label"
            />
          </div>

          {field.type === 'checkbox' ? (
            <div>
              <Label htmlFor="checkbox-options">Checkbox Options (one per line)</Label>
              <Textarea
                id="checkbox-options"
                value={field.options?.join('\n') || ''}
                onChange={(e) => {
                  e.stopPropagation()
                  const lines = e.target.value.split('\n')
                  onFieldChange({
                    ...field,
                    options: lines
                  })
                }}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                rows={4}
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Each line will become a separate checkbox option. Empty lines will be ignored when saving.
              </p>
            </div>
          ) : field.type !== 'rating' ? (
            <div>
              <Label htmlFor="field-placeholder">Placeholder (Optional)</Label>
              <Input
                id="field-placeholder"
                value={field.placeholder || ''}
                onChange={(e) => {
                  e.stopPropagation()
                  onFieldChange({ ...field, placeholder: e.target.value })
                }}
                placeholder="Enter placeholder text"
              />
            </div>
          ) : null}

          {field.type === 'select' && (
            <div>
              <Label htmlFor="field-options">Select Options (one per line)</Label>
              <Textarea
                id="field-options"
                value={field.options?.join('\n') || ''}
                onChange={(e) => {
                  e.stopPropagation()
                  const lines = e.target.value.split('\n')
                  onFieldChange({
                    ...field,
                    options: lines
                  })
                }}
                placeholder="Option 1&#10;Option 2&#10;Option 3"
                rows={4}
                className="font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">
                Each line will become a separate select option. Empty lines will be ignored when saving.
              </p>
            </div>
          )}

          {field.type === 'checkbox' && (
            <div>
              <Label>Preview</Label>
              <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 space-y-3">
                <div className="font-medium text-sm text-gray-900">
                  {field.label || "Question Label"}
                  {field.required && <span className="text-red-500 ml-1">*</span>}
                </div>
                <div className="space-y-2">
                  {(field.options && field.options.length > 0) ? (
                    field.options.map((option, index) => (
                      <div key={index} className="flex items-start space-x-3">
                        <input
                          type="checkbox"
                          disabled
                          className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
                        />
                        <span className="text-sm text-gray-700 flex-1 leading-5">
                          {option}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        disabled
                        className="mt-0.5 h-4 w-4 rounded border-gray-300 text-blue-600"
                      />
                      <span className="text-sm text-gray-500 flex-1 leading-5 italic">
                        Add options above to see preview
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                This is how the checkbox group will appear to users
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave}>
            {isEditing ? 'Save Changes' : 'Add Field'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
