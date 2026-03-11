import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { chatQuery } from "@/services/api";
import { PageHeader } from "@/components/shared/PageHeader";
import { NoticeBanner } from "@/components/shared/NoticeBanner";
import { CitationCard } from "@/components/shared/CitationCard";
import { ResultCard } from "@/components/shared/ResultCard";
import { LoadingState } from "@/components/shared/LoadingState";
import { EmptyState } from "@/components/shared/EmptyState";

interface ChatMessage {
  question: string;
  answer: string;
  reasoning?: string;
  sources?: any[];
  in_scope?: boolean;
  scope_warning?: string;
  disclaimer?: string;
}

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!question.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const res = await chatQuery(question);
      setMessages((prev) => [...prev, { question, ...res }]);
      setQuestion("");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <PageHeader title="AI Legal Chatbot" description="Ask legal questions in natural language and get grounded answers with citations." />

      <div className="space-y-6 mb-6">
        {messages.length === 0 && !loading && <EmptyState message="Ask your first legal question" sub="Get AI-powered answers grounded in Indian law" />}

        {messages.map((msg, i) => (
          <div key={i} className="space-y-3 animate-fade-in">
            <div className="bg-primary/5 border border-primary/10 rounded-lg p-4">
              <p className="text-sm font-medium text-foreground">{msg.question}</p>
            </div>

            {msg.in_scope === false && msg.scope_warning && (
              <NoticeBanner variant="warning">{msg.scope_warning}</NoticeBanner>
            )}

            <ResultCard title="Answer">
              <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{msg.answer}</p>
            </ResultCard>

            {msg.reasoning && (
              <ResultCard title="Legal Reasoning">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{msg.reasoning}</p>
              </ResultCard>
            )}

            {msg.sources && msg.sources.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Sources</h4>
                <div className="grid gap-2 sm:grid-cols-2">
                  {msg.sources.map((s: any, j: number) => (
                    <CitationCard key={j} source={s} />
                  ))}
                </div>
              </div>
            )}

            {msg.disclaimer && (
              <NoticeBanner variant="info">{msg.disclaimer}</NoticeBanner>
            )}
          </div>
        ))}

        {loading && <LoadingState message="Analyzing your question..." />}
        {error && <NoticeBanner variant="error">{error}</NoticeBanner>}
      </div>

      <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t">
        <div className="flex gap-3">
          <Textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="e.g. What should be included in an FIR for phone theft?"
            className="min-h-[48px] max-h-32 resize-none"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
            }}
          />
          <Button onClick={handleSubmit} disabled={loading || !question.trim()} className="shrink-0">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
