"use client";

import PATTERN from "@/../public/images/pattern-2.svg";
import ContactForm from "@/components/forms/ContactForm";
import Image from "next/image";
import { useTranslations } from "next-intl";

const ContactPage = () => {
  const t = useTranslations("contact");

  return (
    <section className="py-12">
      <h1 className="text-[#DAE6EA] lg:text-4xl text-xl text-center pb-4">
        {t("title")}
      </h1>
      <p className="text-[#DAE6EA] text-center lg:text-xl text-lg pb-12">
        {t("description")}
      </p>
      <ContactForm />
      <div className="w-full pt-12">
        <Image
          className="w-full"
          src={PATTERN}
          width={600}
          height={300}
          alt={t("pattern_alt")}
        />
      </div>
    </section>
  );
};

export default ContactPage;
