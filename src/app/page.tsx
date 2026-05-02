
import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  Zap, 
  Video, 
  FileCode, 
  Settings, 
  ArrowRight,
  Instagram
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-primary/30 selection:text-primary overflow-x-hidden font-body">
      {/* HEADER */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary fill-primary" />
            <span className="text-sm font-black uppercase tracking-[3px] text-white">PricePattern</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            <a href="#features" className="hover:text-primary transition-colors">Features</a>
            <a href="#faq" className="hover:text-primary transition-colors">FAQ</a>
          </nav>
          <Link href="/editor">
            <Button variant="outline" className="h-9 px-5 text-[10px] font-bold uppercase tracking-widest border-white/10 hover:bg-white/5 bg-transparent text-white" aria-label="Open Studio Editor">
              Open Studio
            </Button>
          </Link>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-40 pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-primary/20 blur-[120px] rounded-full -z-10 opacity-30" />
        <div className="max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-primary text-[10px] font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4">
            <Zap className="w-3 h-3 fill-primary" /> v3.0 Engine is Live
          </div>
          <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9] text-white animate-in fade-in slide-in-from-bottom-6 duration-700">
            Create 4K Trading <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent italic">Animations</span> in Seconds.
          </h1>
          <p className="max-w-2xl mx-auto text-muted-foreground text-sm md:text-lg font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000">
            The ultimate free tool for Crypto TikTokers, Forex YouTubers, and Trading Educators. 
            Generate high-resolution candlestick patterns and exports for your content. No After Effects required.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <Link href="/editor">
              <Button className="h-14 px-10 text-xs font-black uppercase tracking-widest bg-primary hover:bg-primary/90 text-black rounded-full shadow-[0_0_30px_rgba(0,255,157,0.3)] group" aria-label="Get Started for Free">
                Open Studio (Free) <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button variant="ghost" className="h-14 px-10 text-xs font-black uppercase tracking-widest text-white hover:bg-white/5 rounded-full" aria-label="View Features">
                View Features
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* FEATURE SECTION */}
      <section id="features" className="py-24 px-6 border-t border-white/5 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary group-hover:bg-primary/10 transition-colors">
                <Video className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Export to WebM</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Record tick-by-tick price action at 60 FPS and 4K UHD resolution. Perfect for Premiere Pro, CapCut, and DaVinci Resolve overlays.
              </p>
            </div>
            <div className="space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-accent group-hover:bg-accent/10 transition-colors">
                <FileCode className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Vector SVG Export</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Download crisp, scalable graphics for your PDFs, E-books, and PowerPoint presentations. Infinite resolution with zero blur.
              </p>
            </div>
            <div className="space-y-4 group">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white group-hover:bg-white/10 transition-colors">
                <Settings className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Fully Customizable</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Adjust bodies, wicks, colors, and spacing to match your personal brand identity. Real-time rendering at your fingertips.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ SECTION */}
      <section id="faq" className="py-24 px-6 border-t border-white/5 bg-black">
        <div className="max-w-3xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl md:text-5xl font-black tracking-tighter">Frequently Asked Questions</h2>
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold">Clear answers for your workflow</p>
          </div>
          
          <div className="space-y-6">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" /> How do I animate a candlestick pattern?
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed pl-5">
                Simply add your candles in the studio, adjust the open/close prices or use a template, and click the "VIDEO" export button. The animation is generated automatically based on your sequence.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" /> Is this tool free to use?
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed pl-5">
                Yes, PricePattern Studio is completely free for creators and traders. We want to empower educators to create better visuals for the community.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-primary" /> Can I use these animations on YouTube and TikTok?
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed pl-5">
                Absolutely! The WebM format supports high bitrates and is widely compatible with professional video editing software like Premiere Pro, CapCut, and DaVinci Resolve.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="py-12 px-6 border-t border-white/5 text-center">
        <div className="flex items-center justify-center gap-2 mb-6">
          <Zap className="w-4 h-4 text-primary fill-primary" />
          <span className="text-xs font-black uppercase tracking-[2px]">PricePattern Studio</span>
        </div>
        <div className="flex justify-center gap-4 mb-4">
          <a aria-label="Instagram masffadil" href="https://www.instagram.com/masffadil/" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
            <Instagram className="w-5 h-5" />
          </a>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
          &copy; {new Date().getFullYear()} PricePattern. Built for the Trading Community.
        </p>
      </footer>
    </div>
  );
}
