'use client';

import Link from 'next/link';
import { Brain, Menu, Plus, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AgentIcon } from '@/components/brand/agent-icon';
import { Logo } from '@/components/brand/logo';
import { ThemeToggle } from '@/components/providers/theme';
import { agents } from '@/lib/agents/registry';

export function AppSidebar() {
  const [open, setOpen] = useState(false);
  const [history, setHistory] = useState<{ id: string; title: string }[]>([]);
  useEffect(() => {
    fetch('/api/conversations')
      .then((response) => (response.ok ? response.json() : []))
      .then(setHistory)
      .catch(() => undefined);
  }, []);
  return (
    <>
      <button className="mobile-menu" aria-label="Open agent menu" onClick={() => setOpen(true)}>
        <Menu />
      </button>
      {open && (
        <button
          className="sidebar-scrim"
          aria-label="Close agent menu"
          onClick={() => setOpen(false)}
        />
      )}
      <aside className={`app-sidebar ${open ? 'is-open' : ''}`} aria-label="LoveStory agents">
        <div className="sidebar-brand">
          <Logo />
          <button
            className="sidebar-close"
            aria-label="Close agent menu"
            onClick={() => setOpen(false)}
          >
            <X />
          </button>
        </div>
        <button className="new-chat" onClick={() => window.location.assign('/app/guru')}>
          <Plus size={16} /> New conversation
        </button>
        <p className="sidebar-label">YOUR COMPANIONS</p>
        <nav className="agent-nav">
          {agents.map((agent) =>
            agent.status === 'available' && agent.route ? (
              <Link
                key={agent.id}
                href={agent.route}
                className="agent-nav-item active"
                aria-current="page"
              >
                <span>
                  <AgentIcon name={agent.icon} />
                </span>
                <div>
                  <strong>{agent.name}</strong>
                  <small>Available now</small>
                </div>
              </Link>
            ) : (
              <div key={agent.id} className="agent-nav-item locked" aria-disabled="true">
                <span>
                  <AgentIcon name={agent.icon} />
                </span>
                <div>
                  <strong>{agent.name}</strong>
                  <small>Coming soon</small>
                </div>
              </div>
            ),
          )}
        </nav>
        <div className="sidebar-history">
          <p className="sidebar-label">RECENT</p>
          {history.length ? (
            <div className="history-list">
              {history.slice(0, 6).map((conversation) => (
                <Link href={`/app/guru?conversation=${conversation.id}`} key={conversation.id}>
                  {conversation.title}
                </Link>
              ))}
            </div>
          ) : (
            <p>Your conversations will appear here.</p>
          )}
        </div>
        <Link className="memory-link" href="/app/memory">
          <Brain size={15} /> Memory & privacy
        </Link>
        <div className="sidebar-footer">
          <ThemeToggle />
          <div>
            <strong>Local preview</strong>
            <small>Development session</small>
          </div>
        </div>
      </aside>
    </>
  );
}
