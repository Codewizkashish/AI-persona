import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { date } = await req.json();

  const response = await fetch(
    `https://api.cal.com/v2/slots?eventTypeSlug=30min&username=kashish-nandwani-funq0d&start=${date}&end=${date}&format=range`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CAL_API_KEY}`,
        "cal-api-version": "2024-09-04",
      },
    }
  );

  const data = await response.json();

  return NextResponse.json(data);
}