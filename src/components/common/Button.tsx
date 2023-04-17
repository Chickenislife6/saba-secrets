import clsx, { type ClassValue } from 'clsx'
import Link, { type LinkProps } from 'next/link'
import { type ButtonHTMLAttributes } from 'react'

type Variant = 'solid' | 'outline'
type Color = 'purple' | 'white' | 'gray'

type ButtonProps = {
  variant?: Variant
  color?: Color
  href?: string
} & Omit<LinkProps, 'href'> &
  ButtonHTMLAttributes<HTMLButtonElement>

const baseStyles: Record<Variant, ClassValue> = {
  solid:
    'inline-flex justify-center rounded-lg py-2 px-3 text-sm font-semibold outline-2 outline-offset-2 transition-colors',
  outline:
    'inline-flex justify-center rounded-lg border py-[calc(theme(spacing.2)-1px)] px-[calc(theme(spacing.3)-1px)] text-sm outline-2 outline-offset-2 transition-colors',
}

const variantStyles: Record<Variant, Record<Color, ClassValue>> = {
  solid: {
    purple:
      'relative overflow-hidden bg-purple-600 text-white before:absolute before:inset-0 active:before:bg-transparent hover:before:bg-white/10 active:bg-purple-800 active:text-white/80 before:transition-colors',
    white:
      'bg-white text-purple-700 hover:bg-white/90 active:bg-white/90 active:text-purple-800/70',
    gray: 'bg-gray-800 text-white hover:bg-gray-900 active:bg-gray-800 active:text-white/80',
  },
  outline: {
    purple:
      'border-purple-300 text-purple-600 hover:border-purple-400 before:insert-0 before:transition-colors active:bg-purple-100 active:text-purple-600/80',
    white:
      'border-white-300 text-white-700 hover:border-white-400 active:bg-white-100 active:text-white-700/80',
    gray: 'border-gray-300 text-gray-700 hover:border-gray-400 active:bg-gray-100 active:text-gray-700/80',
  },
}

export function Button({
  variant = 'solid',
  color = 'gray',
  className,
  href,
  ...props
}: ButtonProps) {
  className = clsx(baseStyles[variant], variantStyles[variant][color], className)

  return href !== undefined ? (
    <Link href={href} className={className} {...(props as Omit<LinkProps, 'href'>)} />
  ) : (
    <button className={className} {...(props as ButtonHTMLAttributes<HTMLButtonElement>)} />
  )
}
