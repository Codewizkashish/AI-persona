import { NextResponse } from "next/server";

const CAL_USERNAME = process.env.CAL_USERNAME ?? "kashish-nandwani-funq0d";
const CAL_EVENT_TYPE_SLUG = process.env.CAL_EVENT_TYPE_SLUG ?? "30min";
const CAL_API_VERSION = "2026-02-25";
const DEFAULT_TIME_ZONE = "Asia/Kolkata";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const start = typeof body.start === "string" ? body.start.trim() : "";
        const name = typeof body.name === "string" ? body.name.trim() : "";
        const email = typeof body.email === "string" ? body.email.trim() : "";
        const timeZone =
            typeof body.timeZone === "string" && body.timeZone.trim()
                ? body.timeZone.trim()
                : DEFAULT_TIME_ZONE;

        if (!start || !name || !email) {
            return NextResponse.json(
                {
                    error: "Start time, name, and email are required.",
                },
                { status: 400 },
            );
        }

        if (!process.env.CAL_API_KEY) {
            return NextResponse.json(
                {
                    error: "Cal API key is not configured.",
                },
                { status: 500 },
            );
        }

        const response = await fetch(
            "https://api.cal.com/v2/bookings",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.CAL_API_KEY}`,
                    "Content-Type": "application/json",
                    "cal-api-version": CAL_API_VERSION,
                },
                body: JSON.stringify({
                    start,
                    eventTypeSlug: CAL_EVENT_TYPE_SLUG,
                    username: CAL_USERNAME,
                    attendee: {
                        name,
                        email,
                        timeZone,
                    },
                }),
            }
        );

        const data = await response.json();

        if (!response.ok || data?.status === "error") {
            return NextResponse.json(
                {
                    error:
                        data?.message ||
                        data?.error?.message ||
                        "Booking failed",
                },
                { status: response.status || 502 },
            );
        }

        return NextResponse.json({
            status: data.status ?? "success",
            booking: data.data ?? null,
            bookingUid: data.data?.uid ?? null,
            start: data.data?.start ?? null,
            end: data.data?.end ?? null,
        });
    } catch (error) {
        return NextResponse.json(
            {
                error:
                    error instanceof Error ? error.message : "Booking failed",
            },
            { status: 500 }
        );
    }
}
