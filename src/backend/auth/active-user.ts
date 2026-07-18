import { auth } from '@/backend/auth'
import { db } from '@/backend/database'

export async function getActiveUserSession() {
  const session = await auth()
  if (!session?.user?.id) return null

  const currentUser = await db.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, role: true, isActive: true },
  })

  if (!currentUser?.isActive) return null

  session.user.id = currentUser.id
  session.user.role = currentUser.role
  return session
}
