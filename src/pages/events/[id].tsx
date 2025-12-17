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

type EventPageProps = {
  event: Event | null;
  error?: string | null;
};

export const getServerSideProps: GetServerSideProps<EventPageProps> = async (
  context,
) => {
  const supabase = getSupabaseClient("anon");
  if (!supabase) {
    return {
      props: {
        event: null,
        error: "Supabase not configured. Add URL and anon key to .env.local.",
      },
    };
  }

  const id = context.params?.id as string;
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return { props: { event: null, error: error.message } };
  }

  if (!data) {
    return { props: { event: null, error: "Event not found" } };
  }

  return { props: { event: data, error: null } };
};

const formatFullDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  }).format(new Date(value));

const formatTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default function EventPage({ event, error }: EventPageProps) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] antialiased`}
    >
      <Head>
        <title>
          {event?.title ? `${event.title} | Dragonfire Games` : "Event | Dragonfire Games"}
        </title>
        <meta
          name="description"
          content={event?.description ?? "Event details at Dragonfire Games."}
        />
      </Head>
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-12">
        <Link
          href="/events"
          className="text-sm font-semibold text-[color:var(--color-imperial-blue)] underline-offset-4 hover:underline"
        >
          ← Back to events
        </Link>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            {error}
          </div>
        ) : null}

        {event ? (
          <article className="rounded-2xl border border-[color:var(--color-granite)]/25 bg-white/80 p-8 shadow-sm">
            <div className="flex flex-col gap-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="rounded-full bg-[color:var(--color-imperial-blue)]/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--color-imperial-blue)]">
                  {event.event_type.replace("-", " ")}
                </span>
                {event.entry_fee ? (
                  <span className="rounded-full bg-[color:var(--color-aquamarine)]/30 px-3 py-1 text-xs font-semibold text-[color:var(--color-granite)]">
                    Entry: {event.entry_fee}
                  </span>
                ) : null}
              </div>
              <h1 className="text-3xl font-semibold leading-tight text-[color:var(--color-charcoal-brown)]">
                {event.title}
              </h1>
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--color-granite)]">
                {formatFullDate(event.start_datetime)} · {formatTime(event.start_datetime)}
                {event.end_datetime ? ` – ${formatTime(event.end_datetime)}` : ""}
              </p>
            </div>

            {event.description ? (
              <p className="mt-4 text-base leading-relaxed text-[color:var(--color-granite)]">
                {event.description}
              </p>
            ) : null}

            {event.game_tags?.length ? (
              <div className="mt-5 flex flex-wrap gap-2">
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

            {event.registration_link ? (
              <div className="mt-6">
                <a
                  href={event.registration_link}
                  className="inline-flex items-center justify-center rounded-full bg-[color:var(--color-imperial-blue)] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--color-granite)]"
                  target="_blank"
                  rel="noreferrer"
                >
                  Register / Learn more
                </a>
              </div>
            ) : (
              <p className="mt-6 text-sm text-[color:var(--color-granite)]">
                No registration needed—just show up.
              </p>
            )}
          </article>
        ) : null}
      </main>
    </div>
  );
}
