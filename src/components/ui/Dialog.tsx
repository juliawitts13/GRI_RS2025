import * as RadixDialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Dialog({
  open,
  onOpenChange,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: ReactNode
}) {
  return (
    <RadixDialog.Root open={open} onOpenChange={onOpenChange}>
      <RadixDialog.Portal>
        <RadixDialog.Overlay className="fixed inset-0 z-40 bg-navy-950/50 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in" />
        <RadixDialog.Content
          className={cn(
            'fixed left-1/2 top-1/2 z-50 max-h-[90vh] w-[min(560px,92vw)] -translate-x-1/2 -translate-y-1/2',
            'overflow-y-auto rounded-card bg-white p-6 shadow-xl focus:outline-none',
          )}
        >
          {children}
          <RadixDialog.Close className="absolute right-4 top-4 rounded-md p-1 text-navy-700/60 hover:bg-navy-50 hover:text-navy-950">
            <X size={18} />
          </RadixDialog.Close>
        </RadixDialog.Content>
      </RadixDialog.Portal>
    </RadixDialog.Root>
  )
}

export function DialogTitle({ children }: { children: ReactNode }) {
  return <RadixDialog.Title className="mb-4 text-lg font-bold text-navy-950">{children}</RadixDialog.Title>
}
