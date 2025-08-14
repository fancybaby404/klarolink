"use client"

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Package } from "lucide-react"

interface AddItemModalProps {
  isOpen: boolean
  onClose: () => void
  onAddField: () => void
  onAddProduct: () => void
}

export function AddItemModal({ isOpen, onClose, onAddField, onAddProduct }: AddItemModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add to Form</DialogTitle>
          <DialogDescription>
            Choose what you'd like to add to your feedback form
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid grid-cols-1 gap-4 py-4">
          {/* Add Field Option */}
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/20"
            onClick={() => {
              onAddField()
              onClose()
            }}
          >
            <Plus className="w-6 h-6 text-primary" />
            <div className="text-center">
              <div className="font-medium">Add Field</div>
              <div className="text-xs text-gray-500">Add a new form field</div>
            </div>
          </Button>

          {/* Add Product Option */}
          <Button
            variant="outline"
            className="h-20 flex flex-col items-center justify-center gap-2 hover:bg-primary/5 hover:border-primary/20"
            onClick={() => {
              onAddProduct()
              onClose()
            }}
          >
            <Package className="w-6 h-6 text-primary" />
            <div className="text-center">
              <div className="font-medium">Add Product</div>
              <div className="text-xs text-gray-500">Add products for feedback</div>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
