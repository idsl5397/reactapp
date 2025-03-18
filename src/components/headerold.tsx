'use client'
import {useEffect, useState} from 'react'
import {
    Dialog,
    DialogPanel,
    Disclosure,
    DisclosureButton, DisclosurePanel,
    Popover,
    PopoverButton,
    PopoverGroup,
    PopoverPanel,
} from '@headlessui/react'
import {
    Bars3Icon,
    ChartPieIcon,
    CursorArrowRaysIcon,
    FingerPrintIcon, UserCircleIcon,
    XMarkIcon,
} from '@heroicons/react/24/outline'
import { ChevronDownIcon} from '@heroicons/react/20/solid'
import ArrowRightEndOnRectangleIcon from "@heroicons/react/24/outline/ArrowRightEndOnRectangleIcon";
import CheckCircleIcon from "@heroicons/react/24/outline/CheckCircleIcon";
import CalendarDateRangeIcon from "@heroicons/react/24/outline/CalendarDateRangeIcon";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";
import Link from "next/link";
import axios from "axios";
import Image from 'next/image';

const products = [
    { name: '新增/修改績效指標', href: '/kpi', icon: PencilSquareIcon},
    { name: '建立KPI報告', href: '/reportEntry', icon: CursorArrowRaysIcon },
    { name: '改善報告書', href: '/improvement', icon: CheckCircleIcon },
    { name: '委員回覆及改善計畫', href: '/actionPlan', icon: CalendarDateRangeIcon },
    { name: '報表', href: '/report', icon: ChartPieIcon },
]
const account = [
    { name: '登入帳號', href: '/login', icon: ArrowRightEndOnRectangleIcon },
    { name: '新增帳號',href: '/register', icon: FingerPrintIcon },

]


export default function Example() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [_menu, setMenu] = useState([]);
    const api = axios.create({
        baseURL: '/proxy', //  timeout: 10000  // 添加請求超時設置
    });

    useEffect(() => {
        api
            .get("/Menu/GetMenus") // 透過 axios 獲取後端選單數據
            .then((response) => {
                setMenu(response.data.menu);
            })
            .catch((error) => {
                console.error("獲取選單失敗:", error);
            });
    }, []);

    return (
        <>
        <div className="border-b border-gray-900/10">
            <header className="bg-white"> {/*bg-[#E0E8FA]*/}
                <nav aria-label="Global" className="mx-auto flex max-w-7xl items-center p-6">
                    <div className="flex lg:flex-1">
                        <Link href="/" className="-m-1.5 p-1.5 btn btn-ghost">
                            <span className="sr-only">首頁</span>
                            <Image
                                alt=""
                                src="/logo.svg"
                                className="h-11 w-auto md:h-8 lg:h-11"
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
                    <PopoverGroup className="hidden md:flex md:gap-x-6 lg:gap-x-6">
                        <Link href="/home" className="text-base font-semibold text-gray-900 btn btn-ghost">
                            首頁
                        </Link>

                        <Link href="/direction" className="text-base font-semibold text-gray-900 btn btn-ghost">
                            網站導覽
                        </Link>

                        <Popover className="relative">
                            <PopoverButton
                                className="flex items-center gap-x-1 text-base font-semibold text-gray-900 btn btn-ghost">
                                績效指標
                                <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-gray-400"/>
                            </PopoverButton>

                            <PopoverPanel
                                transition
                                className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                            >

                                <div className="p-4">
                                    {products.map((item) => (
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
                                                <Link href={item.href} className="block font-semibold text-gray-900">
                                                    {item.name}
                                                    <span className="absolute inset-0"/>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </PopoverPanel>
                        </Popover>

                        <Popover className="relative">
                            <PopoverButton
                                className="flex items-center gap-x-1 text-base font-semibold text-gray-900 btn btn-ghost">
                                帳號管理
                                <ChevronDownIcon aria-hidden="true" className="size-5 flex-none text-gray-400"/>
                            </PopoverButton>
                            <PopoverPanel
                                transition
                                className="absolute -left-8 top-full z-10 mt-3 w-screen max-w-md overflow-hidden rounded-3xl bg-white shadow-lg ring-1 ring-gray-900/5 transition data-[closed]:translate-y-1 data-[closed]:opacity-0 data-[enter]:duration-200 data-[leave]:duration-150 data-[enter]:ease-out data-[leave]:ease-in"
                            >
                                <div className="p-4">
                                    {account.map((item) => (
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
                                                <Link href={item.href} className="block font-semibold text-gray-900">
                                                    {item.name}
                                                    <span className="absolute inset-0"/>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </PopoverPanel>
                        </Popover>
                        <div className="hidden md:flex md:flex-1 md:justify-end lg:justify-end">
                            <Link href="#" className="text-sm/6 font-semibold text-gray-900 btn btn-ghost">
                                <UserCircleIcon className="h-8 w-8 text-gray-900"/>
                                {/*Log in <span aria-hidden="true">&rarr;</span>*/}
                            </Link>
                        </div>
                    </PopoverGroup>


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
                                />
                            </Link>
                            <button
                                type="button"
                                onClick={() => setMobileMenuOpen(false)}
                                className="-m-2.5 rounded-md p-2.5 text-gray-700"
                            >
                                <span className="sr-only">Close menu</span>
                                <XMarkIcon aria-hidden="true" className="size-6" />
                            </button>
                        </div>
                        <div className="mt-6 flow-root">
                            <div className="-my-6 divide-y divide-gray-500/10">
                                <div className="space-y-2 py-6">
                                    <Link
                                        href="/home"
                                        className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                                    >
                                        首頁
                                    </Link>

                                    <Link
                                        href="/direction"
                                        className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-gray-900 hover:bg-gray-50"
                                    >
                                        網站導覽
                                    </Link>

                                    <Disclosure as="div" className="-mx-3">
                                        <DisclosureButton
                                            className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                                            績效指標
                                            <ChevronDownIcon aria-hidden="true"
                                                             className="size-5 flex-none group-data-[open]:rotate-180"/>
                                        </DisclosureButton>
                                        <DisclosurePanel className="mt-2 space-y-2">
                                            {products.map((item) => (
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


                                    <Disclosure as="div" className="-mx-3">
                                        <DisclosureButton
                                            className="group flex w-full items-center justify-between rounded-lg py-2 pl-3 pr-3.5 text-base/7 font-semibold text-gray-900 hover:bg-gray-50">
                                            帳號管理
                                            <ChevronDownIcon aria-hidden="true"
                                                             className="size-5 flex-none group-data-[open]:rotate-180"/>
                                        </DisclosureButton>
                                        <DisclosurePanel className="mt-2 space-y-2">
                                            {account.map((item) => (
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
                                        Log in
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </DialogPanel>
                </Dialog>
            </header>
        </div>
        </>
    )
}
