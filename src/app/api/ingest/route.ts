import { ingestDocuments } from "@/app/lib/ingest";

export async function GET() {
  try {
    await ingestDocuments();

    return Response.json({
      success: true,
    });
  } catch (err) {
    console.error(err);

    return Response.json(
      {
        success: false,
      },
      { status: 500 }
    );
  }
}