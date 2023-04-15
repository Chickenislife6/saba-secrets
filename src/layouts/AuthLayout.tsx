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
    <div className="flex min-h-full overflow-hidden pt-16 sm:py-28">
      <main className="flex mx-auto justify-center w-full max-w-2xl flex-col px-4 sm:px-6">
        <Link href="/" aria-label="Home" className="mx-auto -my-8">
          <Logo className="h-16 w-auto sm:h-28" />
        </Link>
        <div className="relative mt-12 sm:mt-16">
          <BackgroundIllustration
            width="1090"
            height="1090"
            className="absolute -top-7 left-1/2 -z-10 h-[788px] -translate-x-1/2 stroke-gray-300/30 [mask-image:linear-gradient(to_bottom,white_20%,transparent_75%)] sm:-top-9 sm:h-auto"
          />
          <h1 className="text-center text-2xl sm:text-3xl font-medium tracking-tight text-gray-900">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-3 text-center text-base sm:text-lg text-gray-600">{subtitle}</p>
          )}
        </div>
        <div className="-mx-4 mt-4 flex-auto bg-white py-8 px-4 shadow-2xl shadow-gray-900/10 sm:mx-0 sm:flex-none sm:rounded-5xl sm:px-24 sm:py-20">
          {children}
        </div>
      </main>
      {/* TODO: add footer */}
    </div>
  )
}
