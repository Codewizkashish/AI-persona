import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const {
            start,
            name,
            email,
        } = await req.json();

        const response = await fetch(
            "https://api.cal.com/v2/bookings",
            {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${process.env.CAL_API_KEY}`,
                    "Content-Type": "application/json",
                    "cal-api-version": "2026-02-25"
                },
                body: JSON.stringify({
                    start,
                    eventTypeSlug: "30min",
                    username: "kashish-nandwani-funq0d",
                    attendee: {
                        name,
                        email,
                        timeZone: "Asia/Kolkata",
                    },
                }),
            }
        );

        const data = await response.json();

        console.log("BOOKING CREATED:", data.status);

        return NextResponse.json({
            status: data.status,
        });
    } catch (error) {
        return NextResponse.json(
            { error: "Booking failed" },
            { status: 500 }
        );
    }
}