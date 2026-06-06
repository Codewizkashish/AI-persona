import { retrieve } from "@/app/lib/retriever";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const query =
      body.query ||
      body.message ||
      "";

    if (!query) {
      return Response.json({
        result: "No query provided",
      });
    }

    const docs = await retrieve(query);

    const context = docs
      .map((doc: any) => doc.content)
      .join("\n\n");

    return Response.json({
      result: context,
    });
  } catch (error) {
    console.error("VOICE RAG ERROR:", error);

    return Response.json(
      {
        result: "No information found",
      },
      {
        status: 500,
      }
    );
  }
}