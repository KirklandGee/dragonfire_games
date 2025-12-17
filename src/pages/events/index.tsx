import Head from "next/head";
import { Geist, Geist_Mono } from "next/font/google";
import type { GetServerSideProps } from "next";
import Link from "next/link";
import { useMemo, useState } from "react";

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

type TimeFilter = "all" | "next7" | "next30";

export default function EventsPage({ events, error }: EventsPageProps) {
  const [search, setSearch] = useState("");
  const [game, setGame] = useState<string>("all");
  const [eventType, setEventType] = useState<Event["event_type"] | "all">("all");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("all");

  const gameOptions = useMemo(() => {
    const set = new Set<string>();
    events.forEach((evt) => evt.game_tags?.forEach((tag) => set.add(tag)));
    return Array.from(set).sort();
  }, [events]);

  const filtered = useMemo(() => {
    const now = new Date();
    const limitDate =
      timeFilter === "next7"
        ? addDays(now, 7)
        : timeFilter === "next30"
          ? addDays(now, 30)
          : null;

    return events.filter((evt) => {
      const term = search.trim().toLowerCase();
      if (term) {
        const haystack = `${evt.title} ${evt.description ?? ""}`.toLowerCase();
        if (!haystack.includes(term)) return false;
      }
      if (game !== "all") {
        if (!evt.game_tags || !evt.game_tags.includes(game)) return false;
      }
      if (eventType !== "all" && evt.event_type !== eventType) return false;

      if (limitDate) {
        const start = new Date(evt.start_datetime);
        if (start < now || start > limitDate) return false;
      }

      return true;
    });
  }, [events, search, game, eventType, timeFilter]);

  const resetFilters = () => {
    setSearch("");
    setGame("all");
    setEventType("all");
    setTimeFilter("all");
  };

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
            What&apos;s happening
          </h1>
          <p className="text-base text-[color:var(--color-granite)]">
            Filter by game, type, or date range. Tap an event for details.
          </p>
        </header>

        {error ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            {error}
          </div>
        ) : null}

        <section className="rounded-2xl border border-[color:var(--color-granite)]/25 bg-white/90 p-5 shadow-sm">
          <div className="flex flex-col gap-3 sm:grid sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
            <label className="flex flex-col gap-1 text-sm font-semibold text-[color:var(--color-charcoal-brown)]">
              Search
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Event name or description"
                className="rounded-lg border border-[color:var(--color-granite)]/30 px-3 py-2 text-sm text-[color:var(--color-charcoal-brown)] shadow-inner"
              />
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[color:var(--color-charcoal-brown)]">
              Game
              <select
                value={game}
                onChange={(e) => setGame(e.target.value)}
                className="rounded-lg border border-[color:var(--color-granite)]/30 px-3 py-2 text-sm text-[color:var(--color-charcoal-brown)] shadow-inner"
              >
                <option value="all">All games</option>
                {gameOptions.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[color:var(--color-charcoal-brown)]">
              Type
              <select
                value={eventType}
                onChange={(e) =>
                  setEventType(e.target.value as Event["event_type"] | "all")
                }
                className="rounded-lg border border-[color:var(--color-granite)]/30 px-3 py-2 text-sm text-[color:var(--color-charcoal-brown)] shadow-inner"
              >
                <option value="all">All types</option>
                <option value="weekly">Weekly</option>
                <option value="one-time">One-time</option>
                <option value="tournament">Tournament</option>
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm font-semibold text-[color:var(--color-charcoal-brown)]">
              Date range
              <select
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
                className="rounded-lg border border-[color:var(--color-granite)]/30 px-3 py-2 text-sm text-[color:var(--color-charcoal-brown)] shadow-inner"
              >
                <option value="all">All upcoming</option>
                <option value="next7">Next 7 days</option>
                <option value="next30">Next 30 days</option>
              </select>
            </label>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-[color:var(--color-granite)]">
            <span>
              Showing {filtered.length} of {events.length} events
            </span>
            <button
              onClick={resetFilters}
              className="rounded-full border border-[color:var(--color-granite)]/30 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-[color:var(--color-imperial-blue)] hover:border-[color:var(--color-imperial-blue)]/60"
            >
              Clear filters
            </button>
          </div>
        </section>

        <EventsList events={filtered} />
      </main>
    </div>
  );
}

function EventsList({ events }: { events: Event[] }) {
  if (!events.length) {
    return (
      <div className="rounded-2xl border border-[color:var(--color-granite)]/25 bg-white/80 p-6 text-[color:var(--color-granite)] shadow-sm">
        No events match these filters.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {events.map((event) => (
        <Link
          key={event.id}
          href={`/events/${event.id}`}
          className="flex flex-col gap-2 rounded-2xl border border-[color:var(--color-granite)]/20 bg-white/85 p-4 shadow-sm transition hover:-translate-y-[2px] hover:shadow-md"
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-[color:var(--color-imperial-blue)]/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-imperial-blue)]">
                {event.event_type}
              </span>
              {event.game_tags?.length ? (
                <span className="text-xs font-semibold text-[color:var(--color-granite)]">
                  {event.game_tags.join(", ")}
                </span>
              ) : null}
            </div>
            {event.entry_fee ? (
              <span className="text-xs font-semibold text-[color:var(--color-granite)]">
                Entry: {event.entry_fee}
              </span>
            ) : null}
          </div>
          <h2 className="text-xl font-semibold text-[color:var(--color-charcoal-brown)]">
            {event.title}
          </h2>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--color-granite)]">
            {formatDate(event.start_datetime)} · {formatTime(event.start_datetime)}
          </p>
          {event.description ? (
            <p className="text-sm text-[color:var(--color-granite)]">{event.description}</p>
          ) : null}
          {event.registration_link ? (
            <span className="text-xs font-semibold text-[color:var(--color-imperial-blue)]">
              Registration available
            </span>
          ) : null}
        </Link>
      ))}
    </div>
  );
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

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
