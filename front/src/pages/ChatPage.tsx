import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import './ChatPage.css';

interface Message {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  message: string;
  createdAt: string;
  read: boolean;
}

interface Conversation {
  conversationId: string;
  user: {
    id: string;
    name: string;
    email: string;
    office: string;
  };
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
}

export function ChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const isStandardUser = user?.role === 'standard-user';
  const isServiceDesk = user?.role === 'service-desk-user' || user?.role === 'admin-user';

  useEffect(() => {
    if (isStandardUser) {
      fetchMessages();
      const interval = setInterval(fetchMessages, 5000); // Poll every 5 seconds
      return () => clearInterval(interval);
    } else if (isServiceDesk) {
      fetchConversations();
      const interval = setInterval(fetchConversations, 5000);
      return () => clearInterval(interval);
    }
  }, [isStandardUser, isServiceDesk]);

  useEffect(() => {
    if (isServiceDesk && selectedConversation) {
      fetchMessages(selectedConversation);
      const interval = setInterval(() => fetchMessages(selectedConversation), 5000);
      return () => clearInterval(interval);
    }
  }, [selectedConversation, isServiceDesk]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const fetchConversations = async () => {
    try {
      const response = await fetch('http://localhost:3000/api/chat/conversations', {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data);
        setError('');
        
        // Auto-select first conversation if none selected
        if (!selectedConversation && data.length > 0) {
          setSelectedConversation(data[0].conversationId);
        }
      } else {
        setError('Failed to load conversations');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchMessages = async (conversationId?: string) => {
    try {
      const url = conversationId
        ? `http://localhost:3000/api/chat/messages/${conversationId}`
        : 'http://localhost:3000/api/chat/messages';

      const response = await fetch(url, {
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        setError('');
      } else {
        setError('Failed to load messages');
      }
    } catch (err) {
      setError('Connection error');
    } finally {
      setIsLoading(false);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim()) return;

    try {
      const body: any = { message: newMessage };
      
      if (isServiceDesk && selectedConversation) {
        body.conversationId = selectedConversation;
      }

      const response = await fetch('http://localhost:3000/api/chat/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      });

      if (response.ok) {
        setNewMessage('');
        // Refresh messages immediately
        if (isStandardUser) {
          fetchMessages();
        } else if (selectedConversation) {
          fetchMessages(selectedConversation);
          fetchConversations(); // Update conversation list
        }
      } else {
        setError('Failed to send message');
      }
    } catch (err) {
      setError('Connection error');
    }
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const formatMessageTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (isLoading && messages.length === 0 && conversations.length === 0) {
    return (
      <div className="chat-container">
        <div className="loading">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {error && <div className="error-message">{error}</div>}

      <div className="chat-layout">
        {/* Sidebar for service desk users */}
        {isServiceDesk && (
          <div className="chat-sidebar">
            <div className="sidebar-header">
              <h2>Conversations</h2>
              <span className="conversation-count">{conversations.length}</span>
            </div>
            <div className="conversations-list">
              {conversations.length === 0 ? (
                <div className="no-conversations">
                  <p>No conversations yet</p>
                </div>
              ) : (
                conversations.map((conv) => (
                  <div
                    key={conv.conversationId}
                    className={`conversation-item ${selectedConversation === conv.conversationId ? 'active' : ''}`}
                    onClick={() => setSelectedConversation(conv.conversationId)}
                  >
                    <div className="conversation-avatar">
                      {conv.user.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="conversation-info">
                      <div className="conversation-header">
                        <span className="conversation-name">{conv.user.name}</span>
                        {conv.unreadCount > 0 && (
                          <span className="unread-badge">{conv.unreadCount}</span>
                        )}
                      </div>
                      <div className="conversation-meta">
                        <span className="conversation-office">{conv.user.office}</span>
                        <span className="conversation-time">{formatTime(conv.lastMessageTime)}</span>
                      </div>
                      <p className="conversation-preview">{conv.lastMessage}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Main chat area */}
        <div className="chat-main">
          <div className="chat-header">
            {isStandardUser ? (
              <>
                <h2>Service Desk Chat</h2>
                <p>Chat with our support team</p>
              </>
            ) : selectedConversation ? (
              <>
                <h2>
                  {conversations.find(c => c.conversationId === selectedConversation)?.user.name || 'User'}
                </h2>
                <p>
                  {conversations.find(c => c.conversationId === selectedConversation)?.user.email || ''}
                </p>
              </>
            ) : (
              <>
                <h2>Chat</h2>
                <p>Select a conversation to start</p>
              </>
            )}
          </div>

          <div className="messages-container">
            {messages.length === 0 ? (
              <div className="no-messages">
                <p>No messages yet</p>
                <p className="no-messages-hint">
                  {isStandardUser
                    ? 'Start a conversation with the service desk'
                    : 'Waiting for messages...'}
                </p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isOwnMessage = msg.senderId === user?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`message ${isOwnMessage ? 'message-own' : 'message-other'}`}
                    >
                      <div className="message-content">
                        {!isOwnMessage && (
                          <div className="message-sender">
                            {msg.senderName}
                            {msg.senderRole !== 'standard-user' && (
                              <span className="sender-badge">Support</span>
                            )}
                          </div>
                        )}
                        <div className="message-text">{msg.message}</div>
                        <div className="message-time">{formatMessageTime(msg.createdAt)}</div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {(isStandardUser || selectedConversation) && (
            <form className="message-input-form" onSubmit={sendMessage}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type your message..."
                className="message-input"
              />
              <button type="submit" className="send-button" disabled={!newMessage.trim()}>
                Send
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
