'use client';

import { toast } from 'sonner';

export default function AddSepoliaButton() {
    const addSepoliaNetwork = async () => {
        if (typeof window.ethereum === 'undefined') {
            toast.error('MetaMask is not installed. Please install it first.');
            return;
        }

        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [
                    {
                        chainId: '0xAA36A7',
                        chainName: 'Sepolia',
                        nativeCurrency: {
                            name: 'SepoliaETH',
                            symbol: 'ETH',
                            decimals: 18,
                        },
                        rpcUrls: ['https://rpc.sepolia.org'],
                        blockExplorerUrls: ['https://sepolia.etherscan.io'],
                    },
                ],
            });

            toast.success('Sepolia Test Network has been added to MetaMask!');
        } catch (error) {
            console.error(error);
            toast.error('Failed to add Sepolia network. Check console for details.');
        }
    };

    return (
        <button
            onClick={addSepoliaNetwork}
            className="px-5 py-3 rounded-lg text-sm font-medium bg-lime-300 text-slate-800 hover:bg-lime-400 transition hover:scale-105"
        >
            Add Sepolia Testnet to MetaMask
        </button>
    );
}
