"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import { Store, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DurianLogo } from "@/components/durian-logo";
import { useAppStore } from "@/lib/store";

export default function LoginPage() {
  const router = useRouter();
  const { authenticated, ready, login } = usePrivy();
  const { userRole, setUserRole } = useAppStore();

  useEffect(() => {
    if (ready && authenticated) {
      // Redirect based on role
      if (userRole === "business") {
        router.push("/business/dashboard");
      } else {
        router.push("/directory");
      }
    }
  }, [ready, authenticated, userRole, router]);

  const handleRoleSelect = async (role: "business" | "tourist") => {
    setUserRole(role);
    login();
  };

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-durian-gradient p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <DurianLogo className="w-16 h-16 mx-auto mb-4" />
          <h1 className="text-3xl font-serif font-semibold">Welcome to Durian</h1>
          <p className="text-muted-foreground mt-2">
            Choose how you want to use Durian
          </p>
        </div>

        <div className="grid gap-4">
          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-sage-500"
            onClick={() => handleRoleSelect("business")}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center shrink-0">
                  <Store className="w-6 h-6 text-sage-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">I&apos;m a Business</h3>
                  <p className="text-sm text-muted-foreground">
                    Accept crypto payments, manage your menu, and withdraw to Thai
                    Baht. Get your business on the Durian directory.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card
            className="cursor-pointer hover:shadow-lg transition-all duration-300 hover:border-gold-500"
            onClick={() => handleRoleSelect("tourist")}
          >
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gold-100 dark:bg-gold-900/30 flex items-center justify-center shrink-0">
                  <Globe className="w-6 h-6 text-gold-700" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-1">I&apos;m a Traveler</h3>
                  <p className="text-sm text-muted-foreground">
                    Discover crypto-friendly businesses in Chiang Mai. Pay with USDC
                    or connect your bank via Revolut.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <p className="text-center text-xs text-muted-foreground mt-8">
          By continuing, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}
