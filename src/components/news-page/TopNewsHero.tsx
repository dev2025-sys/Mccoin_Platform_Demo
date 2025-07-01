"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { useParams } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, FreeMode } from "swiper/modules";
import "swiper/css";
import "swiper/css/free-mode";

interface Article {
  title: string;
  description: string;
  url: string;
  image: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

export function TopNewsHero() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const locale = (useParams() as { locale?: string })?.locale ?? "en";

  useEffect(() => {
    // Check if window is available (client-side)
    if (typeof window !== "undefined") {
      const handleResize = () => {
        setIsMobile(window.innerWidth < 768);
      };

      // Set initial value
      handleResize();

      // Add event listener
      window.addEventListener("resize", handleResize);

      // Cleanup
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`/api/gnews`);
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }
        const data = await response.json();
        setArticles(data.slice(0, 9));
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [locale]);

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="relative mx-auto xl:max-w-[70%] h-[40vh] md:h-[50vh] lg:h-[60vh] rounded-xl overflow-hidden shadow-lg">
      {loading ? (
        <Skeleton className="w-full h-full" />
      ) : articles.length > 0 ? (
        <>
          {/* Background Image */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="absolute inset-0 bg-cover bg-center"
              style={{
                backgroundImage: `url(${
                  articles[activeIndex]?.image || "/placeholder-news.jpg"
                })`,
              }}
            />
          </AnimatePresence>

          {/* Dark overlay - modified for mobile */}
          <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#07153b]/90 md:from-[#07153b]/80 to-transparent" />

          {/* Content */}
          <div className="relative h-full flex flex-col justify-end md:justify-center p-4 md:p-8 text-white">
            <div className="max-w-2xl bg-[#07153b]/70 md:bg-transparent p-4 md:p-0 rounded-lg md:rounded-none">
              <Badge className="mb-2 md:mb-4 bg-[#ffb400] hover:bg-[#ffb400]/90">
                Hot Updates
              </Badge>
              <motion.h1
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 md:mb-4 line-clamp-2"
              >
                {articles[activeIndex]?.title}
              </motion.h1>
              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-sm md:text-base text-[#DAE6EA] mb-3 md:mb-4 line-clamp-2 md:line-clamp-3"
              >
                {articles[activeIndex]?.description}
              </motion.p>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="flex items-center text-xs md:text-sm text-[#DAE6EA]"
              >
                <span>{formatDate(articles[activeIndex]?.publishedAt)}</span>
                <span className="mx-2">•</span>
                <span>{articles[activeIndex]?.source?.name}</span>
              </motion.div>
            </div>

            {/* Swiper-based news list */}
            <div className="absolute right-0 bottom-0 md:right-8 md:bottom-auto md:top-1/2 md:transform md:-translate-y-1/2 w-full md:w-[25%] px-4 md:px-0 py-3 md:py-0">
              <Swiper
                modules={[FreeMode, Autoplay]}
                direction={isMobile ? "horizontal" : "vertical"}
                spaceBetween={16}
                slidesPerView={isMobile ? "auto" : 3}
                freeMode={true}
                autoplay={{
                  delay: 3000,
                  disableOnInteraction: true,
                }}
                onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
                className={isMobile ? "horizontal-swiper" : "vertical-swiper"}
                style={{
                  height: isMobile ? "auto" : "300px", // Adjust height as needed
                  width: isMobile ? "100%" : "auto",
                }}
              >
                {articles.map((article, index) => (
                  <SwiperSlide
                    key={index}
                    style={{ width: isMobile ? "75%" : "100%" }}
                  >
                    <motion.div
                      whileHover={{ x: isMobile ? 0 : -5 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 17,
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        activeIndex === index
                          ? "border border-white bg-[#07153b]/70"
                          : "bg-[#07153b]/50 hover:bg-[#07153b]/60"
                      }`}
                      onClick={() => setActiveIndex(index)}
                    >
                      <Badge className="mb-1 bg-[#ffb400] hover:bg-[#ffb400]/90 text-xs">
                        Hot Update
                      </Badge>
                      <h3 className="font-medium text-sm line-clamp-2">
                        {article.title}
                      </h3>
                      <p className="text-xs text-[#DAE6EA] mt-1">
                        {formatDate(article.publishedAt)}
                      </p>
                    </motion.div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-[#07153b] text-white">
          No news articles found
        </div>
      )}
    </div>
  );
}
