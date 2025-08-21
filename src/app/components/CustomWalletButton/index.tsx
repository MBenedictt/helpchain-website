'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function CustomWalletButton() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <ConnectButton.Custom>
            {({ account, chain, openAccountModal, openConnectModal }) => {
                const connected = account && chain;

                return connected ? (
                    <button
                        onClick={openAccountModal}
                        className="cursor-pointer pl-4 pr-1 py-1 max-md:pr-2 max-md:pl-2 rounded-lg text-sm font-medium bg-white border-2 border-gray-300 text-black hover:opacity-90 transition hover:scale-103 flex items-center gap-2"
                    >
                        <span className="hidden md:inline mr-3 text-xs text-black/60">
                            {account.displayBalance}
                        </span>
                        <div className="flex items-center gap-2 bg-gray-200 max-md:bg-white px-2 pt-1.5 py-1.75 rounded-md">
                            {account.ensAvatar ? (
                                <Image
                                    src={account.ensAvatar}
                                    alt="ENS Avatar"
                                    className="w-6 h-6 rounded-full"
                                    width={24}
                                    height={24}
                                />
                            ) : (
                                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-pink-400 to-indigo-400" />
                            )}
                            <span className="text-sm font-semibold text-black">
                                {account.displayName}
                            </span>
                        </div>
                    </button>
                ) : (
                    <button
                        onClick={openConnectModal}
                        className="cursor-pointer px-4 py-2 rounded-lg text-sm font-medium bg-lime-300 text-slate-800 hover:bg-lime-400 transition hover:scale-103"
                    >
                        Connect
                    </button>
                );
            }}
        </ConnectButton.Custom>
    );
}