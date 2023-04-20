import { api } from '~/utils/api'

export function useMessages() {
  // load local storage here

  const newMessages = api.messages.loadNewMessages.useQuery(undefined, {
    staleTime: Infinity,
  })

  // subscribe to postgres updates

  // use state to preserve messages in store

  // memoize grouped messages, or set as an outside object store?
  // this is why we consider zustand
  // const groupedMessages = useMemo(() => { },

  // save to local storage
  return newMessages
}
