import { Logo } from '@/components/brand/logo';
export default function About() {
  return (
    <main className="wrap simple-page">
      <Logo />
      <h1>
        A little guidance.
        <br />
        <em>A lot of heart.</em>
      </h1>
      <p>
        LoveStory is a space to reflect on communication, dating, boundaries, and connection.
        Relationship Guru is the first companion available, with text and voice conversations.
      </p>
      <h2>For moments that need more support</h2>
      <p>
        Guru offers general reflection, not diagnosis, therapy, or crisis care. If you may be in
        immediate danger, contact local emergency services or someone you trust who can be with you.
        For a helpline in your country, visit{' '}
        <a
          className="text-link"
          href="https://findahelpline.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          Find A Helpline
        </a>
        .
      </p>
      <h2>When something isn’t working</h2>
      <p>
        Try text chat if microphone access or voice playback is unavailable. If an AI request fails,
        your saved conversation remains available. Connection and provider setup errors are shown in
        the app so you can try again later.
      </p>
    </main>
  );
}
