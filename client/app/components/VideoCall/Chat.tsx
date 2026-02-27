"use client";

import { useState, useRef, useEffect } from 'react';
import { Message } from '@/app/types';
import { Send } from 'lucide-react';

interface ChatProps {
  messages: Message[];
  onSendMessage: (content: string, targetUserId?: string) => void;
  currentUserId: string;
  participants: Array<{ id: string; name: string }>;
  selectedRecipient: string;
  onRecipientChange: (recipientId: string) => void;
}

export const Chat = ({
  messages,
  onSendMessage,
  currentUserId,
  participants,
  selectedRecipient,
  onRecipientChange
}: ChatProps) => {
  const [activeTab, setActiveTab] = useState<'group' | 'direct'>('group');
  const [activeDirectUserId, setActiveDirectUserId] = useState<string>('');
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (selectedRecipient === 'all') {
      setActiveTab('group');
      setActiveDirectUserId('');
      return;
    }
    setActiveTab('direct');
    setActiveDirectUserId(selectedRecipient);
  }, [selectedRecipient]);

  const directParticipants = participants.filter((participant) => participant.id !== currentUserId);

  const filteredMessages = messages.filter((message) => {
    if (activeTab === 'group') {
      return !message.isDirect;
    }

    if (!activeDirectUserId || !message.isDirect) return false;

    const isLocalToSelected =
      message.userId === currentUserId && message.targetUserId === activeDirectUserId;
    const isSelectedToLocal =
      message.userId === activeDirectUserId && message.targetUserId === currentUserId;

    return isLocalToSelected || isSelectedToLocal;
  });

  useEffect(() => {
    scrollToBottom();
  }, [filteredMessages.length, activeTab, activeDirectUserId]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (activeTab === 'direct' && !activeDirectUserId) return;

    if (inputValue.trim()) {
      const targetUserId = activeTab === 'group' ? undefined : activeDirectUserId;
      onSendMessage(inputValue.trim(), targetUserId);
      setInputValue('');
    }
  };

  const formatTime = (date: Date) => {
    return new Date(date).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getNameById = (id: string) =>
    participants.find((participant) => participant.id === id)?.name || id.split(":")[0];

  return (
    <div className="flex flex-col h-full bg-[#1a1d23] overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/5 bg-black/10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-blue-600/20 flex items-center justify-center border border-blue-500/20">
            <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Meeting Chat</h3>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">
              {activeTab === 'group'
                ? `${filteredMessages.length} Group messages`
                : activeDirectUserId
                  ? `Direct with ${getNameById(activeDirectUserId)}`
                  : `${directParticipants.length} Direct contacts`}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 rounded-xl bg-black/30 border border-white/10 p-1">
          <button
            type="button"
            onClick={() => {
              setActiveTab('group');
              setActiveDirectUserId('');
              onRecipientChange('all');
            }}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'group' ? 'bg-blue-600 text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Group chats
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('direct')}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition-colors ${
              activeTab === 'direct' ? 'bg-blue-600 text-white' : 'text-white/70 hover:text-white'
            }`}
          >
            Direct chats
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-hide">
        {activeTab === 'direct' && !activeDirectUserId ? (
          <div className="space-y-2">
            {directParticipants.map((participant) => (
              <button
                key={participant.id}
                type="button"
                onClick={() => {
                  setActiveDirectUserId(participant.id);
                  onRecipientChange(participant.id);
                }}
                className="w-full flex items-center gap-3 p-3 rounded-2xl border border-white/10 bg-white/5 hover:bg-white/10 text-left transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-white/10 text-white/80 flex items-center justify-center text-sm font-semibold">
                  {participant.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{participant.name}</p>
                  <p className="text-[11px] text-white/40">Open conversation</p>
                </div>
              </button>
            ))}
            {directParticipants.length === 0 && (
              <p className="text-sm text-white/50 text-center py-6">No participants available</p>
            )}
          </div>
        ) : filteredMessages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
            <div className="w-16 h-16 rounded-3xl bg-white/5 flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
              </svg>
            </div>
            <p className="text-sm font-medium">No messages yet</p>
            <p className="text-xs">
              {activeTab === 'group'
                ? 'Start a conversation with everyone'
                : 'Start a direct conversation'}
            </p>
          </div>
        ) : (
          filteredMessages.map((message) => {
            const isLocal = message.userId === currentUserId;
            const isDirect = !!message.isDirect;
            const senderName = getNameById(message.userId);
            return (
              <div
                key={message.id}
                className={`flex flex-col ${isLocal ? 'items-end' : 'items-start'} group`}
              >
                {!isLocal && (
                  <span className="text-[10px] font-bold text-white/40 mb-1 ml-2 uppercase tracking-wider">
                    {senderName}
                  </span>
                )}
                <div
                  className={`max-w-[85%] relative rounded-2xl px-4 py-3 shadow-xl transition-all duration-300 ${isLocal
                      ? 'bg-blue-600 text-white rounded-tr-none hover:bg-blue-500'
                      : 'bg-white/5 text-white/90 border border-white/5 rounded-tl-none hover:bg-white/10'
                    }`}
                >
                  {isDirect && activeTab === 'group' && (
                    <p className={`text-[10px] font-semibold mb-1 ${isLocal ? "text-blue-100/90" : "text-white/60"}`}>
                      Direct message
                    </p>
                  )}
                  <p className="text-sm leading-relaxed">{message.content}</p>
                </div>
                <span className={`text-[9px] font-medium text-white/30 mt-1 opacity-0 group-hover:opacity-100 transition-opacity ${isLocal ? 'mr-1' : 'ml-1'}`}>
                  {formatTime(message.timestamp)}
                </span>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-6 pt-2">
        {activeTab === 'direct' && activeDirectUserId && (
          <div className="mb-3 flex items-center justify-between rounded-xl border border-white/20 bg-black/20 px-3 py-2">
            <p className="text-xs text-white/80">
              Chatting with {getNameById(activeDirectUserId)}
            </p>
            <button
              type="button"
              onClick={() => {
                setActiveDirectUserId('');
              }}
              className="text-[11px] text-blue-400 hover:text-blue-300"
            >
              Change
            </button>
          </div>
        )}
        <div className="flex justify-between gap-3 bg-black/20 border border-white/20 rounded-2xl p-2 transition-all duration-300">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder={activeTab === 'group' ? "Type your group message..." : "Type your direct message..."}
            className="w-full bg-transparent text-sm text-white px-3 py-2 placeholder:text-white/20 "
            disabled={activeTab === 'direct' && !activeDirectUserId}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit();
            }}
          />
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!inputValue.trim() || (activeTab === 'direct' && !activeDirectUserId)}
            className="w-10 h-10 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 disabled:hover:bg-blue-600 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg shadow-blue-500/20 active:scale-95 focus:outline-none focus:ring-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
