
import React from "react";

export default function Component() {
    return (
        <>

            <footer className="footer footer-center bg-primary text-primary-content p-10 relative">
                {/*<a*/}
                {/*    id="skip-to-content"*/}
                {/*    href="#mainContent"*/}
                {/*    accessKey="C"*/}
                {/*    tabIndex={0}*/}
                {/*    title="跳轉到中央內容區塊"*/}
                {/*    className="invisible absolute"*/}
                {/*>*/}
                {/*    :::*/}
                {/*</a>*/}

                <nav className="grid grid-flow-col gap-4">
                    <a className="link link-hover" href="/about">關於我們</a>
                    <span>|</span>
                    <a className="link link-hover" href="/direction">網站導覽</a>
                </nav>
                <aside>
                    <p className="font-bold">
                        ※本網所提供之電子檔案部分為.PDF格式，如無法閱讀，請自行下載安裝 免費軟體「中文版Adobe PDF Reader」
                        本網站由經濟部產業園區管理局「114年度所轄園區工廠風險評估暨管理躍升計畫」之委辦單位「中華民國工業安全衛生協會」維護管理
                        This site, sponsored by IDA/MOEA, was created and is maintained by the ISHA 本網站最佳瀏覽環境為
                        1024 x 768 視窗模式以上，IE 11.0含以上、Firefox、Chrome、safari 最新版本瀏覽器
                    </p>
                    <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
                </aside>
            </footer>
        </>

    );
}
