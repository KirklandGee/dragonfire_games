import type { NextApiRequest, NextApiResponse } from "next";

import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Event } from "@/types/events";

type ErrorResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Event | ErrorResponse>,
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const supabase = getSupabaseClient("anon");
  if (!supabase) {
    return res.status(500).json({
      error:
        "Supabase client not configured. Ensure SUPABASE_URL and anon key are set.",
    });
  }

  const id = req.query.id as string;

  const { data, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: "Event not found" });
  }

  return res.status(200).json(data);
}
