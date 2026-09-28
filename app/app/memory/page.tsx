'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/brand/logo';

export default function MemoryPage() {
  const [memories, setMemories] = useState<{ id: string; type: string; content: string }[]>([]);
  const [enabled, setEnabled] = useState(true);
  const [notice, setNotice] = useState('');
  useEffect(() => {
    fetch('/api/memory')
      .then((response) => (response.ok ? response.json() : []))
      .then(setMemories)
      .catch(() => undefined);
  }, []);
  async function update(value: boolean) {
    const response = await fetch('/api/memory', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: value }),
    });
    if (response.ok) {
      setEnabled(value);
      setNotice(value ? 'Memory is on.' : 'Memory is paused.');
    }
  }
  async function clear() {
    if (!window.confirm('Clear all saved Guru memories? This cannot be undone.')) return;
    const response = await fetch('/api/memory', { method: 'DELETE' });
    if (response.ok) {
      setMemories([]);
      setNotice('All saved memories were cleared.');
    }
  }
  async function edit(memory: { id: string; content: string }) {
    const content = window.prompt('Update this memory', memory.content)?.trim();
    if (!content) return;
    const response = await fetch('/api/memory', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: memory.id, content }),
    });
    if (response.ok) {
      setMemories((items) =>
        items.map((item) => (item.id === memory.id ? { ...item, content } : item)),
      );
      setNotice('Memory updated.');
    }
  }
  async function remove(id: string) {
    const response = await fetch(`/api/memory?id=${id}`, { method: 'DELETE' });
    if (response.ok) {
      setMemories((items) => items.filter((item) => item.id !== id));
      setNotice('Memory removed.');
    }
  }
  return (
    <main className="wrap simple-page">
      <Logo />
      <h1>Your Guru memory.</h1>
      <p>
        Guru can remember durable details such as relationship goals, communication preferences, and
        approaches that helped. Raw audio, passwords, payment details, government IDs, and other
        highly sensitive information are excluded.
      </p>
      <section className="memory-list" aria-label="Saved memories">
        <h2>What Guru remembers</h2>
        {memories.length ? (
          memories.map((memory) => (
            <article key={memory.id}>
              <small>{memory.type.replace('_', ' ')}</small>
              <p>{memory.content}</p>
              <div>
                <button onClick={() => void edit(memory)}>Edit</button>
                <button onClick={() => void remove(memory.id)}>Delete</button>
              </div>
            </article>
          ))
        ) : (
          <p>No durable memories have been saved yet.</p>
        )}
      </section>
      <label className="memory-toggle">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(event) => void update(event.target.checked)}
        />{' '}
        Allow Guru to remember useful details
      </label>
      <p>
        Saved memory content is encrypted before it is written to the database. Pausing memory stops
        retrieval and new extraction.
      </p>
      <div className="memory-actions">
        <Button variant="outline" onClick={() => void clear()}>
          Clear all memories
        </Button>
        <Button asChild>
          <Link href="/app/guru">Back to Guru</Link>
        </Button>
      </div>
      {notice && (
        <div className="notice" role="status">
          {notice}
        </div>
      )}
    </main>
  );
}
