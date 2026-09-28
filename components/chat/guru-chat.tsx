'use client';

import { Clipboard, Flower2, LoaderCircle, Mic, Send, Sparkles, Volume2 } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Citations } from './citations';
import { useVoiceRecorder } from '@/hooks/use-voice-recorder';
import type { ChatMessage, Citation, ScopeDecision } from '@/lib/guru/types';

type DisplayMessage = ChatMessage & {
  id: string;
  citations?: Citation[];
  cached?: boolean;
  decision?: ScopeDecision;
};

const starters = [
  'How can I start a difficult conversation gently?',
  'I need help setting a boundary with someone I love.',
  'How do I stop overthinking after a date?',
];

export function GuruChat() {
  const searchParams = useSearchParams();
  const [messages, setMessages] = useState<DisplayMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [conversationId, setConversationId] = useState<string>();
  const [language, setLanguage] = useState('auto');
  const [voiceReplies, setVoiceReplies] = useState(false);
  const [voiceBusy, setVoiceBusy] = useState(false);
  const audio = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const selected = searchParams.get('conversation');
    if (!selected) return;
    setConversationId(selected);
    fetch(`/api/conversations/${selected}`)
      .then((response) => (response.ok ? response.json() : []))
      .then((saved: ChatMessage[]) =>
        setMessages(saved.map((message) => ({ ...message, id: crypto.randomUUID() }))),
      )
      .catch(() => setError('This conversation could not be loaded.'));
  }, [searchParams]);

  async function speak(text: string) {
    setVoiceBusy(true);
    try {
      audio.current?.pause();
      const response = await fetch('/api/voice/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language: language === 'auto' ? 'en-IN' : language }),
      });
      if (!response.ok)
        throw new Error('Voice playback is unavailable. The text reply is still here.');
      const url = URL.createObjectURL(await response.blob());
      audio.current = new Audio(url);
      audio.current.onended = () => URL.revokeObjectURL(url);
      await audio.current.play();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Voice playback failed.');
    } finally {
      setVoiceBusy(false);
    }
  }

  const recorder = useVoiceRecorder(async (blob) => {
    setVoiceBusy(true);
    try {
      const form = new FormData();
      form.set('audio', new File([blob], 'recording.webm', { type: blob.type }));
      form.set('language', language);
      const response = await fetch('/api/voice/stt', { method: 'POST', body: form });
      const data = await response.json();
      if (!response.ok || !data.transcript)
        throw new Error(data.error ?? 'No speech was detected.');
      if (data.languageCode) setLanguage(data.languageCode);
      await sendMessage(data.transcript);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Voice transcription failed.');
    } finally {
      setVoiceBusy(false);
    }
  });

  async function sendMessage(value: string) {
    const message = value.trim();
    if (!message || loading) return;
    const userMessage: DisplayMessage = { id: crypto.randomUUID(), role: 'user', content: message };
    const history = messages.map(({ role, content }) => ({ role, content }));
    setMessages((current) => [...current, userMessage]);
    setInput('');
    setError('');
    setLoading(true);
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, history, conversationId, requestId: crypto.randomUUID() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error ?? 'The Guru could not respond.');
      if (data.conversationId) setConversationId(data.conversationId);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          content: data.text,
          citations: data.citations,
          cached: data.cached,
          decision: data.decision,
        },
      ]);
      if (voiceReplies) await speak(data.text);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    void sendMessage(input);
  }

  return (
    <section className="chat-workspace">
      <header className="chat-header">
        <div className="guru-heading-icon">
          <Flower2 />
        </div>
        <div>
          <h1>Relationship Guru</h1>
          <p>A little wisdom. A lot of warmth.</p>
        </div>
        <span className="chat-status">
          <i /> HERE WITH YOU
        </span>
        <div className="voice-settings">
          <select
            aria-label="Voice language"
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
          >
            <option value="auto">Auto language</option>
            <option value="en-IN">English</option>
            <option value="hi-IN">Hindi</option>
            <option value="bn-IN">Bengali</option>
            <option value="gu-IN">Gujarati</option>
            <option value="kn-IN">Kannada</option>
            <option value="ml-IN">Malayalam</option>
            <option value="mr-IN">Marathi</option>
            <option value="pa-IN">Punjabi</option>
            <option value="ta-IN">Tamil</option>
            <option value="te-IN">Telugu</option>
          </select>
          <label>
            <input
              type="checkbox"
              checked={voiceReplies}
              onChange={(event) => setVoiceReplies(event.target.checked)}
            />
            <Volume2 size={14} /> Voice replies
          </label>
        </div>
      </header>
      <div className="chat-scroll" aria-live="polite">
        {messages.length === 0 ? (
          <div className="chat-empty">
            <Sparkles />
            <span className="eyebrow">A QUIET SPACE, JUST FOR YOU</span>
            <h2>
              What’s on your <em>heart?</em>
            </h2>
            <p>There are no perfect words here. Start wherever feels right.</p>
            <div className="starter-grid">
              {starters.map((starter) => (
                <button key={starter} onClick={() => void sendMessage(starter)}>
                  {starter}
                </button>
              ))}
            </div>
            <small>
              Greetings and stable LoveStory FAQs are answered from a local cache to save tokens.
            </small>
          </div>
        ) : (
          <div className="message-list">
            {messages.map((message) => (
              <article key={message.id} className={`chat-message ${message.role}`}>
                <div className="message-meta">
                  {message.role === 'assistant' ? 'GURU' : 'YOU'}
                  {message.cached && <span>CACHED</span>}
                </div>
                <div className="message-paper">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} skipHtml>
                    {message.content}
                  </ReactMarkdown>
                  {message.role === 'assistant' && (
                    <>
                      <span className="signature">Yours, Guru</span>
                      <button
                        className="message-action"
                        aria-label="Copy reply"
                        onClick={() => void navigator.clipboard.writeText(message.content)}
                      >
                        <Clipboard size={13} /> Copy
                      </button>
                      <Citations citations={message.citations ?? []} />
                    </>
                  )}
                </div>
              </article>
            ))}
            {loading && (
              <div className="guru-typing">
                <LoaderCircle className="spin" /> Guru is gathering a thought…
              </div>
            )}
          </div>
        )}
      </div>
      <div className="composer-wrap">
        {(error || recorder.error) && (
          <p className="composer-error" role="alert">
            {error || recorder.error}
          </p>
        )}
        <form className="composer" onSubmit={submit}>
          <button
            type="button"
            className={`composer-icon ${recorder.recording ? 'recording' : ''}`}
            disabled={loading || voiceBusy}
            aria-label={recorder.recording ? 'Stop recording' : 'Start voice input'}
            onClick={() => void recorder.toggle()}
          >
            <Mic />
          </button>
          <textarea
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                event.currentTarget.form?.requestSubmit();
              }
            }}
            placeholder="Share what’s on your mind…"
            rows={1}
            maxLength={4000}
          />
          <button
            type="submit"
            className="send-button"
            disabled={loading || !input.trim()}
            aria-label="Send message"
          >
            <Send />
          </button>
        </form>
        <p>
          LoveStory can make mistakes. For emergencies, contact local services or someone you trust.
        </p>
      </div>
    </section>
  );
}
