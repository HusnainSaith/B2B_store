import { StarRating } from '@/components/common/StarRating'
import { formatDate } from '@/lib/format'
import { Check } from 'lucide-react'
import type { Review } from '@/types'

interface ReviewCardProps {
  review: Review
}

export function ReviewCard({ review }: ReviewCardProps) {
  return (
    <div className="py-4 border-b border-border last:border-0">
      {/* Header */}
      <div className="flex items-start gap-3 mb-2">
        <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center text-white text-sm font-bold shrink-0">
          {review.user?.firstName?.charAt(0) ?? '?'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text-primary">
            {review.user?.firstName} {review.user?.lastName}
          </p>
          {review.isVerified && (
            <span className="text-xs text-success flex items-center gap-1">
              <Check className="h-3 w-3" /> Verified Purchase
            </span>
          )}
        </div>
        <time className="text-xs text-text-secondary shrink-0">{formatDate(review.createdAt)}</time>
      </div>

      {/* Rating + Title */}
      <div className="flex items-center gap-2 mb-1">
        <StarRating rating={review.rating} size="sm" />
        {review.title && (
          <span className="text-sm font-bold text-text-primary">{review.title}</span>
        )}
      </div>

      {/* Body */}
      {review.body && (
        <p className="text-sm text-text-primary whitespace-pre-line mb-2">{review.body}</p>
      )}

      {/* Seller Reply */}
      {review.sellerReply && (
        <div className="bg-surface rounded p-3 mt-2 ml-4">
          <p className="text-xs font-bold text-text-primary mb-1">Seller Response</p>
          <p className="text-sm text-text-primary">{review.sellerReply}</p>
          {review.sellerReplyAt && (
            <time className="text-xs text-text-secondary mt-1 block">{formatDate(review.sellerReplyAt)}</time>
          )}
        </div>
      )}
    </div>
  )
}
