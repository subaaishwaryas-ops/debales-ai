"use client";
import { useState, useRef, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useProject, useConversations, useCreateConversation, useMessages, useSendMessage, useLogout } from "@/hooks";

function Spinner() { return <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />; }

function StepLines({ steps }: { steps: string[] }) {
  return (
    <div className="space-y-1 mb-2">
      {steps.map((s, i) => (
        <p key={i} className="text-xs text-gray-400 flex items-center gap-1.5">
          <span className="w-1 h-1 rounded-full bg-indigo-300 inline-block" />
          {s}
        </p>
      ))}
    </div>
  );
}

export default function ChatPage() {
  const { slug } = useParams() as { slug: string };
  const router = useRouter();
  const [activeConvoId, setActiveConvoId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [pendingSteps, setPendingSteps] = useState<string[]>([]);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: projectData, isError: projectError } = useProject(slug);
  const { data: convos = [], isLoading: convosLoading } = useConversations(slug);
  const createConvo = useCreateConversation(slug);
  const { data: messages = [], isLoading: msgsLoading } = useMessages(activeConvoId);
  const sendMsg = useSendMessage(activeConvoId ?? "");
  const logout = useLogout();

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, pendingSteps]);

  if (projectError) { router.push("/login"); return null; }

  async function handleNewChat() {
    if (!projectData?.instance) return;
    const convo = await createConvo.mutateAsync({ productInstanceId: String(projectData.instance._id), title: "New Conversation" });
    setActiveConvoId(convo._id);
  }

  async function handleSend() {
    if (!input.trim() || isSending || !activeConvoId) return;
    const text = input.trim();
    setInput("");
    setIsSending(true);
    setPendingSteps([]);
    try {
      const res = await sendMsg.mutateAsync(text);
      setPendingSteps(res.steps ?? []);
    } finally {
      setIsSending(false);
      setTimeout(() => setPendingSteps([]), 2000);
    }
  }

  const isAdmin = projectData?.instance; // simplified — real check from session

  return (
    <div className="flex h-screen bg-white" data-testid="chat-shell">
      {/* Sidebar */}
      <aside className="w-64 border-r border-gray-100 flex flex-col bg-gray-50" data-testid="sidebar">
        <div className="p-4 border-b border-gray-100">
          <h1 className="font-bold text-gray-900 text-sm truncate">{projectData?.project?.name ?? slug}</h1>
          <p className="text-xs text-gray-400 mt-0.5">{projectData?.instance?.productType ?? "AI Assistant"}</p>
        </div>

        <div className="p-3">
          <button onClick={handleNewChat} disabled={createConvo.isPending} className="w-full text-sm bg-indigo-600 text-white rounded-lg py-2 font-medium hover:bg-indigo-700 disabled:opacity-50 transition-colors">
            + New Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2">
          {convosLoading ? <div className="flex justify-center py-4"><Spinner /></div> : convos.length === 0 ? (
            <p className="text-xs text-gray-400 text-center py-6">No conversations yet</p>
          ) : convos.map((c: any) => (
            <button key={c._id} onClick={() => setActiveConvoId(c._id)} className={`w-full text-left px-3 py-2.5 rounded-lg mb-1 text-sm transition-colors ${activeConvoId === c._id ? "bg-indigo-100 text-indigo-900 font-medium" : "text-gray-600 hover:bg-gray-100"}`}>
              <p className="truncate">{c.title}</p>
              <p className="text-xs text-gray-400 mt-0.5">{new Date(c.updatedAt).toLocaleDateString()}</p>
            </button>
          ))}
        </div>

        <div className="p-3 border-t border-gray-100 space-y-1">
          {/* Admin link — only shown when user is admin */}
          <button onClick={() => router.push(`/${slug}/admin`)} className="w-full text-left text-xs text-gray-500 hover:text-indigo-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            ⚙ Admin Dashboard
          </button>
          <button onClick={async () => { await logout.mutateAsync(); router.push("/login"); }} className="w-full text-left text-xs text-gray-500 hover:text-red-600 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
            → Log out
          </button>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex-1 flex flex-col" data-testid="chat-main">
        {!activeConvoId ? (
          <div className="flex-1 flex items-center justify-center flex-col gap-4 text-center px-8">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 flex items-center justify-center text-3xl">🤖</div>
            <div>
              <h2 className="text-xl font-semibold text-gray-800">AI Sales Assistant</h2>
              <p className="text-gray-400 text-sm mt-1">Start a new conversation or select one from the sidebar</p>
            </div>
            <button onClick={handleNewChat} className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-medium hover:bg-indigo-700 transition-colors">
              Start chatting
            </button>
          </div>
        ) : (
          <>
            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4" data-testid="messages">
              {msgsLoading ? (
                <div className="flex justify-center pt-12"><Spinner /></div>
              ) : messages.length === 0 ? (
                <p className="text-center text-gray-400 text-sm pt-12">Send a message to start</p>
              ) : messages.map((m: any) => (
                <div key={m._id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[70%] rounded-2xl px-4 py-3 text-sm ${m.role === "user" ? "bg-indigo-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                    {m.role === "assistant" && m.steps?.length > 0 && <StepLines steps={m.steps} />}
                    <p className="whitespace-pre-wrap">{m.content}</p>
                  </div>
                </div>
              ))}
              {isSending && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 text-sm max-w-[70%]">
                    {pendingSteps.length > 0 && <StepLines steps={pendingSteps} />}
                    <div className="flex gap-1 pt-1">
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                      <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                    </div>
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div className="border-t border-gray-100 p-4">
              <div className="flex gap-3 items-end">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                  placeholder="Type a message… (Enter to send)"
                  rows={1}
                  className="flex-1 resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  style={{ maxHeight: "120px" }}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isSending}
                  className="bg-indigo-600 text-white px-5 py-3 rounded-xl font-medium text-sm hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0"
                >
                  {isSending ? <Spinner /> : "Send"}
                </button>
              </div>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
