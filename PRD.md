# 📄 Product Requirements Document (PRD)

**Project Name:** PricePattern Studio  
**Version:** 1.0 (MVP / Production Ready)  
**Platform:** Web Application (SaaS Ready)  
**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, HTML5 Canvas API, MediaRecorder API  

---

## 1. Product Overview
**PricePattern Studio** adalah *vector & animation engine* berbasis web yang dirancang khusus untuk Edukator Trading, Financial Content Creators, dan Algo Traders. Aplikasi ini memecahkan masalah utama para kreator: sulitnya membuat visualisasi *candlestick* yang tajam (4K/SVG) dan animasi pergerakan harga (*price action tick-by-tick*) secara instan tanpa perlu menggambar manual di platform *charting* eksternal.

## 2. Target Audience & Use Cases
* **Trading Educators:** Membutuhkan grafis vektor (SVG) dengan *background* transparan untuk disisipkan ke modul PDF, e-book, dan presentasi (PPT) agar grafik tidak pecah saat di-zoom.
* **Content Creators (YouTube/TikTok/Reels):** Membutuhkan video animasi 4K 60FPS dengan *green screen* atau transparan untuk *overlay* video konten edukasi.
* **Algo Traders & Analysts:** Membutuhkan alat visualisasi instan untuk mendemonstrasikan pola *Smart Money Concepts* (SMC), *Liquidity*, dan struktur *backtest* secara spesifik.

---

## 3. Core Features & Requirements

### A. Interactive Canvas Engine (TradingView UX)
* **Panning & Zooming:** Sumbu X (Waktu/Bar) dan Sumbu Y (Harga) bersifat interaktif. Pengguna dapat menggeser (*drag/pan*) area tengah kanvas dan melakukan *scroll-wheel zoom* untuk melihat detail *candle*.
* **Anti-Bleeding System:** Menggunakan `ctx.clip()` untuk memastikan *candlestick* dipotong dengan rapi dan tidak merender menabrak area teks sumbu Harga dan Bar.
* **Auto-Snap Price Logic:** Kontinuitas harga terjamin otomatis; harga *Open* pada *candle* baru akan selalu mengikuti harga *Close* pada *candle* sebelumnya, menciptakan struktur gelombang harga yang realistis.

### B. Market Template Library (Pre-built Data)
Menyediakan *preset* struktur pasar yang valid secara psikologis dan matematis, mencakup:
* **General Patterns:** Spinning Tops, Hammer, Shooting Star, Doji, Engulfing, Morning/Evening Star, 3 Soldiers, 3 Crows.
* **Market Structure (SNR):** Bullish SNR (3 Valleys), Bearish SNR (3 Peaks).
* **Advanced Price Action:** V-Shape Reversal, Fakeout / Bull Trap, Breakout & Retest, Strong Momentum (Marubozu).
* **Smart Money Concepts (SMC):** Liquidity Sweep (Stop Hunt), Fair Value Gap (FVG), Bullish Flag Continuation, Choppy Market.

### C. Pro-Level Manual Editor
* **Triple-Pane Architecture:** Tata letak profesional dengan *Properties Panel* (Kiri), *Canvas Viewport* (Tengah), dan *Layers Panel* (Kanan - dapat di-*resize*).
* **Scrubbable Inputs:** Nilai input (Body, Top Wick, Bot Wick, Offset Y) dapat diubah secara dinamis dengan melakukan klik-tahan-geser (*drag-to-scrub*) pada label, memberikan interaksi UX kelas atas.
* **Market Volatility Randomizer:** Tombol untuk merandomisasi panjang sumbu (wick) secara instan guna mensimulasikan fluktuasi pasar nyata tanpa merusak bodi utama *candle*.

### D. Export & Rendering Engine
* **SVG Export:** Mengekspor grafis ke format `<svg>` murni dengan *background* 100% transparan, *infinite resolution*, dan ukuran file sangat kecil.
* **4K Cinematic Video Replay:** Perekaman simulasi *tick-by-tick* menggunakan MediaRecorder API (codec VP9, 60 FPS, High Bitrate) ke format `.webm`. Animasi menggunakan *easing* agar pergerakan jarum harga mulus.

### E. SaaS Business Logic (Freemium Paywall)
* **Aspect Ratio Control:** Mode ukuran kanvas dinamis untuk 16:9 (Desktop/YouTube), 9:16 (Mobile/TikTok), dan 1:1 (Instagram).
* **Custom Branding:** Input *watermark* transparan di belakang kanvas untuk mencegah pencurian konten.
* **Paywall Guard:** Fitur premium (SVG dan Render 4K) dikunci dengan *badge* "👑 PRO". Pengguna *Free* akan diarahkan ke *Modal/Dialog* pendaftaran langganan jika mencoba mengaksesnya. Pengguna gratis hanya dapat melakukan ekspor PNG biasa.

---

## 4. Technical Architecture
* **Frontend Framework:** Next.js (App Router), React.js.
* **Rendering:** HTML5 Canvas 2D Context (Client-Side Rendering).
* **Styling:** Tailwind CSS (Utility-first) dengan CSS Flexbox untuk *layouting* adaptif.
* **State Management:** React `useState` untuk UI state, dan `useRef` untuk kalkulasi pergerakan *mouse* (Pan/Drag) guna mempertahankan performa 60FPS tanpa terhalang *React re-rendering lifecycle*.
