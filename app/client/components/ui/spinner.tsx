import { Loader2Icon } from 'lucide-react'

import { cn } from '@/lib/utils'

type SpinnerProps = React.ComponentProps<'svg'> & {
  size?: 'sm' | 'md' | 'lg'
}

const spinnerSizes = {
  sm: 'size-4',
  md: 'size-5',
  lg: 'size-6',
}

function Spinner({ className, size = 'sm', ...props }: SpinnerProps) {
  return (
    <Loader2Icon
      role="status"
      aria-label="Loading"
      className={cn(spinnerSizes[size], 'animate-spin', className)}
      {...props}
    />
  )
}

export { Spinner }
