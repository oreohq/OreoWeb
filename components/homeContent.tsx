"use client";
import { AnimationOnScroll } from "react-animation-on-scroll";
import { PlusCircle, Stars } from "@/components/icons";
import { StaticImageData } from "next/image";
import { useState, useEffect } from "react";
import { Button } from "@nextui-org/react";
import { ClassValue } from "clsx";
import Image from "next/image";
import Link from "next/link";
import cn from "@/utils/cn";


type Props = { title: string; description: string; image: StaticImageData, images?: StaticImageData[], imageFirst?: boolean, className?: ClassValue };
export function ArticleContent({ title, description, image, images, imageFirst = false, className }: Props) {
    return (
        <AnimationOnScroll offset={100} animateOnce={true} animateIn="animate__fadeInUp" duration={0.5}>
            <div className={cn("flex flex-col items-center gap-6 justify-between", imageFirst ? "lg:flex-row-reverse" : "lg:flex-row", className)}>
                <div className="w-full md:w-1/2 flex flex-col items-center justify-center lg:justify-start gap-4">
                    <div className="flex flex-col gap-4 text-center w-full lg:text-left">
                        <h2 className="lg:text-5xl text-4xl text-white font-bold mb-2">{title}</h2>
                        <div className="text-xl">{description}</div>
                    </div>
                </div>
    
                <div className={cn("shrink-0 flex items-center justify-center w-full md:w-1/2 select-none", imageFirst ? "lg:justify-start" : "lg:justify-end")}>
                    {images?.length ? (
                        <MultiImageRotate images={images}/>
                    ) : (
                        <Image 
                            alt="content"
                            className="max-w-[28rem] hover:scale-[1.02]"
                            itemProp="image"
                            loading="lazy"
                            src={image}
                        />
                    )}
                    
                </div>
            </div>
        </AnimationOnScroll>
    )
}


export function Homebuttons() {
    const scrollToFeatures = () => {
        const element = document.getElementById('oreo-features');
        if (element) element.scrollIntoView({ behavior: 'smooth' });
    }

    return (
        <div className="flex flex-row gap-4">
            <Button
                size="lg"
                as={Link} 
                href="/invite"
                prefetch={false}
                startContent={<PlusCircle />}
                className="!text-xl button-primary shadow-md"
            >
                <span className="block sm:hidden">Add Oreo</span>
                <span className="hidden sm:block">Add to Discord</span>
            </Button>
            <Button
                size="lg"
                onClick={scrollToFeatures}
                startContent={<Stars />}
                className="!text-xl button-secondary shadow-md"
            >
                <span>View Features</span>
            </Button>
        </div>
    )
}


export function ContentAnimate({ children }: { children: React.ReactNode }) {
    return (
        <AnimationOnScroll offset={100} animateOnce={true} animateIn="animate__fadeInUp" duration={0.5}>
            {children}
        </AnimationOnScroll>
    )
}


function MultiImageRotate({ images }: { images: StaticImageData[] }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    
    useEffect(() => {
        const intervalId = setInterval(() => {
            if (currentIndex === images.length - 1) setCurrentIndex(0);
            else setCurrentIndex(currentIndex + 1)     
        }, 3000);
        return () => clearInterval(intervalId);
    }, [currentIndex]);

    return (
        <Image 
            alt="content"
            className="max-w-[28rem] hover:scale-[1.02]"
            itemProp="image"
            src={images[currentIndex]}
        />
    )
}