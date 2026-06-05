import { ai } from "@/app/lib/gemini";
import { retrieve } from "@/app/lib/retriever";

type RetrievedDocument = {
  content?: string | null;
};

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    const docs = await retrieve(message);

    const context = docs
      .map((doc: RetrievedDocument) => doc.content ?? "")
      .join("\n\n");

    const prompt = `
You are Kashish Nandwani's AI representative.

Rules:

- Answer ONLY from the provided context.
- Never invent information.
- If information is unavailable, say:
  "I don't know based on the information available to me."
- Speak in first person as Kashish.
- Be concise but specific.
- Mention projects, skills, experience and achievements accurately.

CONTEXT:

${context}

QUESTION:

${message}
`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return Response.json({
      answer: response.text,
    });
  } catch (error: unknown) {
  console.error("CHAT ERROR:", error);

  return Response.json(
    {
      error: error instanceof Error ? error.message : String(error),
    },
    {
      status: 500,
    }
  );
}
}
