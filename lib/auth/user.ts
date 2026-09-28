import 'server-only';
import { cookies } from 'next/headers';

export async function currentUserId() {
  return (await cookies()).get('lovestory_user')?.value ?? null;
}
