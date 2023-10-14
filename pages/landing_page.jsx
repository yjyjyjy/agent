"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Footer from "@/components/ui/Footer";

export default function LandingPage() {


    const [marginTop, setMarginTop] = useState('0px');  // Initialize margin state
    const router = useRouter();
    useEffect(() => {
        // Function to update margin
        const updateMargin = () => {
            if (window.innerWidth <= 768) {  // 768px is commonly used for mobile
                setMarginTop('-20px');  // Set top margin for mobile
            } else {
                setMarginTop('20px');  // Reset for non-mobile
            }
        };

        // Initial call to set margin
        updateMargin();

        // Listen for window resize events
        window.addEventListener('resize', updateMargin);

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('resize', updateMargin);
        };
    }, []);  // Empty dependency array means this effect runs once on mount and cleanup on unmount

    return (
        <AnimatePresence>
            <div className="w-full flex flex-col min-h-screen font-inter overflow-hidden">
                <div className="justify-center w-full mt-20">

                    <main style={{ marginTop: marginTop }} className="flex-grow flex flex-col justify-center h-full static w-screen overflow-hidden  pt-[30px] md:py-0 ">

                        <div className=" px-4 md:px-20">
                            <motion.h3
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: 0.15,
                                    duration: 0.95,
                                    ease: [0.165, 0.84, 0.44, 1],
                                }}
                                className="relative md:ml-[-10px] mb-5 font-extrabold text-[5vw] md:text-[30px] font-inter text-secondary leading-[0.9] tracking-[-2px] "
                            >
                                Waterbear.one  <br />
                            </motion.h3>

                            <motion.h1
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: 0.15,
                                    duration: 0.95,
                                    ease: [0.165, 0.84, 0.44, 1],
                                }}
                                className="relative md:ml-[-10px] md:mb-[37px] font-extrabold text-[16vw] md:text-[130px] font-inter text-base-400 leading-[0.9] tracking-[-2px]"
                            >
                                Connect,  <br />
                                Earn, <br />
                                <span className="text-primary">Effortlessly</span>
                                <span className="font-inter text-primary">.</span>
                            </motion.h1>

                            <div className="flex flex-wrap justify-start mt-8 mb-8 md:mt-0 space-x-0 space-y-5 md:space-x-5 md:space-y-0">
                                <motion.div
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{
                                        delay: 0.55,
                                        duration: 0.55,
                                        ease: [0.075, 0.82, 0.965, 1],
                                    }}
                                    className="w-full md:w-auto"
                                >
                                    <div className="btn btn-primary btn-wide w-full md:w-auto" onClick={() => {
                                        router.push('/signin');
                                    }}>Sign in 🚀</div>
                                </motion.div>
                            </div>



                            <motion.div
                                initial={{ opacity: 0, y: 40 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    delay: 0.15,
                                    duration: 0.95,
                                    ease: [0.165, 0.84, 0.44, 1],
                                }}
                                className="flex flex-row justify-center z-20 mx-0 mb-0 mt-8 md:mt-0 md:mb-[35px] max-w-2xl md:space-x-8"
                            >
                                <div className="w-1/2 mr-10">
                                    <h2 className="flex items-center font-semibold text-[1em] text-secondary">
                                        Triage your DMs with AI
                                    </h2>
                                    <p className="text-[14px] leading-[20px] text-secondary font-normal">
                                        Your inbox is a mix of opportunities and distractions. Leave this to our AI</p>
                                </div>
                                <div className="w-1/2">
                                    <h2 className="flex items-center font-semibold text-[1em] text-secondary">
                                        Connect, Support, Upsell wihtout the hassle
                                    </h2>
                                    <p className="text-[14px] leading-[20px] text-secondary font-normal">
                                        Our AI agent engage your conversations per your instruction base on the task, available 24/7, perfect every time.</p>
                                </div>

                            </motion.div>


                        </div>

                        <div className="z-20 mt-20 justify-center w-full">
                            <Footer />
                        </div>
                    </main>

                    <div
                        className="fixed top-0 right-0 w-[80%] md:w-1/2 h-screen bg-[#1F2B3A]/20"
                        style={{
                            clipPath:
                                "polygon(100px 0,100% 0,calc(100% + 225px) 100%, 480px 100%)",
                        }}
                    ></div>
                </div>
            </div>

        </AnimatePresence>

    );
}