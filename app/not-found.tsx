import OreoSmilePic from "@/public/assets/oreoSmile.png";
import { Button } from "@nextui-org/react";
import Image from "next/image";
import Link from "next/link";


export default function NotFound() {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center my-40">
            
            <div className="relative bottom-8 ml-8 select-none" >
                <Image draggable="false" src={OreoSmilePic} alt="" height={141 * 1.5} width={124 * 1.5} />
            </div>

            <div>
                <div className="mb-8 flex flex-col items-center text-center">
                    <span className="text-4xl text-neutral-100 font-semibold">Sadly, this page can not be found..</span> <br />
                    <span className="text-lg text-neutral-400 font-semibold max-w-xl">Seems like you got a little lost here? Here's oreo for now!</span>
                </div>

                <div className="w-full flex flex-col items-center">
                    <Button 
                        as={Link}
                        href="/"
                        prefetch={false}
                        className="button-secondary" 
                     >
                        <span>Go back to Home</span>
                    </Button>
                </div>
            </div>

        </div>
    );
}