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

type AdminEventsProps = {
  events: Event[];
  error?: string | null;
};

export const getServerSideProps: GetServerSideProps<AdminEventsProps> = async () => {
  const supabase = getSupabaseClient("anon");

  if (!supabase) {
    return {
      props: {
        events: [],
        error: "Supabase not configured. Add URL and anon key to .env.local.",
      },
    };
  }

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .order("start_datetime", { ascending: true });

  if (error) {
    return { props: { events: [], error: error.message } };
  }

  return { props: { events: data ?? [], error: null } };
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export default function AdminEventsPage({ events, error }: AdminEventsProps) {
  return (
    <div
      className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-[color:var(--background)] text-[color:var(--foreground)] antialiased`}
    >
      <Head>
        <title>Admin · Events | Dragonfire Games</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--color-imperial-blue)]">
              Admin
            </p>
            <h1 className="text-3xl font-semibold">Events overview</h1>
            <p className="text-sm text-[color:var(--color-granite)]">
              Read-only for now. Add edit/delete after auth wiring.
            </p>
          </div>
          <Link
            href="/events"
            className="text-sm font-semibold text-[color:var(--color-imperial-blue)] underline-offset-4 hover:underline"
          >
            View public
          </Link>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            {error}
          </div>
        ) : null}

        <div className="overflow-hidden rounded-2xl border border-[color:var(--color-granite)]/25 bg-white/80 shadow-sm">
          <div className="grid grid-cols-6 bg-[color:var(--color-imperial-blue)]/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-granite)]">
            <span className="col-span-2">Event</span>
            <span>Type</span>
            <span>When</span>
            <span>Game tags</span>
            <span>Entry</span>
          </div>
          <div className="divide-y divide-[color:var(--color-granite)]/15">
            {events.length === 0 ? (
              <div className="px-4 py-3 text-sm text-[color:var(--color-granite)]">
                No events yet.
              </div>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="grid grid-cols-6 items-start gap-3 px-4 py-3 text-sm"
                >
                  <div className="col-span-2">
                    <p className="font-semibold text-[color:var(--color-charcoal-brown)]">
                      {event.title}
                    </p>
                    {event.description ? (
                      <p className="text-xs text-[color:var(--color-granite)]">
                        {event.description}
                      </p>
                    ) : null}
                  </div>
                  <span className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-imperial-blue)]">
                    {event.event_type}
                  </span>
                  <span className="text-sm text-[color:var(--color-granite)]">
                    {formatDateTime(event.start_datetime)}
                  </span>
                  <span className="text-sm text-[color:var(--color-granite)]">
                    {event.game_tags?.length ? event.game_tags.join(", ") : "—"}
                  </span>
                  <span className="text-sm text-[color:var(--color-granite)]">
                    {event.entry_fee ?? "—"}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
