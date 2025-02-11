"use client";
import { useEffect, useRef, useState } from "react";


interface Props {
    mobileSrc: string;
    src: string;
    alt: string;
}

export default function MarkdownImage({ mobileSrc, src, alt }: Props) {
    const [isZoomed, setZoom] = useState(false);
    const [innerWidth, setWidth] = useState(0);
    const imageRef = useRef(null);

    useEffect(() => {
        setWidth(window.innerWidth);
    })
    function zoomImage() {
        setZoom(!isZoomed);
    }

    return (
        <div ref={imageRef}>
            {(innerWidth > 768 ? isZoomed : (isZoomed && mobileSrc)) ? (
                <div onClick={zoomImage} className="w-screen z-[100000000000] fixed top-0 bottom-0 right-0 left-0 flex items-center justify-center select-none bg-black/30">
                    <div className="relative flex rounded-xl overflow-hidden w-[85%] cursor-zoom-out items-center justify-center">
                        <img alt="" className="rounded-md" loading="lazy" src={innerWidth > 768 ? src : mobileSrc} />
                    </div>
                </div>
            ) : <></>}
            <span onClick={zoomImage} className="w-fit items-center flex rounded-lg max-w-4xl cursor-zoom-in select-none outline outline-1 outline-white/[10%] my-5">
                <img alt={alt} className="rounded-md" loading="lazy" src={src?.split('?')[0]} />
            </span>
        </div>
    )
}