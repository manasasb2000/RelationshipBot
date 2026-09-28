import { Suspense } from 'react';
import { GuruChat } from '@/components/chat/guru-chat';
import { AppSidebar } from '@/components/shell/app-sidebar';

export default function GuruPage() {
  return (
    <main className="app-shell">
      <AppSidebar />
      <Suspense fallback={<div className="chat-workspace" />}>
        <GuruChat />
      </Suspense>
    </main>
  );
}
