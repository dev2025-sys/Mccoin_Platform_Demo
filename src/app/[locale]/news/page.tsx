import BusinessNews from "@/components/news-page/BusinessNews";
import DontMiss from "@/components/news-page/DontMiss";
import FintechNews from "@/components/news-page/FintechNews";
import RecentPosts from "@/components/news-page/RecentPosts";
import { TopNewsHero } from "@/components/news-page/TopNewsHero";
import { TopNewsSlider } from "@/components/news-page/TopNewsSlider";
import Footer from "@/components/shared/Footer";
import Navbar from "@/components/shared/Navbar";

const NewsPage = () => {
  return (
    <section className="bg-[#07153b]">
      <div className="mb-6">
        <Navbar />
      </div>
      <TopNewsHero />
      <TopNewsSlider />
      <FintechNews />
      <BusinessNews />
      <RecentPosts />
      <DontMiss />
      <Footer />
    </section>
  );
};

export default NewsPage;
