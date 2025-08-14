'use client'
import React, {useState} from 'react';
import Image from "next/image";
import ReactMarkdown from 'react-markdown';
import type { Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import {Check, Copy} from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import {useauthStore} from "@/Stores/authStore";

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string;
  avatar?: string;
}
const base_path = process.env.NEXT_PUBLIC_BASE_PATH || '/';
const avatarImage = base_path? (`${base_path}/user.svg`):(`/user.svg`);

const ChatBubble: React.FC<ChatBubbleProps> = ({ message, isUser, timestamp }) => {
    const [copiedCode, setCopiedCode] = useState<string | null>(null);
    const {userName}=useauthStore();
    const copyToClipboard = async (code: string, codeId: string) => {
        try {
            await navigator.clipboard.writeText(code);
            setCopiedCode(codeId);
            setTimeout(() => setCopiedCode(null), 2000);
        } catch (err) {
            console.error('複製失敗:', err);
            const textArea = document.createElement('textarea');
            textArea.value = code;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            setCopiedCode(codeId);
            setTimeout(() => setCopiedCode(null), 2000);
        }
    };

    const markdownComponents: Components = {
        // 段落
        p: ({ children }) => (
            <p className="mb-2 last:mb-0">{children}</p>
        ),

        // 強調文字
        strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
        ),

        // 斜體
        em: ({ children }) => (
            <em className="italic">{children}</em>
        ),

        // 代碼處理 - 使用 DaisyUI mockup-code
        code: ({ node, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '');
            const isCodeBlock = match;
            const language = match ? match[1] : '';
            const codeContent = String(children).replace(/\n$/, '');

            if (isCodeBlock) {
                // 代碼區塊 - 使用 DaisyUI mockup-code
                const lines = codeContent.split('\n');
                const codeId = `code-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

                // 判斷代碼類型來設定樣式
                const getCodeBlockStyle = (lang: string) => {
                    switch (lang) {
                        case 'bash':
                        case 'shell':
                        case 'terminal':
                            return {
                                className: 'mockup-code bg-base-300 text-base-content',
                                prefix: '$'
                            };
                        case 'javascript':
                        case 'typescript':
                        case 'js':
                        case 'ts':
                            return {
                                className: 'mockup-code bg-neutral text-neutral-content',
                                prefix: (index: number) => (index + 1).toString()
                            };
                        case 'python':
                            return {
                                className: 'mockup-code bg-success text-success-content',
                                prefix: '>>>'
                            };
                        case 'sql':
                            return {
                                className: 'mockup-code bg-info text-info-content',
                                prefix: 'SQL>'
                            };
                        case 'error':
                            return {
                                className: 'mockup-code bg-error text-error-content',
                                prefix: '!'
                            };
                        default:
                            return {
                                className: 'mockup-code bg-base-300 text-base-content',
                                prefix: (index: number) => (index + 1).toString()
                            };
                    }
                };

                const { className: mockupClass, prefix } = getCodeBlockStyle(language);
                const isCopied = copiedCode === codeId;

                return (
                    <div className="my-3 not-prose w-full relative group">
                        {/* 複製按鈕 */}
                        <motion.button
                            onClick={() => copyToClipboard(codeContent, codeId)}
                            className={`absolute top-2 right-2 z-10 btn btn-ghost btn-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${
                                isCopied 
                                    ? 'bg-success/90 text-success-content hover:bg-success' 
                                    : 'bg-base-100/80 hover:bg-base-100'
                            }`}
                            title={isCopied ? "已複製!" : "複製代碼"}
                            whileTap={{ scale: 0.95 }}
                            animate={isCopied ? { scale: [1, 1.1, 1] } : { scale: 1 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                        >
                            <AnimatePresence mode="wait" initial={false}>
                                {isCopied ? (
                                    <motion.div
                                        key="check"
                                        initial={{ scale: 0, rotate: -180, opacity: 0 }}
                                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                        exit={{ scale: 0, rotate: 180, opacity: 0 }}
                                        transition={{
                                            duration: 0.4,
                                            ease: "easeOut",
                                            opacity: { duration: 0.2 }
                                        }}
                                    >
                                        <Check className="w-3 h-3" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="copy"
                                        initial={{ scale: 0, rotate: 180, opacity: 0 }}
                                        animate={{ scale: 1, rotate: 0, opacity: 1 }}
                                        exit={{ scale: 0, rotate: -180, opacity: 0 }}
                                        transition={{
                                            duration: 0.4,
                                            ease: "easeOut",
                                            opacity: { duration: 0.2 }
                                        }}
                                    >
                                        <Copy className="w-3 h-3" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.button>

                        <div className={`${mockupClass} w-full text-xs overflow-x-auto`}>
                            {lines.map((line, index) => {
                                const linePrefix = typeof prefix === 'function' ? prefix(index) : prefix;
                                const isErrorLine = line.includes('Error') || line.includes('error');
                                const isWarningLine = line.includes('Warning') || line.includes('warning');
                                const isSuccessLine = line.includes('Done') || line.includes('success') || line.includes('✓');

                                let lineClass = '';
                                if (isErrorLine) lineClass = 'bg-error text-error-content';
                                else if (isWarningLine) lineClass = 'text-warning';
                                else if (isSuccessLine) lineClass = 'text-success';

                                return (
                                    <pre
                                        key={index}
                                        data-prefix={linePrefix}
                                        className={lineClass}
                                    >
                                        <code>{line}</code>
                                    </pre>
                                );
                            })}
                        </div>
                        {language && (
                            <div className="text-xs opacity-60 mt-1 text-right">
                                {language}
                            </div>
                        )}
                    </div>
                );
            } else {
                // 行內代碼
                return (
                    <code className="bg-base-300 text-base-content px-1 py-0.5 rounded text-xs font-mono">
                        {children}
                    </code>
                );
            }
        },

        // 列表
        ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 my-2 pl-2">{children}</ul>
        ),

        ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 my-2 pl-2">{children}</ol>
        ),

        li: ({ children }) => (
            <li className="text-sm leading-relaxed">{children}</li>
        ),

        // 連結
        a: ({ href, children }) => (
            <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary underline hover:text-primary-focus break-all"
            >
                {children}
            </a>
        ),

        // 標題
        h1: ({ children }) => (
            <h1 className="text-base font-bold my-2 border-b border-base-300 pb-1">{children}</h1>
        ),
        h2: ({ children }) => (
            <h2 className="text-sm font-bold my-2">{children}</h2>
        ),
        h3: ({ children }) => (
            <h3 className="text-sm font-semibold my-1">{children}</h3>
        ),

        // 引用 - 使用 DaisyUI 樣式
        blockquote: ({ children }) => (
            <div className="mockup-code bg-base-200 text-base-content my-3">
                <pre data-prefix=">">
                    <code>{children}</code>
                </pre>
            </div>
        ),

        // 表格
        table: ({ children }) => (
            <div className="overflow-x-auto my-3 rounded border border-base-300">
                <table className="table table-compact w-full text-xs">{children}</table>
            </div>
        ),

        thead: ({ children }) => (
            <thead className="bg-base-200">{children}</thead>
        ),

        tbody: ({ children }) => (
            <tbody>{children}</tbody>
        ),

        tr: ({ children }) => (
            <tr className="hover:bg-base-100/20">{children}</tr>
        ),

        th: ({ children }) => (
            <th className="text-xs font-medium p-2 text-left border-b border-base-300">{children}</th>
        ),

        td: ({ children }) => (
            <td className="text-xs p-2 border-b border-base-200 align-top">{children}</td>
        ),

        // 水平線
        hr: () => (
            <hr className="border-base-300 my-3" />
        ),
    };

    return (
        <div
            className={`chat ${isUser ? 'chat-end' : 'chat-start'} animate-fade-in-up`}
            style={{
                animation: 'fadeInUp 0.3s ease-out forwards',
                opacity: 0,
                transform: 'translateY(10px)'
            }}
        >
            <div className="chat-image avatar">
                <div className="w-8 sm:w-10 md:w-12 rounded-full">
                    <Image
                        alt="頭像"
                        src={avatarImage}
                        width={48}
                        height={48}
                        className="w-full h-full object-cover"
                    />
                </div>
            </div>
            <div className={`chat-header ${isUser ? 'text-right' : 'text-left'} mb-1`}>
                <span className="text-xs sm:text-sm text-base-content">{isUser ? userName : '石化小幫手'}</span>
                <time className="text-xs opacity-50 ml-1 text-base-content">{timestamp}</time>
            </div>
            <div className={`chat-bubble ${isUser ? 'chat-bubble-primary' : 'chat-bubble-secondary'} 
                w-full max-w-[85%] break-words text-xs sm:text-sm leading-relaxed overflow-hidden`}>
                {isUser ? (
                    // 用戶訊息保持簡單格式
                    <div className="whitespace-pre-wrap">{message}</div>
                ) : (
                    // AI 訊息使用 Markdown 解析
                    <div className="markdown-content prose prose-sm max-w-none">
                        <ReactMarkdown
                            components={markdownComponents}
                            remarkPlugins={[remarkGfm]}
                        >
                            {message}
                        </ReactMarkdown>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ChatBubble;
