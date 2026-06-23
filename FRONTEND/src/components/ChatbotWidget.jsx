import { useState, useRef, useEffect } from "react";
import { HiOutlineX, HiOutlinePaperAirplane } from "react-icons/hi";
import chatbotIcon from "../assets/chatbot.gif";

import { API_BASE_URL } from "../config";
const API_URL = `${API_BASE_URL}/api/chat/`;

const tools = [
  {
    id: "url",
    title: "URL Scanner",
    description: "Scan URLs for phishing and scams.",
  },
  {
    id: "email",
    title: "Email Scanner",
    description: "Scan emails for phishing and scams.",
  },
  {
    id: "metadata",
    title: "Metadata Fetching",
    description:
      "Retrieve detailed metadata and security information for any website or domain.",
  },
  {
    id: "takedown",
    title: "Takedown",
    description: "Request takedown of scam sites.",
  },
];

const quickActions = [
  "What tools do you have?",
  "How to scan a URL?",
  "How to scan an email?",
  "What is phishing?",
];

function getLocalReply(userInput) {
  const input = userInput.toLowerCase().trim();
  if (/^(hello|hi|hey|greetings)[!,. ]*$/i.test(input)) {
    return "Hello! How can I help you today? You can ask about our cybersecurity tools.";
  }
  if (
    /what (tools|products) (do you have|are available)/.test(input) ||
    /list (tools|products)/.test(input)
  ) {
    return `We offer these tools:\n${tools.map((t) => `• **${t.title}** — ${t.description}`).join("\n")}`;
  }
  if (/how (do i|to) use (the )?(email scanner|email)|how to scan.*(email)/.test(input)) {
    return "To use the **Email Scanner**, upload an email file or paste the email content. The tool will analyze it for phishing indicators and scam patterns.";
  }
  if (/how (do i|to) use (the )?(url scanner|url)|how to scan.*(url)/.test(input)) {
    return "To use the **URL Scanner**, enter the URL you want to check. The tool will analyze it for phishing and scam risks and give you a safety verdict.";
  }
  if (/how (do i|to) use (the )?(metadata fetching|metadata fetcher|metadata)/.test(input)) {
    return "To use **Metadata Fetching**, enter a website or domain. The tool will retrieve detailed metadata and security information for it.";
  }
  if (/how (do i|to) (request|make) (a )?takedown|how to use (the )?takedown/.test(input)) {
    return "To request a **Takedown**, enter the domain you want to report and provide a reason. The tool will help you submit a takedown request.";
  }
  for (const tool of tools) {
    if (
      input.includes(tool.title.toLowerCase()) ||
      input.includes(tool.id)
    ) {
      return `**${tool.title}**: ${tool.description}`;
    }
  }
  return null;
}

function TypingIndicator() {
  return (
    <div className="flex justify-start">
      <div className="bg-white/60 backdrop-blur-sm border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function formatMessage(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={i} className="font-semibold">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      from: "bot",
      text: "Hi! I'm SecBot, your cybersecurity assistant. How can I help you today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  const sendMessage = async (text) => {
    const userMsg = text.trim();
    if (!userMsg) return;

    setMessages((prev) => [...prev, { from: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMsg }),
      });
      const data = await res.json();
      if (data.response) {
        setMessages((prev) => [...prev, { from: "bot", text: data.response }]);
      } else {
        const localReply = getLocalReply(userMsg);
        setMessages((prev) => [
          ...prev,
          {
            from: "bot",
            text: localReply || data.error || "Sorry, I couldn't process that. Please try again.",
          },
        ]);
      }
    } catch {
      const localReply = getLocalReply(userMsg);
      setMessages((prev) => [
        ...prev,
        {
          from: "bot",
          text: localReply || "I'm having trouble connecting right now. You can ask about our tools: URL Scanner, Email Scanner, Metadata Fetching, or Takedown.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const showQuickActions = messages.length <= 1 && !loading;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Chat Window */}
      <div
        className={`absolute bottom-24 right-0 w-[calc(100vw-3rem)] sm:w-[440px] transition-all duration-300 ease-out origin-bottom-right ${
          open
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col h-[calc(100vh-10rem)] sm:h-[600px] overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-700 to-indigo-600 px-5 py-5 flex items-center gap-4">
            <img src={chatbotIcon} alt="SecBot" className="w-12 h-12 rounded-full object-cover" />
            <div className="flex-1">
              <h3 className="text-white font-semibold text-lg leading-tight">
                SecBot
              </h3>
              <p className="text-purple-200 text-sm">
                Cybersecurity Assistant
              </p>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              aria-label="Close chatbot"
            >
              <HiOutlineX className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-gray-50 to-white custom-scrollbar">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.from === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-2.5 text-base leading-relaxed whitespace-pre-line ${
                    msg.from === "user"
                      ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl rounded-br-sm shadow-sm"
                      : "bg-white border border-gray-200 text-gray-700 rounded-2xl rounded-bl-sm shadow-sm"
                  }`}
                >
                  {msg.from === "bot" ? formatMessage(msg.text) : msg.text}
                </div>
              </div>
            ))}

            {loading && <TypingIndicator />}

            {/* Quick Actions */}
            {showQuickActions && (
              <div className="pt-2 flex flex-wrap gap-2">
                {quickActions.map((action) => (
                  <button
                    key={action}
                    onClick={() => sendMessage(action)}
                    className="text-sm px-3 py-1.5 rounded-full border border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 hover:border-purple-300 transition-colors"
                  >
                    {action}
                  </button>
                ))}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={handleSend}
            className="px-4 py-3 border-t border-gray-100 bg-white flex items-center gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-gray-100 rounded-xl px-4 py-3 text-base text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:bg-white transition-colors border border-transparent focus:border-purple-300"
              placeholder="Ask me anything..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm"
              aria-label="Send message"
            >
              <HiOutlinePaperAirplane className="w-5 h-5 rotate-90" />
            </button>
          </form>
        </div>
      </div>

      {/* Floating Toggle Button */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className={`w-18 h-18 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl ${
          open
            ? "bg-gradient-to-r from-gray-600 to-gray-700 rotate-0"
            : "bg-gradient-to-r from-purple-600 to-indigo-600"
        }`}
        aria-label={open ? "Close chatbot" : "Open chatbot"}
      >
        {open ? <HiOutlineX className="w-7 h-7" /> : <img src={chatbotIcon} alt="Chat" className="w-14 h-14 rounded-full object-cover" />}
      </button>
    </div>
  );
}