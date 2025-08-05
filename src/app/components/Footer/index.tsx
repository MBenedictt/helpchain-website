import { HeartHandshake, Instagram, Facebook, Twitter, Linkedin } from 'lucide-react';
import Link from 'next/link';
import React from 'react';
import { Separator } from '../ui/separator';

const Footer = () => {
    return (
        <div className="w-full px-10 max-[991px]:px-5 py-10">
            <footer className="bg-black text-white px-12 py-12 rounded-[32px]">
                <div className="flex max-md:flex-col">
                    <div className="mr-12 max-md:mr-0">
                        <div className="flex items-center gap-2 mb-4">
                            <i className="w-8 h-8 text-lime-200 rounded flex items-center justify-center">
                                <HeartHandshake fill="currentColor" stroke="oklch(45.3% 0.124 130.933)" />
                            </i>
                            <span className="text-xl font-bold">HelpChain</span>
                        </div>
                        <p className="text-gray-200 text-sm leading-relaxed">Proof Of Hope, Empower Change With Your Contribution.</p>
                    </div>
                    <div className="grid md:grid-cols-3 w-full gap-8 mb-8 max-md:mt-8">
                        <div>
                            <h3 className="font-bold mb-4">Donate</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>
                                    <Link href="#" className="hover:text-white">
                                        Education
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-white">
                                        Social
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-white">
                                        Health
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-white">
                                        Disaster
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold mb-4">Help</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>
                                    <Link href="#" className="hover:text-white">
                                        FAQ
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-white">
                                        Privacy Policy
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-white">
                                        Accessibility
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-white">
                                        Contact Us
                                    </Link>
                                </li>
                            </ul>
                        </div>

                        <div>
                            <h3 className="font-bold mb-4">Company</h3>
                            <ul className="space-y-2 text-sm text-gray-400">
                                <li>
                                    <Link href="#" className="hover:text-white">
                                        About Us
                                    </Link>
                                </li>
                                <li>
                                    <Link href="#" className="hover:text-white">
                                        How It Works
                                    </Link>
                                </li>
                                <li>
                                    <Link href="https://taranium.foundation/" target="_blank" className="hover:text-white">
                                        Taranium
                                    </Link>
                                </li>
                                <li>
                                    <Link href="https://faucet.taranium.com" target="_blank" className="hover:text-white">
                                        Get Faucet
                                    </Link>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                <Separator className="bg-gray-800 mb-8" />

                <div className="flex items-center justify-between max-md:flex-col max-md:gap-4 max-md:items-start">
                    <div className="text-sm text-gray-200">
                        <p>© HelpChain 2025</p>
                        <p>All Rights Reserved.</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Link href="#" className="text-gray-400 hover:text-white">
                            <Instagram className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-white">
                            <Facebook className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-white">
                            <Twitter className="w-5 h-5" />
                        </Link>
                        <Link href="#" className="text-gray-400 hover:text-white">
                            <Linkedin className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Footer;