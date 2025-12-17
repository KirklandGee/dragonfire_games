import Head from "next/head";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import type { GetServerSideProps } from "next";

import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Event } from "@/types/events";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

type EventsPageProps = {
  events: Event[];
  error?: string | null;
};

export const getServerSideProps: GetServerSideProps<EventsPageProps> = async () => {
  const supabase = getSupabaseClient("anon");

  if (!supabase) {
    return {
      props: {
        events: [],
        error: "Supabase not configured. Add URL and anon key to .env.local.",
      },
    };
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("start_datetime", now)
    .order("start_datetime", { ascending: true });

  if (error) {
    return { props: { events: [], error: error.message } };
  }

  return { props: { events: data ?? [], error: null } };
};

const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default function EventsPage({ events, error }: EventsPageProps) {
  const weekly = events.filter((evt) => evt.event_type === "weekly");
  const special = events.filter((evt) => evt.event_type !== "weekly");

  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] antialiased`}
    >
      <Head>
        <title>Events | Dragonfire Games</title>
        <meta
          name="description"
          content="See upcoming events at Dragonfire Games."
        />
      </Head>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-2">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[color:var(--color-imperial-blue)]">
            Events
          </p>
          <h1 className="text-3xl font-semibold leading-tight sm:text-4xl">
            What&apos;s happening this week
          </h1>
          <p className="text-base text-[color:var(--color-granite)]">
            Clear times, clear formats. No digging for info.
          </p>
        </header>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            {error}
          </div>
        ) : null}

        <div className="grid gap-8">
          <Section title="Weekly staples" items={weekly} />
          <Section title="Special events" items={special} />
        </div>
      </main>
    </div>
  );
}

function Section({ title, items }: { title: string; items: Event[] }) {
  if (!items.length) {
    return (
      <section className="rounded-2xl border border-[color:var(--color-granite)]/20 bg-white/70 p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-[color:var(--color-charcoal-brown)]">
          {title}
        </h2>
        <p className="mt-2 text-sm text-[color:var(--color-granite)]">
          Nothing scheduled here yet.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-[color:var(--color-granite)]/20 bg-white/70 p-6 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-xl font-semibold text-[color:var(--color-charcoal-brown)]">
          {title}
        </h2>
        <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-imperial-blue)]">
          {items.length} event{items.length === 1 ? "" : "s"}
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {items.map((event) => (
          <Link
            key={event.id}
            href={`/events/${event.id}`}
            className="flex flex-col gap-2 rounded-xl border border-[color:var(--color-granite)]/15 bg-white/80 p-4 transition hover:-translate-y-[2px] hover:shadow-sm"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.12em] text-[color:var(--color-granite)]">
                  {formatDate(event.start_datetime)} · {formatTime(event.start_datetime)}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[color:var(--color-charcoal-brown)]">
                  {event.title}
                </h3>
              </div>
              <Badge>{event.event_type.replace("-", " ")}</Badge>
            </div>
            {event.description ? (
              <p className="text-sm text-[color:var(--color-granite)]">
                {event.description}
              </p>
            ) : null}
            {event.game_tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {event.game_tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-[color:var(--color-aquamarine)]/30 px-3 py-1 text-xs font-semibold text-[color:var(--color-granite)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}
            {event.entry_fee ? (
              <p className="text-xs font-semibold text-[color:var(--color-imperial-blue)]">
                Entry: {event.entry_fee}
              </p>
            ) : null}
          </Link>
        ))}
      </div>
    </section>
  );
}

function Badge({ children }: { children: string }) {
  return (
    <span className="rounded-full bg-[color:var(--color-imperial-blue)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-imperial-blue)]">
      {children}
    </span>
  );
}
