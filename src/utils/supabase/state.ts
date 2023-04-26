import { RealtimeChannel, createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  'https://rzurryjuhfrhmmndeiwm.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6dXJyeWp1aGZyaG1tbmRlaXdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODA4OTc5ODMsImV4cCI6MTk5NjQ3Mzk4M30.MTM56TifvML_qpSPWtHl0qTEyPwUI7IHv5nttnTGnJs'
)

let channel: RealtimeChannel = supabase.channel('test')

export async function sendMessageSUPA() {
  console.log('sending message!')
  channel.send({ type: 'broadcast', event: 'supa', payload: {} })
}

export function subscribeSUPA(handler: () => void) {
  if (channel.joinedOnce) {
    return
  }
  channel.on('broadcast', { event: 'supa' }, handler).subscribe()
}
