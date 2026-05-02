import { useState, useRef, useEffect, useCallback } from 'react';
import { chatAPI } from '../services/api';
import { TypingIndicator } from '../components/Loader';
import toast from 'react-hot-toast';

const STARTERS = [
  'What funeral providers are in New York?',
  'Which providers offer cremation services?',
  'Compare the services available in the database',
  'What is direct cremation and which providers offer it?',
  'Which funeral homes offer pre-planning services?',
];

function ChatBubble({ msg }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-end gap-3 ${isUser ? 'flex-row-reverse' : ''} animate-fade-in`}>
      {/* Avatar */}
      {!isUser && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-500 to-brand-700 flex items-center justify-center flex-shrink-0 shadow-sm">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M20 9V7a2 2 0 00-2-2h-1V4a1 1 0 00-2 0v1H9V4a1 1 0 00-2 0v1H6a2 2 0 00-2 2v2a2 2 0 002 2h12a2 2 0 002-2zM4 13v6a2 2 0 002 2h12a2 2 0 002-2v-6H4z" />
          </svg>
        </div>
      )}
      {isUser && (
        <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center flex-shrink-0">
          <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      )}
      {/* Bubble */}
      <div className={`max-w-[75%] sm:max-w-[65%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
          isUser
            ? 'bg-brand-600 text-white rounded-br-none shadow-sm'
            : 'bg-white text-slate-800 border border-slate-100 rounded-bl-none shadow-sm'
        }`}>
          {msg.content}
        </div>
        <span className="text-xs text-slate-400 px-1">
          {msg.timestamp
            ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : ''
          }
        </span>
      </div>
    </div>
  );
}

const INITIAL_MSG = {
  role: 'assistant',
  content: 'Hello! 👋 I\'m your Funeral Intelligence Assistant powered by GPT-4.\n\nI can help you:\n• Find funeral providers in our database\n• Compare services and pricing\n• Explain funeral service options\n• Answer any questions about providers\n\nWhat would you like to know?',
  timestamp: new Date().toISOString(),
};

export default function Chat() {
  const [messages, setMessages] = useState([INITIAL_MSG]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = useCallback(async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = { role: 'user', content: msg, timestamp: new Date().toISOString() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const history = messages
      .filter((m) => m.role !== 'system')
      .map(({ role, content }) => ({ role, content }));

    try {
      const res = await chatAPI.sendMessage(msg, history);
      const aiMsg = {
        role: 'assistant',
        content: res.data.reply,
        timestamp: new Date().toISOString(),
        providers_used: res.data.providers_used,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      toast.error('Failed to get AI response: ' + err.message);
      setMessages((prev) => [...prev, {
        role: 'assistant',
        content: 'I apologize, I encountered an error processing your request. Please check your OpenAI API key configuration and try again.',
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages]);

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = () => {
    setMessages([INITIAL_MSG]);
    toast.success('Conversation cleared');
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 pt-16">
      {/* Chat header */}
      <div className="bg-white border-b border-slate-100 px-4 sm:px-6 py-4 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-sm">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20 9V7a2 2 0 00-2-2h-1V4a1 1 0 00-2 0v1H9V4a1 1 0 00-2 0v1H6a2 2 0 00-2 2v2a2 2 0 002 2h12a2 2 0 002-2z" />
              <path d="M4 13v6a2 2 0 002 2h12a2 2 0 002-2v-6H4z" />
            </svg>
          </div>
          <div>
            <h2 className="font-display font-semibold text-slate-900 text-base">AI Assistant</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-slate-400">GPT-4 · Funeral Intelligence</span>
            </div>
          </div>
        </div>
        <button
          onClick={clearChat}
          className="text-sm text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-slate-50"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Clear
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-5">
        <div className="max-w-3xl mx-auto space-y-5">
          {messages.map((msg, i) => <ChatBubble key={i} msg={msg} />)}
          {loading && <TypingIndicator />}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Starters */}
      {messages.length <= 1 && !loading && (
        <div className="px-4 sm:px-6 pb-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-xs text-slate-400 mb-2 font-medium">Try asking:</p>
            <div className="flex flex-wrap gap-2">
              {STARTERS.map((s, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(s)}
                  className="text-xs px-3 py-2 bg-white text-slate-600 rounded-xl border border-slate-200 hover:bg-slate-50 hover:border-brand-200 hover:text-brand-700 transition-all duration-200 text-left"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-slate-100 px-4 sm:px-6 py-4 shadow-sm">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-end gap-3">
            <div className="flex-1 relative">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKey}
                placeholder="Ask about funeral providers, services, pricing..."
                rows={1}
                disabled={loading}
                className="input-field resize-none py-3 pr-4 max-h-32 overflow-y-auto leading-relaxed"
                style={{ minHeight: '48px' }}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 128) + 'px';
                }}
              />
            </div>
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              className="w-12 h-12 flex-shrink-0 bg-brand-600 hover:bg-brand-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center transition-all duration-200 active:scale-95"
            >
              {loading ? (
                <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
          <p className="text-xs text-slate-300 mt-2 text-center">
            Press Enter to send · Shift+Enter for new line
          </p>
        </div>
      </div>
    </div>
  );
}
