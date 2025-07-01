"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Article {
  article_id: string;
  title: string;
  description: string;
  link: string;
  image_url: string | null;
  pubDate: string;
  category: string[];
  creator?: string[];
  source_name?: string;
  source_icon?: string;
}

export default function BusinessNews() {
  const locale = (useParams() as { locale?: string })?.locale ?? "en";
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const q = "Business";
        const response = await fetch(`/api/newsdata?q=${q}`);
        const data = await response.json();
        setArticles(data.slice(0, 6));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <Skeleton className="mx-auto xl:max-w-[70%] px-4 xl:px-0 h-[600px]" />
    );
  }

  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

  return (
    <section className="mx-auto py-12 xl:max-w-[70%] px-4 xl:px-0">
      <h2 className="text-3xl font-bold text-white mb-8 pl-6 relative">
        <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-sm"></span>
        Business News
      </h2>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map((article, index) => (
          <motion.div
            key={article.article_id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-[#07153b] rounded-lg overflow-hidden shadow-md hover:-translate-y-1 transition-transform duration-300 border border-slate-700"
          >
            <Link href={article.link} className="block">
              <img
                src={article.image_url || "/images/fallback-image.jpeg"}
                alt={article.title}
                className="w-full h-48 object-cover"
              />
              <div className="p-4">
                <div className="flex items-center gap-3 text-xs text-[#FFF] mb-2">
                  <Badge className="bg-yellow-400 text-[#07153b] uppercase">
                    {article.category?.[0] || "News"}
                  </Badge>
                  <span>{formatDate(article.pubDate)}</span>
                </div>
                <h3 className="text-lg font-semibold text-[#FFF] mb-3 line-clamp-2">
                  {article.title}
                </h3>
                <p className="text-sm text-[#DAE6EA] mb-3 line-clamp-3">
                  {article.description}
                </p>
                <div className="flex items-center justify-between text-xs text-[#DAE6EA] border-t pt-3">
                  <span className="flex items-center gap-2">
                    <img
                      src={article.source_icon || "/images/fallback-image.jpeg"}
                      alt={article.source_name || "source"}
                      className="w-5 h-5 rounded-full"
                    />
                    {article.source_name || "Unknown Source"}
                  </span>
                  <span className="flex items-center gap-4">
                    👁 12345 💬 123
                  </span>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
