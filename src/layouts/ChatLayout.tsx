import { type ReactNode } from 'react'

type ChatLayoutProps = {
  children?: ReactNode
}

// TODO: include navbar in ChatLayout (not rerendering on page change)
export function ChatLayout({ children }: ChatLayoutProps) {
  return <div className="flex h-screen w-screen justify-center bg-white">{children}</div>
}
