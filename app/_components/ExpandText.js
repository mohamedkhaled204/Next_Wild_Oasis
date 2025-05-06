"use client"
import { useState } from "react"

function ExpandText({ children }) {
    const [isExpand, setIsExpand] = useState(false);
    const displayText = isExpand ? children : children.split(" ").slice(0, 20).join(" ") + "...";
    return (
        <span>
            {displayText} {" "}
            <button className='text-primary-700 border-b border-primary-700 leading-3 pb-1'
                onClick={() => setIsExpand(!isExpand)}>
                {isExpand ? "Read Less" : "Read More"}
            </button>
        </span>
    )
}

export default ExpandText
