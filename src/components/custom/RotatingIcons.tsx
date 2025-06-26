"use client";
import Image from "next/image";
import MONEY_1 from "@/../public/images/money-1.svg";
import MONEY_2 from "@/../public/images/money-2.svg";
import MONEY_3 from "@/../public/images/money-3.svg";
import MONEY_4 from "@/../public/images/money-4.svg";

const RotatingIcons = () => {
  const icons = [
    { component: MONEY_1, id: 1 },
    { component: MONEY_2, id: 2 },
    { component: MONEY_3, id: 3 },
    { component: MONEY_4, id: 4 },
  ];

  return (
    <div
      className="flex items-center justify-center w-full pt-10 md:pt-12 z-10 relative"
      style={{
        background: "linear-gradient(135deg, #1A0A2E 0%, #2A1A4A 100%)",
      }}
    >
      <ul className="flex flex-wrap justify-center gap-4 md:gap-12 w-full max-w-6xl mx-auto">
        {icons.map((icon, index) => (
          <li
            key={icon.id}
            className="w-[20%] min-w-[100px] max-w-[150px] aspect-square animate-flip"
            style={{ animationDelay: `${index * 0.2}s` }}
          >
            <div className="w-full h-full flex items-center justify-center perspective-1000">
              <div className="relative w-full h-full transition-transform duration-1000 transform-style-preserve-3d">
                <div className="absolute inset-0 backface-hidden rounded-lg flex items-center justify-center p-2">
                  <Image
                    src={icon.component}
                    alt={`Icon ${icon.id}`}
                    width={100}
                    height={100}
                    className="h-auto object-contain md:w-[80%] w-[50%]"
                  />
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* CSS remains the same */}
      <style jsx global>{`
        @keyframes flip {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }
        .animate-flip {
          animation: flip 3s infinite linear;
        }
        .perspective-1000 {
          perspective: 1000px;
        }
        .transform-style-preserve-3d {
          transform-style: preserve-3d;
        }
        .backface-hidden {
          backface-visibility: hidden;
        }
      `}</style>
    </div>
  );
};

export default RotatingIcons;
