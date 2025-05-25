"use client"

import React, { useState, useEffect } from 'react'
import { Activity, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'
import { useRouter } from "next/navigation"; //

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter(); 

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <header className={cn(
      'fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-6 py-4',
      isScrolled 
        ? 'bg-white/90 dark:bg-gray-900/90 backdrop-blur-md shadow-sm' 
        : 'bg-transparent'
    )}>
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">UptimeGuard</span>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          <NavLinks />
          <div className="flex items-center space-x-3">
            <ThemeToggle />
            <Button variant="ghost" className="font-medium w-full justify-center bg-indigo-600 hover:bg-indigo-600 text-white"   onClick={() => router.push("/login")}>Login</Button>
          </div>
        </nav>

        {/* Mobile Menu Button */}
        <div className="flex items-center space-x-3 md:hidden">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={toggleMobileMenu} aria-label="Menu">
            {mobileMenuOpen ? <X /> : <Menu />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-x-0 top-[72px] bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-lg transition-all duration-300 ease-in-out transform md:hidden overflow-hidden",
        mobileMenuOpen ? "h-auto opacity-100" : "h-0 opacity-0"
      )}>
        <div className="container mx-auto py-6 px-6 flex flex-col space-y-6">
          <div className="flex flex-col space-y-4">
            <NavLinks mobile onClick={() => setMobileMenuOpen(false)} />
          </div>
          <div className="flex flex-col space-y-3 pt-4 border-t border-gray-200 dark:border-gray-800">
            <Button variant="outline" className="w-full justify-center bg-indigo-600 hover:bg-indigo-600 text-white"  onClick={() => router.push("/login")}>
              Login
            </Button>
          </div>
        </div>
      </div>
    </header>
  )
}

function NavLinks({ mobile = false, onClick }: { mobile?: boolean; onClick?: () => void }) {
  const links = [
    { href: "#features", label: "Features" },
    { href: "#testimonials", label: "Testimonials" },
    { href: "#pricing", label: "Pricing" },
    { href: "#", label: "Docs" },
  ]

  return (
    <>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          onClick={onClick}
          className={cn(
            "text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white font-medium transition-colors",
            mobile && "text-lg py-2 block"
          )}
        >
          {link.label}
        </a>
      ))}
    </>
  )
}