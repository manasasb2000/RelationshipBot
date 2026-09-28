import Link from 'next/link';
import { Logo } from '@/components/brand/logo';
import { Button } from '@/components/ui/button';
export default function Login() {
  return (
    <main className="auth-page">
      <section className="auth-card">
        <Logo />
        <h1>
          Your next chapter
          <br />
          is waiting.
        </h1>
        <p>A thoughtful space for you and your story.</p>
        <div className="notice" role="status">
          This is the local design preview. Google and email sign-in are still being implemented.
          Chat and voice are not available yet.
        </div>
        <Button asChild variant="outline">
          <Link href="/">Back to LoveStory</Link>
        </Button>
        <p className="auth-note">A little guidance. A lot of heart.</p>
      </section>
    </main>
  );
}
