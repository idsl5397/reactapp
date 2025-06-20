'use client'
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export interface UploadItem {
    title: string;
    content: string;
    href: string;
    icon?: React.ReactNode;
}
interface UploadOptionModalProps {
    isOpen: boolean;
    activeIndex: number | null;
    toggle: (index: number) => void;
    closeModal: () => void;
    title?: string;
    description?: string;
    items: UploadItem[];
}

export function UploadOptionModal({
                                      isOpen,
                                      activeIndex,
                                      toggle,
                                      closeModal,
                                      title,
                                      description,
                                      items
                                  }: UploadOptionModalProps) {
    if (!isOpen) return null;

    return (
        <dialog className="modal modal-open z-50">
            <div className="modal-box bg-white p-6 rounded-2xl shadow-lg border w-full max-w-2xl">
                {title && <h3 className="text-2xl font-bold text-gray-800 mb-2">{title}</h3>}
                {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}

                <div className="grid gap-4">
                    {items.map((item, idx) => {
                        const expanded = activeIndex === idx;
                        return (
                            <div key={idx} className="border border-base-200 rounded-xl bg-gray-50 hover:bg-gray-100 transition">
                                <button
                                    onClick={() => toggle(idx)}
                                    className="w-full flex items-center justify-between px-4 py-3 font-semibold text-gray-800"
                                >
                                    <div className="flex items-center gap-2">
                                        {item.icon}
                                        {item.title}
                                    </div>
                                    <span className="text-gray-400">{expanded ? "▲" : "▼"}</span>
                                </button>

                                <AnimatePresence initial={false}>
                                    {expanded && (
                                        <motion.div
                                            key="content"
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                                            className="overflow-hidden px-4 pb-4 text-sm text-gray-600"
                                        >
                                            <p>{item.content}</p>
                                            <div className="flex justify-end mt-3 mb-3">
                                                <Link href={item.href} className="btn btn-sm btn-primary" onClick={closeModal}>
                                                    前往
                                                </Link>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                <div className="modal-action mt-6  flex justify-end">
                    <button className="btn btn-neutral btn-sm" onClick={closeModal}>關閉</button>
                </div>
            </div>
        </dialog>
    );
}