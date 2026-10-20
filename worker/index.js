const ALLOWED_ORIGIN = "https://crytalss.xyz";
const MESSAGE_MAX_LENGTH = 1983;
const RATE_LIMIT_WINDOW_MS = 30_000;
const recentSubmissions = new Map();

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin"
  };
}

function jsonResponse(body, status, origin) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders(origin),
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store"
    }
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin");
    if (origin !== ALLOWED_ORIGIN) {
      return new Response("Forbidden", { status: 403 });
    }

    if (request.method === "OPTIONS") {
      return new Response(null, { status: 204, headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return jsonResponse({ error: "Method not allowed" }, 405, origin);
    }

    let submission;
    try {
      submission = await request.json();
    } catch {
      return jsonResponse({ error: "Invalid JSON" }, 400, origin);
    }

    if (typeof submission.website === "string" && submission.website.trim()) {
      return jsonResponse({ ok: true }, 200, origin);
    }

    const message = typeof submission.message === "string" ? submission.message.trim() : "";
    if (!message || message.length > MESSAGE_MAX_LENGTH) {
      return jsonResponse({ error: `Message must be between 1 and ${MESSAGE_MAX_LENGTH} characters` }, 400, origin);
    }

    const clientIp = request.headers.get("CF-Connecting-IP");
    if (!clientIp) {
      return jsonResponse({ error: "Unable to verify request" }, 400, origin);
    }
    const now = Date.now();
    const previousSubmission = recentSubmissions.get(clientIp);
    if (previousSubmission && now - previousSubmission < RATE_LIMIT_WINDOW_MS) {
      return jsonResponse({ error: "Please wait before sending another message" }, 429, origin);
    }
    recentSubmissions.set(clientIp, now);
    for (const [ip, timestamp] of recentSubmissions) {
      if (now - timestamp >= RATE_LIMIT_WINDOW_MS) recentSubmissions.delete(ip);
    }

    if (!env.DISCORD_WEBHOOK_URL) {
      return jsonResponse({ error: "Message service is not configured" }, 503, origin);
    }

    const discordResponse = await fetch(env.DISCORD_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        content: `Website message:\n${message}`,
        allowed_mentions: { parse: [] }
      })
    });
    if (!discordResponse.ok) {
      console.error("Discord webhook returned HTTP", discordResponse.status);
      return jsonResponse({ error: "Message delivery failed" }, 502, origin);
    }

    return jsonResponse({ ok: true }, 200, origin);
  }
};
