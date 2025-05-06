"use client"

import { usePathname, useRouter, useSearchParams } from "next/navigation"

function Filter() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();
    const activeFilter = searchParams.get("quantity") ?? "all";

    function handleFilter(filter) {
        const params = new URLSearchParams(searchParams);
        params.set("quantity", filter);
        router.replace(`${pathname}?${params.toString()}`);
    }

    return (
        <div className="border border-primary-800 flex">
            <Button handleFilter={handleFilter} activeFilter={activeFilter} filter="all">All Cabins</Button>
            <Button handleFilter={handleFilter} activeFilter={activeFilter} filter="small">1&mdash;3 guests</Button>
            <Button handleFilter={handleFilter} activeFilter={activeFilter} filter="medium">4&mdash;7 guests</Button>
            <Button handleFilter={handleFilter} activeFilter={activeFilter} filter="large">8&mdash;12 guests</Button>
        </div>
    );
}

export default Filter;


function Button({ children, handleFilter, filter, activeFilter }) {
    return (
        <button
            className={`px-5 py-2 hover:bg-primary-700 ${activeFilter === filter ? "bg-primary-700" : ""
                }`}
            onClick={() => handleFilter(filter)}
        >
            {children}
        </button>
    );
}
