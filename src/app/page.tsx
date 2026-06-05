"use client";

import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowDownToLine,
  Copy,
  LoaderCircle,
  Mic,
  MicOff,
  Menu,
  PhoneCall,
  RefreshCw,
  Send,
  X,
} from "lucide-react";
import {
  FormEvent,
  KeyboardEvent,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { vapi } from "./lib/vapi";

type Role = "user" | "assistant";
type VoiceState = "idle" | "listening" | "speaking";

type Message = {
  id: string;
  role: Role;
  content: string;
  timestamp: Date;
};

const suggestedQuestions = [
  "Tell me about Kashish",
  "Show projects",
  "Skills",
  "Experience",
  "Achievements",
  "Why should we hire you?",
];

const stats = [
  "IIIT Sonepat",
  "B.Tech IT",
  "AI+FullStack Developer",
  "2+ years experience",
];

const recruiterLinks = [
  { label: "Resume", href: "https://kashish-nandwani-portfolio.vercel.app" },
  { label: "GitHub", href: "https://github.com/Codewizkashish" },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/in/kashish-nandwani-284872291",
  },
];

const examplePrompts = [
  "Projects",
  "Skills",
  "Experience",
  "Achievements",
  "Education",
];

function formatTime(date: Date) {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function renderInline(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);

  return parts.map((part, index) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${part}-${index}`} className="font-semibold text-zinc-50">
          {part.slice(2, -2)}
        </strong>
      );
    }

    return <span key={`${part}-${index}`}>{part}</span>;
  });
}

function MarkdownMessage({ content }: { content: string }) {
  const blocks = content.split(/\n{2,}/).filter(Boolean);

  return (
    <div className="space-y-3 text-sm leading-7 text-zinc-200 sm:text-[15px]">
      {blocks.map((block, index) => {
        const lines = block.split("\n").filter(Boolean);
        const isList = lines.every((line) => /^[-*]\s+/.test(line.trim()));

        if (isList) {
          return (
            <ul key={`${block}-${index}`} className="space-y-2 pl-4">
              {lines.map((line, lineIndex) => (
                <li
                  key={`${line}-${lineIndex}`}
                  className="list-disc pl-1 marker:text-cyan-300"
                >
                  {renderInline(line.replace(/^[-*]\s+/, ""))}
                </li>
              ))}
            </ul>
          );
        }

        return (
          <p key={`${block}-${index}`} className="whitespace-pre-wrap">
            {renderInline(block)}
          </p>
        );
      })}
    </div>
  );
}

function PersonaAvatar({
  active = false,
  compact = false,
}: {
  active?: boolean;
  compact?: boolean;
}) {
  return (
    <motion.div
      className={cx(
        "relative grid shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-500 via-fuchsia-500 to-cyan-400 p-[2px]",
        compact ? "size-10" : "size-20",
      )}
      animate={{ y: compact ? [0, -2, 0] : [0, -7, 0] }}
      transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
    >
      <motion.div
        className="absolute inset-0 rounded-full bg-violet-500/35 blur-xl"
        animate={{
          opacity: active ? [0.55, 0.95, 0.55] : [0.25, 0.45, 0.25],
          scale: active ? [1, 1.18, 1] : [1, 1.08, 1],
        }}
        transition={{
          duration: active ? 1.4 : 2.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <div className="relative grid size-full place-items-center rounded-full bg-zinc-950 text-zinc-50 shadow-2xl shadow-violet-950/50">
        <span
          className={cx(
            "font-semibold tracking-tight",
            compact ? "text-sm" : "text-2xl",
          )}
        >
          KN
        </span>
        <motion.span
          className="absolute bottom-1.5 right-1.5 size-3 rounded-full border border-zinc-950 bg-emerald-400"
          animate={{ scale: active ? [1, 1.35, 1] : 1 }}
          transition={{ duration: 1, repeat: Infinity }}
        />
      </div>
    </motion.div>
  );
}

function Sidebar({
  onAsk,
  isOpen,
  onClose,
}: {
  onAsk: (question: string) => void;
  isOpen: boolean;
  onClose: () => void;
}) {
  const sidebar = (
    <motion.aside
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -24, opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      className="flex h-full w-[19rem] flex-col border-r border-white/10 bg-zinc-950/75 px-5 py-5 shadow-2xl shadow-black/30 backdrop-blur-2xl"
    >
      <div className="flex items-start justify-between gap-4 lg:hidden">
        <div className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
          Persona
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid size-9 place-items-center rounded-full border border-white/10 text-zinc-300 transition hover:border-white/20 hover:bg-white/10"
          aria-label="Close sidebar"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>

      <div className="mt-2 flex flex-col items-center text-center lg:mt-0">
        <PersonaAvatar />
        <h1 className="mt-5 text-xl font-semibold text-white">
          Kashish Nandwani
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          AI Engineer | Full Stack Developer
        </p>
      </div>

      <div className="mt-7 grid grid-cols-2 gap-2">
        {stats.map((stat) => (
          <motion.div
            key={stat}
            whileHover={{ y: -2 }}
            className="rounded-lg border border-white/10 bg-white/[0.045] px-3 py-3 text-xs font-medium text-zinc-200 shadow-inner shadow-white/5"
          >
            {stat}
          </motion.div>
        ))}
      </div>

      <div className="mt-8">
        <div className="mb-3 text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
          Suggested Questions
        </div>
        <div className="space-y-2">
          {suggestedQuestions.map((question) => (
            <motion.button
              key={question}
              type="button"
              whileHover={{ x: 3 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                onAsk(question);
                onClose();
              }}
              className="group flex w-full items-center justify-between rounded-lg border border-white/10 bg-white/[0.035] px-3 py-2.5 text-left text-sm text-zinc-300 transition hover:border-violet-400/35 hover:bg-violet-500/10 hover:text-white"
            >
              <span>{question}</span>
              <span className="text-zinc-600 transition group-hover:text-cyan-300">
                -&gt;
              </span>
            </motion.button>
          ))}
        </div>
      </div>

      <div className="mt-auto rounded-lg border border-emerald-400/15 bg-emerald-400/[0.06] p-4">
        <div className="text-sm font-medium text-emerald-200">
          Available for recruiter chats
        </div>
        <p className="mt-1 text-xs leading-5 text-zinc-400">
          Ask about projects, technical depth, education, achievements, or fit
          for AI/full-stack roles.
        </p>
      </div>
    </motion.aside>
  );

  return (
    <>
      <div className="hidden lg:block">{sidebar}</div>
      <AnimatePresence>
        {isOpen ? (
          <motion.div
            className="fixed inset-0 z-50 lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button
              type="button"
              aria-label="Close sidebar overlay"
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
              onClick={onClose}
            />
            <div className="relative h-full">{sidebar}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}

function RecruiterActions() {
  return (
    <div className="flex items-center gap-2">
      {recruiterLinks.map((link) => (
        <motion.a
          key={link.label}
          href={link.href}
          target={link.href.startsWith("http") ? "_blank" : undefined}
          rel={link.href.startsWith("http") ? "noreferrer" : undefined}
          whileHover={{ y: -2 }}
          whileTap={{ scale: 0.98 }}
          className="rounded-full border border-white/10 bg-white/[0.055] px-3 py-2 text-xs font-medium text-zinc-200 backdrop-blur transition hover:border-white/20 hover:bg-white/10 hover:text-white sm:px-4"
        >
          {link.label}
        </motion.a>
      ))}
    </div>
  );
}

function VoiceStatus({ voiceState }: { voiceState: VoiceState }) {
  if (voiceState === "idle") return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="mb-3 flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm text-zinc-200 shadow-2xl shadow-black/30 backdrop-blur-xl"
    >
      {voiceState === "listening" ? (
        <>
          <motion.span
            className="grid size-6 place-items-center rounded-full bg-cyan-400/15 text-cyan-200"
            animate={{ scale: [1, 1.15, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
          >
            <Mic className="size-3.5" aria-hidden="true" />
          </motion.span>
          <span>Listening...</span>
        </>
      ) : (
        <>
          <div className="flex h-6 items-center gap-1">
            {[0, 1, 2].map((bar) => (
              <motion.span
                key={bar}
                className="w-1 rounded-full bg-emerald-300"
                animate={{ height: [8, 20, 8] }}
                transition={{
                  delay: bar * 0.12,
                  duration: 0.75,
                  repeat: Infinity,
                }}
              />
            ))}
          </div>
          <span>Speaking...</span>
        </>
      )}
    </motion.div>
  );
}

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-start gap-3"
    >
      <PersonaAvatar compact active />
      <div className="rounded-2xl border border-white/10 bg-white/[0.055] px-4 py-3 shadow-2xl shadow-black/20 backdrop-blur-xl">
        <div className="mb-2 text-xs font-medium text-zinc-400">
          Thinking...
        </div>
        <div className="flex gap-1.5">
          {[0, 1, 2].map((dot) => (
            <motion.span
              key={dot}
              className="size-2 rounded-full bg-violet-300"
              animate={{ y: [0, -5, 0], opacity: [0.4, 1, 0.4] }}
              transition={{
                delay: dot * 0.14,
                duration: 0.8,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

function MessageBubble({
  message,
  onCopy,
  onRegenerate,
}: {
  message: Message;
  onCopy: (content: string) => void;
  onRegenerate: () => void;
}) {
  const isUser = message.role === "user";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 18, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.26, ease: "easeOut" }}
      className={cx("flex gap-3", isUser ? "justify-end" : "justify-start")}
    >
      {!isUser ? <PersonaAvatar compact /> : null}
      <div
        className={cx("max-w-[88%] sm:max-w-[78%]", isUser ? "order-1" : "")}
      >
        <div
          className={cx(
            "rounded-2xl px-4 py-3 shadow-2xl",
            isUser
              ? "bg-gradient-to-br from-violet-600 to-fuchsia-600 text-white shadow-violet-950/25"
              : "border border-white/10 bg-white/[0.06] text-zinc-100 shadow-black/25 backdrop-blur-xl",
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap text-sm leading-6 sm:text-[15px]">
              {message.content}
            </p>
          ) : (
            <MarkdownMessage content={message.content} />
          )}
        </div>
        <div
          className={cx(
            "mt-2 flex items-center gap-2 text-xs text-zinc-500",
            isUser ? "justify-end" : "justify-start",
          )}
        >
          <span>{formatTime(message.timestamp)}</span>
          {!isUser ? (
            <>
              <button
                type="button"
                onClick={() => onCopy(message.content)}
                className="rounded-full px-2 py-1 transition hover:bg-white/10 hover:text-zinc-200"
                aria-label="Copy response"
              >
                <Copy className="size-3.5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={onRegenerate}
                className="rounded-full px-2 py-1 transition hover:bg-white/10 hover:text-zinc-200"
                aria-label="Regenerate response"
              >
                <RefreshCw className="size-3.5" aria-hidden="true" />
              </button>
            </>
          ) : null}
        </div>
      </div>
    </motion.div>
  );
}

function WelcomeHero({ onAsk }: { onAsk: (prompt: string) => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: "easeOut" }}
      className="mx-auto flex min-h-[58vh] max-w-3xl flex-col items-center justify-center px-5 text-center"
    >
      <PersonaAvatar active />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12, duration: 0.4 }}
        className="mt-7"
      >
        <div className="mb-4 inline-flex rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-cyan-200 backdrop-blur">
          AI Persona Portfolio
        </div>
        <h2 className="text-balance text-4xl font-semibold tracking-tight text-white sm:text-6xl">
          Ask anything about Kashish
        </h2>
        <p className="mx-auto mt-5 max-w-xl text-base leading-7 text-zinc-400 sm:text-lg">
          Projects, skills, experience, achievements, education, and why Kashish
          is a strong fit for AI and full-stack roles.
        </p>
      </motion.div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {examplePrompts.map((prompt, index) => (
          <motion.button
            key={prompt}
            type="button"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + index * 0.05 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onAsk(prompt)}
            className="rounded-full border border-white/10 bg-white/[0.055] px-4 py-2 text-sm text-zinc-200 backdrop-blur transition hover:border-violet-400/40 hover:bg-violet-500/10 hover:text-white"
          >
            {prompt}
          </motion.button>
        ))}
      </div>
    </motion.div>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
  vapi.on("call-start", () => {
    console.log("call started");
    setVoiceState("speaking");
  });

  vapi.on("call-end", () => {
    console.log("call ended");
    setVoiceState("idle");
  });

  return () => {
    vapi.removeAllListeners?.();
  };
}, []);

  const lastUserMessage = useMemo(
    () => [...messages].reverse().find((message) => message.role === "user"),
    [messages],
  );

  const scrollToBottom = (behavior: ScrollBehavior = "smooth") => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior,
    });
  };

  useEffect(() => {
    scrollToBottom("smooth");
  }, [messages, isLoading]);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const onScroll = () => {
      const distanceFromBottom =
        container.scrollHeight - container.scrollTop - container.clientHeight;
      setShowScrollButton(distanceFromBottom > 220);
    };

    container.addEventListener("scroll", onScroll);
    return () => container.removeEventListener("scroll", onScroll);
  }, []);

  const sendMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
      timestamp: new Date(),
    };

    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);
    setVoiceState("speaking");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.error || "The AI persona could not answer right now.",
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            data.answer ||
            "I don't know based on the information available to me.",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong while contacting Kashish's AI persona.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setVoiceState("idle");
      inputRef.current?.focus();
    }
  };

  const fetchAssistantReply = async (text: string) => {
    if (!text.trim() || isLoading) return;

    setIsLoading(true);
    setVoiceState("speaking");

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(
          data?.error || "The AI persona could not answer right now.",
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            data.answer ||
            "I don't know based on the information available to me.",
          timestamp: new Date(),
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong while contacting Kashish's AI persona.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
      setVoiceState("idle");
      inputRef.current?.focus();
    }
  };

  const regenerate = async () => {
    if (!lastUserMessage || isLoading) return;
    setMessages((current) => {
      const lastAssistantIndex = current.findLastIndex(
        (message) => message.role === "assistant",
      );
      if (lastAssistantIndex === -1) return current;
      return current.filter((_, index) => index !== lastAssistantIndex);
    });
    await fetchAssistantReply(lastUserMessage.content);
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input);
    }
  };

  const toggleListening = () => {
    setVoiceState((current) =>
      current === "listening" ? "idle" : "listening",
    );
  };

  return (
    <main className="relative flex h-dvh overflow-hidden bg-[#09090B] text-zinc-100">
      <div className="persona-background" aria-hidden="true" />
      <Sidebar
        onAsk={sendMessage}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <section className="relative z-10 flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-white/10 bg-zinc-950/55 px-4 backdrop-blur-2xl sm:px-6">
          <div className="flex items-center gap-3">
              <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="grid size-10 place-items-center rounded-full border border-white/10 bg-white/[0.045] text-zinc-200 transition hover:bg-white/10 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu className="size-4" aria-hidden="true" />
            </button>
            <div>
              <div className="text-sm font-semibold text-white">Kashish AI</div>
              <div className="text-xs text-zinc-500">
                Recruiter-facing persona assistant
              </div>
            </div>
          </div>
          <RecruiterActions />
        </header>

        <div
          ref={scrollRef}
          className="relative flex-1 overflow-y-auto px-4 pb-36 pt-6 sm:px-6 lg:px-10"
        >
          <AnimatePresence mode="popLayout">
            {messages.length === 0 ? (
              <WelcomeHero key="welcome" onAsk={sendMessage} />
            ) : (
              <motion.div
                key="messages"
                className="mx-auto flex max-w-4xl flex-col gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                {messages.map((message) => (
                  <MessageBubble
                    key={message.id}
                    message={message}
                    onCopy={(content) =>
                      navigator.clipboard?.writeText(content)
                    }
                    onRegenerate={regenerate}
                  />
                ))}
                {isLoading ? <TypingIndicator /> : null}
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showScrollButton ? (
              <motion.button
                type="button"
                onClick={() => scrollToBottom("smooth")}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 12 }}
                className="fixed bottom-32 right-5 z-20 rounded-full border border-white/10 bg-zinc-900/85 px-4 py-2 text-sm text-zinc-200 shadow-2xl shadow-black/40 backdrop-blur transition hover:bg-zinc-800"
                aria-label="Scroll to bottom"
              >
                <ArrowDownToLine className="size-4" aria-hidden="true" />
              </motion.button>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-[#09090B] via-[#09090B]/96 to-transparent px-4 pb-4 pt-12 sm:px-6 lg:px-10">
          <div className="pointer-events-auto mx-auto max-w-4xl">
            <AnimatePresence>
              <VoiceStatus voiceState={voiceState} />
            </AnimatePresence>
            <motion.form
              onSubmit={handleSubmit}
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35 }}
              className="rounded-2xl border border-white/10 bg-zinc-950/80 p-2 shadow-2xl shadow-black/40 backdrop-blur-2xl focus-within:border-violet-400/45"
            >
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                  placeholder="Ask about Kashish's projects, skills, achievements..."
                  className="max-h-32 min-h-12 flex-1 resize-none bg-transparent px-3 py-3 text-sm leading-6 text-zinc-100 outline-none placeholder:text-zinc-600 sm:text-[15px]"
                />
                <motion.button
                  type="button"
                  onClick={toggleListening}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className={cx(
                    "grid size-11 shrink-0 place-items-center rounded-xl border transition",
                    voiceState === "listening"
                      ? "border-cyan-300/45 bg-cyan-400/15 text-cyan-100"
                      : "border-white/10 bg-white/[0.055] text-zinc-300 hover:bg-white/10",
                  )}
                  aria-label={
                    voiceState === "listening" ? "Stop listening" : "Start listening"
                  }
                >
                  {voiceState === "listening" ? (
                    <MicOff className="size-4" aria-hidden="true" />
                  ) : (
                    <Mic className="size-4" aria-hidden="true" />
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={async () => {
                    try {
                      if (voiceState === "speaking") {
                        vapi.stop();
                        setVoiceState("idle");
                      } else {
                        setVoiceState("speaking");

                        await vapi.start(
                          process.env.NEXT_PUBLIC_VAPI_ASSISTANT_ID!,
                        );
                      }
                    } catch (err) {
                      console.error(err);
                      setVoiceState("idle");
                    }
                  }}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="grid size-11 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.055] text-xs font-semibold text-zinc-300 transition hover:bg-white/10"
                  aria-label={voiceState === "speaking" ? "End call" : "Start call"}
                >
                  <PhoneCall className="size-4" aria-hidden="true" />
                </motion.button>
                <motion.button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  whileHover={{ y: input.trim() && !isLoading ? -2 : 0 }}
                  whileTap={{ scale: input.trim() && !isLoading ? 0.96 : 1 }}
                  className="grid size-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-950/35 transition disabled:cursor-not-allowed disabled:opacity-40"
                  aria-label="Send message"
                >
                  {isLoading ? (
                    <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Send className="size-4" aria-hidden="true" />
                  )}
                </motion.button>
              </div>
            </motion.form>
          </div>
        </div>
      </section>
    </main>
  );
}
