import { type ReactNode } from 'react'

type ChatLayoutProps = {
  children?: ReactNode
}

// TODO: include navbar in ChatLayout (not rerendering on page change)
export function ChatLayout({ children }: ChatLayoutProps) {
  return <div className="bg-white h-full">{children}</div>
}
