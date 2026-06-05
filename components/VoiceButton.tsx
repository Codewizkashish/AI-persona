"use client";

import { useState } from "react";
import Vapi from "@vapi-ai/web";

const vapi = new Vapi(
  process.env.NEXT_PUBLIC_VAPI_PUBLIC_KEY!
);

export default function VoiceButton() {
  const [active, setActive] = useState(false);

  const startCall = async () => {
    setActive(true);

    await vapi.start(
      process.env
        .NEXT_PUBLIC_VAPI_ASSISTANT_ID!
    );
  };

  const stopCall = () => {
    vapi.stop();
    setActive(false);
  };

  return (
    <>
      {!active ? (
        <button
          onClick={startCall}
          className="px-4 py-2 rounded-xl bg-violet-600"
        >
          📞 Talk to Kashish AI
        </button>
      ) : (
        <button
          onClick={stopCall}
          className="px-4 py-2 rounded-xl bg-red-500"
        >
          End Call
        </button>
      )}
    </>
  );
}