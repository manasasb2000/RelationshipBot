import { currentUserId } from '@/lib/auth/user';
import { listConversations } from '@/lib/guru/persistence';

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return Response.json([]);
  return Response.json(await listConversations(userId));
}
