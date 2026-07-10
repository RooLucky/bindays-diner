"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Bot,
  MessageCircle,
  RefreshCw,
  RotateCcw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  CHATBOT_HISTORY_MAX_MESSAGES,
  CHATBOT_MESSAGE_MAX_LENGTH,
  CHATBOT_SESSION_LIMIT,
} from "@/lib/chatbot-contracts";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  localOnly?: boolean;
};

type Suggestion = {
  id: string;
  question: string;
};

const MESSAGE_STORAGE_KEY = "bindays-diner-chatbot-messages";
const SESSION_STORAGE_KEY = "bindays-diner-chatbot-session";

function createWelcomeMessage(): ChatMessage {
  return {
    id: "welcome",
    role: "assistant",
    content:
      "Hi. Ask me about Bindays Diner's menu, reservations, delivery, promos, or loyalty program.",
    localOnly: true,
  };
}

function isStoredMessage(value: unknown): value is ChatMessage {
  if (!value || typeof value !== "object") {
    return false;
  }

  const message = value as Partial<ChatMessage>;
  return (
    typeof message.id === "string" &&
    (message.role === "user" || message.role === "assistant") &&
    typeof message.content === "string"
  );
}

export function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    createWelcomeMessage(),
  ]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [message, setMessage] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [remaining, setRemaining] = useState(CHATBOT_SESSION_LIMIT);
  const [pending, setPending] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const storedSession = window.sessionStorage.getItem(SESSION_STORAGE_KEY);
    const nextSession = storedSession || crypto.randomUUID();
    window.sessionStorage.setItem(SESSION_STORAGE_KEY, nextSession);
    setSessionId(nextSession);

    try {
      const storedMessages = JSON.parse(
        window.sessionStorage.getItem(MESSAGE_STORAGE_KEY) ?? "[]",
      ) as unknown;

      if (Array.isArray(storedMessages)) {
        const validMessages = storedMessages.filter(isStoredMessage).slice(-30);

        if (validMessages.length > 0) {
          setMessages(validMessages);
          const userMessageCount = validMessages.filter(
            (item) => item.role === "user",
          ).length;
          setRemaining(Math.max(0, CHATBOT_SESSION_LIMIT - userMessageCount));
        }
      }
    } catch {
      window.sessionStorage.removeItem(MESSAGE_STORAGE_KEY);
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.sessionStorage.setItem(MESSAGE_STORAGE_KEY, JSON.stringify(messages));
  }, [hydrated, messages]);

  useEffect(() => {
    void fetch("/api/chatbot/suggestions", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { suggestions?: Suggestion[] };
        setSuggestions(data.suggestions ?? []);
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, pending]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const focusTimer = window.setTimeout(() => inputRef.current?.focus(), 180);
    const closeOnEscape = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    window.addEventListener("keydown", closeOnEscape);
    return () => {
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const history = useMemo(
    () =>
      messages
        .filter((item) => !item.localOnly)
        .slice(-CHATBOT_HISTORY_MAX_MESSAGES)
        .map(({ role, content }) => ({ role, content })),
    [messages],
  );

  async function sendMessage(content: string) {
    const trimmed = content.trim();

    if (!trimmed || pending || !sessionId || remaining <= 0) {
      return;
    }

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: trimmed,
    };
    setMessages((current) => [...current, userMessage]);
    setMessage("");
    setPending(true);

    try {
      const response = await fetch("/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          sessionId,
          history,
        }),
      });
      const data = (await response.json()) as {
        answer?: string;
        error?: string;
        remaining?: number;
      };

      if (!response.ok || !data.answer) {
        if (response.status === 429) {
          setRemaining(0);
        }

        throw new Error(data.error ?? "The chatbot could not answer right now.");
      }

      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.answer ?? "",
        },
      ]);
      setRemaining(
        typeof data.remaining === "number"
          ? data.remaining
          : Math.max(0, remaining - 1),
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "The chatbot could not answer right now.";
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: errorMessage,
          localOnly: true,
        },
      ]);
      toast.error(errorMessage);
    } finally {
      setPending(false);
    }
  }

  function submitMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void sendMessage(message);
  }

  function handleInputKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void sendMessage(message);
    }
  }

  function clearConversation() {
    setMessages([createWelcomeMessage()]);
    setMessage("");
    inputRef.current?.focus();
  }

  const outOfMessages = remaining <= 0;

  return (
    <div className="fixed bottom-4 right-4 z-[60] sm:bottom-6 sm:right-6">
      <AnimatePresence>
        {open ? (
          <motion.section
            key="chatbot-panel"
            role="dialog"
            aria-label="Bindays Diner chatbot"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 18, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 330, damping: 28 }}
            className="fixed inset-x-3 bottom-20 flex h-[min(72dvh,39rem)] flex-col overflow-hidden rounded-lg border border-border bg-background shadow-[var(--shadow-hero-image)] sm:inset-x-auto sm:bottom-24 sm:right-6 sm:w-[25rem]"
          >
            <header className="flex shrink-0 items-center justify-between gap-3 bg-primary px-4 py-3 text-primary-foreground">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary-foreground/15">
                  <Bot className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-serif text-lg">Ask Bindays</p>
                  <p className="truncate text-[11px] font-semibold uppercase opacity-80">
                    Approved answers only
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={clearConversation}
                  className="grid size-8 place-items-center rounded-full transition hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70"
                  title="Clear conversation"
                  aria-label="Clear conversation"
                >
                  <RotateCcw className="size-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="grid size-8 place-items-center rounded-full transition hover:bg-primary-foreground/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/70"
                  title="Close chatbot"
                  aria-label="Close chatbot"
                >
                  <X className="size-4" />
                </button>
              </div>
            </header>

            <div
              ref={scrollRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto bg-muted/25 px-4 py-4"
              aria-live="polite"
            >
              {messages.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={
                    item.role === "user"
                      ? "ml-auto max-w-[84%] rounded-lg bg-primary px-3 py-2.5 text-sm leading-6 text-primary-foreground"
                      : "mr-auto max-w-[88%] rounded-lg border border-border bg-card px-3 py-2.5 text-sm leading-6 text-card-foreground shadow-[var(--shadow-card)]"
                  }
                >
                  {item.content}
                </motion.div>
              ))}

              {messages.length <= 1 && suggestions.length > 0 ? (
                <div className="space-y-2 pt-1">
                  <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase text-muted-foreground">
                    <Sparkles className="size-3.5 text-brand-gold" />
                    Suggested questions
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {suggestions.map((suggestion) => (
                      <button
                        key={suggestion.id}
                        type="button"
                        onClick={() => void sendMessage(suggestion.question)}
                        disabled={pending || outOfMessages}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-left text-xs font-medium leading-5 text-foreground transition hover:border-primary/50 hover:bg-primary/5 disabled:pointer-events-none disabled:opacity-50"
                      >
                        {suggestion.question}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}

              {pending ? (
                <div className="mr-auto flex max-w-[88%] items-center gap-2 rounded-lg border border-border bg-card px-3 py-2.5 text-sm text-muted-foreground">
                  <RefreshCw className="size-4 animate-spin text-primary" />
                  Checking approved answers...
                </div>
              ) : null}
            </div>

            <form className="shrink-0 border-t border-border bg-card p-3" onSubmit={submitMessage}>
              <div className="flex items-end gap-2">
                <textarea
                  ref={inputRef}
                  rows={1}
                  maxLength={CHATBOT_MESSAGE_MAX_LENGTH}
                  value={message}
                  onChange={(event) => setMessage(event.target.value)}
                  onKeyDown={handleInputKeyDown}
                  disabled={pending || outOfMessages}
                  placeholder={outOfMessages ? "Chat limit reached" : "Ask a question"}
                  aria-label="Chatbot question"
                  className="max-h-24 min-h-10 flex-1 resize-none rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/15 disabled:opacity-60"
                />
                <Button
                  type="submit"
                  size="icon-lg"
                  className="rounded-lg"
                  disabled={!message.trim() || pending || outOfMessages || !sessionId}
                  title="Send question"
                  aria-label="Send question"
                >
                  <Send className="size-4" />
                </Button>
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>{message.length}/{CHATBOT_MESSAGE_MAX_LENGTH}</span>
                <span>{remaining} questions remaining</span>
              </div>
            </form>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <motion.div whileHover={{ y: -3 }} whileTap={{ scale: 0.94 }}>
        <Button
          type="button"
          size="icon-lg"
          className="size-14 rounded-full border border-primary-foreground/20 shadow-[var(--shadow-primary-button)]"
          onClick={() => setOpen((current) => !current)}
          aria-expanded={open}
          aria-label={open ? "Close chatbot" : "Open chatbot"}
          title={open ? "Close chatbot" : "Ask Bindays"}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : "message"}
              initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
              className="grid place-items-center"
            >
              {open ? <X className="size-5" /> : <MessageCircle className="size-5" />}
            </motion.span>
          </AnimatePresence>
        </Button>
      </motion.div>
    </div>
  );
}
