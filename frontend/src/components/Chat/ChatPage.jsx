import React, { useState, useRef, useEffect } from 'react'
import {
  Send, Bot, User, Sparkles, FileText, Loader2,
  AlertCircle, RotateCcw, MessageSquare, Trash2
} from 'lucide-react'
import ReactMarkdown from 'react-markdown'
import { sendMessage, deleteChatHistory, getConversations, getConversationMessages } from '../../services/api'

const WELCOME_MESSAGE = {
  role: 'assistant',
  content: `👋 Hello! I'm **Medicus**, your AI medical knowledge assistant.

I answer questions based on the PDF documents you've uploaded. Here's how to get started:

1. **Upload PDFs** on the Dashboard page
2. **Ask me questions** about those documents
3. I'll find the most relevant passages and give you a cited answer

*Remember: I'm an AI assistant, not a doctor. Always consult healthcare professionals for medical advice.*

What would you like to know?`,
  sources: [],
}

export default function ChatPage() {
  const [messages, setMessages] = useState([WELCOME_MESSAGE])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationId, setConversationId] = useState(null)
  const [error, setError] = useState(null)
  const [conversations, setConversations] = useState([])

  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])


  const loadConversations = async () => {
    try {
      const data = await getConversations()
      setConversations(data)
    } catch (e) {
      console.error('Failed to load conversations:', e)
    }
  }

  const loadConversation = async (conversationId) => {
    try {
      const history = await getConversationMessages(conversationId)

      const loadedMessages = [WELCOME_MESSAGE]

      history.forEach((item) => {
        loadedMessages.push({
          role: 'user',
          content: item.question,
        })

        loadedMessages.push({
          role: 'assistant',
          content: item.answer,
          sources: [],
        })
      })

      setMessages(loadedMessages)
      setConversationId(conversationId)
    } catch (e) {
      console.error('Failed to load conversation:', e)
    }
  }



  const handleDeleteConversation = async (e, deletedConversationId) => {
    e.stopPropagation()

    if (!confirm('Delete this conversation?')) return

    try {
      await deleteChatHistory(deletedConversationId)
      await loadConversations()

      if (deletedConversationId === conversationId) {
        resetChat()
      }
    } catch (e) {
      console.error('Failed to delete conversation:', e)
      setError(e.message)
    }
  }

  useEffect(() => {
    loadConversations()
  }, [])


  const handleSend = async () => {
    const question = input.trim()
    if (!question || loading) return

    setInput('')
    setError(null)

    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: question }])
    setLoading(true)

    try {
      const res = await sendMessage(question, conversationId)
      setConversationId(res.conversation_id)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: res.answer,
        sources: res.sources || [],
      }])

      await loadConversations()

    } catch (e) {
      setError(e.message)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: '⚠️ I couldn\'t process your question. Please make sure the backend server and Ollama are running.',
        sources: [],
        isError: true,
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const resetChat = () => {
    setMessages([WELCOME_MESSAGE])
    setConversationId(null)
    setError(null)
  }

  return (
    <div className="flex h-screen lg:h-screen">
      <aside className="w-72 border-r border-[var(--border-subtle)] p-4 overflow-y-auto">
        <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-4">
          Chat History
        </h3>

        {conversations.length === 0 ? (
          <p className="text-xs text-[var(--text-muted)]">No saved chats yet.</p>
        ) : (
          <div className="space-y-2">
            {conversations.map((conversation) => (
              <button
                key={conversation.conversation_id}
                onClick={() => loadConversation(conversation.conversation_id)}
                className="w-full text-left p-3 rounded-lg bg-[var(--bg-card)] border border-[var(--border-subtle)] hover:border-medicus-500/40 transition-colors"
              >
                <p className="text-sm text-[var(--text-primary)] line-clamp-2">
                  {conversation.title}
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">
                  {new Date(conversation.created_at).toLocaleString()}
                </p>
                <span
                  onClick={(e) => handleDeleteConversation(e, conversation.conversation_id)}
                  className="inline-flex items-center gap-1 text-[10px] text-red-400 hover:text-red-300 mt-2"
                >
                  <Trash2 className="w-3 h-3" />
                  Delete
                </span>
              </button>
            ))}
          </div>
        )}
      </aside>

      <div className="flex flex-col flex-1">
        {/* Chat header */}
        <div className="flex-shrink-0 border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]/60 backdrop-blur-sm px-4 sm:px-6 py-3">
          <div className="max-w-3xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-medicus-500 to-medicus-700 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="font-display font-bold text-sm text-[var(--text-primary)]">Medicus</h2>
                <p className="text-[10px] text-medicus-500 uppercase tracking-wider">
                  {loading ? 'Thinking...' : 'RAG-Powered Assistant'}
                </p>
              </div>
            </div>
            <button
              onClick={resetChat}
              className="flex items-center gap-2 px-3 py-2 rounded-lg bg-medicus-600 text-white hover:bg-medicus-500 transition-colors font-medium"
            >
              <RotateCcw className="w-4 h-4" />
              New Chat
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((msg, i) => (
              <MessageBubble key={i} message={msg} />
            ))}

            {loading && (
              <div className="flex items-start gap-3 animate-fade-in">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-medicus-500 to-medicus-700 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-white" />
                </div>
                <div className="bg-[var(--bg-card)] border border-[var(--border-subtle)] rounded-2xl rounded-tl-md px-4 py-3">
                  <div className="flex items-center gap-2 text-[var(--text-muted)] text-sm">
                    <Loader2 className="w-4 h-4 animate-spin text-medicus-400" />
                    <span>Searching documents & generating answer...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="flex-shrink-0 border-t border-[var(--border-subtle)] bg-[var(--bg-secondary)]/60 backdrop-blur-sm px-4 sm:px-6 py-4">
          <div className="max-w-3xl mx-auto">
            <div className="relative flex items-end gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask Medicus about your documents..."
                  rows={1}
                  className="
                  w-full resize-none rounded-xl border border-[var(--border-subtle)]
                  bg-[var(--bg-card)] text-[var(--text-primary)] placeholder-[var(--text-muted)]
                  px-4 py-3 pr-12 text-sm font-body
                  focus:outline-none focus:border-medicus-500/50 focus:ring-1 focus:ring-medicus-500/20
                  transition-colors
                "
                  style={{ maxHeight: '120px' }}
                  onInput={(e) => {
                    e.target.style.height = 'auto'
                    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px'
                  }}
                />
              </div>
              <button
                onClick={handleSend}
                disabled={!input.trim() || loading}
                className="
                p-3 rounded-xl transition-all duration-200 flex-shrink-0
                bg-medicus-600 hover:bg-medicus-500 text-white
                disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-medicus-600
                active:scale-95
              "
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
            <p className="text-[10px] text-[var(--text-muted)] mt-2 text-center">
              Medicus answers from your uploaded PDFs using Ollama. Not a substitute for medical advice.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }) {
  const isUser = message.role === 'user'

  return (
    <div className={`flex items-start gap-3 animate-slide-up ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`
        w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0
        ${isUser
          ? 'bg-blue-500/20 border border-blue-500/30'
          : 'bg-gradient-to-br from-medicus-500 to-medicus-700'
        }
      `}>
        {isUser
          ? <User className="w-4 h-4 text-blue-400" />
          : <Bot className="w-4 h-4 text-white" />
        }
      </div>

      {/* Content */}
      <div className={`
        max-w-[85%] sm:max-w-[75%]
        ${isUser ? 'items-end' : 'items-start'}
      `}>
        <div className={`
          rounded-2xl px-4 py-3 text-sm leading-relaxed
          ${isUser
            ? 'bg-blue-600/20 border border-blue-500/20 rounded-tr-md text-[var(--text-primary)]'
            : `border rounded-tl-md ${message.isError
              ? 'bg-red-500/10 border-red-500/20'
              : 'bg-[var(--bg-card)] border-[var(--border-subtle)]'
            }`
          }
        `}>
          {isUser ? (
            <p>{message.content}</p>
          ) : (
            <div className="markdown-body">
              <ReactMarkdown>{message.content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Sources */}
        {!isUser && message.sources?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {message.sources.map((src, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-medicus-500/10 border border-medicus-500/20 text-medicus-400"
              >
                <FileText className="w-3 h-3" />
                <span className="text-[10px] font-medium">
                  {src.filename} p.{src.page}
                </span>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
