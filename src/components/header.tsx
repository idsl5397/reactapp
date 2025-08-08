"use client"
import React, { useEffect, useState } from 'react';
import {
    Dialog,
    DialogPanel,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Popover,
    PopoverGroup,
} from '@headlessui/react';
import * as Icon from '@heroicons/react/24/outline';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from 'next/link';
import { Bars3Icon, XMarkIcon, InformationCircleIcon, MapIcon } from '@heroicons/react/24/outline';
import Ava from './avatar/avatarMenu';
import Image from 'next/image';
import {getAccessToken, getUserInfo} from "@/services/serverAuthService";
import {useauthStore} from "@/Stores/authStore";
import { useMenuStore } from "@/Stores/menuStore";
import {jwtDecode} from "jwt-decode";
import logo from "@/../public/logo.svg"
import AutoRefresh from "@/components/Auth/AutoRefresh";
import api from "@/utils/api";
import {DialogContent} from "next/dist/client/components/react-dev-overlay/ui/components/dialog";

const illustrate = [
    { name: '關於我們', href: '/about', icon: InformationCircleIcon },
    { name: '網站導覽', href: '/direction', icon: MapIcon },
];

interface MenuItem {
    id: number;
    label: string;
    link: string;
    icon: string | null;
    parentId: number | null;
    sortOrder: number;
    isActive: number;
    menuType: string;
    children?: MenuItem[];
}

const getIcon = (iconName: string | null) => {
    if (iconName && Icon[iconName as keyof typeof Icon]) {
        return React.createElement(Icon[iconName as keyof typeof Icon], {
            className: 'size-6 text-gray-600 group-hover:text-indigo-600',
        });
    }
    return null;
};

export default function Header() {
    const [avatarMenuState, setAvatarMenuState] = useState<string | null>(null);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    // const [menu, setMenu] = useState<MenuItem[]>([]);
    const [name, setName] = useState('使用者');
    const { checkIsLoggedIn,isLoggedIn } = useauthStore();
    const menu = useMenuStore((state) => state.menu); // ✅ 從 store 直接取
    const hasMenu = useMenuStore((state) => state.hasMenu);

    const basePath = process.env.BASE_PATH || '';
    const NPbasePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
    //先檢查登入狀態
    useEffect(() => {
        checkIsLoggedIn(); // 單純檢查登入狀態
    }, [checkIsLoggedIn]);

    useEffect(() => {
        if (isLoggedIn) {
            // Get user info
            getUserInfo().then(cookieInfo => {
                if (cookieInfo) {
                    setName(cookieInfo?.NickName);
                }
                console.log("✅ 用戶名稱:", cookieInfo?.NickName);
            }).catch(err => {
                console.error("❌ 獲取用戶資訊失敗:", err);
            });

            // Define async function for getting menu
            const getMenu = async () => {
                try {
                    // Get token first
                    const token = await getAccessToken();
                    const res = await api.get('/Menu/GetMenus', {
                        headers: {
                            Authorization: token ? `Bearer ${token.value}` : '',
                        },
                    });
                    useMenuStore.getState().setMenu(res.data);
                } catch (menuError) {
                    console.warn("選單取得失敗，預設為空");
                    useMenuStore.getState().setMenu([]);
                }
            };

            // Parse permissions
            getAccessToken().then(token => {
                if (token?.value) {
                    try {
                        const decoded = jwtDecode<any>(token.value);
                        const rawPerms = decoded.permission ?? [];
                        const permissions = Array.isArray(rawPerms) ? rawPerms : [rawPerms];
                        console.log("🛡️ 使用者權限:", permissions);

                        useauthStore.getState().setPermissions(permissions);
                    } catch (error) {
                        console.error("❌ JWT 解析失敗:", error);
                        useauthStore.getState().setPermissions([]);
                    }
                } else {
                    console.warn("⚠️ 無法取得 access token");
                    useauthStore.getState().setPermissions([]);
                }
            }).catch(err => {
                console.error("❌ 獲取 token 失敗:", err);
            });

            // Call getMenu only when logged in
            getMenu();
        }
    }, [isLoggedIn]);

    return (
        <header id="top" className="bg-white shadow-md">
            <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center p-6">
                {/* Logo */}
                <div className="flex flex-1">
                    <Link href="/home" className="btn btn-ghost">
                        <span className="sr-only">首頁</span>
                        <Image
                            alt="Logo"
                            src={logo}
                            className="h-8 w-auto sm:h-11 md:h-9 lg:h-11"
                            width={100}
                            height={40}
                        />
                    </Link>
                </div>

                {/* Desktop Menu */}
                <PopoverGroup className="hidden md:flex md:gap-x-3 lg:gap-x-5">
                    {/*登入刷新foy版*/}
                    {isLoggedIn &&(
                        <AutoRefresh/>
                    )}
                    {isLoggedIn && hasMenu ? (
                            menu.map((item) => (
                                <React.Fragment key={item.id}>
                                    {item.children && item.children.length > 0 ? (
                                        <Popover className="relative">
                                            {({open, close}) => (
                                                <div
                                                    onMouseEnter={() => !open && (document.activeElement as HTMLElement)?.blur()} // 避免按鈕焦點黏住
                                                >
                                                    <Popover.Button
                                                        onMouseEnter={() => !open && (document.activeElement as HTMLElement)?.blur()}
                                                        className="flex items-center gap-x-1 text-base font-semibold text-gray-900 btn btn-ghost">
                                                        {item.label}
                                                        <ChevronDownIcon aria-hidden="true"
                                                                         className="size-5 flex-none text-gray-400"/>
                                                    </Popover.Button>
                                                    <Popover.Panel
                                                        className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5"
                                                        onMouseLeave={() => close()}
                                                    >
                                                        <div className="p-4">
                                                            {item.children?.map((child) => (
                                                                <div key={child.id}
                                                                     className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                                                                    <div
                                                                        className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                                                        {getIcon(child.icon)}
                                                                    </div>
                                                                    <div className="flex-auto">
                                                                        <Link
                                                                            href={child.link}
                                                                            className="block font-semibold text-gray-900"
                                                                            onClick={() => close()}
                                                                        >
                                                                            {child.label}
                                                                            <span className="absolute inset-0"/>
                                                                        </Link>
                                                                    </div>
                                                                </div>
                                                            ))}
                                                        </div>
                                                    </Popover.Panel>
                                                </div>
                                            )}
                                        </Popover>
                                    ) : (
                                        <Link key={item.id} href={item.link}
                                              className="text-base font-semibold text-gray-900 btn btn-ghost">
                                            {item.label}
                                        </Link>
                                    )}
                                </React.Fragment>
                            )))
                        : (
                            <div className="text-gray-400"></div>
                        )}
                    <Popover className="relative">
                        <Popover.Button
                            className="flex items-center gap-x-1 text-base font-semibold text-gray-900 btn btn-ghost">
                            說明
                            <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-gray-400"/>
                        </Popover.Button>
                        <Popover.Panel
                            className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5">
                            <div className="p-4">
                                {illustrate.map((item) => (
                                    <div key={item.name}
                                         className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                                        <div
                                            className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                            <item.icon aria-hidden="true"
                                                       className="size-6 text-gray-600 group-hover:text-indigo-600"/>
                                        </div>
                                        <div className="flex-auto">
                                            <Link href={item.href} className="block font-semibold text-gray-900">
                                                {item.name}
                                                <span className="absolute inset-0"/>
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </Popover.Panel>
                    </Popover>
                </PopoverGroup>

                {/* Mobile Menu Button */}
                <div className="flex md:hidden ml-auto">
                    <button
                        type="button"
                        onClick={() => setMobileMenuOpen(true)}
                        className="-m-2.5 inline-flex items-center rounded-md p-2.5 text-gray-700"
                    >
                        <span className="sr-only">打開menu</span>
                        <Bars3Icon aria-hidden="true" className="size-8"/>
                    </button>
                </div>

                {/* Avatar Menu */}
                <Ava name={name} state={avatarMenuState} setState={setAvatarMenuState}/>
            </nav>

            {/* Mobile Menu */}
            <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
                <DialogContent className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right">
                    <div className="flex items-center justify-between">
                        <Link href="/home" className="-m-1.5 p-1.5 btn btn-ghost">
                            <span className="sr-only">首頁</span>
                            <Image alt="Logo" src={logo} className="h-11 w-auto" width={100} height={40} />
                        </Link>
                        <button
                            type="button"
                            onClick={() => setMobileMenuOpen(false)}
                            className="-m-2.5 rounded-md p-2.5 text-gray-700 hover:bg-gray-50"
                        >
                            <span className="sr-only">Close menu</span>
                            <XMarkIcon aria-hidden="true" className="size-6" />
                        </button>
                    </div>
                    <div className="mt-6 flow-root">
                        <div className="-my-6 divide-y divide-gray-500/10">
                            <div className="space-y-2 py-6">
                                {menu.map((item) => (
                                    <React.Fragment key={item.id}>
                                        {item.children && item.children.length > 0 ? (
                                            <Disclosure as="div" className="-mx-3">
                                                <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                                                    {item.label}
                                                    <ChevronDownIcon aria-hidden="true" className="size-5 flex-none group-data-[open]:rotate-180" />
                                                </DisclosureButton>
                                                <DisclosurePanel className="mt-2 space-y-2">
                                                    {item.children.map((child) => (
                                                        <Link
                                                            key={child.id}
                                                            href={child.link}
                                                            className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50"
                                                            onClick={() => setMobileMenuOpen(false)}
                                                        >
                                                            {child.label}
                                                        </Link>
                                                    ))}
                                                </DisclosurePanel>
                                            </Disclosure>
                                        ) : (
                                            <Link
                                                key={item.id}
                                                href={item.link}
                                                className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {item.label}
                                            </Link>
                                        )}
                                    </React.Fragment>
                                ))}
                                <Disclosure as="div" className="-mx-3">
                                    <DisclosureButton className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                                        說明
                                        <ChevronDownIcon aria-hidden="true" className="size-5 flex-none group-data-[open]:rotate-180" />
                                    </DisclosureButton>
                                    <DisclosurePanel className="mt-2 space-y-2">
                                        {illustrate.map((item) => (
                                            <Link
                                                key={item.name}
                                                href={item.href}
                                                className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50"
                                                onClick={() => setMobileMenuOpen(false)}
                                            >
                                                {item.name}
                                            </Link>
                                        ))}
                                    </DisclosurePanel>
                                </Disclosure>
                            </div>
                            <div className="py-6">
                                <Link
                                    href="/login"
                                    className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    登入
                                </Link>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </header>
    );
}
