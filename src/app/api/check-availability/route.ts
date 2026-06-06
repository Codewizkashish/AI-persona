import { NextResponse } from "next/server";

const CAL_USERNAME = process.env.CAL_USERNAME ?? "kashish-nandwani-funq0d";
const CAL_EVENT_TYPE_SLUG = process.env.CAL_EVENT_TYPE_SLUG ?? "30min";
const CAL_API_VERSION = "2024-09-04";
const DEFAULT_TIME_ZONE = "Asia/Kolkata";

type SlotRange = {
  start?: string;
  end?: string;
};

function flattenSlots(data: unknown): SlotRange[] {
  if (!data || typeof data !== "object") {
    return [];
  }

  return Object.values(data as Record<string, unknown>).flatMap((value) => {
    if (!Array.isArray(value)) {
      return [];
    }

    return value
      .map((slot): SlotRange | null => {
        if (!slot || typeof slot !== "object") {
          return null;
        }

        const candidate = slot as SlotRange;
        return typeof candidate.start === "string" ? candidate : null;
      })
      .filter((slot): slot is SlotRange => Boolean(slot?.start));
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const date = typeof body.date === "string" ? body.date.trim() : "";
    const timeZone =
      typeof body.timeZone === "string" && body.timeZone.trim()
        ? body.timeZone.trim()
        : DEFAULT_TIME_ZONE;

    if (!date) {
      return NextResponse.json(
        { error: "A booking date is required." },
        { status: 400 },
      );
    }

    if (!process.env.CAL_API_KEY) {
      return NextResponse.json(
        { error: "Cal API key is not configured." },
        { status: 500 },
      );
    }

    const url = new URL("https://api.cal.com/v2/slots");
    url.searchParams.set("eventTypeSlug", CAL_EVENT_TYPE_SLUG);
    url.searchParams.set("username", CAL_USERNAME);
    url.searchParams.set("start", date);
    url.searchParams.set("end", date);
    url.searchParams.set("format", "range");
    url.searchParams.set("timeZone", timeZone);

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${process.env.CAL_API_KEY}`,
        "cal-api-version": CAL_API_VERSION,
      },
    });

    const data = await response.json();

    if (!response.ok || data?.status === "error") {
      return NextResponse.json(
        {
          error:
            data?.message ||
            data?.error?.message ||
            "Unable to load availability.",
        },
        { status: response.status || 502 },
      );
    }

    return NextResponse.json({
      status: data?.status ?? "success",
      date,
      timeZone,
      slots: flattenSlots(data?.data),
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Unable to load availability.",
      },
      { status: 500 },
    );
  }
}
