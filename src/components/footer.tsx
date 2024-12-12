"use client";

import { Footer } from "flowbite-react";
import { BsFacebook, BsGithub, BsInstagram, BsTwitter } from "react-icons/bs";

export function Component() {
    return (
        <Footer container>
            <div className="w-full">
                <Footer.Divider />
                <div className="grid w-full justify-between sm:flex sm:justify-between md:flex md:grid-cols-1 font-semibold">
                    <div>
                        ※本網所提供之電子檔案部分為.PDF格式，如無法閱讀，請自行下載安裝　免費軟體「中文版Adobe PDF Reader」 本網站由經濟部產業發展署「工業安全智慧化輔導計畫」之委辦單位「中華民國工業安全衛生協會」維護管理
                        This site, sponsored by IDA/MOEA, was created and is maintained by the ISHA 本網站最佳瀏覽環境為 1024 x 768 視窗模式以上，IE 11.0含以上、Firefox、Chrome、safari最新版本瀏覽器
                    </div>
                    <div className="grid grid-cols-2 gap-8 sm:mt-4 sm:grid-cols-3 sm:gap-6">

                    </div>
                </div>

                <div className="w-full sm:flex sm:items-center sm:justify-between">
                    <Footer.Copyright href="#" by="測試™" year={2024} />
                    <div className="mt-4 flex space-x-6 sm:mt-0 sm:justify-center">
                        <Footer.Icon href="#" icon={BsFacebook} />
                        <Footer.Icon href="#" icon={BsInstagram} />
                        <Footer.Icon href="#" icon={BsTwitter} />
                        <Footer.Icon href="#" icon={BsGithub} />
                    </div>
                </div>
            </div>
        </Footer>
    );
}
