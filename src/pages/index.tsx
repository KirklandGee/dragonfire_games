import { Geist, Geist_Mono } from "next/font/google";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] antialiased`}
    >
      <main className="mx-auto flex max-w-5xl flex-col gap-10 px-6 py-14">
        <section className="rounded-2xl border border-[color:var(--color-granite)]/25 bg-white/80 p-8 shadow-sm backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-imperial-blue)]">
            Dragonfire Games
          </p>
          <h1 className="mt-3 text-3xl font-semibold leading-tight sm:text-4xl">
            Welcoming, calm, and clear updates for our local players.
          </h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-[color:var(--color-granite)]">
            Find what&apos;s happening this week, plan your visit, and request cards
            without digging through posts. Built to keep the community informed
            and the staff workflow simple.
          </p>
          <div className="mt-6 flex flex-col gap-3 text-sm font-medium sm:flex-row">
            <a
              className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-imperial-blue)] px-5 py-3 text-white shadow-sm transition hover:bg-[color:var(--color-granite)]"
              href="/events"
            >
              See events
            </a>
            <a
              className="inline-flex items-center justify-center rounded-full border border-[color:var(--color-granite)]/30 px-5 py-3 text-[color:var(--color-granite)] transition hover:border-[color:var(--color-imperial-blue)]/50 hover:text-[color:var(--color-imperial-blue)]"
              href="/card-requests"
            >
              Request cards
            </a>
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-[color:var(--color-granite)]/20 bg-white/70 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[color:var(--color-charcoal-brown)]">
              What you can do
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-granite)]">
              <li>Check this week&apos;s events and see what&apos;s next.</li>
              <li>Read store info at a glance: hours, location, contact.</li>
              <li>Submit a card pull request in decklist format.</li>
            </ul>
          </div>
          <div className="rounded-xl border border-[color:var(--color-granite)]/20 bg-white/70 p-6 shadow-sm">
            <h2 className="text-xl font-semibold text-[color:var(--color-charcoal-brown)]">
              Built for staff
            </h2>
            <ul className="mt-3 space-y-2 text-sm text-[color:var(--color-granite)]">
              <li>Clerk-protected admin tools for events and requests.</li>
              <li>Update schedules and requests in minutes, not hours.</li>
              <li>Clean, mobile-friendly layout with no distractions.</li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}
