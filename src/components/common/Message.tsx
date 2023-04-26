export type props = {
  message: string
  sender: string
  recipient: string
  timestamp: number
}

export function Message(props: props) {
  let justify = ''
  let color = '#619e78'
  if (props.recipient === props.sender) {
    justify = 'justify-end'
    color = '#9657a8'
  }
  //   <div class="mb-2 flex justify-end">
  //     <div class="rounded px-3 py-2" style="background-color: #E2F7CB">
  //       <p class="mt-1 text-sm">Hi guys.</p>
  //       <p class="text-grey-dark mt-1 text-right text-xs">12:45 pm</p>
  //     </div>
  //   </div>
  return (
    <div className={'mb-2 flex ' + justify}>
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
