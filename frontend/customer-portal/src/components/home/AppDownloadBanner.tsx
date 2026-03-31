import { Button } from '@/components/ui/button'
import { Smartphone, Download } from 'lucide-react'

export function AppDownloadBanner() {
  return (
    <section className="py-12 md:py-16" aria-label="Download our app">
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-secondary to-accent">
        {/* Decorative circles */}
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/4" />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4" />

        <div className="container-main relative z-10 py-10 md:py-16 flex flex-col md:flex-row items-center justify-between gap-10">
          <div className="text-white max-w-lg">
            <div className="inline-flex items-center gap-2 bg-white/10 rounded-full px-4 py-1.5 text-sm font-medium mb-4">
              <Download className="h-4 w-4" /> Available on iOS & Android
            </div>
            <h2 className="text-2xl md:text-4xl font-bold mb-3 tracking-tight leading-tight">
              Shop Smarter with<br />the Zaroox App
            </h2>
            <p className="text-white/80 mb-8 text-base md:text-lg">
              Get exclusive app-only deals, faster checkout, and real-time order tracking.
            </p>
            <div className="flex gap-3">
              <Button size="lg" className="font-semibold bg-white text-gray-900 hover:bg-white/90 rounded-xl h-12 px-6">
                App Store
              </Button>
              <Button size="lg" variant="outline" className="font-semibold border-white/30 text-white hover:bg-white/10 rounded-xl h-12 px-6">
                Google Play
              </Button>
            </div>
          </div>

          <div className="shrink-0">
            <div className="relative">
              <div className="w-48 h-80 md:w-56 md:h-96 bg-white/10 backdrop-blur-sm rounded-[2rem] border border-white/20 flex flex-col items-center justify-center p-6 shadow-2xl">
                <Smartphone className="h-20 w-20 text-white/80 mb-4" />
                <div className="text-center">
                  <p className="text-white font-semibold text-sm">Zaroox</p>
                  <p className="text-white/60 text-xs mt-1">Scan to download</p>
                </div>
              </div>
              {/* Glow effect */}
              <div className="absolute inset-0 rounded-[2rem] bg-white/5 blur-xl scale-110" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
