import type { NextApiRequest, NextApiResponse } from "next";
import { getAuth } from "@clerk/nextjs/server";

import { isAdmin } from "@/lib/auth";
import { getSupabaseClient } from "@/lib/supabaseClient";
import type { Event } from "@/types/events";

type ErrorResponse = { error: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Event | ErrorResponse>,
) {
  if (req.method === "GET") {
    return handleGet(req, res);
  }
  if (req.method === "PUT") {
    return handleUpdate(req, res);
  }
  if (req.method === "DELETE") {
    return handleDelete(req, res);
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).json({ error: "Method not allowed" });
}

async function handleGet(
  req: NextApiRequest,
  res: NextApiResponse<Event | ErrorResponse>,
) {
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

async function handleUpdate(
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

  const id = req.query.id as string;
  const body = req.body as Partial<Event>;

  const { data, error } = await supabase
    .from("events")
    .update(body)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: "Event not found" });
  }

  return res.status(200).json(data);
}

async function handleDelete(
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

  const id = req.query.id as string;

  const { data, error } = await supabase
    .from("events")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  if (!data) {
    return res.status(404).json({ error: "Event not found" });
  }

  return res.status(200).json(data);
}
