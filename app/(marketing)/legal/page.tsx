"use client";

import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

export default function LegalPage() {
  return (
    <div className="min-h-screen bg-cream-50 dark:bg-background">
      <Header />

      <main className="pt-24 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <h1 className="text-4xl font-serif mb-8">Legal & Compliance</h1>

          <div className="prose prose-sage dark:prose-invert max-w-none">
            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">Terms of Service</h2>
              <p className="text-muted-foreground mb-4">
                Last updated: January 2024
              </p>
              <p>
                By using Durian Pay services, you agree to these terms. Durian Pay
                (Thailand) Ltd. operates as a licensed Digital Asset Provider under
                the supervision of the Securities and Exchange Commission of
                Thailand.
              </p>
              <h3 className="text-xl font-semibold mt-6 mb-3">
                1. Service Description
              </h3>
              <p>
                Durian provides payment infrastructure enabling businesses to accept
                cryptocurrency payments (primarily USDC) and settle in Thai Baht.
                Our services include:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Payment processing for USDC and supported cryptocurrencies</li>
                <li>Fiat offramp services via PromptPay</li>
                <li>Business directory and merchant tools</li>
                <li>Payment verification via zkTLS technology</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">
                2. Eligibility
              </h3>
              <p>
                To use our business services, you must be a legally registered
                entity in Thailand or a foreign entity with valid Thai business
                registration. Individual users must be at least 18 years old.
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">
                3. KYC Requirements
              </h3>
              <p>
                All business accounts must complete our Know Your Customer (KYC)
                verification process. This includes providing valid identification,
                business registration documents, and proof of address.
              </p>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">Privacy Policy</h2>
              <p className="text-muted-foreground mb-4">
                Last updated: January 2024
              </p>
              <p>
                We are committed to protecting your privacy and handling your data
                in accordance with Thailand&apos;s Personal Data Protection Act (PDPA).
              </p>

              <h3 className="text-xl font-semibold mt-6 mb-3">
                Data We Collect
              </h3>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Account information (email, name, business details)</li>
                <li>Transaction data (payment amounts, timestamps, wallet addresses)</li>
                <li>KYC documents (identification, business registration)</li>
                <li>Device and usage information</li>
              </ul>

              <h3 className="text-xl font-semibold mt-6 mb-3">
                How We Use Your Data
              </h3>
              <ul className="list-disc pl-6 mt-2 space-y-2">
                <li>Process payments and settlements</li>
                <li>Comply with regulatory requirements</li>
                <li>Prevent fraud and ensure platform security</li>
                <li>Improve our services and user experience</li>
              </ul>
            </section>

            <section className="mb-12">
              <h2 className="text-2xl font-serif mb-4">
                Thai SEC Compliance
              </h2>
              <p>
                Durian Pay (Thailand) Ltd. is registered as a Digital Asset Provider
                with the Securities and Exchange Commission of Thailand (Thai SEC).
                We comply with:
              </p>
              <ul className="list-disc pl-6 mt-4 space-y-2">
                <li>Digital Asset Business Emergency Decree B.E. 2561 (2018)</li>
                <li>Anti-Money Laundering Act B.E. 2542 (1999)</li>
                <li>Personal Data Protection Act B.E. 2562 (2019)</li>
                <li>Bank of Thailand regulations on digital payments</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-serif mb-4">Contact</h2>
              <p>
                For legal inquiries, please contact our compliance team:
              </p>
              <p className="mt-4">
                <strong>Email:</strong> legal@durianpay.co.th
                <br />
                <strong>Address:</strong> 123 Nimmanhaemin Road, Chiang Mai 50200,
                Thailand
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
