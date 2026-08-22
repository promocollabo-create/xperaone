import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { emailLogs } from "@/db/schema";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    if (!email || typeof email !== "string" || !/^\S+@\S+\.\S+$/.test(email)) {
      return NextResponse.json({ error: "Please enter a valid email address." }, { status: 400 });
    }
    await db.insert(emailLogs).values({
      toEmail: email,
      subject: "Newsletter Signup",
      body: "Subscribed to XperaOne newsletter.",
      status: "subscribed",
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Something went wrong." }, { status: 500 });
  }
}
