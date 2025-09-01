"use client";

import Link from "next/link";
import Navbar from "./components/Navbar";
import { Globe, CopyCheck, ShieldCheck } from "lucide-react";
import Image from "next/image";
import { Faqs } from "./components/Faqs";
import { useEffect, useState } from "react";
import { fetchAllCampaigns } from "@/lib/campaigns";
import CampaignCard from "./components/CampaignCard";
import AOS from 'aos';
import 'aos/dist/aos.css';
import { toast } from "sonner"
import SkeletonCard from "./components/SkeletonCard";
import Footer from "./components/Footer";

type Campaign = {
  address: string;
  name: string;
  description: string;
  goal: bigint;
  balance: bigint;
  owner: string;
  state: number;
};

export default function Home() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loadCampaign, setLoadCampaign] = useState(true);

  const loadCampaigns = async () => {
    try {
      const data = await fetchAllCampaigns();
      setCampaigns(data);
    } catch (err) {
      console.error("Error loading campaigns:", err);
      toast.error("Failed to fetch campaigns, try again later.", {
        closeButton: true,
        position: "top-right",
      });
    } finally {
      setLoadCampaign(false);
    }
  };

  useEffect(() => {
    loadCampaigns();
  }, []);

  useEffect(() => {
    AOS.init({
      disable: "phone",
      duration: 1000,
      easing: "ease-out-cubic",
    });
  }, []);

  return (
    <div className="font-inter">
      <Navbar />

      {/* Hero Section */}
      <div className="w-full px-10 max-[991px]:px-5 mt-[80px]">
        <div className="w-full bg-[url('/assets/help.jpg')] bg-cover bg-center h-[600px] max-[991px]:h-[400px] rounded-[32px]">
          <div className="w-full h-full bg-[rgba(0,0,0,0.5)] rounded-[32px] flex flex-col justify-center p-10 max-md:p-5">
            <p className="text-white font-semibold mb-2 max-md:text-sm">HelpChain Inc.</p>
            <h1 className="font-bold text-white text-7xl mb-3 max-md:text-6xl"><span className="text-lime-300">Help</span> Others</h1>
            <p className="text-white text-xl max-md:text-md font-semibold mb-4">Empower Change With Your Contribution.</p>
            <div className="flex items-center gap-4">
              <Link href="/campaigns" className="px-5 py-3 rounded-lg text-sm font-medium bg-lime-300 text-slate-800 hover:bg-lime-400 transition hover:scale-103">
                Start Donating
              </Link>
              <Link href="https://www.alchemy.com/faucets/ethereum-sepolia" target="_blank" className="px-5 py-3 rounded-lg text-sm font-medium bg-[rgba(255,255,255,0.1)] text-white hover:bg-[rgba(255,255,255,0.2)] transition hover:scale-103">
                Get Faucet
              </Link>
            </div>
          </div>
        </div>

        {/* About Us Section */}
        <div id="about" className="px-10 max-[991px]:px-5 py-15">
          <h2 className="text-3xl sm:text-4xl font-bold" data-aos="fade-right" data-aos-once="true">
            Proof of Hope, <span className="italic text-gray-700">On-Chain.</span>
          </h2>
          <p className="mt-2 text-gray-500 text-sm sm:text-lg w-full" data-aos="fade-right" data-aos-delay="200" data-aos-once="true">
            HelpChain — powered by smart contracts, governed by the donors, and traceable on the blockchain.
          </p>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-6 w-full" data-aos="fade-up" data-aos-delay="400" data-aos-once="true">
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

        {/* New Campaign Section */}
        <div className="px-10 max-[991px]:px-5 pb-15">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2" data-aos="fade-right" data-aos-once="true">Latest Campaigns</h2>
          <p className="text-gray-500 mb-6 text-sm sm:text-lg" data-aos="fade-right" data-aos-delay="200" data-aos-once="true">
            Time is of the essence! Join our mission NOW to make an immediate impact. Every second counts!
          </p>

          {loadCampaign ? (
            <div className="grid md:grid-cols-3 gap-6" data-aos="fade-up" data-aos-delay="400" data-aos-once="true">
              {[...Array(3)].map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : campaigns.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-6" data-aos="fade-up" data-aos-delay="400" data-aos-once="true">
              {campaigns
                .filter((campaign) => campaign.state === 0)
                .reverse()
                .slice(0, 3)
                .map((campaign) => (
                  <CampaignCard key={campaign.address} {...campaign} />
                ))}
            </div>
          ) : (
            <div className="text-center text-gray-500 w-full h-[300px] flex items-center justify-center">
              No campaigns available yet.
            </div>
          )}
        </div>
      </div>

      {/* Statistics Section */}
      <div className="bg-[url('/assets/decentralized.png')] bg-cover bg-center">
        <div className="w-full h-full relative pt-10 pb-20 text-center overflow-hidden bg-[rgba(255,255,255,0.7)]">
          <div className="absolute top-[25%] left-[12%] transform -translate-x-1/2 z-0 hidden md:block" data-aos="fade-right" data-aos-delay="400" data-aos-once="true">
            <Image
              src="/assets/stock-image-1.jpg"
              alt="Disaster relief support"
              width={450}
              height={480}
              className="object-cover w-[150px] h-[180px] rounded-lg"
            />
          </div>
          <div className="absolute top-[25%] right-[12%] transform translate-x-1/2 z-0 hidden md:block" data-aos="fade-left" data-aos-delay="400" data-aos-once="true">
            <Image
              src="/assets/stock-image-2.jpg"
              alt="Disaster relief support"
              width={450}
              height={480}
              className="object-cover w-[150px] h-[180px] rounded-lg"
            />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <h2 className="text-lg max-sm:w-3/4 max-sm:text-center sm:text-xl md:text-3xl font-semibold text-gray-900 mb-4" data-aos="fade-down" data-aos-once="true">
              Need Help? Get Support Through HelpChain
            </h2>
            <div className="text-5xl md:text-7xl lg:text-8xl font-bold text-gray-900 mb-10 font-serif" data-aos="zoom-in" data-aos-once="true" data-aos-delay="400">
              217,924+
            </div>
            <p className="text-md w-2/4 leading-relaxed max-sm:text-center sm:text-lg md:text-xl font-semibold text-gray-900 mb-10" data-aos="fade-up" data-aos-once="true" data-aos-delay="200">
              Campaigns and Lives Impacted Around The World
            </p>

            <div data-aos="fade-up" data-aos-once="true">
              <Link
                href="/"
                className="inline-block px-4 py-2 md:px-5 md:py-3 rounded-lg text-sm md:text-base font-medium bg-lime-300 text-slate-800 hover:bg-lime-400 transition hover:scale-103"
              >
                Create a Campaign
              </Link>
            </div>

          </div>
        </div>
      </div>

      {/* Faq Section */}
      <div id="faqs">
        <Faqs />
      </div>


      {/* Footer Section */}
      <Footer />

    </div>
  );
}
