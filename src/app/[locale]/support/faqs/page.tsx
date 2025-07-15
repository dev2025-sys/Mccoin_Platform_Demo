"use client";
import { FaPlus, FaMinus } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import FAQImage from "@/../public/images/faq_icon.webp";
import Image from "next/image";
import { Faqs } from "@/utils/data";

const FaqsPage = () => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleAccordion = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="container mx-auto xl:w-[70%] py-12 px-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex flex-col items-center mb-12"
      >
        <Image
          src={FAQImage}
          alt="FAQ Icon"
          width={100}
          height={100}
          className="mb-4"
        />

        <h1 className="text-[#DAE6EA] text-center text-2xl lg:text-4xl font-bold pb-4 bg-gradient-to-r from-[#DAE6EA] to-[#FFF] bg-clip-text">
          Frequently Asked Questions
        </h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="text-center text-[#DAE6EA]/80 text-sm lg:text-base max-w-2xl"
        >
          Got questions? We've got answers. Explore our FAQ section to learn
          more about how our crypto brokerage works, including trading, account
          management, funding options, security protocols, and more.
        </motion.p>
      </motion.div>

      <div className="w-full space-y-4">
        {Faqs.map((faq, index) => (
          <motion.div
            key={faq.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <div
              className={`border border-[#07153B] rounded-lg overflow-hidden shadow-xl transition-all duration-300 hover:border-slate-400 dark:hover:border-white ${
                activeIndex === index
                  ? "border-slate-400 dark:border-white"
                  : ""
              }`}
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="flex justify-between items-center w-full font-semibold text-lg text-[#07153B] dark:text-[#DAE6EA] px-6 py-4 transition-colors duration-300 bg-[#DAE6EA] dark:bg-[#07153B]/70 dark:hover:bg-[#07153B] cursor-pointer"
              >
                <span className="text-left">{faq.question}</span>
                <motion.span
                  animate={{ rotate: activeIndex === index ? 0 : 0 }}
                  transition={{ duration: 0.3 }}
                  className="ml-4 text-[#EC3B3B]"
                >
                  {activeIndex === index ? <FaMinus /> : <FaPlus />}
                </motion.span>
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                    className="overflow-hidden"
                  >
                    <div className="px-6 pb-4 pt-4 text-[#07153B] dark:text-[#DAE6EA]/90 bg-[#DAE6EA] dark:bg-[#07153B]/40 border-t-2 border-[#CCC]/20">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default FaqsPage;
