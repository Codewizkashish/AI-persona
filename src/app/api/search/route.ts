export async function GET() {
  const response = await fetch(
    "http://localhost:3000/api/chat",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message:
          "Why are you a good fit for Scaler's AI Engineer Internship?"
      }),
    }
  );

  const data = await response.json();

  return Response.json(data);
}