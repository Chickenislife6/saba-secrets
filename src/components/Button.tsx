import Link from 'next/link'
// import clsx from 'clsx'

// TODO: define base/variant styles

type ButtonProps = {
  variant?: 'solid' | 'outline'
  color?: 'slate' // add others
  className?: string
  href?: string
}

export function Button({
  variant = 'solid',
  color = 'slate',
  className,
  href,
  ...props
}: ButtonProps) {
  // className = clsx(
  //   baseStyles[variant],
  //   variantStyles[variant][color],
  //   className
  // )

  return href ? (
    <Link href={href} className={className} {...props} />
  ) : (
    <button className={className} {...props} />
  )
}
