import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Cookies from 'js-cookie';

interface AvatarMenuProps {
    name: string;
    image?: string;
    state: string | null;
    setState: (state: string | null) => void;
}

export default function AvatarMenu(props: AvatarMenuProps) {
    const { name, image, state, setState } = props;

    const avatarImage = image || "/user.svg";

    const [isLoading] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false); // 新增：登入狀態
    const menuRef = useRef<HTMLDivElement>(null);

    const avatarMenuId = "avatar-menu";
    const isAvatarMenuOpen = state === avatarMenuId;

    // 檢查 cookies 中是否有 JWT
    useEffect(() => {
        const token = Cookies.get('token');
        setIsLoggedIn(!!token); // 如果有 token，設置 isLoggedIn 為 true
    }, []);

    const handleLogout = (e?: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent) => {
        e?.preventDefault();
        Cookies.remove('token'); // 清除 JWT
        Cookies.remove('name'); // 清除 JWT
        setIsLoggedIn(false); // 設置登入狀態為 false
        setState(null); // 關閉選單
        // router.push('/login');
        window.location.replace('/login');// 跳轉到登入頁面
    };

    const handleLogin = (e?: React.MouseEvent<HTMLSpanElement> | React.KeyboardEvent) => {
        e?.preventDefault();
        setState(null); // 關閉選單
        // router.push('/login');
        window.location.replace('/login');// 跳轉到登入頁面
    };

    const toggleMenu = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        setState(isAvatarMenuOpen ? null : avatarMenuId);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape' && isAvatarMenuOpen) {
            setState(null);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (isAvatarMenuOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
                setState(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isAvatarMenuOpen, setState]);

    // 根據登入狀態動態生成選項
    const items = isLoggedIn
        ? [
            { label: "個人資料", link: "/profile" },
            { label: "設定", link: "/settings" },
            { label: "登出", onClick: handleLogout },
        ]
        : [{ label: "登入", onClick: handleLogin }];

    return (
        <div ref={menuRef} onKeyDown={handleKeyDown} className="relative">
            <div className="dropdown dropdown-end">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    aria-haspopup="true"
                    aria-expanded={isAvatarMenuOpen}
                    aria-controls="avatar-dropdown-menu"
                    aria-label="Toggle user menu"
                    className="btn btn-ghost btn-circle avatar focus:ring-2 focus:ring-primary focus:outline-none"
                    onClick={toggleMenu}
                >
                    <div className="w-10 rounded-full">
                        <Image
                            src={avatarImage}
                            alt={`${name}'s avatar`}
                            width={200}
                            height={200}
                            priority={avatarImage === "/user.svg"}
                        />
                    </div>
                </motion.button>

                <AnimatePresence>
                    {isAvatarMenuOpen && (
                        <motion.ul
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.2, staggerChildren: 0.1 }}
                            id="avatar-dropdown-menu"
                            className="menu menu-sm dropdown-content bg-base-100 rounded-box z-[1] mt-3 w-52 p-2 shadow"
                            role="menu"
                        >
                            {isLoading ? (
                                <motion.li
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="px-4 py-2"
                                    role="none"
                                >
                                    載入中...
                                </motion.li>
                            ) : (
                                <>
                                    {isLoggedIn && ( // 只有登入時顯示名字
                                        <>
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="flex items-center gap-2 px-3 py-2"
                                            >
                                                <p className="font-medium text-2xl">
                                                    {name}
                                                </p>
                                                <p className="text-sm text-gray-600 ml-2">
                                                    您好
                                                </p>
                                            </motion.div>
                                            <div className="divider my-1"></div>
                                        </>
                                    )}

                                    {items.map((item, index) => (
                                        <motion.li
                                            key={index}
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1 }}
                                            className="mt-1"
                                            role="none"
                                        >
                                            {item.link ? (
                                                <Link
                                                    href={item.link}
                                                    className="flex gap-2 p-2 hover:bg-base-200 rounded-md"
                                                    role="menuitem"
                                                    tabIndex={0}
                                                >
                                                    {item.label}
                                                </Link>
                                            ) : (
                                                <button
                                                    onClick={item.onClick}
                                                    className="flex gap-2 p-2 hover:bg-base-200 rounded-md w-full text-left"
                                                    role="menuitem"
                                                    tabIndex={0}
                                                >
                                                    {item.label}
                                                </button>
                                            )}
                                        </motion.li>
                                    ))}
                                </>
                            )}
                        </motion.ul>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}