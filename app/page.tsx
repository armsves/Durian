"use client";

import Link from "next/link";
import { usePrivy } from "@privy-io/react-auth";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Shield,
  Banknote,
  Globe,
  Users,
  BarChart3,
  Wallet,
  QrCode,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DurianLogo } from "@/components/durian-logo";

const stats = [
  { label: "REGISTERED THAI ENTITIES", value: "250+" },
  { label: "TOTAL VOLUME SETTLED", value: "฿1.2B" },
  { label: "AVG SETTLEMENT SPEED", value: "< 2m" },
  { label: "SYSTEM UPTIME", value: "99.9%" },
];

const features = [
  {
    icon: Globe,
    title: "Global Invoicing",
    description:
      "Accept USDC from clients worldwide. Our automated system handles compliance and tax-ready receipts in real-time.",
  },
  {
    icon: Users,
    title: "Client Directory",
    description:
      "A specialized CRM for Web3 businesses. Track on-chain identities alongside traditional business contact data.",
  },
  {
    icon: BarChart3,
    title: "Treasury Control",
    description:
      "Monitor your Thai Baht cashflow alongside your digital asset reserves. Unified reporting for the board.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Register Your Business",
    description: "Sign up with email, complete KYC, and set up your business profile.",
  },
  {
    step: "02",
    title: "Generate Payment QR",
    description: "Create payment requests with QR codes for USDC or Revolut payments.",
  },
  {
    step: "03",
    title: "Receive & Offramp",
    description: "Get paid in USDC, verify with zkTLS, and offramp to Thai Baht instantly.",
  },
];

export default function LandingPage() {
  const { login, authenticated } = usePrivy();

  return (
    <div className="min-h-screen">
      <Header />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 durian-gradient animated-bg opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background" />

        <div className="container mx-auto px-4 pt-20 pb-32 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Hero text */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 bg-gold-100 dark:bg-gold-900/30 text-gold-800 dark:text-gold-300 px-4 py-2 rounded-full text-sm mb-6">
                <span className="w-2 h-2 bg-gold-500 rounded-full animate-pulse" />
                LIVE IN THE KINGDOM OF THAILAND
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-serif mb-6">
                Sovereign Assets,
                <br />
                <span className="text-gradient italic">Local Liquidity.</span>
              </h1>

              <p className="text-lg text-muted-foreground mb-8 max-w-lg">
                Bridge the gap between global USDC payments and the Thai Baht
                economy. Professional-grade infrastructure for modern Thai
                enterprises.
              </p>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-sage-600" />
                  <div>
                    <p className="font-medium">Institutional Compliance</p>
                    <p className="text-sm text-muted-foreground">
                      Regulated pathways for digital asset settlement.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Banknote className="w-5 h-5 text-sage-600" />
                  <div>
                    <p className="font-medium">Direct Baht Offramping</p>
                    <p className="text-sm text-muted-foreground">
                      Settlements delivered via PromptPay in minutes.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Right: Login card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex justify-center lg:justify-end"
            >
              <Card className="w-full max-w-md glass shadow-2xl">
                <CardContent className="p-8">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    ENTERPRISE PORTAL
                  </p>
                  <h2 className="text-2xl font-serif mb-2">
                    Welcome to the Directory
                  </h2>
                  <p className="text-muted-foreground mb-6">
                    Connect your business identity to begin.
                  </p>

                  <Button
                    onClick={login}
                    className="w-full btn-primary mb-4"
                    size="lg"
                  >
                    <Wallet className="w-4 h-4 mr-2" />
                    Sign in with Privy
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>

                  <div className="relative my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-border" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-card px-2 text-muted-foreground">
                        Institutional Access
                      </span>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" size="lg" asChild>
                    <Link href="/directory">
                      <QrCode className="w-4 h-4 mr-2" />
                      Browse Directory
                    </Link>
                  </Button>

                  <p className="text-xs text-muted-foreground text-center mt-4">
                    By proceeding, you agree to our{" "}
                    <Link href="/legal" className="underline">
                      Standard Terms
                    </Link>
                    .
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-sage-900 text-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-3xl md:text-4xl font-serif mb-2">{stat.value}</p>
                <p className="text-xs uppercase tracking-wider text-sage-300">
                  {stat.label}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="solutions" className="py-24 bg-cream-50 dark:bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif mb-4">
              Designed for the{" "}
              <span className="italic text-gradient">Modern Merchant</span>
            </h2>
            <div className="w-16 h-1 bg-gold-500 mx-auto" />
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow duration-300">
                  <CardContent className="p-8">
                    <div className="w-12 h-12 rounded-xl bg-sage-100 dark:bg-sage-900/30 flex items-center justify-center mb-6">
                      <feature.icon className="w-6 h-6 text-sage-700 dark:text-sage-400" />
                    </div>
                    <h3 className="text-xl font-serif font-semibold mb-3 italic">
                      {feature.title}
                    </h3>
                    <p className="text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-serif mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started in minutes. Accept global payments and settle in Thai
              Baht.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="text-6xl font-serif text-sage-100 dark:text-sage-900 font-bold absolute -top-6 -left-2">
                  {item.step}
                </div>
                <div className="relative pt-8 pl-4">
                  <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                  <p className="text-muted-foreground">{item.description}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-sage-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          />
        </div>
        <div className="container mx-auto px-4 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-serif mb-4 italic">
              Cultivate your business growth.
            </h2>
            <p className="text-sage-200 mb-8 max-w-xl mx-auto">
              Join the elite network of Thai businesses operating on the global
              stage. Secure, organic, and powerful.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={login}
                className="bg-gold-500 hover:bg-gold-600 text-white"
                size="lg"
              >
                GET ONBOARDED
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                size="lg"
                asChild
              >
                <Link href="/directory">REQUEST DEMO</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
