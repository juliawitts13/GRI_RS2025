import { type InputHTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-10 w-full rounded-lg border border-navy-100 bg-white px-3 text-sm text-navy-950 placeholder:text-navy-700/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export const Select = forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, children, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'h-10 w-full rounded-lg border border-navy-100 bg-white px-3 text-sm text-navy-950 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500',
      className,
    )}
    {...props}
  >
    {children}
  </select>
))
Select.displayName = 'Select'

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'w-full rounded-lg border border-navy-100 bg-white px-3 py-2 text-sm text-navy-950 placeholder:text-navy-700/40 focus:outline-none focus:ring-2 focus:ring-orange-500/40 focus:border-orange-500',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label className={cn('mb-1.5 block text-xs font-semibold text-navy-700', className)} {...props} />
  )
}
