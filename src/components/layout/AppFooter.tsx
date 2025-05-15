
"use client";

import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useState, useEffect } from 'react';

// Placeholder SVG icons for payment methods
const VisaIcon = () => <svg viewBox="0 0 75 26" fill="none" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg"><path d="M32.6211 0.542969L26.2432 24.959H20.6211L27.0049 0.542969H32.6211ZM53.1611 12.751C53.1611 15.5635 55.0352 16.8887 56.7119 17.7627C58.3945 18.6367 59.0596 19.2031 59.0596 20.1211C59.0596 21.458 57.6162 22.1816 56.0186 22.1816C53.501 22.1816 52.3164 21.5039 51.2607 20.9375L50.4287 24.2607C51.542 24.7344 53.4277 25.0039 55.5605 25.0039C59.9443 25.0039 62.8506 22.8887 62.8506 19.5537C62.8506 15.4805 57.7744 14.9258 57.7744 13.668C57.7744 12.9561 58.4277 12.291 59.6572 12.2207C60.1895 12.1875 61.9014 12.1875 63.251 13.0615L64.0771 9.9209C62.8887 9.39844 61.3242 9.04297 59.5401 9.04297C55.5322 9.04297 53.1611 10.9502 53.1611 12.751ZM73.0771 0.542969L69.7539 17.1475L68.4834 10.3057C68.1182 8.40918 67.6504 6.71094 65.2852 6.71094C63.5596 6.71094 61.7119 8.1123 61.0352 9.31543L56.0186 24.959H50.3965L55.3135 0.542969H60.6084L62.2275 12.3828L66.5049 0.542969H73.0771ZM19.6475 10.0811C19.0811 7.60742 16.7646 6.51855 14.9688 6.51855C12.3428 6.51855 9.8252 8.46777 9.8252 12.1543C9.8252 15.2148 11.8486 16.6045 13.8721 17.5586C15.8955 18.5127 17.2109 19.2031 17.2109 20.374C17.2109 21.7227 15.7256 22.4023 13.9961 22.4023C11.2393 22.4023 9.73633 21.208 9.73633 21.208L8.5293 24.3203C8.5293 24.3203 10.3896 25.0039 13.415 25.0039C18.8057 25.0039 21.0049 22.4023 21.0049 19.9102C21.0049 15.1309 15.0752 14.7656 15.0752 13.5703C15.0752 13.0967 15.543 12.4609 16.6045 12.2207C16.8584 12.1875 17.1416 12.1651 17.4307 12.1651C19.2305 12.1651 20.1289 12.9443 20.3828 13.3623L21.5547 10.0811H19.6475ZM7.47363 24.959L12.0791 0.542969H6.44531L1.83984 24.959H7.47363Z" fill="#1A1F71"/></svg>;
const MastercardIcon = () => <svg viewBox="0 0 38 24" fill="none" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg"><circle cx="15" cy="12" r="7" fill="#EB001B"/><circle cx="23" cy="12" r="7" fill="#F79E1B"/><path d="M20 12C20 14.7614 17.7614 17 15 17C12.2386 17 10 14.7614 10 12C10 9.23858 12.2386 7 15 7C17.7614 7 20 9.23858 20 12Z" fill="#FF5F00"/></svg>;
const AmexIcon = () => <svg viewBox="0 0 38 24" fill="none" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg"><rect width="38" height="24" rx="3" fill="#006FCF"/><path d="M11.916 16.26H10.032L12.332 12L10.032 7.74H11.916L13.212 10.464L14.508 7.74H16.392L14.092 12L16.392 16.26H14.508L13.212 13.536L11.916 16.26ZM20.3924 12.708H24.0124V11.292H20.3924V8.94H24.5804V7.524H18.8084V16.476H24.7124V15.06H20.3924V12.708ZM27.6193 14.724L29.3533 7.524H30.9553L28.6333 16.476H26.8033L24.4813 7.524H26.0833L27.6193 14.724Z" fill="white"/></svg>;
const PaypalIcon = () => <svg viewBox="0 0 38 24" fill="none" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg"><rect width="38" height="24" rx="3" fill="#003087"/><path d="M17.5482 16.552C17.4042 17.068 17.0002 17.44 16.4082 17.44H13.2642C13.1082 17.44 12.9942 17.332 12.9642 17.188L12.0162 11.788C11.9802 11.596 11.9982 11.428 12.1602 11.428H14.5962C15.1122 11.428 15.5322 11.782 15.6162 12.292L15.9342 14.242C16.0362 14.842 16.5402 15.226 17.1462 15.226H17.5722C18.0822 15.226 18.3822 14.902 18.4122 14.608L18.8622 8.668C18.8922 8.362 18.7602 8.2 18.4602 8.2H16.9902C16.5282 8.2 16.1682 8.488 16.0722 8.95L15.9642 9.556C15.9642 9.586 15.9342 9.604 15.9102 9.604H15.2562C15.1842 9.604 15.1422 9.55001 15.1602 9.47801L15.5742 7.072C15.7122 6.31 16.3482 5.8 17.1222 5.8H19.8522C20.1942 5.8 20.3202 6.022 20.2422 6.346L17.5482 16.552ZM25.7571 12.34C25.4051 10.732 24.2231 9.74801 22.7291 9.74801H19.6031C19.3331 9.74801 19.1531 9.92201 19.0991 10.186L17.7551 17.188C17.7191 17.332 17.8331 17.44 17.9951 17.44H20.0531C20.3171 17.44 20.5151 17.266 20.5751 17.008L20.7311 16.258C20.9291 15.298 21.7091 14.686 22.6751 14.686H23.0171C24.2831 14.686 25.2791 13.774 25.7571 12.34Z" fill="#009CDE"/><path d="M25.3962 12.4C25.0502 10.822 23.9222 9.80201 22.4942 9.80201H20.6342L21.6602 14.686H22.3322C23.5502 14.686 24.5102 13.81 24.9662 12.448L25.3962 12.4ZM22.9262 11.188C23.2922 11.188 23.5802 11.422 23.4782 11.842C23.3102 12.46 22.7522 12.886 22.0862 12.886H21.6482L22.9262 11.188Z" fill="white"/></svg>;
const ApplePayIcon = () => <svg viewBox="0 0 38 24" fill="none" className="h-6 w-auto" xmlns="http://www.w3.org/2000/svg"><rect width="38" height="24" rx="3" fill="black"/><path d="M19.3163 10.3291C19.3043 9.66512 18.8603 9.09712 18.1643 9.07312C17.3243 9.04912 16.5683 9.57712 16.1963 9.73312C15.5003 10.0091 14.9003 10.4291 14.9003 11.3411C14.9003 12.7091 15.8603 13.3731 17.1083 13.3731C17.8523 13.3731 18.4163 13.0451 18.8723 12.7931C18.9083 12.7691 18.9323 12.7331 18.9563 12.7091L18.9683 12.6971C18.9203 13.4771 18.3443 14.5571 17.2883 14.5571C16.5323 14.5571 16.0403 14.1851 15.5243 14.1851C15.0083 14.1851 14.5043 14.5451 14.5043 15.2531C14.5043 15.8891 14.9003 16.3091 15.5963 16.3091C16.2083 16.3091 16.6163 15.9791 17.2163 15.9791C17.7803 15.9791 18.2723 16.3211 18.8723 16.3091C19.8923 16.2851 20.6243 15.3491 20.9243 14.2451C20.0003 13.7411 19.4003 12.8051 19.4003 11.7131C19.4003 11.1131 19.5683 10.6451 19.3163 10.3291ZM18.0563 8.65312C18.4523 8.18512 18.6923 7.57312 18.6203 6.92512C17.8523 6.97312 17.1203 7.45312 16.6763 7.90912C16.2923 8.34112 16.0163 8.97712 16.1003 9.59512C16.9403 9.60712 17.6003 9.15712 18.0563 8.65312Z" fill="white"/></svg>;


const footerLinks = {
  quick: [
    { href: '/flights', label: 'Flights' },
    { href: '/hotels', label: 'Hotels' },
    { href: '/trains', label: 'Trains' },
    { href: '/holiday-packages', label: 'Holiday Packages' },
    { href: '/bus', label: 'Bus Tickets' },
    { href: '/cabs', label: 'Cabs & Rentals' },
  ],
  company: [
    { href: '/about-us', label: 'About Us' },
    { href: '/careers', label: 'Careers' },
    { href: '/blog', label: 'Blog' },
    { href: '/press', label: 'Press' },
    { href: '/contact', label: 'Contact Us' },
    { href: '/privacy', label: 'Privacy Policy' },
  ],
};

export default function AppFooter() {
  const { toast } = useToast();
  const [currentYear, setCurrentYear] = useState<number | null>(null);

  useEffect(() => {
    setCurrentYear(new Date().getFullYear());
  }, []);

  const handleNewsletterSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const emailInput = event.currentTarget.elements.namedItem('email') as HTMLInputElement | null;
    if (emailInput && emailInput.value) {
      toast({
        title: "Subscribed!",
        description: `Thank you for subscribing with ${emailInput.value}.`,
      });
      emailInput.value = ''; // Clear the input
    } else {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
    }
  };

  return (
    <footer className="bg-secondary text-secondary-foreground border-t">
      <div className="container mx-auto py-12 px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">About TravelEase</h3>
            <p className="text-sm">
              Your trusted partner in travel planning since 2025. We make travel simple, affordable, and memorable.
            </p>
            <div className="flex space-x-3">
              <Link href="#" aria-label="Facebook"><Facebook size={20} className="hover:text-primary" /></Link>
              <Link href="#" aria-label="Twitter"><Twitter size={20} className="hover:text-primary" /></Link>
              <Link href="#" aria-label="Instagram"><Instagram size={20} className="hover:text-primary" /></Link>
              <Link href="#" aria-label="LinkedIn"><Linkedin size={20} className="hover:text-primary" /></Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {footerLinks.quick.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Company</h3>
            <ul className="space-y-2">
              {footerLinks.company.map(link => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm hover:text-primary transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Us */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <a href="mailto:support@travelease.com" className="flex items-center space-x-2 text-sm hover:text-primary">
              <Mail size={16} />
              <span>support@travelease.com</span>
            </a>
            <a href="tel:+15551234567" className="flex items-center space-x-2 text-sm hover:text-primary">
              <Phone size={16} />
              <span>+1 (555) 123-4567</span>
            </a>
            <div className="flex items-start space-x-2 text-sm">
              <MapPin size={16} className="mt-1" />
              <span>123 Travel Street, Suite 100<br />New York, NY 10001</span>
            </div>
          </div>
        </div>
        
        {/* Newsletter Section (moved to footer as per original HTML structure) */}
        <section className="py-8 border-t border-b">
          <div className="newsletter-content text-center max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-2">Get Travel Deals & Updates</h3>
            <p className="text-sm text-muted-foreground mb-4">Subscribe to our newsletter for exclusive offers and travel inspiration</p>
            <form className="flex flex-col sm:flex-row gap-2 max-w-md mx-auto" onSubmit={handleNewsletterSubmit}>
              <Input type="email" name="email" placeholder="Your email address" required className="flex-grow" />
              <Button type="submit" className="bg-accent text-accent-foreground hover:bg-accent/90">Subscribe</Button>
            </form>
          </div>
        </section>

      </div>
      <div className="bg-muted py-6">
        <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center text-sm text-muted-foreground">
          {currentYear !== null ? (
            <p>&copy; {currentYear} TravelEase. All rights reserved.</p>
          ) : (
            <p>&copy; TravelEase. All rights reserved.</p> 
          )}
          <div className="flex space-x-3 mt-4 sm:mt-0 items-center">
            <VisaIcon />
            <MastercardIcon />
            <AmexIcon />
            <PaypalIcon />
            <ApplePayIcon />
          </div>
        </div>
      </div>
    </footer>
  );
}
