"use client";

export default function Component() {
    return (
        <footer className="footer footer-center bg-primary text-primary-content p-10">
            <aside>
                <p className="font-bold">
                    ※本網所提供之電子檔案部分為.PDF格式，如無法閱讀，請自行下載安裝 免費軟體「中文版Adobe PDF Reader」
                    本網站由經濟部產業發展署「工業安全智慧化輔導計畫」之委辦單位「中華民國工業安全衛生協會」維護管理
                    This site, sponsored by IDA/MOEA, was created and is maintained by the ISHA 本網站最佳瀏覽環境為
                    1024 x 768 視窗模式以上，IE 11.0含以上、Firefox、Chrome、safari最新版本瀏覽器
                </p>
                <p>Copyright © {new Date().getFullYear()} - All right reserved</p>
            </aside>
        </footer>
    );
}
