"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Star } from "lucide-react"
import type { ProductWithPricing, ProductReview } from "@/lib/types"

interface ProductReviewFormProps {
  product: ProductWithPricing
  onSubmit: (review: Omit<ProductReview, 'id' | 'created_at' | 'updated_at'>) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export function ProductReviewForm({
  product,
  onSubmit,
  onCancel,
  isSubmitting = false
}: ProductReviewFormProps) {
  const [rating, setRating] = useState(0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      alert("Please select a rating")
      return
    }

    if (!comment.trim()) {
      alert("Please write a comment")
      return
    }

    onSubmit({
      product_id: product.id,
      rating,
      comment: comment.trim()
    })
  }

  const activePricing = product.pricing?.find(p => p.is_active)

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
      {/* Product Info */}
      <div className="flex items-start gap-4 mb-6">
        {product.product_image ? (
          <img
            src={product.product_image}
            alt={product.name}
            className="w-16 h-16 object-cover rounded-lg"
          />
        ) : (
          <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xs">No Image</span>
          </div>
        )}
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">{product.name}</h3>
          {product.description && (
            <p className="text-sm text-gray-600 mt-1 line-clamp-2">
              {product.description}
            </p>
          )}
          {activePricing && (
            <p className="text-sm font-medium text-gray-900 mt-2">
              {activePricing.currency} {activePricing.price.toFixed(2)}
            </p>
          )}
        </div>
      </div>

      {/* Review Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Rating */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rating *
          </label>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="p-1 hover:scale-110 transition-transform"
                onMouseEnter={() => setHoveredRating(star)}
                onMouseLeave={() => setHoveredRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`w-6 h-6 ${
                    star <= (hoveredRating || rating)
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          {rating > 0 && (
            <p className="text-xs text-gray-500 mt-1">
              {rating} star{rating !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Comment */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Comment *
          </label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Share your experience with this product..."
            rows={4}
            className="resize-none"
            maxLength={500}
          />
          <p className="text-xs text-gray-500 mt-1">
            {comment.length}/500 characters
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isSubmitting || rating === 0 || !comment.trim()}
            className="flex-1"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Review'}
          </Button>
        </div>
      </form>
    </div>
  )
}

// Simple review display component
interface ProductReviewDisplayProps {
  review: ProductReview
  product?: ProductWithPricing
}

export function ProductReviewDisplay({ review, product }: ProductReviewDisplayProps) {
  return (
    <div className="bg-white rounded-lg border p-4">
      {product && (
        <div className="flex items-center gap-3 mb-3">
          {product.product_image ? (
            <img
              src={product.product_image}
              alt={product.name}
              className="w-10 h-10 object-cover rounded"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
              <span className="text-gray-400 text-xs">No Image</span>
            </div>
          )}
          <div>
            <h4 className="font-medium text-gray-900">{product.name}</h4>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-4 h-4 ${
                    star <= review.rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              ))}
              <span className="text-sm text-gray-600 ml-1">
                ({review.rating}/5)
              </span>
            </div>
          </div>
        </div>
      )}
      
      <p className="text-gray-700 text-sm leading-relaxed">{review.comment}</p>
      
      <p className="text-xs text-gray-500 mt-3">
        {new Date(review.created_at).toLocaleDateString()}
      </p>
    </div>
  )
}
