import { Logo } from '@/components/brand/logo';
export default function Privacy() {
  return (
    <main className="wrap simple-page">
      <Logo />
      <h1>A little care for your privacy.</h1>
      <p>
        Your conversations are linked to your account and stored in our database so you can return
        to them. Only authenticated account owners can access their conversations through the app.
      </p>
      <h2>What reaches our providers</h2>
      <p>
        Text and relevant conversation context are sent to the configured AI provider. Voice
        recordings go to Sarvam for transcription; reply text goes to Sarvam when voice playback is
        requested. These providers process data under their own policies. LoveStory does not save
        raw recordings in its database.
      </p>
      <h2>History and deletion</h2>
      <p>
        Use “Delete conversation” in your chat to remove its messages, summaries, and associated
        interaction events from the application database. Conversations otherwise remain until
        deleted. Infrastructure backups and provider retention may last longer; this is not a
        promise of immediate deletion from every service.
      </p>
      <h2>Operational records</h2>
      <p>
        We store bounded interaction records, including message references, model, latency, token
        usage, and sanitized errors, to understand failures. Ordinary application logs exclude
        conversation text. Session cookies are necessary to keep you signed in; theme preferences
        are stored on your device.
      </p>
      <h2>A thoughtful boundary</h2>
      <p>
        Guru is AI, not a therapist or emergency service. Avoid sharing information you do not want
        processed by these services. This initial release does not offer end-to-end encryption.
      </p>
    </main>
  );
}
