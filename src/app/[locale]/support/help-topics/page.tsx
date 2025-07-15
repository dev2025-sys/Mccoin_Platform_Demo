"use client";
import { useState, useEffect, JSX } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Search,
  Zap,
  Database,
  LayoutTemplate,
  BookOpen,
  User,
  BrainCircuit,
} from "lucide-react";

// Sample data for crypto help topics
const helpTopics = [
  {
    id: 1,
    title: "Trading Platform",
    description:
      "Learn how to navigate our trading platform and execute trades efficiently.",
    icon: <Zap className="w-8 h-8" />,
    tags: ["trading", "platform", "errors"],
  },
  {
    id: 2,
    title: "Wallet Management",
    description:
      "Secure your assets with proper wallet setup and management techniques.",
    icon: <Database className="w-8 h-8" />,
    tags: ["wallet", "security", "transfer"],
  },
  {
    id: 3,
    title: "API Integration",
    description: "Connect your applications with our powerful trading API.",
    icon: <LayoutTemplate className="w-8 h-8" />,
    tags: ["api", "integration", "developers"],
  },
  {
    id: 4,
    title: "Account Security",
    description: "Protect your account with 2FA and other security measures.",
    icon: <User className="w-8 h-8" />,
    tags: ["security", "authentication", "2fa"],
  },
  {
    id: 5,
    title: "Market Analysis",
    description: "Master technical analysis and trading strategies.",
    icon: <BrainCircuit className="w-8 h-8" />,
    tags: ["analysis", "trading", "charts"],
  },
  {
    id: 6,
    title: "Getting Started",
    description: "New to crypto? Start your journey with our beginner's guide.",
    icon: <BookOpen className="w-8 h-8" />,
    tags: ["beginner", "guide", "basics"],
  },
];

const popularSearches = [
  "Trading platform errors",
  "Wallet transfer issues",
  "API authentication",
  "2FA setup",
  "Chart indicators",
];

const HelpTopics = () => {
  const router = useRouter();
  const params = useParams();
  const [searchTerm, setSearchTerm] = useState("");
  const [filteredTopics, setFilteredTopics] = useState(helpTopics);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  useEffect(() => {
    const results = helpTopics.filter(
      (topic: {
        id: number;
        title: string;
        description: string;
        icon: JSX.Element;
        tags: string[];
      }) => {
        // First filter by search term
        const matchesSearch =
          searchTerm === "" || // Show all if search is empty
          topic.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topic.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          topic.tags.some((tag: string) =>
            tag.toLowerCase().includes(searchTerm.toLowerCase())
          );

        // Then filter by active filter if it exists
        const matchesActiveFilter = activeFilter
          ? topic.tags.some((tag: string) =>
              tag.toLowerCase().includes(activeFilter.toLowerCase())
            ) || topic.title.toLowerCase().includes(activeFilter.toLowerCase())
          : true;

        return matchesSearch && matchesActiveFilter;
      }
    );

    setFilteredTopics(results);
  }, [searchTerm, activeFilter]);

  const handlePopularSearchClick = (search: string) => {
    const mainKeyword = search.split(" ")[0].toLowerCase();
    setActiveFilter(mainKeyword);
    setSearchTerm(mainKeyword);
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);

    // Clear active filter when input is cleared
    if (value === "") {
      setActiveFilter(null);
    }
  };

  const clearFilters = () => {
    setSearchTerm("");
    setActiveFilter(null);
  };
  const handleCardClick = (topicId: number) => {
    if (params && typeof params.locale === "string") {
      router.push(`/${params.locale}/support/help-topics/${topicId}`);
    } else {
      // fallback or error handling if locale is not available
      console.error("Locale is not defined in params.");
    }
  };

  return (
    <div className="min-h-screen bg-[#07153B] text-[#DAE6EA] p-6 md:p-12">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-6xl mx-auto"
      >
        {/* Header Section */}
        <div className="text-center mb-12">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#DAE6EA] to-[#FFFFFF]"
          >
            Welcome to the Help Center
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="text-xl md:text-2xl mb-8"
          >
            How can we help you?
          </motion.p>

          {/* Search Input */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="relative max-w-2xl mx-auto"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-[#DAE6EA]/70" />
            <Input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={handleInputChange}
              className="pl-10 pr-4 py-6 rounded-xl bg-[#07153B]/70 border border-[#DAE6EA]/20 focus:border-[#DAE6EA]/50 text-[#DAE6EA] placeholder-[#DAE6EA]/50"
            />
          </motion.div>

          {/* Popular Searches */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="mt-6"
          >
            <p className="text-sm text-[#DAE6EA]/70 mb-3">Popular searches:</p>
            <div className="flex flex-wrap justify-center gap-2">
              {popularSearches.map((search, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handlePopularSearchClick(search)}
                  className={`px-4 py-2 rounded-full text-sm cursor-pointer ${
                    activeFilter && search.toLowerCase().includes(activeFilter)
                      ? "bg-yellow-500 text-white font-semibold"
                      : "bg-[#DAE6EA]/10 hover:bg-[#DAE6EA]/20"
                  }`}
                >
                  {search}
                </motion.button>
              ))}
              {activeFilter && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={clearFilters}
                  className="px-4 py-2 rounded-full text-sm cursor-pointer bg-[#DAE6EA]/5 hover:bg-[#DAE6EA]/10 border border-[#DAE6EA]/20"
                >
                  Clear filters
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        {/* Help Topics Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="mt-12"
        >
          <h2 className="text-2xl font-semibold mb-6">Help Topics</h2>

          <AnimatePresence>
            {filteredTopics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredTopics.map((topic) => (
                  <motion.div
                    key={topic.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.3)",
                    }}
                    className="bg-[#07153B]/70 border border-[#DAE6EA]/10 rounded-xl p-6 flex flex-col aspect-square transition-all duration-300 hover:border-[#DAE6EA]/30"
                  >
                    <div className="mb-4 p-3 bg-[#0A1E4D] rounded-lg w-fit">
                      {topic.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-2">
                      {topic.title}
                    </h3>
                    <p className="text-[#DAE6EA]/80 mb-6 flex-grow">
                      {topic.description}
                    </p>
                    <motion.p
                      onClick={() => handleCardClick(topic.id)}
                      whileHover={{ x: 5 }}
                      className="text-[#EC3B3B] font-medium flex items-center gap-1 self-start cursor-pointer"
                    >
                      Read more
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </motion.p>
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <p className="text-xl">No results found for your search.</p>
                <button
                  onClick={clearFilters}
                  className="mt-4 px-6 py-2 rounded-lg bg-[#EC3B3B] hover:bg-[#EC3B3B]/90 transition-colors"
                >
                  Clear search
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default HelpTopics;
