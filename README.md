 
 
# PricePattern Studio 📈

![Next.js](https://img.shields.io/badge/Next.js-black?style=for-the-badge&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)

PricePattern Studio is a professional, web-based vector and animation engine designed for Trading Educators, Financial Content Creators, and Analysts. It allows users to generate mathematically precise, high-resolution (4K) candlestick patterns and export them as infinitely scalable SVGs or cinematic 60FPS video replays.

## ✨ Key Features

* **TradingView-Style UX:** Fluid panning, axis-zooming, and scrubbable inputs for ultimate precision.
* **Smart Auto-Snap Logic:** Guaranteed price continuity; open prices automatically snap to previous closes to create realistic market structures.
* **Advanced Market Library:** Pre-built templates including *Smart Money Concepts (SMC)*, *Liquidity Sweeps*, *Fair Value Gaps (FVG)*, and *Macro Price Action* (Fakeouts, Breakout Retests).
* **Pro Rendering Engine:** 
  * Download as **SVG** for crystal-clear PDF/PPT modules.
  * Record as **4K `.webm` Video** (Tick-by-tick price action simulation) for YouTube/TikTok overlays.
* **SaaS Ready:** Integrated freemium paywall logic, aspect ratio toggles (16:9, 9:16, 1:1), and custom watermark capabilities.

## 🚀 Getting Started

This is a [Next.js](https://nextjs.org/) project initialized with `create-next-app`.

### Prerequisites
Make sure you have Node.js (v18 or higher) installed.

### Installation

1. Clone the repository:
   ```bash
   git clone [https://github.com/Fortotest/Price-Pattern.git](https://github.com/Fortotest/Price-Pattern.git)
   cd Price-Pattern
   ```

2. Install dependencies:
   ```bash
   npm install
   # or yarn install
   # or pnpm install
   ```

3. Run the development server:
   ```bash
   npm run dev
   # or yarn dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🏗️ Project Architecture

* **Triple-Pane Layout:** Designed for professional workflows (Properties, Canvas, Layers).
* **Zero-Lag Canvas:** Utilizes React `useRef` and `requestAnimationFrame` for 60FPS dragging and zooming without main thread blocking.
* **MediaRecorder API:** Client-side video encoding using VP9 codecs for broadcasting-quality exports.

## 📄 License

This project is proprietary and intended for SaaS deployment. All rights reserved.
 
