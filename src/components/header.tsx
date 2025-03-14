import React, {useEffect, useState} from 'react'
import Cookies from 'js-cookie';
import {
    Dialog,
    DialogPanel,
    Disclosure,
    DisclosureButton, DisclosurePanel,
    Popover,
    PopoverGroup,
} from '@headlessui/react'

import * as Icon from '@heroicons/react/24/outline'
import { ChevronDownIcon} from '@heroicons/react/20/solid'
import Link from "next/link";
import axios from "axios";
import {Bars3Icon, FingerPrintIcon, XMarkIcon} from "@heroicons/react/24/outline";
import Ava from "./avatar/avatarMenu";
import ArrowRightEndOnRectangleIcon from "@heroicons/react/24/outline/ArrowRightEndOnRectangleIcon";
import Image from 'next/image';

const illustrate = [
    { name: '關於我們', href: '/about', icon: ArrowRightEndOnRectangleIcon },
    { name: '網站導覽',href: '/direction', icon: FingerPrintIcon },

]

interface MenuItem {
    id: number;
    label: string;
    link: string;
    icon: string | null;
    parentId: number | null;
    sortOrder: number;
    isActive: number;
    menuType: string;
    children?: MenuItem[]; // 有可能會有 children
}

const getIcon = (iconName: string | null) => {
    if (iconName && Icon[iconName as keyof typeof Icon]) {
        return React.createElement(Icon[iconName as keyof typeof Icon], { className: 'size-6 text-gray-600 group-hover:text-indigo-600' });
    }
    return null;
};

export default function Header() {
    const [avatarMenuState, setAvatarMenuState] = useState<string | null>(null);

    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [menu, setMenu] = useState<MenuItem[]>([]);
    const api = axios.create({
        baseURL: '/proxy', //  timeout: 10000  // 添加請求超時設置
    });

    const [windowWidth, setWindowWidth] = useState<number>(0);

    useEffect(() => {
        const handleResize = () => {
            setWindowWidth(window.innerWidth);
        };
        handleResize(); // 設定初始值

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        const token = Cookies.get('token')
        api.get("/Menu/GetMenus", {
            headers: {
                Authorization: token ? `Bearer ${token}` : "", // 如果沒有 token，仍發送請求但不附帶 Authorization
            },
        })
            .then((response) => {
                setMenu(response.data);
            })
            .catch((error) => {
                if (error.response && error.response.status === 401) {
                    // 如果是 401，保持 menu 為空，不顯示錯誤訊息
                    console.warn("未授權 (401)，不顯示選單");
                    setMenu([]); // 確保選單為空
                } else {
                    console.error("獲取選單失敗:", error);
                }
            });
    }, []);

    if (windowWidth >= 768) {
        return (
            <>
                <header className="bg-white shadow-md">
                    <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center p-6">
                        <div className="flex lg:flex-1">
                            <div className="flex lg:flex-1">
                                <Link href="/" className="-m-1.5 p-1.5 btn btn-ghost">
                                    <span className="sr-only">首頁</span>
                                    <Image
                                        alt="Logo"
                                        src="/logo.svg"
                                        className="h-11 w-auto md:h-8 lg:h-11"
                                        width={100} // 設定寬度
                                        height={40} // 設定高度
                                    />
                                </Link>
                            </div>
                        </div>

                        <PopoverGroup className="hidden md:flex md:gap-x-3 lg:gap-x-5">
                            {menu.map((item) => {
                                if (item.children && item.children.length > 0) {
                                    // 如果有 children，就渲染 Popover
                                    return (

                                        <Popover key={item.id} className="relative">
                                            <Popover.Button
                                                className="flex items-center gap-x-1 text-base font-semibold text-gray-900 btn btn-ghost">
                                                {item.label}
                                                <ChevronDownIcon aria-hidden="true"
                                                                 className="size-5 flex-none text-gray-400"/>
                                            </Popover.Button>

                                            <Popover.Panel
                                                transition
                                                className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                                            >
                                                <div className="p-4">
                                                    {item.children.map((child) => (
                                                        <div key={child.id}
                                                             className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50">
                                                            <div
                                                                className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                                                {getIcon(child.icon)}
                                                            </div>
                                                            <div className="flex-auto">
                                                                <Link href={child.link}
                                                                      className="block font-semibold text-gray-900">
                                                                    {child.label}
                                                                    <span className="absolute inset-0"/>
                                                                </Link>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </Popover.Panel>
                                        </Popover>
                                    );
                                } else {
                                    // 如果沒有 children，就渲染普通的 Link
                                    return (
                                        <Link key={item.id} href={item.link}
                                              className="text-base font-semibold text-gray-900 btn btn-ghost">
                                            {item.label}
                                        </Link>
                                    );
                                }
                            })}
                            <Popover className="relative">
                                <Popover.Button
                                    className="flex items-center gap-x-1 text-base font-semibold text-gray-900 btn btn-ghost">
                                    說明
                                    <ChevronDownIcon aria-hidden="true"
                                                     className="size-5 flex-none text-gray-400"/>
                                </Popover.Button>

                                <Popover.Panel
                                    transition
                                    className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                                >
                                    <div className="p-4">
                                        {illustrate.map((item) => (
                                            <div
                                                key={item.name}
                                                className="group relative flex items-center gap-x-6 rounded-lg p-4 text-sm/6 hover:bg-gray-50"
                                            >
                                                <div
                                                    className="flex size-11 flex-none items-center justify-center rounded-lg bg-gray-50 group-hover:bg-white">
                                                    <item.icon aria-hidden="true"
                                                               className="size-6 text-gray-600 group-hover:text-indigo-600"/>
                                                </div>
                                                <div className="flex-auto">
                                                    <Link href={item.href}
                                                          className="block font-semibold text-gray-900">
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

                        <Ava
                            name={Cookies.get('name') || '使用者'}
                            state={avatarMenuState}
                            setState={setAvatarMenuState}
                        />
                    </nav>
                </header>
            </>
        )
    } else {
        return (
            <>
                <header className="bg-white shadow-md"> {/*bg-[#E0E8FA]*/}
                    <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center p-6">
                        <div className="flex lg:flex-1">
                            <Link href="/" className="-m-1.5 p-1.5 btn btn-ghost">
                                <span className="sr-only">首頁</span>
                                <Image
                                    alt=""
                                    src="/logo.svg"
                                    className="h-11 w-auto md:h-8 lg:h-11"
                                    width={100} // 設定寬度
                                    height={40} // 設定高度
                                />
                            </Link>
                        </div>
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
                </nav>
                <Dialog open={mobileMenuOpen} onClose={setMobileMenuOpen} className="lg:hidden">
                            <div className="fixed inset-0 z-10"/>
                            <DialogPanel
                                className="fixed inset-y-0 right-0 z-10 w-full overflow-y-auto bg-white px-6 py-6 sm:max-w-sm sm:ring-1 sm:ring-gray-900/10">
                                <div className="flex items-center justify-between">
                                    <Link href="/" className="-m-1.5 p-1.5 btn btn-ghost">
                                        <span className="sr-only">首頁</span>
                                        <Image
                                            alt=""
                                            src="/logo.svg"
                                            className="h-11 w-auto"
                                            width={100} // 設定寬度
                                            height={40} // 設定高度
                                        />
                                    </Link>
                                    <button
                                        type="button"
                                        onClick={() => setMobileMenuOpen(false)}
                                        className="-m-2.5 rounded-md p-2.5 text-gray-700"
                                    >
                                        <span className="sr-only">Close menu</span>
                                        <XMarkIcon aria-hidden="true" className="size-6"/>
                                    </button>
                                </div>
                                <div className="mt-6 flow-root">
                                    <div className="-my-6 divide-y divide-gray-500/10">
                                        <div className="space-y-2 py-6">
                                            {menu.map((item) => {
                                                if (item.children && item.children.length > 0) {
                                                    return (
                                                        <Disclosure key={item.id} as="div" className="-mx-3">
                                                            <DisclosureButton
                                                                className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                                                                {item.label}
                                                                <ChevronDownIcon aria-hidden="true"
                                                                                 className="size-5 flex-none group-data-[open]:rotate-180"/>
                                                            </DisclosureButton>
                                                            <DisclosurePanel className="mt-2 space-y-2">
                                                                {item.children.map((child) => (
                                                                    <DisclosureButton
                                                                        key={child.id}
                                                                        as="a"
                                                                        href={child.link}
                                                                        className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50"
                                                                    >
                                                                        {child.label}
                                                                    </DisclosureButton>
                                                                ))}
                                                            </DisclosurePanel>
                                                        </Disclosure>
                                                    );
                                                } else {
                                                    return (
                                                        <Link
                                                            key={item.id} href={item.link}
                                                            className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                                                        >
                                                            {item.label}
                                                        </Link>
                                                    );
                                                }
                                            })}
                                            <Disclosure as="div" className="-mx-3">
                                                <DisclosureButton
                                                    className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                                                    說明
                                                    <ChevronDownIcon aria-hidden="true"
                                                                     className="size-5 flex-none group-data-[open]:rotate-180"/>
                                                </DisclosureButton>
                                                <DisclosurePanel className="mt-2 space-y-2">
                                                    {illustrate.map((item) => (
                                                        <DisclosureButton
                                                            key={item.name}
                                                            as="a"
                                                            href={item.href}
                                                            className="block rounded-lg py-2 pl-6 pr-3 text-sm/7 font-semibold text-gray-900 hover:bg-gray-50"
                                                        >
                                                            {item.name}
                                                        </DisclosureButton>
                                                    ))}
                                                </DisclosurePanel>
                                            </Disclosure>
                                        </div>
                                        <div className="py-6">
                                            <Link
                                                href="#"
                                                className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                                            >
                                                登入
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </DialogPanel>
                        </Dialog>
                </header>
            </>
    )
    }
    }
