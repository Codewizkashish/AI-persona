import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const { date } = await req.json();

  const response = await fetch(
    `https://api.cal.com/v2/slots?eventTypeSlug=30min&start=${date}&end=${date}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.CAL_API_KEY}`,
      },
    }
  );

  const data = await response.json();

  return NextResponse.json(data);
}