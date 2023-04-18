import NextLink, { type LinkProps as NextLinkProps } from 'next/link'

import clsx, { type ClassValue } from 'clsx'
import { type ReactNode } from 'react'

type LinkProps = NextLinkProps & {
  className?: ClassValue
  children?: ReactNode
}

export function Link({ className, children, ...props }: LinkProps) {
  className = clsx('text-purple-700 hover:text-purple-500 hover:underline', className)

  return (
    <NextLink {...props} className={className}>
      {children}
    </NextLink>
  )
}
