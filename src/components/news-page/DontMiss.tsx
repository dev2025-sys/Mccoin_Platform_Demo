"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";

interface Article {
  id?: string;
  title?: string;
  content?: string;
  description?: string;
  image?: string;
  publishedAt?: string;
  source?: { name?: string };
  url?: string;
}

export default function DontMiss() {
  const locale = (useParams() as { locale?: string })?.locale ?? "en";
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(`/api/gnews`);
        const data = await response.json();
        setArticles(
          data
            ?.slice(0, 6)
            ?.map((article: Article) => ({
              ...article,
              id: article.id || uuidv4(),
            })) || []
        );
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, [locale]);

  if (loading) {
    return (
      <Skeleton className="xl:max-w-[70%] mx-auto px-4 xl:px-0 h-[500px]" />
    );
  }

  if (!articles.length) {
    return <div className="text-[#DAE6EA] p-4">No articles available.</div>;
  }

  const topArticles = articles.slice(0, 2);
  const gridArticles = articles.slice(2);

  const formatDate = (date?: string) => {
    if (!date) return "Unknown date";
    const d = new Date(date);
    return isNaN(d.getTime())
      ? "Unknown date"
      : d.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
  };

  return (
    <section className="mx-auto py-12 xl:max-w-[70%] px-4 xl:px-0">
      <div className="flex items-center">
        <h2 className="text-3xl font-bold text-white mb-8 pl-6 relative">
          <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-sm"></span>
          Don’t Miss
        </h2>
      </div>

      {/* Top Two Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        {topArticles.map((article) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.5 }}
            className="bg-[#07153b] rounded-lg overflow-hidden shadow-md h-full group border border-slate-700"
          >
            <Link
              href={article.url || "#"}
              className={`block h-full ${
                !article.url ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <div className="overflow-hidden relative">
                <motion.img
                  src={article.image || "/placeholder-news.jpg"}
                  alt={article.title || "Untitled"}
                  className="w-full h-[220px] object-cover transition-transform duration-500 group-hover:scale-105"
                  whileHover={{ scale: 1.1 }}
                />
              </div>
              <div className="p-4">
                <Badge className="bg-[#EC3B3B] text-white mb-2">
                  {article.source?.name || "Don't Miss"}
                </Badge>
                <h3 className="text-[#DAE6EA] font-bold text-lg mb-2 line-clamp-2">
                  {article.title || "Untitled Article"}
                </h3>
                <div className="text-xs text-[#DAE6EA] mb-2 flex items-center gap-2">
                  <span>{formatDate(article.publishedAt)}</span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Grid Four Articles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {gridArticles.map((article) => (
          <motion.div
            key={article.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.5 }}
            className="bg-[#07153b] backdrop-blur-md rounded-lg p-3 flex gap-4 items-center shadow-md group border border-slate-700"
          >
            <Link
              href={article.url || "#"}
              className={`flex gap-2 items-center group w-full ${
                !article.url ? "pointer-events-none opacity-50" : ""
              }`}
            >
              <div className="w-24 h-24 overflow-hidden rounded-lg relative">
                <motion.img
                  src={article.image || "/placeholder-news.jpg"}
                  alt={article.title || "Untitled"}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-white font-semibold text-sm leading-snug group-hover:text-[#EC3B3B] transition-colors line-clamp-2">
                  {article.title || "Untitled Article"}
                </h4>
                <div className="text-xs text-[#DAE6EA] mt-1">
                  {formatDate(article.publishedAt)}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
