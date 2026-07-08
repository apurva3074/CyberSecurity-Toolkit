import { useState, useRef, useEffect } from "react";
import { HiOutlineX, HiOutlinePaperAirplane, HiOutlineTrash } from "react-icons/hi";
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

function timestamp() {
  return new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

const initialMessages = [
  {
    from: "bot",
    text: "Hi! I'm SecBot, your cybersecurity assistant. How can I help you today?",
    time: timestamp(),
  },
];

function TypingIndicator() {
  return (
    <div className="flex justify-start items-end gap-2 animate-slideUp">
      <img src={chatbotIcon} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
      <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
        <span className="w-2 h-2 bg-purple-400/70 rounded-full animate-bounce [animation-delay:0ms]" />
        <span className="w-2 h-2 bg-purple-400/70 rounded-full animate-bounce [animation-delay:150ms]" />
        <span className="w-2 h-2 bg-purple-400/70 rounded-full animate-bounce [animation-delay:300ms]" />
      </div>
    </div>
  );
}

function formatMessage(text) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <span key={i} className="font-semibold text-white">
          {part.slice(2, -2)}
        </span>
      );
    }
    return part;
  });
}

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [unread, setUnread] = useState(0);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      setUnread(0);
    }
  }, [open]);

  const pushBotMessage = (msg) => {
    setMessages((prev) => [...prev, { from: "bot", time: timestamp(), ...msg }]);
    if (!open) setUnread((u) => u + 1);
  };

  const sendMessage = async (text) => {
    const userMsg = text.trim();
    if (!userMsg) return;

    setMessages((prev) => [...prev, { from: "user", text: userMsg, time: timestamp() }]);
    setInput("");
    if (inputRef.current) inputRef.current.style.height = "auto";
    setLoading(true);

    // The backend runs on a free tier that spins down when idle, so the first
    // request after a while can fail while it wakes up. Retry a couple times
    // with a short delay before giving up.
    const attempts = 3;
    for (let attempt = 1; attempt <= attempts; attempt++) {
      try {
        const res = await fetch(API_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message: userMsg }),
        });
        const data = await res.json();
        if (data.response) {
          pushBotMessage({ text: data.response });
        } else {
          const localReply = getLocalReply(userMsg);
          pushBotMessage({
            text: localReply || data.error || "Sorry, I couldn't process that. Please try again.",
          });
        }
        break;
      } catch {
        if (attempt < attempts) {
          await new Promise((resolve) => setTimeout(resolve, 4000));
          continue;
        }
        const localReply = getLocalReply(userMsg);
        pushBotMessage({
          text: localReply || "I'm having trouble connecting right now. You can ask about our tools: URL Scanner, Email Scanner, Metadata Fetching, or Takedown.",
          error: !localReply,
        });
      }
    }
    setLoading(false);
  };

  const handleSend = (e) => {
    e.preventDefault();
    sendMessage(input);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
    const el = e.target;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 112)}px`;
  };

  const clearChat = () => {
    setMessages(initialMessages);
  };

  const showQuickActions = messages.length <= 1 && !loading;

  return (
    <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50">
      {/* Chat Window */}
      <div
        className={`absolute bottom-20 sm:bottom-24 right-0 w-[calc(100vw-2rem)] sm:w-[440px] transition-all duration-300 ease-out origin-bottom-right ${
          open
            ? "scale-100 opacity-100 pointer-events-auto"
            : "scale-95 opacity-0 pointer-events-none"
        }`}
      >
        <div className="pt-4 bg-[#111119] rounded-2xl shadow-2xl shadow-purple-950/40 border border-white/10 flex flex-col h-[min(70vh,600px)] overflow-hidden">
          {/* Header */}
          <div className=" bg-gradient-to-r from-purple-700 to-indigo-600 px-4 py-4 sm:px-5 sm:py-5 flex items-center gap-3 sm:gap-4">
            <div className="relative flex-shrink-0">
              <img src={chatbotIcon} alt="SecBot" className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover" />
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-purple-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-white font-semibold text-base sm:text-lg leading-tight">
                SecBot
              </h3>
              <p className="text-purple-200 text-sm flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                Online
              </p>
            </div>
            <button
              onClick={clearChat}
              className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              aria-label="Clear conversation"
              title="Clear conversation"
            >
              <HiOutlineTrash className="w-5 h-5" />
            </button>
            <button
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
              aria-label="Close chatbot"
            >
              <HiOutlineX className="w-6 h-6" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-[#0a0a0f] custom-scrollbar">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex flex-col animate-slideUp ${msg.from === "user" ? "items-end" : "items-start"}`}
              >
                <div className={`flex items-end gap-2 max-w-[85%] ${msg.from === "user" ? "flex-row-reverse" : ""}`}>
                  {msg.from === "bot" && (
                    <img src={chatbotIcon} alt="" className="w-6 h-6 rounded-full object-cover flex-shrink-0" />
                  )}
                  <div
                    className={`px-4 py-2.5 text-sm leading-relaxed whitespace-pre-line shadow-sm ${
                      msg.from === "user"
                        ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl rounded-br-sm"
                        : msg.error
                        ? "bg-red-500/10 border border-red-500/20 text-red-300 rounded-2xl rounded-bl-sm"
                        : "bg-white/5 border border-white/10 text-gray-200 rounded-2xl rounded-bl-sm"
                    }`}
                  >
                    {msg.from === "bot" ? formatMessage(msg.text) : msg.text}
                  </div>
                </div>
                <span className={`text-[10px] text-gray-600 mt-1 ${msg.from === "user" ? "mr-1" : "ml-8"}`}>
                  {msg.time}
                </span>
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
                    className="text-sm px-3 py-1.5 rounded-full border border-purple-500/30 text-purple-300 bg-purple-500/10 hover:bg-purple-500/20 hover:border-purple-500/50 transition-colors"
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
            className="px-4 py-3 border-t border-white/10 bg-[#111119] flex items-end gap-2"
          >
            <textarea
              ref={inputRef}
              rows={1}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500/50 transition-colors resize-none max-h-28 custom-scrollbar"
              placeholder="Ask me anything..."
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={!input.trim() || loading}
              className="w-11 h-11 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white flex items-center justify-center hover:from-purple-700 hover:to-indigo-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-sm flex-shrink-0"
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
        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-lg flex items-center justify-center text-white text-2xl transition-all duration-300 hover:scale-110 hover:shadow-xl ${
          open
            ? "bg-gradient-to-r from-gray-600 to-gray-700"
            : "bg-gradient-to-r from-purple-600 to-indigo-600"
        }`}
        aria-label={open ? "Close chatbot" : "Open chatbot"}
      >
        {!open && (
          <span className="absolute inset-0 rounded-full bg-purple-600 animate-ping opacity-20" />
        )}
        {open ? (
          <HiOutlineX className="w-6 h-6 sm:w-7 sm:h-7" />
        ) : (
          <img src={chatbotIcon} alt="Chat" className="w-9 h-9 sm:w-11 sm:h-11 rounded-full object-cover bg-white" />
        )}
        {!open && unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[22px] h-[22px] px-1 rounded-full bg-red-500 border-2 border-[#0a0a0f] text-white text-[11px] font-bold flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>
    </div>
  );
}
