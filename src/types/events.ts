export type EventType = "weekly" | "one-time" | "tournament";

export interface Event {
  id: string;
  title: string;
  description?: string | null;
  start_datetime: string;
  end_datetime?: string | null;
  event_type: EventType;
  game_tags: string[] | null;
  entry_fee?: string | null;
  registration_link?: string | null;
  image_url?: string | null;
  created_at?: string;
}
