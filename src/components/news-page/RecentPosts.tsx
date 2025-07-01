"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Article {
  title: string;
  description: string;
  link: string;
  image_url: string;
  pubDate: string;
  category: string[];
}

export default function RecentPosts() {
  const locale = (useParams() as { locale?: string })?.locale ?? "en";
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const query = "crypto";
        const response = await fetch(`/api/newsdata?q=${query}`);
        const data = await response.json();
        setArticles(data.slice(0, 5));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return <Skeleton className="w-full h-[500px]" />;
  }

  if (!articles.length) {
    return <div className="text-[#DAE6EA] p-4">No articles available.</div>;
  }

  const mainArticle = articles[0];
  const sideArticles = articles.slice(1);

  const formatDate = (date: string) => {
    const d = new Date(date);
    return d.toLocaleDateString("en-US", {
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
          Popular Posts
        </h2>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Article */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="col-span-1 lg:col-span-2 bg-[#07153b] rounded-lg overflow-hidden shadow-md h-full border border-slate-700"
        >
          <Link href={mainArticle.link} className="block h-full">
            <div className="overflow-hidden">
              <img
                src={mainArticle.image_url || "/images/fallback-image.jpeg"}
                alt={mainArticle.title}
                className="object-cover w-full h-[300px]"
              />
            </div>
            <div className="p-4">
              <Badge className="bg-[#EC3B3B] text-white mb-2">
                {mainArticle.category[0] || "General"}
              </Badge>
              <h3 className="text-[#FFF] font-bold text-lg mb-2 line-clamp-2">
                {mainArticle.title}
              </h3>
              <div className="text-xs text-[#DAE6EA] mb-2 flex items-center gap-2">
                <span>{formatDate(mainArticle.pubDate)}</span>
              </div>
              <p className="text-sm text-[#FFF] line-clamp-3">
                {mainArticle.description}
              </p>
            </div>
          </Link>
        </motion.div>

        {/* Side Articles */}
        <div className="flex flex-col justify-between">
          {sideArticles.map((article, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * index }}
              className="bg-[#07153b] backdrop-blur-md rounded-lg p-3 flex gap-4 items-center mb-4 last:mb-0 shadow-md hover:-translate-y-2 tramsition-transform duration-300 border border-slate-700"
            >
              <Link
                href={article.link}
                className="flex gap-2 items-center group w-full"
              >
                <div className="w-24 h-24 overflow-hidden rounded-lg">
                  <img
                    src={article.image_url || "/images/fallback-image.jpeg"}
                    alt={article.title}
                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="text-white font-semibold text-sm leading-snug transition-colors line-clamp-2">
                    {article.title}
                  </h4>
                  <div className="text-xs text-[#DAE6EA] mt-1">
                    {formatDate(article.pubDate)}
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
