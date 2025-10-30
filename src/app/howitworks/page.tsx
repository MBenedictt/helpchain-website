'use client';

import dynamic from 'next/dynamic';
import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from '../components/Footer';
import Image from 'next/image';

const StepSwiper = dynamic(() => import('../components/StepSwiper'), {
    ssr: false,
    loading: () => <div className="h-[400px] flex items-center justify-center">Loading slides...</div>,
});

export default function HowItWorks() {
    return (
        <div className="font-inter">
            <Navbar />

            {/* HEADER */}
            <div className="bg-lime-100 py-12 mt-[80px]">
                <div className="max-w-4xl mx-auto px-6 flex flex-col justify-center items-center">
                    <h1 className="text-6xl max-md:text-4xl font-extrabold text-lime-800">How it Works?</h1>
                    <p className="mt-5 text-gray-700 leading-relaxed text-center">
                        Before you start, You need to create a Metamask wallet. If you don&apos;t have one, create one and use the testnet faucet to get the sepoliaETH tokens.
                    </p>
                    <div className="flex items-center gap-4 mt-5 max-sm:flex-col">
                        <Link href="/https://metamask.io/download" className="px-5 py-3 rounded-lg text-sm font-medium bg-lime-300 text-slate-800 hover:bg-lime-400 transition hover:scale-103 text-center max-sm:w-full">
                            Create Metamask Wallet
                        </Link>
                        <Link href="https://www.alchemy.com/faucets/ethereum-sepolia" target="_blank" className="px-5 py-3 rounded-lg text-sm font-medium bg-[rgba(255,255,255,0.1)] text-lime-800 hover:bg-[rgba(255,255,255,0.5)] border border-lime-600 transition hover:scale-103 text-center max-sm:w-full">
                            Get Faucet
                        </Link>
                    </div>
                </div>
            </div>

            {/* STEPS */}
            <div className="max-w-4xl mx-auto px-6 py-6">
                {/* STEP 01 */}
                <div className="py-6">
                    <div className="flex items-center gap-6 max-md:gap-3 border-b-4 border-lime-600 pb-5">
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold italic text-lime-800">01</h1>
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold text-lime-600">Connect Wallet</h1>
                    </div>

                    <StepSwiper
                        images={[
                            '/assets/howitworks/step1-1.png',
                            '/assets/howitworks/step1-2.png',
                            '/assets/howitworks/step1-3.png',
                        ]}
                    />

                    <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
                        <li>After installing MetaMask and obtaining Sepolia testnet tokens, click the <strong>Connect Wallet</strong> button on the platform.</li>
                        <li>Select <strong>MetaMask</strong> from the available wallet options.</li>
                        <li>
                            The MetaMask extension will open — press <strong>Connect</strong> to authorize the connection.
                            Ensure the wallet is on the <strong>Sepolia Testnet</strong>.
                            If the network hasn’t been added, follow this guide:{' '}
                            <Link href="https://revoke.cash/learn/wallets/add-network/ethereum-sepolia" target="_blank" className="text-lime-700 underline hover:text-lime-800">Add Sepolia Testnet</Link>.
                        </li>
                    </ol>
                </div>

                {/* STEP 02 */}
                <div className="py-6">
                    <div className="flex items-center gap-6 max-md:gap-3 border-b-4 border-lime-600 pb-5">
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold italic text-lime-800">02</h1>
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold text-lime-600">Create Campaign</h1>
                    </div>

                    <StepSwiper
                        images={[
                            '/assets/howitworks/step2-1.png',
                            '/assets/howitworks/step2-2.png',
                            '/assets/howitworks/step2-3.png',
                        ]}
                    />

                    <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
                        <li>Open the <strong>Dashboard</strong> and click the <strong>Create Campaign</strong> button.</li>
                        <li>Enter the <strong>campaign name</strong>, <strong>goal amount</strong>, and <strong>description</strong>, then press <strong>Create</strong>.</li>
                        <li>MetaMask will prompt a confirmation window — confirm the transaction to publish the campaign on-chain.</li>
                    </ol>
                </div>

                {/* STEP 03 */}
                <div className="py-6">
                    <div className="flex items-center gap-6 max-md:gap-3 border-b-4 border-lime-600 pb-5">
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold italic text-lime-800">03</h1>
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold text-lime-600">Fund Campaign</h1>
                    </div>

                    <StepSwiper
                        images={[
                            '/assets/howitworks/step3-1.png',
                            '/assets/howitworks/step3-2.png',
                            '/assets/howitworks/step3-3.png',
                        ]}
                    />

                    <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
                        <li>Open a campaign, enter the desired donation amount, and click the <strong>&quot;Fund Now&quot;</strong> button.</li>
                        <li>MetaMask will open for confirmation — approve the transaction to send funds to the campaign.</li>
                        <li>Funded campaigns appear under the <strong>My Donations</strong> tab in the Dashboard.</li>
                    </ol>
                </div>

                {/* STEP 04 */}
                <div className="py-6">
                    <div className="flex items-center gap-6 max-md:gap-3 border-b-4 border-lime-600 pb-5">
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold italic text-lime-800">04</h1>
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold text-lime-600">Request Withdraw</h1>
                    </div>

                    <StepSwiper
                        images={[
                            '/assets/howitworks/step4-1.png',
                            '/assets/howitworks/step4-2.png',
                        ]}
                    />

                    <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
                        <li>Campaign owners can request a withdrawal by clicking the <strong>Withdraw</strong> button in the Dashboard.</li>
                        <li>Enter the <strong>amount</strong>, select the <strong>voting duration</strong>, and upload a <strong>proposal file</strong> describing the reason for the withdrawal, then press <strong>&quot;Yes, Withdraw&quot;</strong>.</li>
                        <li>MetaMask will prompt for confirmation — confirm the transaction to create the withdrawal request.</li>
                    </ol>
                </div>

                {/* STEP 05 */}
                <div className="py-6">
                    <div className="flex items-center gap-6 max-md:gap-3 border-b-4 border-lime-600 pb-5">
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold italic text-lime-800">05</h1>
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold text-lime-600">Confirm Request</h1>
                    </div>

                    <StepSwiper
                        images={[
                            '/assets/howitworks/step5-1.png',
                            '/assets/howitworks/step5-2.png',
                        ]}
                    />

                    <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
                        <li>When a withdrawal request is created, backers can vote to <strong>approve</strong> or <strong>reject</strong> it. Non-voters are counted as <strong>abstain</strong>.</li>
                        <li>MetaMask will open for confirmation — confirm to record the vote on-chain.</li>
                    </ol>
                </div>

                {/* STEP 06 */}
                <div className="py-6">
                    <div className="flex items-center gap-6 max-md:gap-3 border-b-4 border-lime-600 pb-5">
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold italic text-lime-800">06</h1>
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold text-lime-600">Finalize Request</h1>
                    </div>

                    <StepSwiper
                        images={[
                            '/assets/howitworks/step6-1.png',
                            '/assets/howitworks/step6-2.png',
                            '/assets/howitworks/step6-3.png',
                        ]}
                    />

                    <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
                        <li>After the voting period ends, the owner can finalize the request by pressing the <strong>&quot;Finalize&quot;</strong> button in the Dashboard.</li>
                        <li>If the approved votes cover the requested amount, funds are transferred to the owner’s wallet. Otherwise, the campaign is marked as <strong>Failed</strong>.</li>
                        <li>MetaMask will prompt for confirmation — confirm to complete the finalization process.</li>
                    </ol>
                </div>

                {/* STEP 07 */}
                <div className="py-6">
                    <div className="flex items-center gap-6 max-md:gap-3 border-b-4 border-lime-600 pb-5">
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold italic text-lime-800">07</h1>
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold text-lime-600">Submit Proof</h1>
                    </div>

                    <StepSwiper
                        images={[
                            '/assets/howitworks/step7-1.png',
                            '/assets/howitworks/step7-2.png',
                            '/assets/howitworks/step7-3.png',
                        ]}
                    />

                    <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
                        <li>Before making another withdrawal, the owner must submit proof of fund usage from the previous one.</li>
                        <li>Click the <strong>&quot;Submit Proof&quot;</strong> button in the Dashboard, upload the document, and press <strong>Submit</strong>.</li>
                        <li>The withdrawal status updates to <strong>Success</strong>, and the proof becomes visible on the campaign page.</li>
                    </ol>
                </div>

                {/* STEP 08 */}
                <div className="py-6">
                    <div className="flex items-center gap-6 max-md:gap-3 border-b-4 border-lime-600 pb-5">
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold italic text-lime-800">08</h1>
                        <h1 className="text-5xl max-md:text-4xl max-sm:text-2xl font-bold text-lime-600">End Campaign</h1>
                    </div>

                    <StepSwiper
                        images={[
                            '/assets/howitworks/step8-1.png',
                            '/assets/howitworks/step8-2.png',
                        ]}
                    />

                    <ol className="mt-4 list-decimal list-inside space-y-2 text-gray-700 leading-relaxed">
                        <li>The campaign owner can end a campaign by clicking the <strong>red stop icon</strong> in the Dashboard. This button appears only right after creation or when the goal has been reached.</li>
                        <li>Click the <strong>&quot;End Campaign&quot;</strong> button. If ended right after creation, the campaign is marked as <strong>Failed</strong>. If ended after reaching the goal, it is marked as <strong>Completed</strong>.</li>
                    </ol>
                </div>

                {/* ENDING SECTION */}
                <div className="mt-12 border-t-2 border-gray-600 pt-8 text-center">
                    <h2 className="text-2xl font-bold text-black mb-4">
                        Track Everything on the Blockchain
                    </h2>
                    <p className="text-gray-700 max-w-2xl mx-auto leading-relaxed">
                        Every transaction, campaign creation, funding, and withdrawal is recorded
                        transparently on the blockchain. All activities can be verified through the
                        Sepolia Testnet explorer at{" "}
                        <a
                            href="https://sepolia.etherscan.io"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-lime-600 font-semibold hover:underline"
                        >
                            sepolia.etherscan.io
                        </a>.
                    </p>

                    <div className="mt-6 flex justify-center">
                        <Image
                            src="/assets/howitworks/etherscan.png"
                            alt="Sepolia Etherscan Example"
                            width={800}
                            height={450}
                            className="rounded-xl shadow-md border border-gray-200 object-contain"
                        />
                    </div>
                </div>
            </div>
            <Footer />
        </div>
    );
}
