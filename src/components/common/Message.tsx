import { useEffect, useRef } from 'react'

export type props = {
  message: string
  sender: string
  recipient: string
  timestamp: number
  isCurrent: boolean
}

export function Message(props: props) {
  let justify = ''
  let color = '#619e78'
  if (props.recipient === props.sender) {
    justify = 'justify-end'
    color = '#9657a8'
  }

  const scrollRef = useRef<HTMLDivElement>(null)

  const scrollToMessage = () => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  // Really jank implementation
  useEffect(() => {
    if (props.isCurrent) {
      scrollToMessage()
    }
  }, [props.isCurrent])

  return (
    <div ref={scrollRef} className={'mb-2 flex ' + justify}>
      <div className="rounded px-3 py-2" style={{ backgroundColor: color }}>
        <p className="text-teal text-sm">{props.sender}</p>
        <p className="mt-1 text-sm">{props.message}</p>
        <p className="text-grey-dark mt-1 text-right text-xs">
          {new Date(props.timestamp).toLocaleString()}
        </p>
      </div>
    </div>
  )
}
