import Link from 'next/link'
import type { ReactNode, SVGProps } from 'react'

import Logo from '~/components/logos/logo-bgp'

type AuthLayoutProps = {
  title: ReactNode
  subtitle?: ReactNode
  children?: ReactNode
}

function BackgroundIllustration(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 1090 1090"
      aria-hidden="true"
      fill="none"
      preserveAspectRatio="none"
      {...props}
    >
      <circle cx={545} cy={545} r="544.5" />
      <circle cx={545} cy={545} r="480.5" />
      <circle cx={545} cy={545} r="416.5" />
      <circle cx={545} cy={545} r="352.5" />
    </svg>
  )
}

export function AuthLayout({ title, subtitle, children }: AuthLayoutProps) {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center overflow-hidden">
      <main className="mx-auto flex w-full max-w-2xl flex-col justify-center px-4 sm:px-6">
        <Link href="/" aria-label="Home" className="-my-10 mx-auto">
          <Logo className="h-16 sm:h-24" />
        </Link>
        <div className="relative mt-12 sm:mt-16">
          <BackgroundIllustration
            width="1090"
            height="1090"
            className="absolute -top-7 left-1/2 -z-10 h-[788px] -translate-x-1/2 stroke-gray-300/30 [mask-image:linear-gradient(to_bottom,white_20%,transparent_75%)] sm:-top-9 sm:h-auto"
          />
          <h1 className="text-center text-2xl font-medium tracking-tight text-gray-900 ">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-2 text-center text-sm text-gray-500 sm:text-base">{subtitle}</p>
          )}
        </div>
        <div className="-mx-4 mt-4 flex-auto bg-white px-4 py-8 shadow-2xl shadow-gray-900/10 sm:mx-16 sm:flex-none sm:rounded-3xl sm:px-12 sm:py-16">
          {children}
        </div>
      </main>
      {/* TODO: add footer */}
    </div>
  )
}
