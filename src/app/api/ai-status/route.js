import { NextResponse } from "next/server";

/**
 * GET /api/ai-status
 *
 * Lets the admin app (and anyone) check whether the Gemini AI deposit
 * verification is configured. Returns whether GEMINI_API_KEY is present.
 *
 * The key itself is NEVER exposed — only a boolean flag.
 */
export async function GET() {
  return NextResponse.json({
    configured: !!process.env.GEMINI_API_KEY,
  });
}
