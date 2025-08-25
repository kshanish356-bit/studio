
"use client";

import type React from 'react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Script from 'next/script';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, CreditCard, Smartphone, Landmark, Wallet, CircleDollarSign, ShieldCheck } from 'lucide-react';

type PaymentSection = 'quikPay' | 'upi' | 'card' | 'netBanking' | 'wallet' | 'cbdc';

interface PaymentMethod {
  id: string;
  name: string;
  logo: string;
  aiHint: string;
}

const upiOptions: PaymentMethod[] = [
  { id: 'google-pay', name: 'Google Pay', logo: 'https://placehold.co/24x24.png', aiHint: 'logo googlepay' },
  { id: 'phonepe', name: 'PhonePe', logo: 'https://placehold.co/24x24.png', aiHint: 'logo phonepe' },
  { id: 'paytm', name: 'Paytm', logo: 'https://placehold.co/24x24.png', aiHint: 'logo paytm' },
  { id: 'bhim', name: 'BHIM', logo: 'https://placehold.co/24x24.png', aiHint: 'logo bhim' },
  { id: 'amazon-pay', name: 'Amazon Pay UPI', logo: 'https://placehold.co/24x24.png', aiHint: 'logo amazonpay' },
  { id: 'payzapp', name: 'PayZapp', logo: 'https://placehold.co/24x24.png', aiHint: 'logo payzapp' },
];

const cardOptions: PaymentMethod[] = [
  { id: 'visa', name: 'Visa', logo: 'https://placehold.co/24x24.png', aiHint: 'logo visa' },
  { id: 'mastercard', name: 'MasterCard', logo: 'https://placehold.co/24x24.png', aiHint: 'logo mastercard' },
  { id: 'amex', name: 'American Express', logo: 'https://placehold.co/24x24.png', aiHint: 'logo amex' },
  { id: 'rupay', name: 'RuPay', logo: 'https://placehold.co/24x24.png', aiHint: 'logo rupay' },
  { id: 'discover', name: 'Discover', logo: 'https://placehold.co/24x24.png', aiHint: 'logo discover' },
  { id: 'diners-club', name: 'Diners Club', logo: 'https://placehold.co/24x24.png', aiHint: 'logo dinersclub' },
];

// Static data for net banking and CBDC as backend isn't implemented yet
const staticNetBankingOptions: PaymentMethod[] = [
    { id: 'icici', name: 'ICICI Bank', logo: 'https://placehold.co/24x24.png', aiHint: 'logo icici' },
    { id: 'hdfc', name: 'HDFC Bank', logo: 'https://placehold.co/24x24.png', aiHint: 'logo hdfc' },
    { id: 'sbi', name: 'SBI Bank', logo: 'https://placehold.co/24x24.png', aiHint: 'logo sbi' },
    { id: 'axis', name: 'Axis Bank', logo: 'https://placehold.co/24x24.png', aiHint: 'logo axis' },
    { id: 'kotak', name: 'Kotak Mahindra Bank', logo: 'https://placehold.co/24x24.png', aiHint: 'logo kotak' },
    { id: 'indusind', name: 'IndusInd Bank', logo: 'https://placehold.co/24x24.png', aiHint: 'logo indusind' },
];

const staticWalletOptions: PaymentMethod[] = [
    { id: 'mobikwik', name: 'MobiKwik', logo: 'https://placehold.co/24x24.png', aiHint: 'logo mobikwik' },
    { id: 'paytm-wallet', name: 'Paytm', logo: 'https://placehold.co/24x24.png', aiHint: 'logo paytm' },
    { id: 'phonepe-wallet', name: 'PhonePe', logo: 'https://placehold.co/24x24.png', aiHint: 'logo phonepe' },
    { id: 'amazonpay-wallet', name: 'Amazon Pay', logo: 'https://placehold.co/24x24.png', aiHint: 'logo amazonpay' },
    { id: 'freecharge', name: 'Freecharge', logo: 'https://placehold.co/24x24.png', aiHint: 'logo freecharge' },
    { id: 'olamoney', name: 'Ola Money', logo: 'https://placehold.co/24x24.png', aiHint: 'logo olamoney' },
    { id: 'jiomoney', name: 'Jio Money', logo: 'https://placehold.co/24x24.png', aiHint: 'logo jiomoney' },
];

const staticCBDCOptions: PaymentMethod[] = [
    { id: 'axis-digital', name: 'Axis Bank Digital Rupee', logo: 'https://placehold.co/24x24.png', aiHint: 'logo axis' },
    { id: 'hdfc-digital', name: 'HDFC Bank Digital Rupee', logo: 'https://placehold.co/24x24.png', aiHint: 'logo hdfc' },
    { id: 'yesbank-digital', name: 'Yes Bank e₹ Wallet', logo: 'https://placehold.co/24x24.png', aiHint: 'logo yesbank' },
    { id: 'icici-digital', name: 'ICICI Bank Digital Rupee', logo: 'https://placehold.co/24x24.png', aiHint: 'logo icici' },
    { id: 'kotak-digital', name: 'Kotak Mahindra Digital Rupee', logo: 'https://placehold.co/24x24.png', aiHint: 'logo kotak' },
];


export default function PaymentPage() {
  const [activeSection, setActiveSection] = useState<PaymentSection | null>(null);
  const [selectedUpi, setSelectedUpi] = useState<string | undefined>();
  const [selectedCard, setSelectedCard] = useState<string | undefined>();
  const [selectedNetBanking, setSelectedNetBanking] = useState<string | undefined>();
  const [selectedWallet, setSelectedWallet] = useState<string | undefined>();
  const [selectedCBDC, setSelectedCBDC] = useState<string | undefined>();

  const { toast } = useToast();

  const sidebarLinks = [
    { id: 'quikPay', label: 'QuikPay', icon: ShieldCheck, target: 'quikPay' as PaymentSection },
    { id: 'upi', label: 'Pay by any UPI App', icon: Smartphone, target: 'upi' as PaymentSection },
    { id: 'card', label: 'Debit/Credit Card', icon: CreditCard, target: 'card' as PaymentSection },
    { id: 'netBanking', label: 'Net Banking', icon: Landmark, target: 'netBanking' as PaymentSection },
    { id: 'wallet', label: 'Mobile Wallets', icon: Wallet, target: 'wallet' as PaymentSection },
    { id: 'cbdc', label: 'CBDC (Digital Rupee)', icon: CircleDollarSign, target: 'cbdc' as PaymentSection },
  ];

  const handleProceedToPayment = (paymentMethod: string, selectedOption?: string) => {
    if (!selectedOption && paymentMethod !== 'QuikPay') {
      toast({
        title: "Selection Required",
        description: `Please select an option for ${paymentMethod}.`,
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "Payment Initiated (Placeholder)",
      description: `Proceeding with ${paymentMethod}${selectedOption ? `: ${selectedOption}` : ''}.`,
    });
    // Actual payment logic would go here
  };
  
  const initiateRazorpay = async () => {
    toast({ title: "Initiating Razorpay...", description: "Please wait."});
    // Simulate API call to backend to get order_id or options
    await new Promise(resolve => setTimeout(resolve, 1000));

    const razorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_IR7GZGbUKziGNs", // Use env variable or default
        amount: 10000, // Amount in paise (e.g., 100.00 INR)
        currency: "INR",
        name: "My Apps Travel", 
        description: "CBDC Payment Simulation", 
        // order_id: "order_xyz_from_backend", // This should come from your backend
        handler: async function (response: any) {
            toast({ title: "Payment Successful", description: `Payment ID: ${response.razorpay_payment_id}` });
            // In a real app, you would verify the payment on your backend here.
        },
        modal: {
            ondismiss: function () {
                toast({ title: "Payment Cancelled", description: "You cancelled the payment process.", variant: "default" });
            }
        },
        prefill: {
            name: "Test User",
            email: "test.user@example.com",
            contact: "9999999999"
        },
        theme: {
            color: "#007BFF" // Primary color
        }
    };

    if (typeof window !== 'undefined' && (window as any).Razorpay) {
        const rzp = new (window as any).Razorpay(razorpayOptions);
        rzp.on('payment.failed', function (response: any) {
            toast({
                title: "Payment Failed",
                description: response.error.description || "An unknown error occurred.",
                variant: "destructive",
            });
        });
        rzp.open();
    } else {
        toast({ title: "Error", description: "Razorpay SDK not loaded.", variant: "destructive" });
    }
  };


  useEffect(() => {
    // Set a default active section on page load for better UX
    setActiveSection('upi');
  }, []);

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <div className="min-h-screen bg-gray-100">
        <nav className="p-4 container mx-auto">
          <Link href="/" className="text-primary hover:text-primary/80 font-bold text-lg inline-flex items-center">
            <ArrowLeft className="mr-2 h-5 w-5" /> Home
          </Link>
        </nav>

        <header className="bg-background shadow-sm py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-foreground">Payment Options</h1>
        </header>

        <div className="container mx-auto px-4 py-8 flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <aside className="w-full md:w-1/4 lg:w-1/5 bg-card p-6 rounded-lg shadow-lg self-start">
            <ul className="space-y-2">
              {sidebarLinks.map((link) => (
                <li key={link.id}>
                  <Button
                    variant={activeSection === link.target ? "default" : "ghost"}
                    className="w-full justify-start text-left"
                    onClick={() => setActiveSection(link.target)}
                  >
                    <link.icon className="mr-2 h-5 w-5" />
                    {link.label}
                  </Button>
                </li>
              ))}
            </ul>
          </aside>

          {/* Main Content */}
          <main className="flex-grow bg-card p-6 rounded-lg shadow-lg">
            {!activeSection && (
              <div className="text-center text-muted-foreground py-10">
                <CreditCard size={48} className="mx-auto mb-4" />
                <p className="text-lg">Please select a payment option from the sidebar.</p>
              </div>
            )}

            {activeSection === 'quikPay' && (
              <div id="quikPaySection">
                <h2 className="text-xl font-semibold mb-4">QuikPay</h2>
                <p className="text-muted-foreground mb-4">Fast and secure payment using QR code.</p>
                <Button onClick={() => handleProceedToPayment('QuikPay', 'QR Scan')} className="bg-accent hover:bg-accent/90 text-accent-foreground">
                  Scan and Pay
                </Button>
              </div>
            )}

            {activeSection === 'upi' && (
              <div id="upiSection">
                <h2 className="text-xl font-semibold mb-4">Pay by any UPI App</h2>
                <RadioGroup value={selectedUpi} onValueChange={setSelectedUpi} className="space-y-3">
                  {upiOptions.map((option) => (
                    <Label key={option.id} htmlFor={`upi-${option.id}`} className="flex items-center p-3 border rounded-md hover:bg-secondary cursor-pointer">
                      <Image data-ai-hint={option.aiHint} src={option.logo} alt={option.name} width={24} height={24} className="mr-3" />
                      <RadioGroupItem value={option.name} id={`upi-${option.id}`} className="mr-3" />
                      {option.name}
                    </Label>
                  ))}
                </RadioGroup>
                <Button onClick={() => handleProceedToPayment('UPI', selectedUpi)} className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                  Proceed to Payment
                </Button>
              </div>
            )}
            
            {activeSection === 'card' && (
              <div id="cardSection">
                <h2 className="text-xl font-semibold mb-4">Debit/Credit Card</h2>
                 <RadioGroup value={selectedCard} onValueChange={setSelectedCard} className="space-y-3">
                  {cardOptions.map((option) => (
                    <Label key={option.id} htmlFor={`card-${option.id}`} className="flex items-center p-3 border rounded-md hover:bg-secondary cursor-pointer">
                      <Image data-ai-hint={option.aiHint} src={option.logo} alt={option.name} width={24} height={24} className="mr-3" />
                      <RadioGroupItem value={option.name} id={`card-${option.id}`} className="mr-3" />
                      {option.name}
                    </Label>
                  ))}
                </RadioGroup>
                <Button onClick={() => handleProceedToPayment('Card', selectedCard)} className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                  Proceed to Payment
                </Button>
              </div>
            )}

            {activeSection === 'netBanking' && (
              <div id="netBankingSection">
                <h2 className="text-xl font-semibold mb-4">Net Banking</h2>
                 <RadioGroup value={selectedNetBanking} onValueChange={setSelectedNetBanking} className="space-y-3">
                  {staticNetBankingOptions.map((option) => (
                    <Label key={option.id} htmlFor={`nb-${option.id}`} className="flex items-center p-3 border rounded-md hover:bg-secondary cursor-pointer">
                      <Image data-ai-hint={option.aiHint} src={option.logo} alt={option.name} width={24} height={24} className="mr-3" />
                      <RadioGroupItem value={option.name} id={`nb-${option.id}`} className="mr-3" />
                      {option.name}
                    </Label>
                  ))}
                </RadioGroup>
                <Button onClick={() => handleProceedToPayment('Net Banking', selectedNetBanking)} className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                  Proceed to Payment
                </Button>
              </div>
            )}
            
            {activeSection === 'wallet' && (
              <div id="walletSection">
                <h2 className="text-xl font-semibold mb-4">Mobile Wallets</h2>
                <RadioGroup value={selectedWallet} onValueChange={setSelectedWallet} className="space-y-3">
                  {staticWalletOptions.map((option) => (
                    <Label key={option.id} htmlFor={`wallet-${option.id}`} className="flex items-center p-3 border rounded-md hover:bg-secondary cursor-pointer">
                      <Image data-ai-hint={option.aiHint} src={option.logo} alt={option.name} width={24} height={24} className="mr-3" />
                      <RadioGroupItem value={option.name} id={`wallet-${option.id}`} className="mr-3" />
                      {option.name}
                    </Label>
                  ))}
                </RadioGroup>
                <Button onClick={() => handleProceedToPayment('Mobile Wallet', selectedWallet)} className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                  Proceed to Payment
                </Button>
              </div>
            )}

            {activeSection === 'cbdc' && (
              <div id="cbdcSection">
                <h2 className="text-xl font-semibold mb-4">CBDC (Digital Rupee)</h2>
                 <RadioGroup value={selectedCBDC} onValueChange={setSelectedCBDC} className="space-y-3">
                  {staticCBDCOptions.map((option) => (
                    <Label key={option.id} htmlFor={`cbdc-${option.id}`} className="flex items-center p-3 border rounded-md hover:bg-secondary cursor-pointer">
                      <Image data-ai-hint={option.aiHint} src={option.logo} alt={option.name} width={24} height={24} className="mr-3" />
                      <RadioGroupItem value={option.name} id={`cbdc-${option.id}`} className="mr-3" />
                      {option.name}
                    </Label>
                  ))}
                </RadioGroup>
                <Button onClick={initiateRazorpay} className="mt-6 bg-accent hover:bg-accent/90 text-accent-foreground">
                  Proceed to Payment with Razorpay
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </>
  );
}
