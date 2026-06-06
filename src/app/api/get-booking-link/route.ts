import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    bookingLink: "https://cal.com/kashish-nandwani-funq0d/30min"
  });
}