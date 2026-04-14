import { redirect } from 'next/navigation'

// Seller registration is disabled — this is a single-owner store
export default function SellerRegisterPage() {
  redirect('/')
}
