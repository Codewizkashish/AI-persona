import { retrieve } from "@/app/lib/retriever";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    console.log(
  "VOICE-RAG BODY:",
  JSON.stringify(body, null, 2)
);

    let query = "";

if (typeof body.query === "string") {
  query = body.query;
} else if (
  body.message?.toolCalls?.[0]?.function?.arguments?.query
) {
  query =
    body.message.toolCalls[0].function.arguments.query;
}

    if (!query) {
  return Response.json({
    results: [
      {
        toolCallId:
          body.message?.toolCalls?.[0]?.id,
        result: "No query provided",
      },
    ],
  });
}

    const docs = await retrieve(query);

    const context = docs
      .map((doc: any) => doc.content)
      .join("\n\n");

    const toolCallId =
  body.message?.toolCalls?.[0]?.id;

return Response.json({
  results: [
    {
      toolCallId,
      result: context,
    },
  ],
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