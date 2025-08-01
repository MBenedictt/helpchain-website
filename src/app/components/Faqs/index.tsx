
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../ui/accordion";
interface FaqItem {
    id: string;
    question: string;
    answer: string;
}

interface Faq1Props {
    heading?: string;
    items?: FaqItem[];
}

const Faqs = ({
    heading = "Frequently Asked Questions.",
    items = [
        {
            id: "faq-1",
            question: "What is HelpChain?",
            answer:
                "HelpChain is a decentralized crowdfunding platform that leverages blockchain technology to enable transparent and secure donations. Unlike traditional platforms, HelpChain uses milestone-based smart contracts that automatically enforce funding conditions. This ensures that funds are only released to campaign creators when specific goals or deliverables have been met, providing donors with confidence and control over how their contributions are used.",
        },
        {
            id: "faq-2",
            question: "How does HelpChain guarantee donations go to the intended recipients?",
            answer:
                "HelpChain implements milestone-based smart contracts, where each donation campaign is deployed as a separate smart contract. These contracts define clear stages (milestones) that must be reached before any portion of the funds can be withdrawn. Each withdrawal request must be approved by the donors who contributed to the campaign. This voting mechanism ensures that funds are only released when the community agrees that the campaign has progressed as promised, minimizing the risk of fraud or misuse.",
        },
        {
            id: "faq-3",
            question: "What is a milestone-based smart contract?",
            answer:
                "A milestone-based smart contract is a blockchain program that divides a donation campaign into several stages or 'milestones.' Funds are locked within the smart contract and can only be partially released upon reaching and verifying each milestone. For example, in a medical crowdfunding campaign, the first milestone might be the initial hospital admission, and the next might be the completion of surgery. These conditions are coded into the smart contract, providing a trustless and automated method of fund disbursement based on actual progress.",
        },
        {
            id: "faq-4",
            question: "Who decides when funds are released?",
            answer:
                "Donors play a critical role in fund disbursement. When a campaign owner requests to withdraw funds for a specific milestone, a voting process is triggered. Only the donors who contributed to the campaign are allowed to vote on whether the withdrawal request should be approved. If the majority agree, the smart contract permits the release of funds. This mechanism ensures that campaign owners are held accountable and that the use of funds is aligned with the donors' expectations.",
        },
        {
            id: "faq-5",
            question: "How does HelpChain prevent fraud?",
            answer:
                "HelpChain reduces the risk of fraud through its milestone-based disbursement model, on-chain transparency, and donor voting system. All campaign activities, donation histories, and withdrawal requests are publicly recorded on the blockchain and cannot be tampered with. Moreover, because campaign owners cannot withdraw funds without majority donor approval, they are incentivized to act honestly and provide regular updates on progress. This combination of transparency and community governance discourages misuse and builds trust.",
        },
        {
            id: "faq-6",
            question: "Is blockchain technology secure for donations?",
            answer:
                "Yes. Blockchain technology offers several advantages in terms of security and transparency. All transactions are immutable, verifiable, and stored on a public ledger. In HelpChain, smart contracts are deployed on the blockchain to autonomously manage the logic for donations and fund releases, eliminating the need for intermediaries. This removes single points of failure and reduces the risk of corruption or human error, making the donation process more secure and reliable.",
        },
        {
            id: "faq-7",
            question: "Can I track how my donation is used?",
            answer:
                "Absolutely. One of the key benefits of HelpChain is the full transparency provided by the blockchain. Each donation is recorded on-chain, and donors can view when and how funds are being requested, approved, and used. This visibility allows donors to stay informed about the campaign’s progress and make informed decisions when voting on fund disbursement requests. This level of insight is rarely available in traditional donation platforms.",
        },
    ],
}: Faq1Props) => {
    return (
        <div className="w-full py-15 px-10 flex justify-center">
            <div className="container max-w-7xl">
                <h1 className="mb-4 text-3xl sm:text-4xl leading-snug font-bold mb-5 md:text-4xl w-4/12 max-[991px]:w-6/12 max-sm:w-7/12">
                    {heading}
                </h1>
                <Accordion type="single" collapsible>
                    {items.map((item, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                            <AccordionTrigger className="font-[400] text-gray-800 hover:no-underline text-lg max-sm:text-md cursor-pointer">
                                {item.question}
                            </AccordionTrigger>
                            <AccordionContent className="text-muted-foreground leading-relaxed">
                                {item.answer}
                            </AccordionContent>
                        </AccordionItem>
                    ))}
                </Accordion>
            </div>
        </div>
    );
};

export { Faqs };