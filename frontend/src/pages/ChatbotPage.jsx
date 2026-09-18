import React, { useState, useEffect, useRef } from 'react';
import { sendChatMessageApi, getChatHistoryApi } from '../services/api';
import { MessageSquare, Send, Sparkles, User, Compass, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const SUGGESTED_PROMPTS = [
  "How can I improve my resume for a Software Engineer role?",
  "What technical skills am I missing for Frontend Engineer?",
  "How should I answer behavioral interview questions?",
  "What projects should I build for my placement portfolio?"
];

export default function ChatbotPage() {
  const [messages, setMessages] = useState([]);
  const [inputMsg, setInputMsg] = useState('');
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchHistory = async () => {
    try {
      const res = await getChatHistoryApi();
      if (res.data && res.data.length > 0) {
        setMessages(res.data);
      } else {
        // Default welcoming message
        setMessages([
          {
            id: 0,
            sender: 'assistant',
            content: "Hello! I am your **CareerPilot AI Copilot**. I can analyze your resume, suggest skill-gap fixes, guide your 30/60/90-day learning roadmap, and help you practice mock interviews. What would you like to ask?"
          }
        ]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (textToSend) => {
    const messageText = textToSend || inputMsg;
    if (!messageText.trim()) return;

    const userMsg = { id: Date.now(), sender: 'user', content: messageText };
    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMsg('');
    setSending(true);

    try {
      const res = await sendChatMessageApi(messageText);
      const botMsg = { id: Date.now() + 1, sender: 'assistant', content: res.data.reply, suggested_actions: res.data.suggested_actions };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col space-y-4 pb-4">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div>
          <h1 className="text-xl font-extrabold text-white flex items-center gap-2.5">
            <MessageSquare className="w-5 h-5 text-brand-400" />
            <span>AI Career Chatbot</span>
          </h1>
          <p className="text-xs text-slate-400">Contextually aware of your uploaded resume, target job, skill gaps, and learning roadmap.</p>
        </div>
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-slate-900 border border-slate-800 rounded-3xl p-6 overflow-y-auto space-y-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`flex items-start gap-3 ${msg.sender === 'user' ? 'flex-row-reverse' : ''}`}
          >
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
              msg.sender === 'user' ? 'bg-brand-600 text-white' : 'bg-gradient-to-tr from-brand-600 to-indigo-500 text-white'
            }`}>
              {msg.sender === 'user' ? <User className="w-4 h-4" /> : <Compass className="w-4 h-4" />}
            </div>

            <div className={`max-w-2xl p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
              msg.sender === 'user'
                ? 'bg-brand-600 text-white rounded-tr-none'
                : 'bg-slate-800 border border-slate-700/80 text-slate-200 rounded-tl-none'
            }`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>

              {msg.suggested_actions && (
                <div className="pt-2 border-t border-slate-700/50 flex flex-wrap gap-2">
                  {msg.suggested_actions.map((act) => (
                    <Link
                      key={act}
                      to={act.includes('Resume') ? '/resume' : act.includes('Mock') ? '/mock-interview' : act.includes('Roadmap') ? '/roadmap' : '/skills'}
                      className="px-2.5 py-1 rounded-lg bg-slate-900/80 hover:bg-slate-900 text-brand-300 font-semibold text-[10px] flex items-center gap-1 border border-brand-500/20"
                    >
                      <span>{act}</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        {sending && (
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
            <span>CareerPilot AI is thinking...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompts Pills */}
      <div className="flex flex-wrap gap-2">
        {SUGGESTED_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => handleSend(prompt)}
            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 text-xs font-medium transition"
          >
            💡 {prompt}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
        <input
          type="text"
          value={inputMsg}
          onChange={(e) => setInputMsg(e.target.value)}
          placeholder="Ask anything about your resume, jobs, skill gaps, or interview prep..."
          className="flex-1 px-4 py-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={sending || !inputMsg.trim()}
          className="px-6 py-3.5 rounded-2xl bg-brand-600 hover:bg-brand-500 disabled:opacity-50 text-white font-bold text-xs transition shadow-lg shadow-brand-600/20 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </button>
      </form>
    </div>
  );
}
