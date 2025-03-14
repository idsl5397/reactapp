import React from "react";

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbsProps {
    items: BreadcrumbItem[];
}
import {HomeIcon} from "@heroicons/react/24/outline";

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items }) => {
    return (
        <div className="breadcrumbs text-sm">
            <ul className="flex space-x-2 pl-2">
                <HomeIcon aria-hidden="true" className="size-4"/>
                {items.map((item, index) => (
                    <li key={index} className="flex items-center ml-2">
                        {item.href ? (
                            <a href={item.href} className="text-blue-500 hover:underline">
                                {item.label}
                            </a>
                        ) : (
                            <span className="text-gray-500">{item.label}</span>
                        )}
                        {index < items.length - 1 }
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Breadcrumbs;
