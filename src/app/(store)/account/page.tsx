import { redirect } from 'next/navigation'

export const metadata = { title: 'Boilabin My Account' }

export default function AccountPage() {
  redirect('/account/profile')
}
