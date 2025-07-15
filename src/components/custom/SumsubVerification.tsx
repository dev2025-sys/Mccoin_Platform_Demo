import { useState, useEffect } from "react";
import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function SumsubIframeVerification({
  levelName,
}: {
  levelName: string;
}) {
  const { userId } = useAuth();
  const [externalLink, setExternalLink] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!userId) return;

    const fetchLink = async () => {
      try {
        const res = await fetch("/api/sumsub", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, levelName }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        setExternalLink(data.url);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLink();
  }, [userId, levelName]);

  useEffect(() => {
    if (!externalLink) return;

    // Add message listener for Sumsub events
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "idCheck.onApplicantSubmitted") {
        console.log("Documents submitted:", event.data);
      } else if (event.data.type === "idCheck.onApplicantReviewed") {
        console.log("Review completed:", event.data);
      } else if (event.data.type === "idCheck.onError") {
        console.error("Sumsub error:", event.data);
      }
    };

    window.addEventListener("message", handleMessage);
    const interval = setInterval(async () => {
      try {
        const res = await fetch("/api/user/kyc-status");
        const data = await res.json();
        if (data.verified) {
          console.log("User verified successfully!");
          router.push("/dashboard");
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000); // Check every 3 seconds for faster response

    return () => {
      clearInterval(interval);
      window.removeEventListener("message", handleMessage);
    };
  }, [externalLink]);

  if (isLoading)
    return (
      <p className="text-white text-center mt-10 flex items-center justify-center gap-2">
        <Loader2 className="animate-spin" />
        Loading...
      </p>
    );
  if (error) return <p className="text-red-500">{error}</p>;

  return (
    externalLink && (
      <iframe
        src={externalLink}
        style={{ width: "100%", height: "100vh", borderRadius: "8px" }}
        allow="camera; microphone"
        frameBorder="0"
      ></iframe>
    )
  );
}
