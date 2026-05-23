// src/components/AIAssistantBubble.tsx
'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Send, X, Terminal, Cpu } from 'lucide-react';
import styles from '@/styles/ChatBubble.module.css';

interface Message {
  sender: 'user' | 'ai';
  text: string;
  provider?: string;
}

export default function AIAssistantBubble() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'ai',
      text: `Systems fully online. I am your autonomous SRE Co-Pilot node.

How can I optimize your PulseFlow observability dashboard today?`,
      provider: 'PulseFlow SRE Core'
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat area on new message
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim()) return;

    // 1. Add user message
    const userMsg: Message = { sender: 'user', text };
    setMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setLoading(true);

    try {
      // 2. Fetch from AI Endpoint
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text })
      });
      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: data.response,
          provider: data.provider
        }]);
      } else {
        setMessages(prev => [...prev, {
          sender: 'ai',
          text: 'Warning: Encrypted chat node returned an operational failure. Please retry shortly.',
          provider: 'System Error Boundary'
        }]);
      }
    } catch (err) {
      console.error('Failed SRE chat transaction:', err);
      setMessages(prev => [...prev, {
        sender: 'ai',
        text: 'Connection Error: Failed to resolve SRE chatbot route. Verify server environment variables.',
        provider: 'Network Link Down'
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage(inputMessage);
    }
  };

  // Convert SRE markdown lines to simple bold/paragraphs securely
  const formatSREMessage = (text: string) => {
    return text.split('\n').map((line, idx) => {
      let cleanLine = line;
      
      // Simple header conversion
      if (line.startsWith('### ')) {
        return <h3 key={idx}>{line.replace('### ', '')}</h3>;
      }
      
      // List conversion
      const isListItem = line.trim().startsWith('* ') || line.trim().startsWith('- ');
      if (isListItem) {
        cleanLine = line.replace(/^\s*[\*\-]\s+/, '');
      }

      // Inline Bold conversion (e.g. **text**)
      const boldRegex = /\*\*([^*]+)\*\*/g;
      const parts = [];
      let lastIndex = 0;
      let match;
      
      while ((match = boldRegex.exec(cleanLine)) !== null) {
        if (match.index > lastIndex) {
          parts.push(cleanLine.substring(lastIndex, match.index));
        }
        parts.push(<strong key={match.index} style={{ color: 'var(--color-ai)', fontWeight: 700 }}>{match[1]}</strong>);
        lastIndex = boldRegex.lastIndex;
      }
      
      if (lastIndex < cleanLine.length) {
        parts.push(cleanLine.substring(lastIndex));
      }

      const inlineContent = parts.length > 0 ? parts : cleanLine;

      if (isListItem) {
        return <li key={idx}>{inlineContent}</li>;
      }

      return <p key={idx} style={{ margin: '4px 0' }}>{inlineContent}</p>;
    });
  };

  const suggestedChips = [
    'Optimize Latency',
    'Explain 500 Crash',
    'Database Status'
  ];

  return (
    <div className={styles.bubbleContainer}>
      {/* 1. Floating Breathing Trigger Orb */}
      {!isOpen && (
        <div onClick={() => setIsOpen(true)} className={styles.triggerBubble}>
          <div className={styles.pulseRing}></div>
          <Sparkles size={24} style={{ color: '#fff' }} />
        </div>
      )}

      {/* 2. Cyberpunk Chat Drawer Box */}
      {isOpen && (
        <div className={styles.chatWindow}>
          {/* Header */}
          <div className={styles.chatHeader}>
            <div className={styles.headerInfo}>
              <div style={{ padding: '6px', borderRadius: '6px', background: 'rgba(168, 85, 247, 0.1)', color: 'var(--color-ai)' }}>
                <Terminal size={14} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span className={styles.headerTitle}>SRE Co-Pilot</span>
                <span className={styles.headerSub}>Gemini Observability Node</span>
              </div>
            </div>
            <X size={18} className={styles.closeBtn} onClick={() => setIsOpen(false)} />
          </div>

          {/* Messages scroll log */}
          <div ref={scrollRef} className={styles.messageArea}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`${styles.messageRow} ${msg.sender === 'user' ? styles.userRow : styles.aiRow}`}>
                <div className={`${styles.messageBubble} ${msg.sender === 'user' ? styles.userBubble : styles.aiBubble}`}>
                  {msg.sender === 'ai' ? (
                    <>
                      {formatSREMessage(msg.text)}
                      {msg.provider && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '9px', color: 'var(--text-muted)', marginTop: '8px', borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: '4px' }}>
                          <Cpu size={10} />
                          <span>NODE: {msg.provider}</span>
                        </div>
                      )}
                    </>
                  ) : (
                    <p style={{ margin: 0 }}>{msg.text}</p>
                  )}
                </div>
              </div>
            ))}

            {/* Glowing Typing dots */}
            {loading && (
              <div className={`${styles.messageRow} ${styles.aiRow}`}>
                <div className={`${styles.messageBubble} ${styles.aiBubble}`} style={{ padding: '8px 12px' }}>
                  <div className={styles.typingIndicator}>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                    <div className={styles.dot}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Quick-Prompt SRE Chips */}
          <div className={styles.suggestedChips}>
            {suggestedChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                className={styles.chip}
                disabled={loading}
                onClick={() => handleSendMessage(chip)}
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input text row */}
          <div className={styles.inputArea}>
            <input
              type="text"
              className={styles.input}
              placeholder="Ask operator command..."
              value={inputMessage}
              disabled={loading}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyPress}
            />
            <button
              type="button"
              className={styles.sendBtn}
              disabled={loading || !inputMessage.trim()}
              onClick={() => handleSendMessage(inputMessage)}
            >
              <Send size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
