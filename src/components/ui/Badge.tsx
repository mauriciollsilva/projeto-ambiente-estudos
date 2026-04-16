import { cn } from '@/lib/utils'

type BadgeVariant = 'easy' | 'medium' | 'hard' | 'note' | 'pdf' | 'default'

interface BadgeProps {
  label: string
  variant?: BadgeVariant
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  easy: 'bg-green-100 text-green-800 border-green-200',
  medium: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  hard: 'bg-red-100 text-red-800 border-red-200',
  note: 'bg-blue-100 text-blue-800 border-blue-200',
  pdf: 'bg-purple-100 text-purple-800 border-purple-200',
  default: 'bg-gray-100 text-gray-700 border-gray-200',
}

export function Badge({ label, variant = 'default', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border',
        variantClasses[variant],
        className
      )}
    >
      {label}
    </span>
  )
}
