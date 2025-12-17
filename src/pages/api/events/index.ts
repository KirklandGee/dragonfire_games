import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

import { isAdmin } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Event } from "@/types/events";

type ErrorResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Event[] | Event | ErrorResponse>,
) {
  if (req.method === "GET") {
    return handleList(req, res);
  }
  if (req.method === "POST") {
    return handleCreate(req, res);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleList(
  req: NextApiRequest,
  res: NextApiResponse<Event[] | ErrorResponse>,
) {
  const supabase = getSupabaseClient("anon");
  if (!supabase) {
    return res.status(500).json({
      error:
        "Supabase client not configured. Ensure SUPABASE_URL and anon key are set.",
    });
  }

  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from("events")
    .select("*")
    .gte("start_datetime", now)
    .order("start_datetime", { ascending: true });

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(200).json(data ?? []);
}

async function handleCreate(
  req: NextApiRequest,
  res: NextApiResponse<Event | ErrorResponse>,
) {
  const { userId } = getAuth(req);
  if (!isAdmin(userId)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const supabase = getSupabaseClient("service");
  if (!supabase) {
    return res.status(500).json({
      error:
        "Supabase client not configured. Ensure SUPABASE_URL and service/secret key are set.",
    });
  }

  const body = req.body as Partial<Event>;
  const payload = {
    ...body,
    id: body.id ?? crypto.randomUUID(),
  };

  const { data, error } = await supabase
    .from("events")
    .upsert(payload)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  return res.status(201).json(data);
}
