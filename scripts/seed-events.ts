import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Event } from "@/types/events";

const sampleEvents: Event[] = [
  {
    id: "weekly-fnm-standard",
    title: "Friday Night Magic – Standard",
    description:
      "Weekly Standard format. Friendly pods, new players welcome. Prize packs for top finishers.",
    start_datetime: nextUpcoming("Friday", 19, 0),
    end_datetime: nextUpcoming("Friday", 22, 0),
    event_type: "weekly",
    game_tags: ["Magic: The Gathering"],
    entry_fee: "$10",
    registration_link: null,
    image_url: null,
  },
  {
    id: "weekly-commander",
    title: "Commander Casual Night",
    description:
      "Low-pressure Commander pods. Bring a deck or borrow a shop precon. Focus on inclusive play.",
    start_datetime: nextUpcoming("Wednesday", 18, 30),
    end_datetime: nextUpcoming("Wednesday", 21, 30),
    event_type: "weekly",
    game_tags: ["Magic: The Gathering"],
    entry_fee: "$5",
    registration_link: null,
    image_url: null,
  },
  {
    id: "pokemon-league",
    title: "Pokémon League Night",
    description:
      "Weekly Pokémon TCG play. Great for juniors and casual play. Bring a standard-legal deck.",
    start_datetime: nextUpcoming("Saturday", 13, 0),
    end_datetime: nextUpcoming("Saturday", 15, 0),
    event_type: "weekly",
    game_tags: ["Pokémon TCG"],
    entry_fee: "$5",
    registration_link: null,
    image_url: null,
  },
  {
    id: "oneoff-mtg-pre-release",
    title: "MTG Pre-release: Emberfall",
    description:
      "Sealed deck pre-release for the Emberfall set. 4 rounds, prize support for all participants.",
    start_datetime: isoDateFromNow(7, 18, 30),
    end_datetime: isoDateFromNow(7, 22, 0),
    event_type: "one-time",
    game_tags: ["Magic: The Gathering"],
    entry_fee: "$35",
    registration_link: "https://example.com/register/emberfall-pre",
    image_url: null,
  },
  {
    id: "tournament-pkmn",
    title: "Pokémon Store Championship",
    description:
      "Swiss rounds with cut to top 8. Bring a standard-legal deck and decklist. Judges on site.",
    start_datetime: isoDateFromNow(14, 12, 0),
    end_datetime: isoDateFromNow(14, 17, 0),
    event_type: "tournament",
    game_tags: ["Pokémon TCG"],
    entry_fee: "$20",
    registration_link: "https://example.com/register/pkmn-champs",
    image_url: null,
  },
];

function nextUpcoming(weekday: Intl.DateTimeFormatOptions["weekday"], hour: number, minute: number) {
  const now = new Date();
  const target = new Date(now);
  target.setHours(hour, minute, 0, 0);

  const currentWeekday = target.toLocaleDateString("en-US", { weekday: "long" });
  const weekdayIndex = getWeekdayIndex(weekday);
  const currentIndex = getWeekdayIndex(currentWeekday);

  let delta = weekdayIndex - currentIndex;
  if (delta < 0 || (delta === 0 && target <= now)) {
    delta += 7;
  }

  target.setDate(target.getDate() + delta);
  return target.toISOString();
}

function isoDateFromNow(daysFromNow: number, hour: number, minute: number) {
  const now = new Date();
  const d = new Date(now);
  d.setDate(now.getDate() + daysFromNow);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
}

function getWeekdayIndex(weekday: Intl.DateTimeFormatOptions["weekday"]) {
  const order = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  return order.findIndex((day) => day.toLowerCase() === String(weekday).toLowerCase());
}

async function run() {
  const supabase = getSupabaseClient("service");

  if (!supabase) {
    console.error(
      "Supabase not configured. Ensure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in .env.local"
    );
    process.exit(1);
  }

  const { error } = await supabase.from("events").upsert(sampleEvents, {
    onConflict: "id",
  });

  if (error) {
    console.error("Seed failed:", error.message);
    process.exit(1);
  }

  console.log(`Seeded ${sampleEvents.length} events.`);
}

run();
