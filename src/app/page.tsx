import Link from "next/link";
import Navbar from "./components/Navbar";
import { Globe, CopyCheck, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Card, CardContent } from "./components/ui/card";
import { Progress } from "./components/ui/progress";
import { Faqs } from "./components/Faqs";

export default function Home() {
  return (
    <div className="font-inter">
      <Navbar />

      {/* Hero Section */}
      <div className="w-full px-10 max-[991px]:px-5 mt-[80px]">
        <div className="w-full bg-[url('/assets/help.jpg')] bg-cover bg-center h-[600px] max-[991px]:h-[400px] rounded-[32px]">
          <div className="w-full h-full bg-[rgba(0,0,0,0.5)] rounded-[32px] flex flex-col justify-center p-10 max-md:p-5">
            <p className="text-white font-semibold mb-2 max-md:text-sm">HelpChain Foundation</p>
            <h1 className="font-bold text-white text-7xl mb-3 max-md:text-6xl"><span className="text-lime-300">Help</span> Others</h1>
            <p className="text-white text-xl max-md:text-md font-semibold mb-4">Empower Change With Your Contribution.</p>
            <div className="flex items-center gap-4">
              <Link href="/" className="px-5 py-3 rounded-lg text-sm font-medium bg-lime-300 text-slate-800 hover:bg-lime-400 transition hover:scale-103">
                Start Donating
              </Link>
              <Link href="/" className="px-5 py-3 rounded-lg text-sm font-medium bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.2)] transition hover:scale-103">
                Get Faucet
              </Link>
            </div>
          </div>
        </div>

        {/* About Us Section */}
        <div className="px-10 max-[991px]:px-5 py-15">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Proof of Hope, <span className="italic text-gray-700">On-Chain.</span>
          </h2>
          <p className="mt-2 text-gray-500 text-sm sm:text-lg w-full">
            HelpChain — powered by smart contracts, governed by the donors, and traceable on the blockchain.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 w-full">
            <div className="bg-gray-50 rounded-2xl px-6 py-12 shadow hover:shadow-md transition">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-lime-100 mb-4">
                <CopyCheck className="text-lime-600 w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Milestone-Based Giving</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Donations are released step-by-step as campaigns reach specific milestones. This ensures funds are used properly, and every stage is verified by donors before the next can proceed.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl px-6 py-12 shadow hover:shadow-md transition">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-lime-100 mb-4">
                <Globe className="text-lime-600 w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Borderless & Transparent</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Anyone, anywhere can donate directly — no banks, no borders. Every transaction is recorded on-chain, viewable by anyone, and protected against tampering.
              </p>
            </div>

            <div className="bg-gray-50 rounded-2xl px-6 py-12 shadow hover:shadow-md transition">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-lime-100 mb-4">
                <ShieldCheck className="text-lime-600 w-5 h-5" />
              </div>
              <h3 className="text-lg font-semibold">Donor-Governed Security</h3>
              <p className="text-sm text-gray-600 mt-2 leading-relaxed">
                Smart contracts don’t just automate funds — they democratize them. Donors vote to approve fund withdrawals, ensuring every release is community-approved and fraud-resistant.
              </p>
            </div>
          </div>
        </div>

        {/* Urgent Fundraising Section */}
        <div className="px-10 max-[991px]:px-5 pb-15">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Urgent Fundraising!</h2>
          <p className="text-gray-500 mb-6 text-sm sm:text-lg">
            Time is of the essence! Join our mission NOW to make an immediate impact. Every second counts!
          </p>

          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/">
              <Card className="overflow-hidden hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer px-4 pt-4">
                <div className="relative h-fit">
                  <Image
                    src="/assets/help.jpg"
                    alt="Environmental cleanup"
                    width={300}
                    height={250}
                    className="object-cover w-full h-[250px] max-md:h-[200px] rounded-lg"
                  />
                </div>
                <CardContent className="py-4 px-0 h-full flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">We Care</p>
                    <h3 className="font-bold text-gray-900 mb-2">GreenFund: Sustain Earth Now</h3>
                  </div>
                  <div>
                    <Progress value={33} />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-md font-bold text-gray-900">$50,240.210</span>
                      <span className="text-sm text-gray-500">7 days left</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/">
              <Card className="overflow-hidden hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer px-4 pt-4">
                <div className="relative h-fit">
                  <Image
                    src="/assets/help.jpg"
                    alt="Senior care support"
                    width={300}
                    height={250}
                    className="object-cover w-full h-[250px] max-md:h-[200px] rounded-lg"
                  />
                </div>
                <CardContent className="py-4 px-0 h-full flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Senior Care</p>
                    <h3 className="font-bold text-gray-900 mb-2">SeniorHealth: Support Campaign</h3>
                  </div>
                  <div>
                    <Progress value={33} />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-md font-bold text-gray-900">$4,240.310</span>
                      <span className="text-sm text-gray-500">10 days left</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/">
              <Card className="overflow-hidden hover:shadow-md hover:scale-[1.01] transition-all cursor-pointer px-4 pt-4">
                <div className="relative h-fit">
                  <Image
                    src="/assets/help.jpg"
                    alt="Disaster relief support"
                    width={300}
                    height={250}
                    className="object-cover w-full h-[250px] max-md:h-[200px] rounded-lg"
                  />
                </div>
                <CardContent className="py-4 px-0 h-full flex flex-col justify-between">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">Unity Foundation</p>
                    <h3 className="font-bold text-gray-900 mb-2">DisasterCare: Urgent Support</h3>
                  </div>
                  <div>
                    <Progress value={33} />
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-md font-bold text-gray-900">$2,100.210</span>
                      <span className="text-sm text-gray-500">24 days left</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
      {/* Statistics Section */}
      <div className="bg-[url('/assets/decentralized.png')] bg-cover bg-center">
        <div className="w-full h-full relative pt-10 pb-20 text-center overflow-hidden bg-[rgba(255,255,255,0.7)]">
          <div className="absolute top-[25%] left-[12%] transform -translate-x-1/2 z-0 hidden md:block">
            <Image
              src="/assets/help.jpg"
              alt="Disaster relief support"
              width={450}
              height={480}
              className="object-cover w-[150px] h-[180px] rounded-lg"
            />
          </div>
          <div className="absolute top-[25%] right-[12%] transform translate-x-1/2 z-0 hidden md:block">
            <Image
              src="/assets/help.jpg"
              alt="Disaster relief support"
              width={450}
              height={480}
              className="object-cover w-[150px] h-[180px] rounded-lg"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-lg max-sm:w-3/4 max-sm:text-center sm:text-xl md:text-3xl font-semibold text-gray-900 mb-4">
              Be The Part Of HelpChain With Over
            </h2>
            <div className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-10 font-serif">
              217,924+
            </div>
            <p className="text-md max-sm:w-3/4 max-sm:text-center sm:text-lg md:text-xl font-semibold text-gray-900 mb-10">
              People From Around The World Joined
            </p>

            <Link
              href="/"
              className="inline-block px-4 py-2 md:px-5 md:py-3 rounded-lg text-sm md:text-base font-medium bg-lime-300 text-slate-800 hover:bg-lime-400 transition hover:scale-105"
            >
              Join The Chain Now!
            </Link>
          </div>
        </div>
      </div>
      <Faqs />
    </div>
  );
}
