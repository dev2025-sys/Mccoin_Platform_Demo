"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname, useRouter } from "next/navigation";
import {
  Zap,
  Database,
  LayoutTemplate,
  BookOpen,
  User,
  BrainCircuit,
  ChevronLeft,
} from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const helpTopics = [
  {
    id: 1,
    title: "Trading Platform",
    description:
      "Learn how to navigate our trading platform and execute trades efficiently.",
    longDescription: `
      <p>Our trading platform is designed for both beginners and experienced traders, offering a seamless experience with advanced charting tools, real-time market data, and lightning-fast execution.</p>
      
      <h3>Key Features</h3>
      <ul>
        <li>Real-time price charts with technical indicators</li>
        <li>One-click trading for instant execution</li>
        <li>Advanced order types (limit, stop-loss, take-profit)</li>
        <li>Portfolio tracking and performance analytics</li>
      </ul>
      
      <h3>Getting Started</h3>
      <p>To begin trading:</p>
      <ol>
        <li>Connect your wallet or exchange account</li>
        <li>Fund your account with your preferred cryptocurrency</li>
        <li>Explore the interface using our interactive tutorial</li>
        <li>Place your first trade with our risk-free demo mode</li>
      </ol>
      
      <p>For advanced users, we offer API access and algorithmic trading tools that integrate directly with our platform.</p>
    `,
    icon: <Zap className="w-8 h-8" />,
    tags: ["trading", "platform", "errors"],
    imageUrl: "/images/trading_platform.jpg",
    relatedTopics: [2, 5, 6],
  },
  {
    id: 2,
    title: "Wallet Management",
    description:
      "Secure your assets with proper wallet setup and management techniques.",
    longDescription: `
      <p>Proper wallet management is crucial for securing your digital assets. Our platform supports multiple wallet types and provides enterprise-grade security features.</p>
      
      <h3>Wallet Types</h3>
      <ul>
        <li><strong>Hot Wallets:</strong> For frequent trading with instant access</li>
        <li><strong>Cold Wallets:</strong> For long-term storage with enhanced security</li>
        <li><strong>Multi-Sig Wallets:</strong> Require multiple approvals for transactions</li>
      </ul>
      
      <h3>Security Best Practices</h3>
      <ol>
        <li>Always enable two-factor authentication (2FA)</li>
        <li>Use hardware wallets for large holdings</li>
        <li>Regularly backup your wallet seed phrases</li>
        <li>Verify wallet addresses before transactions</li>
      </ol>
      
      <p>Our wallet integration allows you to manage multiple wallets from a single interface while maintaining complete control over your private keys.</p>
    `,
    icon: <Database className="w-8 h-8" />,
    tags: ["wallet", "security", "transfer"],
    imageUrl: "/images/wallet_management.jpg",
    relatedTopics: [1, 4, 6],
  },
  {
    id: 3,
    title: "API Integration",
    description: "Connect your applications with our powerful trading API.",
    longDescription: `
      <p>Our REST and WebSocket APIs provide programmatic access to all platform features, enabling developers to build custom trading solutions and integrations.</p>
      
      <h3>API Features</h3>
      <ul>
        <li>Real-time market data streaming</li>
        <li>Order management and execution</li>
        <li>Historical data access</li>
        <li>Webhook support for event notifications</li>
      </ul>
      
      <h3>Getting Started with the API</h3>
      <ol>
        <li>Generate API keys from your account settings</li>
        <li>Review our comprehensive API documentation</li>
        <li>Test with our sandbox environment</li>
        <li>Implement rate limiting and error handling</li>
      </ol>
      
      <p>We provide SDKs in multiple languages (Python, JavaScript, Go) to accelerate your development process. For high-frequency trading, consider our FIX API with ultra-low latency connections.</p>
    `,
    icon: <LayoutTemplate className="w-8 h-8" />,
    tags: ["api", "integration", "developers"],
    imageUrl: "/images/api_integration.jpg",
    relatedTopics: [1, 5],
  },
  {
    id: 4,
    title: "Account Security",
    description: "Protect your account with 2FA and other security measures.",
    longDescription: `
      <p>Account security is our top priority. We employ bank-level security measures and provide tools to help you protect your account from unauthorized access.</p>
      
      <h3>Security Features</h3>
      <ul>
        <li>Two-factor authentication (2FA) via SMS or authenticator apps</li>
        <li>Biometric login (Face ID, Touch ID)</li>
        <li>Device management and login notifications</li>
        <li>Withdrawal whitelisting and time locks</li>
      </ul>
      
      <h3>Enhancing Your Security</h3>
      <ol>
        <li>Enable all available security features</li>
        <li>Use a unique, strong password</li>
        <li>Be cautious of phishing attempts</li>
        <li>Regularly review account activity</li>
      </ol>
      
      <p>For institutional accounts, we offer advanced security options including IP restrictions, multi-user access controls, and compliance reporting tools.</p>
    `,
    icon: <User className="w-8 h-8" />,
    tags: ["security", "authentication", "2fa"],
    imageUrl: "/images/account_security.jpg",
    relatedTopics: [2, 5],
  },
  {
    id: 5,
    title: "Market Analysis",
    description: "Master technical analysis and trading strategies.",
    longDescription: `
      <p>Our advanced market analysis tools give you the edge in cryptocurrency trading with professional-grade charting, indicators, and research tools.</p>
      
      <h3>Analysis Tools</h3>
      <ul>
        <li>100+ technical indicators and drawing tools</li>
        <li>Customizable chart layouts and timeframes</li>
        <li>Market sentiment indicators</li>
        <li>On-chain analytics integration</li>
      </ul>
      
      <h3>Trading Strategies</h3>
      <ol>
        <li>Learn basic candlestick patterns</li>
        <li>Understand support and resistance levels</li>
        <li>Implement risk management techniques</li>
        <li>Backtest strategies with historical data</li>
      </ol>
      
      <p>Our platform includes educational resources and trading signals to help both novice and experienced traders make informed decisions in volatile markets.</p>
    `,
    icon: <BrainCircuit className="w-8 h-8" />,
    tags: ["analysis", "trading", "charts"],
    imageUrl: "/images/market_analysis.jpg",
    relatedTopics: [1, 3, 6],
  },
  {
    id: 6,
    title: "Getting Started",
    description: "New to crypto? Start your journey with our beginner's guide.",
    longDescription: `
      <p>Welcome to the world of cryptocurrency! This comprehensive guide will help you navigate your first steps in digital asset investing.</p>
      
      <h3>Crypto Basics</h3>
      <ul>
        <li>Understanding blockchain technology</li>
        <li>How cryptocurrencies are created and transferred</li>
        <li>The difference between coins and tokens</li>
        <li>Introduction to decentralized finance (DeFi)</li>
      </ul>
      
      <h3>First Steps</h3>
      <ol>
        <li>Set up your account and verify your identity</li>
        <li>Start with small investments to learn</li>
        <li>Explore different asset classes</li>
        <li>Learn about risk management</li>
      </ol>
      
      <p>We recommend beginning with our free demo account to practice trading without risk. Our educational resources include video tutorials, webinars, and a knowledge base to support your learning journey.</p>
    `,
    icon: <BookOpen className="w-8 h-8" />,
    tags: ["beginner", "guide", "basics"],
    imageUrl: "/images/getting_started.jpg",
    relatedTopics: [1, 2, 5],
  },
];

const HelpTopicDetailsPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const id = pathname?.split("/").pop() ?? "";
  const [topic, setTopic] = useState<any>(null);
  const [relatedTopics, setRelatedTopics] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate loading
    const timer = setTimeout(() => {
      const foundTopic = helpTopics.find((t) => t.id.toString() === id);
      setTopic(foundTopic);

      if (foundTopic?.relatedTopics) {
        const related = helpTopics.filter((t) =>
          foundTopic.relatedTopics.includes(t.id)
        );
        setRelatedTopics(related);
      }

      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [id]);

  if (isLoading) {
    return (
      <div className="min-h-screen from-[#07153B] to-[#0A1E4D] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-[#EC3B3B] border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="min-h-screen from-[#07153B] to-[#0A1E4D] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-[#DAE6EA] mb-4">
            Topic Not Found
          </h1>
          <p className="text-xl text-[#DAE6EA]/80 mb-8">
            The help topic you're looking for doesn't exist or has been moved.
          </p>
          <Button
            asChild
            className="bg-[#EC3B3B] hover:bg-[#EC3B3B]/90 text-white"
          >
            <a href="/help-topics">Browse All Topics</a>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#07153B] to-[#0A1E4D]">
      {/* Hero Section with Parallax Effect */}
      <div className="relative h-96 overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 z-0"
        >
          <Image
            src={topic.imageUrl}
            alt={topic.title}
            fill
            className="object-cover"
            priority
            quality={100}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07153B] to-transparent opacity-90" />
        </motion.div>

        <div className="relative z-10 container mx-auto px-6 h-full flex flex-col justify-end pb-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
          >
            <Button
              asChild
              variant="ghost"
              className="mb-6 text-[#DAE6EA] hover:text-white hover:bg-[#07153B]/50"
            >
              <a
                href="/support/help-topics"
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" />
                Back to Help Center
              </a>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="flex items-center gap-4 mb-4"
          >
            <div className="p-3 bg-[#EC3B3B]/20 rounded-lg backdrop-blur-sm">
              {React.cloneElement(topic.icon, {
                className: "w-8 h-8 text-[#EC3B3B]",
              })}
            </div>
            <span className="text-sm font-medium text-[#DAE6EA]/90 bg-[#07153B]/50 px-3 py-1 rounded-full">
              {topic.tags[0]}
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.6 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            {topic.title}
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.6 }}
            className="text-xl text-[#DAE6EA]/90 max-w-3xl"
          >
            {topic.description}
          </motion.p>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <motion.article
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.1, duration: 0.6 }}
              className="prose max-w-none prose-h2:text-2xl prose-h2:font-semibold prose-h2:mb-4 prose-h2:text-[#DAE6EA] prose-h3:text-xl prose-h3:font-medium prose-h3:mt-8 prose-h3:mb-3 prose-ul:list-disc prose-ul:pl-6 prose-ol:list-decimal prose-ol:pl-6 prose-li:my-2 prose-p:text-[#DAE6EA]/80"
              dangerouslySetInnerHTML={{ __html: topic.longDescription }}
            />

            {/* FAQ Section */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.3, duration: 0.6 }}
              className="mt-16"
            >
              <h2 className="text-2xl font-semibold text-[#DAE6EA] mb-6">
                Frequently Asked Questions
              </h2>

              <div className="space-y-4">
                {[1, 2, 3].map((item) => (
                  <motion.div
                    key={item}
                    whileHover={{ y: -2 }}
                    className="border border-[#07153B]/50 rounded-xl overflow-hidden"
                  >
                    <Card className="border-none bg-[#07153B]/20">
                      <CardContent className="p-6">
                        <h3 className="font-medium text-lg text-[#DAE6EA] mb-2">
                          {item === 1 &&
                            "How do I get started with this feature?"}
                          {item === 2 &&
                            "What are the common issues users face?"}
                          {item === 3 &&
                            "Where can I find more advanced documentation?"}
                        </h3>
                        <p className="text-[#DAE6EA]/80">
                          {item === 1 &&
                            "Getting started is simple. Follow our step-by-step guide above or contact our support team for personalized assistance."}
                          {item === 2 &&
                            "Most issues can be resolved by checking our troubleshooting guide. Common solutions include clearing cache, updating your app, or verifying your connection."}
                          {item === 3 &&
                            "Advanced users can access our developer documentation portal which includes API references, SDKs, and technical white papers."}
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 1.5, duration: 0.6 }}
              className="sticky top-24 space-y-8"
            >
              {/* Related Topics */}
              {relatedTopics.length > 0 && (
                <div className="bg-[#07153B]/20 border border-[#07153B]/50 rounded-xl p-6">
                  <h3 className="text-xl font-semibold text-[#DAE6EA] mb-4">
                    Related Topics
                  </h3>
                  <div className="space-y-3">
                    {relatedTopics.map((related) => (
                      <motion.a
                        key={related.id}
                        whileHover={{ x: 5 }}
                        href={`/support/help-topics/${related.id}`}
                        className="block p-3 hover:bg-[#07153B]/30 rounded-lg transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-[#EC3B3B]/10 rounded-lg">
                            {React.cloneElement(related.icon, {
                              className: "w-5 h-5 text-[#EC3B3B]",
                            })}
                          </div>
                          <span className="font-medium text-[#DAE6EA]">
                            {related.title}
                          </span>
                        </div>
                      </motion.a>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Support */}
              <div className="bg-gradient-to-br from-[#EC3B3B]/10 to-[#0A1E4D]/20 border border-[#07153B]/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#DAE6EA] mb-4">
                  Need More Help?
                </h3>
                <p className="text-[#DAE6EA]/80 mb-6">
                  Our support team is available 24/7 to assist you with any
                  questions or issues.
                </p>
                <Button
                  onClick={() => router.push("/support/contact")}
                  className="w-full bg-[#EC3B3B] hover:bg-[#EC3B3B]/90 cursor-pointer hover:text-white"
                >
                  Contact Support
                </Button>
              </div>

              {/* Download Guide */}
              <div className="bg-[#07153B]/20 border border-[#07153B]/50 rounded-xl p-6">
                <h3 className="text-xl font-semibold text-[#DAE6EA] mb-4">
                  Download Guide
                </h3>
                <p className="text-[#DAE6EA]/80 mb-6">
                  Get the complete guide to {topic.title} as a PDF for offline
                  reference.
                </p>
                <Button
                  variant="outline"
                  className="w-full border-[#EC3B3B] text-[#EC3B3B] hover:bg-[#EC3B3B]/10"
                >
                  Download PDF
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpTopicDetailsPage;
