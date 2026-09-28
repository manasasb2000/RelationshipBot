import Link from 'next/link';
import {
  ArrowUpRight,
  ArrowRight,
  Check,
  Heart,
  Leaf,
  LockKeyhole,
  MessageCircle,
  Mic,
  Sparkles,
} from 'lucide-react';
import { Logo, HeartMark } from '@/components/brand/logo';
import { AgentIcon } from '@/components/brand/agent-icon';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/providers/theme';
import { Reveal } from '@/components/marketing/reveal';
import { agents } from '@/lib/agents/registry';
export default function Home() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <header className="site-header wrap">
        <Logo />
        <nav aria-label="Main navigation">
          <a href="#agents">Our agents</a>
          <a href="#kundli">Kundli</a>
          <a href="#how-it-works">How it works</a>
          <a href="#stories">Love notes</a>
        </nav>
        <div className="header-actions">
          <ThemeToggle />
          <Button asChild variant="outline" size="sm">
            <Link href="/login">
              Login <ArrowUpRight size={15} />
            </Link>
          </Button>
        </div>
      </header>
      <main id="main">
        <section className="hero wrap">
          <div className="hero-copy">
            <div className="eyebrow">
              <span className="tiny-heart">♡</span> FOR EVERY CHAPTER OF LOVE
            </div>
            <h1>
              Love is a journey.
              <br />
              You don’t have to
              <br />
              figure it out <em>alone.</em>
            </h1>
            <p>
              A little clarity. A little courage. A space to be heard.
              <br className="desktop-break" /> Thoughtful AI companions for the beautiful, messy,
              <br className="desktop-break" /> wonderfully human world of relationships.
            </p>
            <div className="hero-actions">
              <Button asChild>
                <Link href="/login">
                  Begin your story <ArrowRight size={17} />
                </Link>
              </Button>
              <a className="text-link" href="#meet-guru">
                Meet the Guru <ArrowUpRight size={17} />
              </a>
            </div>
            <div className="hero-footnote">
              <LockKeyhole size={13} /> Private by design <span>·</span> Made with a little heart
            </div>
          </div>
          <Reveal className="hero-art">
            <span className="art-star star-one">✧</span>
            <span className="art-star star-two">✧</span>
            <span className="art-heart heart-one">♡</span>
            <span className="art-heart heart-two">♡</span>
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <div className="letter-shadow" />
            <div className="envelope-back" />
            <div className="hero-letter">
              <div className="letter-top">
                <span>A NOTE, JUST FOR YOU</span>
                <Heart size={15} />
              </div>
              <p>Dear you,</p>
              <h2>
                You deserve a love
                <br />
                that feels like <em>home.</em>
              </h2>
              <div className="letter-rule" />
              <p className="letter-body">
                And sometimes, all it takes
                <br />
                is a little help finding the words.
              </p>
              <span className="signature">Yours, LoveStory</span>
            </div>
            <div className="envelope-front">
              <div className="wax-seal">
                <HeartMark />
              </div>
            </div>
            <div className="art-caption">Every great story starts with a conversation.</div>
            <div className="little-leaf">
              <Leaf size={66} strokeWidth={0.7} />
            </div>
          </Reveal>
        </section>
        <div className="belief-strip">
          <span>FOR THE FIRST HELLO</span>
          <span>✧</span>
          <span>THE HARD CONVERSATIONS</span>
          <span>✧</span>
          <span>AND THE EVERYDAY CHOOSING EACH OTHER</span>
        </div>
        <section id="agents" className="section wrap">
          <div className="section-heading">
            <div>
              <div className="eyebrow">A LITTLE HELP, AT EVERY STEP</div>
              <h2>
                Your story. A whole world
                <br />
                of <em>support.</em>
              </h2>
            </div>
            <p>
              From understanding yourself to growing together,
              <br />
              meet the companions for your relationship journey.
            </p>
          </div>
          <div id="meet-guru" className="guru-feature">
            <div className="guru-intro">
              <div className="badge available">
                <span /> AVAILABLE NOW
              </div>
              <div className="feature-title">
                <span className="agent-symbol">
                  <AgentIcon name="flower" size={32} />
                </span>
                <h3>
                  Meet your
                  <br />
                  <em>Relationship Guru.</em>
                </h3>
              </div>
              <p>
                For the things on your mind and the words you can’t quite find. A warm,
                judgment-free space to talk it through—one conversation at a time.
              </p>
              <div className="feature-tags">
                <span>
                  <MessageCircle size={14} /> Heart-to-heart chats
                </span>
                <span>
                  <Mic size={14} /> Speak your language
                </span>
              </div>
              <Button asChild>
                <Link href="/app/guru">
                  Let’s talk <ArrowUpRight size={17} />
                </Link>
              </Button>
            </div>
            <div className="chat-preview" aria-label="Illustrative Guru conversation">
              <div className="preview-heading">
                <span className="guru-avatar">
                  <AgentIcon name="flower" />
                </span>
                <div>
                  <strong>Relationship Guru</strong>
                  <small>A little wisdom. A lot of warmth.</small>
                </div>
                <span className="preview-spark">✧</span>
              </div>
              <div className="preview-user">
                How do I tell them I need more quality time,
                <br />
                without it sounding like a complaint?
              </div>
              <div className="preview-reply">
                <p>Wanting to feel close is a beautiful thing. ♡</p>
                <p>
                  Try starting with what you love, rather than what’s missing: “I really love our
                  time together. Could we set aside an evening just for us?”
                </p>
                <span className="signature">Yours, Guru</span>
              </div>
              <div className="preview-note">
                <LockKeyhole size={12} /> An example of a conversation with Guru
              </div>
            </div>
          </div>
          {/* ─── Kundli Matching Feature ─── */}
          <div id="kundli" className="guru-feature" style={{ marginTop: '3rem' }}>
            <div className="guru-intro">
              <div className="badge available">
                <span /> AVAILABLE NOW
              </div>
              <div className="feature-title">
                <span className="agent-symbol icon-kundli">
                  <AgentIcon name="stars" size={32} />
                </span>
                <h3>
                  Read the stars.
                  <br />
                  <em>Match your Kundli.</em>
                </h3>
              </div>
              <p>
                36-point Guna Milan, Manglik dosha, Nadi &amp; Bhakoot analysis — all explained warmly,
                in plain language. Rooted in Vedic tradition. Never fatalistic.
              </p>
              <div className="feature-tags">
                <span>
                  <Sparkles size={14} /> Ashtakoot · 36-point match
                </span>
                <span>
                  <Heart size={14} /> Manglik, Nadi &amp; Bhakoot doshas
                </span>
              </div>
              <Button asChild>
                <Link href="/app/kundli">
                  Match your Kundli <ArrowUpRight size={17} />
                </Link>
              </Button>
            </div>
            <div className="chat-preview" aria-label="Kundli Matching illustration">
              <div className="preview-heading">
                <span className="guru-avatar">
                  <AgentIcon name="stars" />
                </span>
                <div>
                  <strong>Kundli Matching</strong>
                  <small>Ancient wisdom, warmly explained.</small>
                </div>
                <span className="preview-spark">✧</span>
              </div>
              <div className="preview-user" style={{ fontSize: '0.85rem' }}>
                Priya &amp; Arjun · Born Mumbai, 1995 &amp; 1993
              </div>
              <div className="preview-reply">
                <p>
                  Ashtakoot score: <strong>28 / 36</strong> — an excellent foundation. ♡
                </p>
                <p>
                  Your Moon nakshatras bring complementary energy — Rohini and Hasta share a gentle,
                  nurturing quality. Nadi is clear; Bhakoot is harmonious.
                </p>
                <span className="signature">With the stars, LoveStory</span>
              </div>
              <div className="preview-note">
                <LockKeyhole size={12} /> Traditional Vedic guidance · Not a scientific verdict
              </div>
            </div>
          </div>

          <div className="agent-grid">
            {agents
              .filter((a) => a.id !== 'guru' && a.id !== 'kundli')
              .map((a) => (
                <article className="agent-card" key={a.id}>
                  <div className="agent-card-top">
                    <span className={`agent-symbol icon-${a.id}`}>
                      <AgentIcon name={a.icon} />
                    </span>
                    <span className="badge soon">COMING SOON</span>
                  </div>
                  <h3>{a.name}</h3>
                  <p>{a.description}</p>
                </article>
              ))}
          </div>
          <p className="under-grid">
            Thoughtfully growing, one companion at a time. <Heart size={13} />
          </p>
        </section>
        <section id="how-it-works" className="how-section">
          <div className="wrap">
            <div className="center-heading">
              <div className="eyebrow">NO PERFECT WORDS NEEDED</div>
              <h2>
                A small step toward
                <br />
                <em>something beautiful.</em>
              </h2>
            </div>
            <div className="steps">
              {[
                {
                  title: 'Come as you are',
                  body: 'Single, together, or somewhere in between. There’s a place for your story here.',
                  icon: Heart,
                },
                {
                  title: 'Share what’s on your mind',
                  body: 'Type it out or say it aloud. Start with whatever feels right for you.',
                  icon: MessageCircle,
                },
                {
                  title: 'Find your next little step',
                  body: 'Walk away with a fresh perspective and something practical to try.',
                  icon: Leaf,
                },
              ].map((s, i) => (
                <div className="step" key={s.title}>
                  <span className="step-number">0{i + 1}</span>
                  <s.icon size={29} strokeWidth={1.2} />
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <section id="stories" className="section wrap story-section">
          <div>
            <div className="eyebrow">THE LITTLE THINGS ARE THE BIG THINGS</div>
            <h2>
              Less guessing.
              <br />
              <em>More understanding.</em>
            </h2>
            <p>
              Love isn’t always grand gestures. Sometimes it’s
              <br />a better question, a softer start, a moment of listening.
            </p>
            <span className="story-disclaimer">
              An illustrative love note—not a customer testimonial.
            </span>
          </div>
          <div className="story-note">
            <span className="quote-mark">“</span>
            <blockquote>
              We didn’t need to have all the answers.
              <br />
              We just needed to start having
              <br />
              the right conversations.
            </blockquote>
            <div className="story-author">
              <span className="signature">A little couple goal</span>
              <Heart size={19} />
            </div>
          </div>
        </section>
        <section className="trust-section wrap">
          <div className="trust-icon">
            <LockKeyhole size={29} strokeWidth={1.3} />
          </div>
          <div>
            <h3>Your heart deserves a safe space.</h3>
            <p>Your conversations are personal. We treat them that way.</p>
            <div className="trust-points">
              <span>
                <Check size={14} /> Account-protected conversations
              </span>
              <span>
                <Check size={14} /> No judgment, ever
              </span>
              <span>
                <Check size={14} /> You set the pace
              </span>
            </div>
            <Link className="text-link" href="/privacy">
              How we care for your privacy <ArrowUpRight size={14} />
            </Link>
          </div>
        </section>
        <section className="closing wrap">
          <Sparkles size={23} strokeWidth={1} />
          <h2>
            Your next chapter
            <br />
            starts with <em>a conversation.</em>
          </h2>
          <Button asChild>
            <Link href="/login">
              Begin your story <ArrowRight size={17} />
            </Link>
          </Button>
          <span className="signature">A little guidance. A lot of heart.</span>
        </section>
      </main>
      <footer className="site-footer wrap">
        <Logo />
        <p>For love, in all its chapters.</p>
        <div>
          <Link href="/privacy">Privacy</Link>
          <Link href="/about">About & support</Link>
          <span>© {new Date().getFullYear()} LoveStory</span>
        </div>
      </footer>
    </>
  );
}
