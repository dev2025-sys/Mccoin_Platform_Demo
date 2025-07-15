"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import toast from "react-hot-toast";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";

const ContactForm = () => {
  const t = useTranslations("Contact");
  const pathname = usePathname();
  const locale = pathname?.split("/")[1] ?? "en";
  const formSchema = z.object({
    name: z.string().min(2, {
      message: t("name_error"),
    }),
    email: z.string().email({
      message: t("email_error"),
    }),
    phone: z.string().min(10, {
      message: t("phone_error"),
    }),
    subject: z.string().min(5, {
      message: t("subject_error"),
    }),
    message: z.string().min(10, {
      message: t("message_error"),
    }),
  });
  type FormValues = z.infer<typeof formSchema>;
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });
  const onSubmit = async (values: FormValues) => {
    try {
      console.log("Form values submitted:", values);
      const response = await fetch(`/${locale}/api/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      console.log(response);
      if (response.ok) {
        toast.success(t("message_sent_success"));
      } else {
        toast.error(`${t("error")}: ${result.error}`);
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error(t("form_submit_error"));
    }
    toast.success(t("message_submitted"), {
      position: "bottom-right",
      duration: 5000,
    });
    form.reset();
  };
  const handleBlur = async (fieldName: keyof FormValues) => {
    await form.trigger(fieldName);
  };
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 md:px-0 px-4"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">{t("full_name")}</FormLabel>
                <FormControl>
                  <Input
                    className="text-white placeholder:text-[#dae6ea] border border-slate-300"
                    placeholder={t("enter_your_full_name")}
                    {...field}
                    onBlur={() => handleBlur("name")}
                  />
                </FormControl>
                <div className="h-1">
                  <FormMessage className="text-red-500 text-sm transition-opacity duration-400" />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">{t("email")}</FormLabel>
                <FormControl>
                  <Input
                    className="text-white placeholder:text-[#dae6ea] border border-slate-300"
                    placeholder={t("enter_your_email")}
                    {...field}
                    onBlur={() => handleBlur("email")}
                  />
                </FormControl>
                <div className="h-1">
                  <FormMessage className="text-red-500 text-sm transition-opacity duration-400" />
                </div>
              </FormItem>
            )}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">{t("phone")}</FormLabel>
                <FormControl>
                  <Input
                    className="text-white placeholder:text-[#dae6ea] border border-slate-300"
                    placeholder={t("enter_your_phone_number")}
                    {...field}
                    onBlur={() => handleBlur("phone")}
                  />
                </FormControl>
                <div className="h-1">
                  <FormMessage className="text-red-500 text-sm transition-opacity duration-400" />
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="subject"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-white">{t("subject")}</FormLabel>
                <FormControl>
                  <Input
                    className="text-white placeholder:text-[#dae6ea] border border-slate-300"
                    placeholder={t("enter_the_subject")}
                    {...field}
                    onBlur={() => handleBlur("subject")}
                  />
                </FormControl>
                <div className="h-1">
                  <FormMessage className="text-red-500 text-sm transition-opacity duration-400" />
                </div>
              </FormItem>
            )}
          />
        </div>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-white">{t("message")}</FormLabel>
              <FormControl>
                <Textarea
                  className="text-white placeholder:text-[#dae6ea] border border-slate-300"
                  placeholder={t("enter_your_message")}
                  {...field}
                  onBlur={() => handleBlur("message")}
                />
              </FormControl>
              <div className="h-1">
                <FormMessage className="text-red-500 text-sm transition-opacity duration-200" />
              </div>
            </FormItem>
          )}
        />
        <div className="flex items-center justify-center">
          <Button
            className="bg-[#ec3b3b]! text-white cursor-pointer hover:bg-white! hover:text-[#ec3b3b] 
            hover:border hover:border-[#ec3b3b] hover:-translate-y-1 transition-all duration-300"
            type="submit"
          >
            {t("send_message")}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContactForm;
