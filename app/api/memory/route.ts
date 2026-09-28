import { currentUserId } from '@/lib/auth/user';
import { memoryManager } from '@/lib/guru/memory';
import { z } from 'zod';

const updateSchema = z.object({ enabled: z.boolean() });
const editSchema = z.object({ id: z.string().uuid(), content: z.string().trim().min(1).max(1000) });

export async function GET() {
  const userId = await currentUserId();
  if (!userId) return Response.json([]);
  return Response.json(await memoryManager.list(userId));
}

export async function PATCH(request: Request) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid setting.' }, { status: 400 });
  await memoryManager.setEnabled(userId, parsed.data.enabled);
  return Response.json({ enabled: parsed.data.enabled });
}

export async function DELETE(request: Request) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const id = new URL(request.url).searchParams.get('id');
  if (id && z.string().uuid().safeParse(id).success) await memoryManager.deleteOne(userId, id);
  else await memoryManager.clear(userId);
  return new Response(null, { status: 204 });
}

export async function PUT(request: Request) {
  const userId = await currentUserId();
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 });
  const parsed = editSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: 'Invalid memory.' }, { status: 400 });
  await memoryManager.update(userId, parsed.data.id, parsed.data.content);
  return Response.json({ updated: true });
}
