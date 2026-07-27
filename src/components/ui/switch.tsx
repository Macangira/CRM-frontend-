// src/components/ui/switch.tsx
import * as React from 'react'
import * as SwitchPrimitive from '@radix-ui/react-switch'
import { cn } from '@/lib/utils'

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitive.Root
    ref={ref}
    className={cn(
      'flex h-5 w-9 items-center rounded-full bg-input transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary',
      className,
    )}
    {...props}
  >
    <SwitchPrimitive.Thumb
      className={cn(
        'pointer-events-none relative flex h-4 w-4 items-center justify-center rounded-full bg-background shadow-lg transition-transform data-[state=checked]:translate-x-4',
      )}
    />
  </SwitchPrimitive.Root>
))
Switch.displayName = SwitchPrimitive.Root.displayName

export { Switch }
