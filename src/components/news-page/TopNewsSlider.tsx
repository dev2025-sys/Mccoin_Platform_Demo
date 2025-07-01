"use client";

import { useState, useEffect } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import "swiper/css";
import "swiper/css/autoplay";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "../ui/skeleton";
import { useParams } from "next/navigation";

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

export function TopNewsSlider() {
  const locale = (useParams() as { locale?: string })?.locale ?? "en";
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`/api/gnews`);
        if (!response.ok) {
          throw new Error("Failed to fetch news");
        }
        const data = await response.json();
        setArticles(data.slice(3, 9)); // Take articles from index 3 to 9
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [locale]);

  const formatDate = (dateString: string) => {
    return format(new Date(dateString), "MMMM d, yyyy");
  };

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  return (
    <div className="relative xl:max-w-[70%] mx-auto px-4 xl:px-0">
      {/* Subtle gradient background for the entire swiper */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#07153b]/10 via-transparent to-[#07153b]/10 -z-10" />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="bg-white/5 backdrop-blur-sm rounded-xl p-4 border border-[#DAE6EA]/10"
            >
              <div className="flex space-x-4">
                <Skeleton className="h-16 w-16 rounded-full bg-[#DAE6EA]/20" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-full bg-[#DAE6EA]/20" />
                  <Skeleton className="h-4 w-3/4 bg-[#DAE6EA]/20" />
                  <Skeleton className="h-3 w-1/2 bg-[#DAE6EA]/20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : articles.length > 0 ? (
        <Swiper
          modules={[Autoplay]}
          spaceBetween={24}
          slidesPerView={1}
          breakpoints={{
            640: {
              slidesPerView: 2,
              spaceBetween: 32,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 40,
            },
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          className="pb-12 px-2 mt-2"
        >
          {articles.map((article, index) => (
            <SwiperSlide key={index}>
              <div className="relative">
                <div className="absolute right-[-20px] top-1/2 transform -translate-y-1/2 h-3/4 w-px bg-[#DAE6EA]/20 hidden md:block" />

                <div className="bg-[#07153b]/90 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 h-full border border-[#DAE6EA]/10 hover:border-[#DAE6EA]/20">
                  <div className="p-5 flex items-start space-x-4 h-full">
                    <div className="flex-shrink-0 relative">
                      <div className="absolute -inset-1 rounded-full bg-[#EC3B3B]/30 blur-sm"></div>
                      <img
                        src={article.image || "/placeholder-news.jpg"}
                        alt={article.title}
                        className="h-16 w-16 rounded-full object-cover border-2 border-[#EC3B3B] relative z-10"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "/placeholder-news.jpg";
                        }}
                      />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-white line-clamp-2 leading-tight">
                        {article.title}
                      </h3>
                      <div className="flex items-center mt-3 text-xs text-[#DAE6EA]/80">
                        <span>{formatDate(article.publishedAt)}</span>
                        <span className="mx-2 w-1 h-1 rounded-full bg-[#DAE6EA]/50"></span>
                        <span>42 comments</span>
                      </div>
                      <Badge
                        variant="outline"
                        className="mt-3 border-[#EC3B3B]/50 text-[#EC3B3B] hover:bg-[#EC3B3B]/10 hover:border-[#EC3B3B]/70 transition-colors"
                      >
                        {article.source?.name}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      ) : (
        <div className="text-center py-8 text-[#DAE6EA] bg-[#07153b]/50 rounded-lg">
          No additional news articles found
        </div>
      )}
    </div>
  );
}
