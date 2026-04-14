import { AdminPlaceholderPanel } from '@/frontend/components/admin/AdminPlaceholderPanel'

export const metadata = { title: 'Create Coupon | Admin' }

export default function AdminNewCouponPage() {
  return (
    <AdminPlaceholderPanel
      title="Create Coupon"
      description="This page now opens correctly, but the coupon creation form still needs to be implemented."
      backHref="/admin/coupons"
      backLabel="Back to Coupons"
    />
  )
}
