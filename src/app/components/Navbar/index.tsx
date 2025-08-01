"use client";

/* eslint-disable no-unused-vars */
import { useState, useEffect } from "react";
import { HeartHandshake, Menu, X } from 'lucide-react';
import Link from "next/link";
import CustomWalletButton from "../CustomWalletButton";

const Navbar = () => {
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [showNavbar, setShowNavbar] = useState(true);

    const toggleDrawer = () => setIsDrawerOpen(!isDrawerOpen);

    useEffect(() => {
        let lastScrollY = window.scrollY;

        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                // scrolling down
                setShowNavbar(false);
            } else {
                // scrolling up
                setShowNavbar(true);
            }

            lastScrollY = currentScrollY;
        };

        window.addEventListener('scroll', handleScroll);

        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div className={`fixed top-0 left-0 w-full bg-white z-50 transition-all duration-300 ease-in-out overflow-hidden ${showNavbar ? 'h-[80px]' : 'h-0'}`}>
            <div className={`flex justify-between items-center px-10 max-md:px-5 transition-all duration-300 ease-in-out ${showNavbar ? 'opacity-100' : 'opacity-0'} h-full`}>
                <div className="flex items-center">
                    <i onClick={toggleDrawer} className='text-2xl hidden max-[991px]:block hover:bg-neutral-100 py-1 px-2 rounded-xl cursor-pointer'>
                        <Menu />
                    </i>
                    <div className='flex items-center'>
                        <Link href="/" className="flex items-center pr-6 mr-6 max-[991px]:pr-0 max-[991px]:mr-0 max-[991px]:pl-5 max-[991px]:ml-3 border-r border-gray-300 max-[991px]:border-0 max-[991px]:border-l">
                            <i className="text-lime-200 mr-2">
                                <HeartHandshake fill="currentColor" stroke="oklch(45.3% 0.124 130.933)" />
                            </i>
                            <h1 className="font-bold text-xl text-black max-sm:hidden">HelpChain</h1>
                        </Link>
                    </div>
                    <ul className="flex items-center gap-7">
                        <li className="font-semibold max-[991px]:hidden">
                            <Link href="/" className="relative group flex">
                                <span className="group-hover:after:w-full after:w-0 after:h-[1px] after:bg-black after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300 text-sm font-[400]">
                                    Home
                                </span>
                            </Link>
                        </li>
                        <li className="font-semibold max-[991px]:hidden">
                            <Link href="/" className="relative group flex">
                                <span className="group-hover:after:w-full after:w-0 after:h-[1px] after:bg-black after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300 text-sm font-[400]">
                                    Donation
                                </span>
                            </Link>
                        </li>
                        <li className="font-semibold max-[991px]:hidden">
                            <Link href="#about" className="relative group flex">
                                <span className="group-hover:after:w-full after:w-0 after:h-[1px] after:bg-black after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300 text-sm font-[400]">
                                    About Us
                                </span>
                            </Link>
                        </li>
                        <li className="font-semibold max-[991px]:hidden">
                            <Link href="#faqs" className="relative group flex">
                                <span className="group-hover:after:w-full after:w-0 after:h-[1px] after:bg-black after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300 text-sm font-[400]">
                                    How It Works
                                </span>
                            </Link>
                        </li>
                    </ul>
                </div>
                <CustomWalletButton />
            </div>

            {/* Drawer remains unchanged */}
            <div
                className={`fixed top-0 left-0 z-40 h-screen shadow-xl p-4 bg-white w-80 transition-transform ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <button
                    type="button"
                    onClick={toggleDrawer}
                    className="cursor-pointer text-black bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-xl w-8 h-8 absolute top-2.5 right-2.5 flex items-center justify-center"
                >
                    <X />
                </button>
                <div className='flex flex-col justify-evenly h-[90%]'>
                    <ul className='flex flex-col items-center'>
                        <li className="font-medium text-xl py-4">
                            <Link href="/" className="relative group flex w-fit">
                                <span className="group-hover:after:w-full after:w-0 after:h-0.5 after:bg-black after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300">
                                    Home
                                </span>
                            </Link>
                        </li>
                        <li className="font-medium text-xl py-4">
                            <Link href="/" className="relative group flex w-fit">
                                <span className="group-hover:after:w-full after:w-0 after:h-0.5 after:bg-black after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300">
                                    Donation
                                </span>
                            </Link>
                        </li>
                        <li className="font-medium text-xl py-4">
                            <Link href="/" className="relative group flex w-fit">
                                <span className="group-hover:after:w-full after:w-0 after:h-0.5 after:bg-black after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300">
                                    How It Works
                                </span>
                            </Link>
                        </li>
                        <li className="font-medium text-xl py-4">
                            <Link href="/" className="relative group flex w-fit">
                                <span className="group-hover:after:w-full after:w-0 after:h-0.5 after:bg-black after:absolute after:bottom-0 after:left-0 after:transition-all after:duration-300">
                                    About Us
                                </span>
                            </Link>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default Navbar;
