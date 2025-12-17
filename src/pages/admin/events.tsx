import Head from "next/head";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import type { GetServerSideProps } from "next";
import { getAuth } from "@clerk/nextjs/server";
import { useRouter } from "next/router";
import { useState } from "react";

import { isAdmin } from "@/lib/auth";
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

export const getServerSideProps: GetServerSideProps<AdminEventsProps> = async (ctx) => {
  const { userId } = getAuth(ctx.req);
  if (!isAdmin(userId)) {
    return {
      redirect: {
        destination: "/sign-in",
        permanent: false,
      },
    };
  }

  const supabase = getSupabaseClient("service");

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
  const router = useRouter();
  const [formState, setFormState] = useState<Partial<Event> | null>(null);
  const [busy, setBusy] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const startEdit = (event?: Event) => {
    setFormState(
      event ?? {
        title: "",
        description: "",
        event_type: "weekly",
        start_datetime: "",
        end_datetime: "",
        game_tags: [],
        entry_fee: "",
        registration_link: "",
      },
    );
  };

  const resetForm = () => {
    setFormState(null);
    setServerError(null);
  };

  const onSubmit = async () => {
    if (!formState) return;
    setBusy(true);
    setServerError(null);
    const method = formState.id ? "PUT" : "POST";
    const endpoint = formState.id
      ? `/api/events/${formState.id}`
      : "/api/events";

    const res = await fetch(endpoint, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formState),
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Request failed");
      setBusy(false);
      return;
    }
    await router.replace(router.asPath);
    setBusy(false);
    resetForm();
  };

  const onDelete = async (id: string) => {
    const confirmed = window.confirm("Delete this event?");
    if (!confirmed) return;
    setBusy(true);
    setServerError(null);
    const res = await fetch(`/api/events/${id}`, { method: "DELETE" });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      setServerError(data.error ?? "Delete failed");
      setBusy(false);
      return;
    }
    await router.replace(router.asPath);
    setBusy(false);
  };

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
        {serverError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            {serverError}
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
                  className="grid grid-cols-7 items-start gap-3 px-4 py-3 text-sm"
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
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => startEdit(event)}
                      className="rounded-full bg-[color:var(--color-imperial-blue)]/10 px-3 py-1 text-xs font-semibold text-[color:var(--color-imperial-blue)] hover:bg-[color:var(--color-imperial-blue)]/20"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => onDelete(event.id)}
                      className="rounded-full bg-red-50 px-3 py-1 text-xs font-semibold text-red-700 hover:bg-red-100"
                      disabled={busy}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-[color:var(--color-granite)]/25 bg-white/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--color-imperial-blue)]">
                {formState?.id ? "Edit event" : "Create event"}
              </p>
              <h2 className="text-xl font-semibold text-[color:var(--color-charcoal-brown)]">
                {formState?.title || "New event"}
              </h2>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => startEdit()}
                className="rounded-full border border-[color:var(--color-granite)]/30 px-4 py-2 text-sm font-semibold text-[color:var(--color-granite)] hover:border-[color:var(--color-imperial-blue)]/50 hover:text-[color:var(--color-imperial-blue)]"
              >
                New
              </button>
              {formState ? (
                <button
                  onClick={resetForm}
                  className="rounded-full border border-[color:var(--color-granite)]/30 px-4 py-2 text-sm font-semibold text-[color:var(--color-granite)] hover:border-red-200 hover:text-red-700"
                >
                  Clear
                </button>
              ) : null}
            </div>
          </div>

          {formState ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void onSubmit();
              }}
              className="mt-5 grid gap-4 sm:grid-cols-2"
            >
              <label className="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-charcoal-brown)]">
                Title
                <input
                  required
                  value={formState.title ?? ""}
                  onChange={(e) =>
                    setFormState((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="rounded-lg border border-[color:var(--color-granite)]/30 px-3 py-2 text-sm text-[color:var(--color-charcoal-brown)] shadow-inner"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-charcoal-brown)]">
                Event type
                <select
                  value={formState.event_type ?? "weekly"}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      event_type: e.target.value as Event["event_type"],
                    }))
                  }
                  className="rounded-lg border border-[color:var(--color-granite)]/30 px-3 py-2 text-sm text-[color:var(--color-charcoal-brown)] shadow-inner"
                >
                  <option value="weekly">Weekly</option>
                  <option value="one-time">One-time</option>
                  <option value="tournament">Tournament</option>
                </select>
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-charcoal-brown)]">
                Start (ISO)
                <input
                  type="datetime-local"
                  required
                  value={toInputValue(formState.start_datetime)}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      start_datetime: new Date(e.target.value).toISOString(),
                    }))
                  }
                  className="rounded-lg border border-[color:var(--color-granite)]/30 px-3 py-2 text-sm text-[color:var(--color-charcoal-brown)] shadow-inner"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-charcoal-brown)]">
                End (ISO)
                <input
                  type="datetime-local"
                  value={toInputValue(formState.end_datetime)}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      end_datetime: e.target.value
                        ? new Date(e.target.value).toISOString()
                        : "",
                    }))
                  }
                  className="rounded-lg border border-[color:var(--color-granite)]/30 px-3 py-2 text-sm text-[color:var(--color-charcoal-brown)] shadow-inner"
                />
              </label>
              <label className="sm:col-span-2 flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-charcoal-brown)]">
                Description
                <textarea
                  value={formState.description ?? ""}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="rounded-lg border border-[color:var(--color-granite)]/30 px-3 py-2 text-sm text-[color:var(--color-charcoal-brown)] shadow-inner"
                  rows={3}
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-charcoal-brown)]">
                Game tags (comma separated)
                <input
                  value={formState.game_tags?.join(", ") ?? ""}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      game_tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    }))
                  }
                  className="rounded-lg border border-[color:var(--color-granite)]/30 px-3 py-2 text-sm text-[color:var(--color-charcoal-brown)] shadow-inner"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-charcoal-brown)]">
                Entry fee
                <input
                  value={formState.entry_fee ?? ""}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      entry_fee: e.target.value,
                    }))
                  }
                  className="rounded-lg border border-[color:var(--color-granite)]/30 px-3 py-2 text-sm text-[color:var(--color-charcoal-brown)] shadow-inner"
                />
              </label>
              <label className="flex flex-col gap-2 text-sm font-semibold text-[color:var(--color-charcoal-brown)]">
                Registration link
                <input
                  value={formState.registration_link ?? ""}
                  onChange={(e) =>
                    setFormState((prev) => ({
                      ...prev,
                      registration_link: e.target.value,
                    }))
                  }
                  className="rounded-lg border border-[color:var(--color-granite)]/30 px-3 py-2 text-sm text-[color:var(--color-charcoal-brown)] shadow-inner"
                />
              </label>
              <div className="sm:col-span-2 flex gap-3">
                <button
                  type="submit"
                  disabled={busy}
                  className="rounded-full bg-[color:var(--color-imperial-blue)] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[color:var(--color-granite)] disabled:opacity-60"
                >
                  {busy ? "Saving..." : formState.id ? "Update event" : "Create event"}
                </button>
                {formState.id ? (
                  <button
                    type="button"
                    onClick={() => onDelete(formState.id!)}
                    className="rounded-full bg-red-50 px-5 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                    disabled={busy}
                  >
                    Delete
                  </button>
                ) : null}
              </div>
            </form>
          ) : (
            <p className="mt-4 text-sm text-[color:var(--color-granite)]">
              Select “New” to add an event or “Edit” on a row to modify.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}

function toInputValue(value?: string | null) {
  if (!value) return "";
  const dt = new Date(value);
  const tzOffset = dt.getTimezoneOffset() * 60000;
  const local = new Date(dt.getTime() - tzOffset).toISOString().slice(0, 16);
  return local;
}
