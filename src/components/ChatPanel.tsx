import { useRef, useEffect, useState, KeyboardEvent } from 'react';

interface ChatMessage {
  id: string;
  sender: string;
  message: string;
  timestamp: number;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
  currentPlayer: string;
}

export default function ChatPanel({ messages, onSendMessage, currentPlayer }: ChatPanelProps) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    const trimmedMessage = inputValue.trim();
    if (!trimmedMessage || trimmedMessage.length > 200) return;
    
    onSendMessage(trimmedMessage);
    setInputValue('');
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="bg-[var(--bg-elevated)] rounded-xl shadow-sm border border-[var(--border-accent)] overflow-hidden flex flex-col max-h-[120px]">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.length === 0 ? (
          <div className="text-center text-[var(--text-tertiary)] text-sm py-8">
            暂无消息，开始聊天吧～
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender === currentPlayer;
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}
              >
                <div className="flex items-baseline gap-2 mb-1">
                  <span className={`text-xs font-bold ${isOwnMessage ? 'text-primary' : 'text-[var(--text-secondary)]'}`}>
                    {msg.sender}
                  </span>
                  <span className="text-[10px] text-[var(--text-tertiary)]">
                    {formatTime(msg.timestamp)}
                  </span>
                </div>
                <div
                  className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                    isOwnMessage
                      ? 'bg-pink-500 text-white rounded-br-none'
                      : 'bg-[var(--bg-tertiary)] text-[var(--text-primary)] rounded-bl-none'
                  }`}
                >
                  {msg.message}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-[var(--border-accent)] bg-[var(--bg-tertiary)]">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="输入消息..."
            maxLength={200}
            className="flex-1 bg-[var(--bg-primary)] text-[var(--text-primary)] px-3 py-2 rounded-lg text-sm border border-[var(--border-primary)] focus:outline-none focus:border-primary placeholder-[var(--text-tertiary)]"
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || inputValue.trim().length > 200}
            className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            发送
          </button>
        </div>
        <div className="text-[10px] text-[var(--text-tertiary)] mt-1 text-right">
          {inputValue.length}/200
        </div>
      </div>
    </div>
  );
}
