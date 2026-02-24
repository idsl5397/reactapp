import type { Metadata } from "next";
import Platform from "@/components/Platform/Platform";
export const metadata: Metadata = { title: "首頁" };

export default function page(){

    return (
        <>
            <Platform />
        </>
    )
}