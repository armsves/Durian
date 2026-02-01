"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { usePrivy } from "@privy-io/react-auth";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  MapPin,
  Menu,
  FileCheck,
  Banknote,
  Check,
  Upload,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DurianLogo } from "@/components/durian-logo";
import { LocationPicker } from "@/components/mapbox-map";
import { ImageUpload } from "@/components/image-upload";
import { CATEGORY_LABELS } from "@/lib/utils";
import { useAppStore } from "@/lib/store";

const steps = [
  { id: 1, title: "Basics", icon: Building2 },
  { id: 2, title: "Location", icon: MapPin },
  { id: 3, title: "Menu", icon: Menu },
  { id: 4, title: "Verification", icon: FileCheck },
  { id: 5, title: "Banking", icon: Banknote },
];

interface MenuItem {
  name: string;
  category: string;
  price: string;
  description: string;
}

export default function OnboardingPage() {
  const router = useRouter();
  const { user, ready } = usePrivy();
  const { onboardingStep, setOnboardingStep } = useAppStore();
  const [currentStep, setCurrentStep] = useState(onboardingStep);
  const [checkingBusiness, setCheckingBusiness] = useState(true);

  // Check if user already has a business - redirect to dashboard if so
  useEffect(() => {
    async function checkExistingBusiness() {
      const userEmail = user?.email?.address || user?.google?.email;
      
      if (!ready) return;
      
      if (!userEmail) {
        setCheckingBusiness(false);
        return;
      }

      try {
        const res = await fetch(`/api/business?owner_email=${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        
        if (data.business) {
          // User already has a business, redirect to dashboard
          router.replace("/business/dashboard");
          return;
        }
      } catch (err) {
        console.error("Error checking for existing business:", err);
      }
      
      setCheckingBusiness(false);
    }

    checkExistingBusiness();
  }, [user, ready, router]);

  // Form state
  const [businessName, setBusinessName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [location, setLocation] = useState<{ lat: number; lng: number } | undefined>();
  const [address, setAddress] = useState("");
  const [menuItems, setMenuItems] = useState<MenuItem[]>([
    { name: "", category: "", price: "", description: "" },
  ]);
  const [logoUrl, setLogoUrl] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [promptPayId, setPromptPayId] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const progress = (currentStep / steps.length) * 100;

  // Get user email and wallet
  const userEmail = user?.email?.address || user?.google?.email || "";
  const userWallet = user?.wallet?.address || "";

  const saveBusinessToDatabase = async () => {
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: businessName,
          category,
          description,
          logo_url: logoUrl,
          address,
          latitude: location?.lat,
          longitude: location?.lng,
          phone,
          website,
          owner_email: userEmail,
          owner_wallet: userWallet,
          wallet_address: walletAddress || userWallet,
          bank_name: bankName,
          bank_account_name: accountName,
          bank_account_number: accountNumber,
          promptpay_id: promptPayId,
          accepts_usdc: true,
          accepts_durianbank: true,
          menu_items: menuItems.filter(item => item.name && item.price),
        }),
      });

      const result = await res.json();

      if (!res.ok || result.error) {
        setError(result.error || "Failed to create business");
        setSaving(false);
        return false;
      }

      return true;
    } catch (err) {
      console.error("Error saving business:", err);
      setError("Failed to create business. Please try again.");
      setSaving(false);
      return false;
    }
  };

  const nextStep = async () => {
    if (currentStep < steps.length) {
      const next = currentStep + 1;
      setCurrentStep(next);
      setOnboardingStep(next);
    } else {
      // Complete onboarding - save to database
      const success = await saveBusinessToDatabase();
      if (success) {
        router.push("/business/dashboard");
      }
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      const prev = currentStep - 1;
      setCurrentStep(prev);
      setOnboardingStep(prev);
    }
  };

  const addMenuItem = () => {
    setMenuItems([...menuItems, { name: "", category: "", price: "", description: "" }]);
  };

  const updateMenuItem = (index: number, field: keyof MenuItem, value: string) => {
    const updated = [...menuItems];
    updated[index][field] = value;
    setMenuItems(updated);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            {/* Show linked email */}
            <div className="bg-gold-50 dark:bg-gold-900/20 p-4 rounded-xl">
              <p className="text-sm text-muted-foreground">
                This business will be linked to: <strong>{userEmail || "No email found"}</strong>
              </p>
              {userWallet && (
                <p className="text-sm text-muted-foreground mt-1">
                  Wallet: <code className="text-xs">{userWallet.slice(0, 6)}...{userWallet.slice(-4)}</code>
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                placeholder="e.g., Nimman Café"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="category">Category *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Tell customers about your business..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="mt-1"
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="08x-xxx-xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  placeholder="https://..."
                  value={website}
                  onChange={(e) => setWebsite(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label>Business Logo / Photo</Label>
              <ImageUpload
                onUploadComplete={(url) => setLogoUrl(url)}
                currentImage={logoUrl}
                className="mt-2"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <Label>Pin Your Location *</Label>
              <p className="text-sm text-muted-foreground mb-3">
                Click on the map to set your business location
              </p>
              <LocationPicker
                value={location}
                onChange={setLocation}
                className="rounded-xl overflow-hidden"
              />
            </div>

            <div>
              <Label htmlFor="address">Street Address *</Label>
              <Textarea
                id="address"
                placeholder="Full street address..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1"
                rows={2}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">
              Add items to your menu. You can always edit these later.
            </p>

            {menuItems.map((item, index) => (
              <Card key={index}>
                <CardContent className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>Item Name</Label>
                      <Input
                        placeholder="e.g., Iced Latte"
                        value={item.name}
                        onChange={(e) =>
                          updateMenuItem(index, "name", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Price (THB)</Label>
                      <Input
                        type="number"
                        placeholder="95"
                        value={item.price}
                        onChange={(e) =>
                          updateMenuItem(index, "price", e.target.value)
                        }
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input
                      placeholder="e.g., Coffee, Food, Dessert"
                      value={item.category}
                      onChange={(e) =>
                        updateMenuItem(index, "category", e.target.value)
                      }
                      className="mt-1"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button variant="outline" onClick={addMenuItem} className="w-full">
              + Add Another Item
            </Button>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="bg-sage-50 dark:bg-sage-900/20 p-4 rounded-xl">
              <h3 className="font-medium mb-2">KYC Verification Required</h3>
              <p className="text-sm text-muted-foreground">
                To comply with Thai regulations, we need to verify your business
                identity. Please upload the following documents:
              </p>
            </div>

            <div>
              <Label>Business Registration Certificate</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Upload DBD Certificate
                </p>
              </div>
            </div>

            <div>
              <Label>Owner ID Card</Label>
              <div className="mt-1 border-2 border-dashed border-border rounded-xl p-6 text-center hover:border-primary transition-colors cursor-pointer">
                <Upload className="w-6 h-6 mx-auto text-muted-foreground mb-2" />
                <p className="text-sm text-muted-foreground">
                  Upload ID Card (front & back)
                </p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Your documents will be reviewed within 1-2 business days. You can
              still set up your profile while waiting for approval.
            </p>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            {/* Crypto Wallet */}
            <div className="bg-sage-50 dark:bg-sage-900/20 p-4 rounded-xl">
              <h3 className="font-medium mb-2">Crypto Wallet (USDC)</h3>
              <p className="text-sm text-muted-foreground">
                Enter the wallet address where you&apos;ll receive USDC payments.
              </p>
            </div>

            <div>
              <Label htmlFor="walletAddress">Wallet Address (Base Network)</Label>
              <Input
                id="walletAddress"
                placeholder="0x..."
                value={walletAddress}
                onChange={(e) => setWalletAddress(e.target.value)}
                className="mt-1 font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground mt-1">
                {userWallet ? `Leave empty to use your connected wallet: ${userWallet.slice(0, 10)}...` : "Enter your EVM wallet address"}
              </p>
            </div>

            {/* Bank Account */}
            <div className="bg-gold-50 dark:bg-gold-900/20 p-4 rounded-xl">
              <h3 className="font-medium mb-2">Thai Baht Settlement (Optional)</h3>
              <p className="text-sm text-muted-foreground">
                For offramp - we&apos;ll settle your crypto to this bank account.
              </p>
            </div>

            <div>
              <Label htmlFor="bankName">Bank Name</Label>
              <Select value={bankName} onValueChange={setBankName}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select your bank" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kbank">Kasikorn Bank</SelectItem>
                  <SelectItem value="scb">Siam Commercial Bank</SelectItem>
                  <SelectItem value="bbl">Bangkok Bank</SelectItem>
                  <SelectItem value="ktb">Krungthai Bank</SelectItem>
                  <SelectItem value="bay">Bank of Ayudhya</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="accountName">Account Holder Name</Label>
              <Input
                id="accountName"
                placeholder="As shown on bank account"
                value={accountName}
                onChange={(e) => setAccountName(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="10-digit account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="promptpay">PromptPay ID (Optional)</Label>
              <Input
                id="promptpay"
                placeholder="Phone number or National ID"
                value={promptPayId}
                onChange={(e) => setPromptPayId(e.target.value)}
                className="mt-1"
              />
              <p className="text-xs text-muted-foreground mt-1">
                For faster settlements
              </p>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-xl text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Show loading while checking for existing business
  if (checkingBusiness) {
    return (
      <div className="min-h-screen bg-cream-50 dark:bg-background flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#C5A35E" }} />
          <p className="text-muted-foreground">Checking account...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream-50 dark:bg-background">
      {/* Header */}
      <div className="border-b bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <DurianLogo className="w-8 h-8" />
              <span className="font-serif text-xl font-semibold">Durian</span>
            </div>
            <Button variant="ghost" onClick={() => router.push("/")}>
              Exit
            </Button>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((step, i) => (
              <div
                key={step.id}
                className={`flex items-center ${
                  i < steps.length - 1 ? "flex-1" : ""
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors ${
                    currentStep > step.id
                      ? "bg-sage-600 text-white"
                      : currentStep === step.id
                      ? "bg-sage-600 text-white"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {currentStep > step.id ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    <step.icon className="w-5 h-5" />
                  )}
                </div>
                {i < steps.length - 1 && (
                  <div
                    className={`flex-1 h-1 mx-2 rounded-full transition-colors ${
                      currentStep > step.id ? "bg-sage-600" : "bg-muted"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-serif">
              {steps[currentStep - 1].title}
            </CardTitle>
            <CardDescription>
              Step {currentStep} of {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderStepContent()}</CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 1 || saving}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button onClick={nextStep} variant="gold" disabled={saving}>
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Creating Business...
              </>
            ) : (
              <>
                {currentStep === steps.length ? "Complete Setup" : "Continue"}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
