
"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Mic, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { interpretUserRequest } from '@/ai/flows/interpret-request-flow';


// Extend the window interface for the Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export default function HeroSection() {
  const { toast } = useToast();
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSearchSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    processRequest(searchTerm);
  };

  const processRequest = async (query: string) => {
    if (!query.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter a destination or command to search.",
        variant: "destructive",
      });
      return;
    }
    setIsProcessing(true);
    try {
      const result = await interpretUserRequest({ query });

      toast({
        title: "Request Processed",
        description: `Navigating to ${result.page}...`,
      });

      // Construct the URL with query parameters
      const url = new URL(result.page, window.location.origin);
      Object.entries(result.params || {}).forEach(([key, value]) => {
        if (value) {
          url.searchParams.append(key, value.toString());
        }
      });
      
      router.push(url.toString());

    } catch (error) {
      console.error("Error interpreting request:", error);
      toast({
        title: "AI Error",
        description: "Could not understand the request. Please try rephrasing.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };


  const handleVoiceSearch = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast({
        title: "Browser Not Supported",
        description: "Voice search is not supported by your browser.",
        variant: "destructive",
      });
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
      return;
    }
    
    const recognition = new SpeechRecognition();
    recognitionRef.current = recognition;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
      toast({ title: "Listening...", description: "Please speak your destination or command." });
    };

    recognition.onresult = (event: any) => {
      const speechResult = event.results[0][0].transcript;
      setSearchTerm(speechResult);
      toast({ title: "Voice Recognized", description: `You said: "${speechResult}". Processing...` });
      processRequest(speechResult);
    };

    recognition.onerror = (event: any) => {
      toast({
        title: "Voice Search Error",
        description: event.error === 'no-speech' ? "No speech was detected." : event.error,
        variant: "destructive",
      });
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };
  
  const DisplayIcon = () => {
    if (isProcessing) return <Loader2 className="h-5 w-5 animate-spin" />;
    if (isListening) return <Mic className="h-5 w-5 text-red-500" />;
    return <Mic className="h-5 w-5" />;
  }

  return (
    <section
      className="hero bg-cover bg-center py-20 md:py-32 text-white relative"
      style={{ backgroundImage: "url('https://placehold.co/1920x1080.png?text=Scenic+Travel+Destination')" }}
      data-ai-hint="travel background"
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="container mx-auto px-4 relative z-10 text-center">
        <h1 className="text-4xl md:text-6xl font-bold mb-6">
          Discover Your Next Adventure
        </h1>
        <p className="text-lg md:text-xl mb-10">
          Book flights, hotels, and packages with exclusive discounts
        </p>
        <form className="max-w-xl mx-auto flex gap-2" onSubmit={handleSearchSubmit}>
          <Input
            type="text"
            name="search-destinations" 
            placeholder="Search or say 'Find hotels in Goa'"
            aria-label="Search destinations"
            className="text-lg p-4 rounded-md flex-grow text-foreground"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button type="button" size="icon" variant="secondary" onClick={handleVoiceSearch} aria-label="Voice Search" className="h-auto w-12" disabled={isProcessing}>
            <DisplayIcon />
          </Button>
          <Button type="submit" size="lg" aria-label="Search" className="bg-accent hover:bg-accent/90 text-accent-foreground" disabled={isProcessing}>
             {isProcessing ? <Loader2 className="mr-2 h-5 w-5 animate-spin"/> : <Search className="mr-2 h-5 w-5" />} Search
          </Button>
        </form>
      </div>
    </section>
  );
}
