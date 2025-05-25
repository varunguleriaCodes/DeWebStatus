"use client"

import React from 'react'
import Header from '@/components/layout/Header'
import Hero from '@/components/sections/Hero'
import Features from '@/components/sections/Features'
import Testimonials from '@/components/sections/Testimonials'
import Pricing from '@/components/sections/Pricing'
import Footer from '@/components/layout/Footer'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900 dark:text-white transition-colors duration-300 overflow-x-hidden">
      <ScrollArea className="h-screen">
        <Header />
        <main>
          <Hero />
          <Features />
          <Testimonials />
          <Pricing />
        </main>
        <Footer />
      </ScrollArea>
    </div>
  )
}