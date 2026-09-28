'use client';
import { useState } from 'react';
import { Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MatchResult } from '@/lib/kundli/engine/types';

interface Message { role: 'user' | 'assistant'; content: string }

interface FollowupChatProps { matchResult: MatchResult }

export function FollowupChat({ matchResult }: FollowupChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const q = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: q }]);
    setLoading(true);
    try {
      const res = await fetch('/api/kundli/followup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q, matchResult, requestId: crypto.randomUUID() }),
      });
      const data = await res.json() as { text: string };
      setMessages(prev => [...prev, { role: 'assistant', content: data.text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'I am having a moment — please try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  const starters = [
    'What does the Nadi score mean for us?',
    'How can we work with our Bhakoot difference?',
    'What does being Manglik mean in daily life?',
  ];

  return (
    <section className="followup-chat" aria-label="Follow-up questions">
      <h3 className="followup-heading">
        <span aria-hidden>✧</span> Ask a follow-up
      </h3>
      {messages.length === 0 && (
        <div className="followup-starters">
          {starters.map(s => (
            <button key={s} className="starter-pill" onClick={() => setInput(s)}>
              {s}
            </button>
          ))}
        </div>
      )}
      {messages.length > 0 && (
        <div className="followup-messages" aria-live="polite">
          {messages.map((m, i) => (
            <div key={i} className={`followup-msg ${m.role}`}>
              {m.role === 'assistant' && <p className="msg-letter">{m.content}</p>}
              {m.role === 'user' && <p className="msg-note">{m.content}</p>}
            </div>
          ))}
          {loading && <div className="typing-indicator" aria-label="Thinking…"><span /><span /><span /></div>}
        </div>
      )}
      <form onSubmit={submit} className="followup-form">
        <input
          type="text"
          value={input}
          onChange={e => setInput(e.target.value)}
          placeholder="Ask about your reading…"
          aria-label="Follow-up question"
          disabled={loading}
          maxLength={500}
        />
        <Button type="submit" disabled={!input.trim() || loading} aria-label="Send">
          {loading ? <Loader2 size={16} className="spin" aria-hidden /> : <Send size={16} aria-hidden />}
        </Button>
      </form>
    </section>
  );
}
