import { useEffect, useRef, useState, type FormEvent } from "react";
import { sendChatMessage, getAiInsights } from "../api/ai";
import { extractErrorMessage } from "../api/client";
import type { ChatMessage } from "../types/ai";
import Header from "../components/Header";

const EXAMPLE_QUESTIONS = [
  "Where am I spending the most?",
  "How much did I spend this month?",
  "Why did my expenses increase?",
  "What was my highest spending category?",
  "How much did I save this month?",
  "Which categories should I reduce?",
];

function AiAssistant() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [insights, setInsights] = useState<string[] | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsError, setInsightsError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchInsights = async () => {
    setInsightsLoading(true);
    setInsightsError(null);
    try {
      const data = await getAiInsights();
      setInsights(data.insights);
    } catch (err) {
      setInsightsError(
        extractErrorMessage(err, "Unable to generate insights right now."),
      );
      setInsights(null);
    } finally {
      setInsightsLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const send = async (message: string) => {
    if (!message.trim() || sending) return;
    setMessages((prev) => [...prev, { role: "user", content: message }]);
    setInput("");
    setSending(true);
    try {
      const { response } = await sendChatMessage(message);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: response },
      ]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: extractErrorMessage(
            err,
            "The AI assistant is currently unavailable. Please try again shortly.",
          ),
        },
      ]);
    } finally {
      setSending(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    send(input);
  };

  return (
    <div className="min-h-screen bg-paper">
      <Header />

      <main className="max-w-5xl mx-auto px-6 py-8 flex flex-col gap-6">
        <div>
          <h1 className="font-display font-semibold text-xl text-ink mb-1">
            AI Assistant
          </h1>
          <p className="text-sm text-ink-soft">
            Ask about your spending, income, or savings.
          </p>
        </div>

        <div className="bg-card border border-line rounded-lg p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-lg">Insights</h2>
            <button
              onClick={fetchInsights}
              disabled={insightsLoading}
              className="text-sm text-teal hover:text-teal-dark font-medium disabled:opacity-50"
            >
              {insightsLoading ? "Refreshing…" : "Refresh"}
            </button>
          </div>
          {insightsLoading && !insights ? (
            <p className="text-sm text-ink-soft">Generating insights…</p>
          ) : insightsError ? (
            <p className="text-sm text-brick">{insightsError}</p>
          ) : insights && insights.length > 0 ? (
            <ul className="flex flex-col gap-2">
              {insights.map((insight, i) => (
                <li
                  key={i}
                  className="text-sm text-ink-soft flex items-start gap-2"
                >
                  <span className="text-gold">•</span>
                  {insight}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-ink-soft">
              Not enough transaction history yet for insights.
            </p>
          )}
        </div>

        <div className="bg-card border border-line rounded-lg p-5 flex flex-col gap-4">
          <h2 className="font-display font-semibold text-lg">Ask a question</h2>

          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUESTIONS.map((q) => (
                <button
                  key={q}
                  onClick={() => send(q)}
                  className="text-xs bg-paper border border-line rounded-full px-3 py-1.5 text-ink-soft hover:border-teal hover:text-teal transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-3 max-h-[420px] overflow-y-auto">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[80%] rounded-lg px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-teal text-white self-end"
                    : "bg-paper border border-line text-ink self-start"
                }`}
              >
                {msg.content}
              </div>
            ))}
            {sending && (
              <div className="bg-paper border border-line text-ink-soft self-start rounded-lg px-4 py-2.5 text-sm">
                Thinking…
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          <form onSubmit={handleSubmit} className="flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your spending…"
              className="flex-1 border border-line rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal"
            />
            <button
              type="submit"
              disabled={sending || !input.trim()}
              className="bg-teal hover:bg-teal-dark disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-md px-4 py-2 transition-colors"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default AiAssistant;
