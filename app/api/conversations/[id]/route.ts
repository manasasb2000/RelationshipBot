import { currentUserId } from '@/lib/auth/user';
import { deleteConversation, listConversationMessages } from '@/lib/guru/persistence';

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  return Response.json(await listConversationMessages(userId, (await context.params).id));
}

export async function DELETE(_: Request, context: { params: Promise<{ id: string }> }) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  await deleteConversation(userId, (await context.params).id);
  return new Response(null, { status: 204 });
}
