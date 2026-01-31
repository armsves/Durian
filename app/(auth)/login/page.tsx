"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Store, Globe, Loader2, ArrowRight } from "lucide-react";
import { DurianLogo } from "@/components/durian-logo";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { authenticated, ready, login } = usePrivy();
  const { setUserRole } = useAppStore();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const handleRoleSelect = async (role: "business" | "tourist") => {
    setUserRole(role);
    
    if (authenticated) {
      if (role === "business") {
        router.push("/business/onboarding");
      } else {
        router.push("/directory");
      }
    } else {
      setIsLoggingIn(true);
      try {
        await login();
        if (role === "business") {
          router.push("/business/onboarding");
        } else {
          router.push("/directory");
        }
      } catch (e) {
        console.error("Login failed:", e);
        setIsLoggingIn(false);
      }
    }
  };

  if (!ready || isLoggingIn) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: "linear-gradient(135deg, #A8C2B9 0%, #c5d6cf 30%, #e0ebe5 60%, #FDFBF7 100%)" }}
      >
        <div className="text-center">
          <Loader2 className="w-10 h-10 animate-spin mx-auto mb-4" style={{ color: "#2D3A2D" }} />
          <p style={{ color: "#333", fontSize: "14px" }}>
            {isLoggingIn ? "Signing you in..." : "Loading..."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: "linear-gradient(135deg, #A8C2B9 0%, #c5d6cf 30%, #e0ebe5 60%, #FDFBF7 100%)" }}
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <DurianLogo className="w-20 h-20 mx-auto mb-6" />
          <h1 
            className="text-4xl font-serif font-bold mb-3"
            style={{ color: "#000" }}
          >
            Welcome to Durian
          </h1>
          <p style={{ color: "#555", fontSize: "16px" }}>
            {authenticated 
              ? "You're signed in! Choose how you'd like to continue."
              : "Select your account type to get started"
            }
          </p>
        </div>

        {/* Cards */}
        <div className="space-y-4">
          {/* Business Card */}
          <div
            className="cursor-pointer transition-all duration-300 rounded-2xl p-6"
            style={{ 
              backgroundColor: hoveredCard === "business" ? "#2D3A2D" : "white",
              border: "2px solid #2D3A2D",
              boxShadow: hoveredCard === "business" 
                ? "0 20px 40px rgba(45, 58, 45, 0.3)" 
                : "0 4px 20px rgba(0, 0, 0, 0.08)",
              transform: hoveredCard === "business" ? "translateY(-4px)" : "translateY(0)",
            }}
            onClick={() => handleRoleSelect("business")}
            onMouseEnter={() => setHoveredCard("business")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ 
                    backgroundColor: hoveredCard === "business" ? "rgba(255,255,255,0.15)" : "#2D3A2D"
                  }}
                >
                  <Store 
                    className="w-7 h-7" 
                    style={{ color: hoveredCard === "business" ? "#fff" : "#fff" }} 
                  />
                </div>
                <div>
                  <h3 
                    className="font-bold text-xl mb-1"
                    style={{ color: hoveredCard === "business" ? "#fff" : "#000" }}
                  >
                    I&apos;m a Business
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: hoveredCard === "business" ? "rgba(255,255,255,0.8)" : "#666" }}
                  >
                    Accept crypto payments & withdraw to Thai Baht
                  </p>
                </div>
              </div>
              <ArrowRight 
                className="w-6 h-6" 
                style={{ 
                  color: hoveredCard === "business" ? "#C5A35E" : "#2D3A2D",
                  transform: hoveredCard === "business" ? "translateX(4px)" : "translateX(0)",
                  transition: "transform 0.2s"
                }} 
              />
            </div>
          </div>

          {/* Traveler Card */}
          <div
            className="cursor-pointer transition-all duration-300 rounded-2xl p-6"
            style={{ 
              backgroundColor: hoveredCard === "tourist" ? "#C5A35E" : "white",
              border: "2px solid #C5A35E",
              boxShadow: hoveredCard === "tourist" 
                ? "0 20px 40px rgba(197, 163, 94, 0.3)" 
                : "0 4px 20px rgba(0, 0, 0, 0.08)",
              transform: hoveredCard === "tourist" ? "translateY(-4px)" : "translateY(0)",
            }}
            onClick={() => handleRoleSelect("tourist")}
            onMouseEnter={() => setHoveredCard("tourist")}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div 
                  className="w-14 h-14 rounded-xl flex items-center justify-center"
                  style={{ 
                    backgroundColor: hoveredCard === "tourist" ? "rgba(255,255,255,0.2)" : "#C5A35E"
                  }}
                >
                  <Globe 
                    className="w-7 h-7" 
                    style={{ color: "#fff" }} 
                  />
                </div>
                <div>
                  <h3 
                    className="font-bold text-xl mb-1"
                    style={{ color: hoveredCard === "tourist" ? "#fff" : "#000" }}
                  >
                    I&apos;m a Traveler
                  </h3>
                  <p 
                    className="text-sm"
                    style={{ color: hoveredCard === "tourist" ? "rgba(255,255,255,0.9)" : "#666" }}
                  >
                    Discover crypto-friendly spots in Chiang Mai
                  </p>
                </div>
              </div>
              <ArrowRight 
                className="w-6 h-6" 
                style={{ 
                  color: hoveredCard === "tourist" ? "#fff" : "#C5A35E",
                  transform: hoveredCard === "tourist" ? "translateX(4px)" : "translateX(0)",
                  transition: "transform 0.2s"
                }} 
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm mt-10" style={{ color: "#666" }}>
          By continuing, you agree to our{" "}
          <span style={{ color: "#2D3A2D", fontWeight: 500, cursor: "pointer" }}>Terms</span>
          {" "}and{" "}
          <span style={{ color: "#2D3A2D", fontWeight: 500, cursor: "pointer" }}>Privacy Policy</span>
        </p>
      </div>
    </div>
  );
}
