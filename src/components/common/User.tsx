export type props = {
  user: string
  recent_message: string
  handler: () => void
}

export function User(props: props) {
  return (
    <a
      onClick={props.handler}
      className="block max-w-sm rounded-lg border border-gray-200 bg-white p-6 shadow hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700"
    >
      <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">
        User: {props.user}
      </h5>
      <p className="font-normal text-gray-700 dark:text-gray-400">{props.recent_message}</p>
    </a>
  )
}
// <div class="hover:bg-grey-lighter flex cursor-pointer items-center bg-white px-3">
//   <div>
//     <img
//       class="h-12 w-12 rounded-full"
//       src="https://www.biography.com/.image/t_share/MTE5NTU2MzE2MjE4MTY0NzQ3/harrison-ford-9298701-1-sized.jpg"
//     />
//   </div>
//   <div class="border-grey-lighter ml-4 flex-1 border-b py-4">
//     <div class="items-bottom flex justify-between">
//       <p class="text-grey-darkest">Harrison Ford</p>
//       <p class="text-grey-darkest text-xs">12:45 pm</p>
//     </div>
//     <p class="text-grey-dark mt-1 text-sm">Tell Java I have the money</p>
//   </div>
// </div>
