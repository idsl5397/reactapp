'use client';
import React from "react";
import PencilSquareIcon from "@heroicons/react/24/outline/PencilSquareIcon";

export default function Dashboard() {

    return (
        // <div className="flex flex-col min-h-screen">
        <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
            <div>
                <h1>首頁</h1>
                <div className="mt-10 grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                    <div className="card shadow-xl">
                        <figure className="px-14 pt-10">
                            <PencilSquareIcon className="rounded-sm"/>
                        </figure>
                        <div className="card-body items-center text-center">
                            <h2 className="card-title">Shoes!</h2>
                            <div className="card-actions">
                                <button className="btn btn-primary">Buy Now</button>
                            </div>
                        </div>
                    </div>
                    <div className="card shadow-xl">
                        <figure className="px-14 pt-10">
                            <PencilSquareIcon className="rounded-sm"/>
                        </figure>
                        <div className="card-body items-center text-center">
                            <h2 className="card-title">Shoes!</h2>
                            <div className="card-actions">
                                <button className="btn btn-primary">Buy Now</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
