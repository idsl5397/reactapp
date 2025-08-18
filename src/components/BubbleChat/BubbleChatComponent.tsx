'use client'

import React, { useState, useRef, useEffect } from 'react';
import Image from "next/image";
import { FlaskConical, Send, X} from "lucide-react";
import FloatingChatButton from "@/components/BubbleChat/FloatingChatButton";
import ChatBubble from "@/components/BubbleChat/ChatBubble";
import QuickReply from "@/components/BubbleChat/QuickReply";
import {GoogleGenAI} from "@google/genai";
import axios from "axios";

interface Message {
  id: number;
  message: string;
  isUser: boolean;
  timestamp: string;
  isRead: boolean;
  avatar?: string;
}

const base_path = process.env.NEXT_PUBLIC_BASE_PATH || '/';
const avatarImage = base_path? (`${base_path}/user.svg`):(`/user.svg`);

const TypingIndicator = () => {
  return (
    <div className="chat chat-start animate-fade-in-up">
      <div className="chat-image avatar">
        <div className="w-8 sm:w-10 md:w-12 rounded-full">
          <Image
            alt="績效指標小幫手"
            src={avatarImage}
            width={48}
            height={48}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
      <div className="chat-bubble chat-bubble-secondary">
        <span className="loading loading-dots loading-sm"></span>
      </div>
    </div>
  );
};



const BubbleChatComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      message: '您好！歡迎來到績效指標資料庫，我是您的AI小幫手。請問有什麼可以協助您的嗎？',
      isUser: false,
      timestamp: '12:30',
      isRead: false,
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [quickReplies, setQuickReplies] = useState([
    '轉接人工客服',
  ]);
  const [isQuickReplyVisible, setIsQuickReplyVisible] = useState(true);
  const [unreadCount, setUnreadCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // 當聊天窗口打開時，標記所有訊息為已讀
  useEffect(() => {
    if (isOpen) {
      setMessages(prev =>
        prev.map(msg => ({ ...msg, isRead: true }))
      );
      setUnreadCount(0);
    }
  }, [isOpen]);

  // 計算未讀訊息數量
  useEffect(() => {
    const unreadMessages = messages.filter(msg => !msg.isUser && !msg.isRead);
    setUnreadCount(unreadMessages.length);
  }, [messages]);

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('zh-TW', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const simulateCustomerServiceReply = (userMessage: string): string => {
    const responses: Record<string, string> = {

      '轉接人工客服': '好的，我正在為您轉接到人工客服，請稍等片刻...',
    };

    return responses[userMessage] || '感謝您的訊息！我們已收到您的問題，目前功能尚未開發完畢請，您耐心等待';
  };

const handleSendMessage = async () => {
  if (inputValue.trim() === '') return;

  const userMessage = inputValue.trim();
  const newMessage: Message = {
    id: Date.now(),
    message: userMessage,
    isUser: true,
    timestamp: getCurrentTime(),
    isRead: true,
  };

  // 立即添加用戶訊息
  setMessages(prev => [...prev, newMessage]);
  setInputValue('');
  setIsTyping(true);

  try {
    const basepath = process.env.NEXT_PUBLIC_BASE_PATH || '/';
    // ✅ 修正：正確的 axios POST 請求格式
    const response = await axios.post(`${basepath}/api/gemini`, {
      text: userMessage  // 或者 message: userMessage，取決於你的 API 設計
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });
    setIsTyping(false);

    // 處理 AI 回覆
    const aiReplyText = response.data.response || '抱歉，目前無法處理您的問題，請稍後再試或聯繫人工客服。';

    const replyMessage: Message = {
      id: Date.now() + 1,
      message: aiReplyText,
      isUser: false,
      timestamp: getCurrentTime(),
      isRead: isOpen,
    };

    setMessages(prev => [...prev, replyMessage]);

    // 重置快速回覆選項
    if (quickReplies.length === 0) {
      setQuickReplies(['需要更多幫助', '問題已解決', '轉接人工客服']);
      setIsQuickReplyVisible(true);
    }

  } catch (error) {
    console.error('AI API 呼叫失敗:', error);
    setIsTyping(false);

    // 錯誤時的備用回覆
    const errorMessage: Message = {
      id: Date.now() + 1,
      message: '抱歉，系統暫時無法回應。請稍後再試，或選擇轉接人工客服。',
      isUser: false,
      timestamp: getCurrentTime(),
      isRead: isOpen,
    };

    setMessages(prev => [...prev, errorMessage]);

    // 提供人工客服選項
    setQuickReplies(['轉接人工客服', '重新嘗試']);
    setIsQuickReplyVisible(true);
  }
};

// 補充：處理快速回覆的函數也需要更新
const handleQuickReply = async (reply: string): Promise<void> => {
  // 如果是特殊指令，直接處理
  if (reply === '轉接人工客服') {
    const transferMessage: Message = {
      id: Date.now(),
      message: reply,
      isUser: true,
      timestamp: getCurrentTime(),
      isRead: true,
    };

    setMessages(prev => [...prev, transferMessage]);
    setQuickReplies([]);
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);
      const replyMessage: Message = {
        id: Date.now() + 1,
        message: '正在為您轉接人工客服，請稍等片刻...',
        isUser: false,
        timestamp: getCurrentTime(),
        isRead: isOpen,
      };
      setMessages(prev => [...prev, replyMessage]);
    }, 1000);
    return;
  }

  if (reply === '重新嘗試') {
    // 重新設置快速回覆選項
    setQuickReplies(['查詢訂單狀態', '退換貨問題', '產品諮詢', '技術支援']);
    setIsQuickReplyVisible(true);
    return;
  }

  // 其他快速回覆使用 AI 處理
  const newMessage: Message = {
    id: Date.now(),
    message: reply,
    isUser: true,
    timestamp: getCurrentTime(),
    isRead: true,
  };

  setMessages(prev => [...prev, newMessage]);
  setQuickReplies([]);
  setIsTyping(true);

  try {
    const basepath = process.env.NEXT_PUBLIC_BASE_PATH || '/';
    // ✅ 修正：正確的 axios POST 請求格式
    const response = await axios.post(`${basepath}/api/gemini`, {
      text: reply  // 或者 message: userMessage，取決於你的 API 設計
    }, {
      headers: {
        'Content-Type': 'application/json',
      }
    });

    setIsTyping(false);
    const aiReplyText = response.data.response || '抱歉，目前無法處理您的問題。';

    const replyMessage: Message = {
      id: Date.now() + 1,
      message: aiReplyText,
      isUser: false,
      timestamp: getCurrentTime(),
      isRead: isOpen,
    };

    setMessages(prev => [...prev, replyMessage]);
    setQuickReplies(['需要更多幫助', '問題已解決', '轉接人工客服']);
    setIsQuickReplyVisible(true);

  } catch (error) {
    console.error('AI API 呼叫失敗:', error);
    setIsTyping(false);

    const errorMessage: Message = {
      id: Date.now() + 1,
      message: '抱歉，系統暫時無法回應。請選擇轉接人工客服。',
      isUser: false,
      timestamp: getCurrentTime(),
      isRead: isOpen,
    };

    setMessages(prev => [...prev, errorMessage]);
    setQuickReplies(['轉接人工客服']);
    setIsQuickReplyVisible(true);
  }
};
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>): void => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const toggleChat = (): void => {
    console.log('toggleChat called, current isOpen:', isOpen);
    setIsOpen(!isOpen);
  };

  const toggleQuickReply = (): void => {
    setIsQuickReplyVisible(!isQuickReplyVisible);
  };

  return (
    <>
        {/* 自定主題 */}
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes slideInRight {
          from {
            opacity: 0;
            transform: translateX(20px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes bounceIn {
          0% {
            opacity: 0;
            transform: scale3d(0.3, 0.3, 0.3);
          }
          50% {
            opacity: 1;
          }
          100% {
            opacity: 1;
            transform: scale3d(1, 1, 1);
          }
        }
        
        @keyframes slideInUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes slideOutDown {
          from {
            transform: translateY(0);
            opacity: 1;
          }
          to {
            transform: translateY(100%);
            opacity: 0;
          }
        }
        
        .chat-window-enter {
          animation: slideInUp 0.3s ease-out forwards;
        }
        
        .chat-window-exit {
          animation: slideOutDown 0.3s ease-in forwards;
        }
      `}</style>

      {/* 浮動聊天按鈕 */}
      <FloatingChatButton onClick={toggleChat} unreadCount={unreadCount} />

      {/* 聊天窗口 */}
      <div className={`fixed z-40 transition-all duration-300 ease-out
        bottom-16 right-2 w-[calc(100vw-1rem)] max-w-sm
        sm:bottom-20 sm:right-4 sm:w-96 sm:max-w-none
        md:bottom-24 md:right-6 md:w-[520px]
        lg:right-24
        ${isOpen 
          ? 'opacity-100 visible translate-y-0 scale-100' 
          : 'opacity-0 invisible translate-y-4 scale-95 pointer-events-none'
        }`}>
        <div className="bg-base-100 shadow-2xl rounded-2xl overflow-hidden border border-base-300 h-[calc(100vh-8rem)] max-h-[480px] sm:h-[500px] sm:max-h-[calc(100vh-6rem)] md:h-[650px] md:max-h-[calc(100vh-6rem)]">
          {/* 標題欄 */}
          <div className="card-header bg-primary text-primary-content p-3 sm:p-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="avatar online">
                  <div className="w-8 sm:w-10 rounded-full">
                    <Image
                      alt="客服頭像"
                      src={avatarImage}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-sm sm:text-lg">績效指標資料庫小幫手</h3>
                  <p className="text-xs sm:text-sm opacity-90 flex items-center gap-1">
                    <FlaskConical className="w-3 h-3 sm:w-4 sm:h-4" />
                    AI 回覆可能有誤，請查證後再使用
                  </p>
                </div>
              </div>

              {/* 關閉按鈕 */}
              <button
                onClick={toggleChat}
                className="btn btn-ghost btn-sm btn-circle text-primary-content hover:bg-primary-focus transition-all duration-200 hover:scale-110 active:scale-95 w-8 h-8 min-h-0"
              >
                <X />
              </button>
            </div>
          </div>

          {/* 訊息區域 */}
          <div className="flex flex-col h-[calc(100%-5rem)]">
            <div className="flex-1 overflow-y-auto p-2 sm:p-4 space-y-2 sm:space-y-4 bg-base-50 min-h-0">
              {messages.map((msg) => (
                <ChatBubble
                  key={msg.id}
                  message={msg.message}
                  isUser={msg.isUser}
                  timestamp={msg.timestamp}
                  avatar={msg.avatar}
                />
              ))}
              {isTyping && <TypingIndicator />}
              <div ref={messagesEndRef} />
            </div>

            {/* 快速回覆 */}
            <div className="flex-shrink-0">
              <QuickReply
                options={quickReplies}
                onSelect={handleQuickReply}
                isVisible={isQuickReplyVisible}
                onToggle={toggleQuickReply}
              />
            </div>

            {/* 輸入區域 */}
            <div className="flex-shrink-0 p-2 sm:p-4 bg-base-100 border-t">
              <div className="flex gap-2 sm:gap-4">
                <textarea
                  className="textarea textarea-bordered flex-1 resize-none transition-all duration-200 focus:scale-[1.02] text-sm sm:text-base min-h-0 h-10 sm:h-12"
                  placeholder="輸入訊息..."
                  value={inputValue}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  rows={1}
                />
                <button
                  className="btn btn-primary transition-all duration-200 hover:scale-105 active:scale-95 w-10 h-10 sm:w-12 sm:h-12 min-h-0 p-0"
                  onClick={handleSendMessage}
                  disabled={inputValue.trim() === ''}
                >
                <Send />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default BubbleChatComponent;
