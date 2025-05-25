"use client"

import React from 'react'
import { Activity, Twitter, Facebook, Linkedin } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-6">
        <div className="pt-16 pb-8 border-b border-gray-800">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-2">
                <Activity className="h-6 w-6 text-indigo-400" />
                <span className="text-xl font-bold">UptimeGuard</span>
              </div>
              <p className="text-gray-400 max-w-xs">
                Comprehensive monitoring solutions to keep your services online and performing at their best.
              </p>
              <div className="flex space-x-4">
                <SocialLink icon={<Twitter className="h-5 w-5" />} />
                <SocialLink icon={<Facebook className="h-5 w-5" />} />
                <SocialLink icon={<Linkedin className="h-5 w-5" />} />
              </div>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-lg">Product</h3>
              <ul className="space-y-3 text-gray-400">
                <FooterLink href="#features">Features</FooterLink>
                <FooterLink href="#pricing">Pricing</FooterLink>
                <FooterLink href="#">API</FooterLink>
                <FooterLink href="#">Status</FooterLink>
                <FooterLink href="#">Integrations</FooterLink>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-lg">Company</h3>
              <ul className="space-y-3 text-gray-400">
                <FooterLink href="#">About</FooterLink>
                <FooterLink href="#">Blog</FooterLink>
                <FooterLink href="#">Careers</FooterLink>
                <FooterLink href="#">Press</FooterLink>
                <FooterLink href="#">Partners</FooterLink>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-4 text-lg">Subscribe</h3>
              <p className="text-gray-400 mb-4">
                Get the latest news and updates from our team.
              </p>
              <form className="space-y-3">
                <Input 
                  type="email" 
                  placeholder="Your email address" 
                  className="bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-indigo-500"
                />
                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Subscribe
                </Button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="py-8 flex flex-col md:flex-row justify-between items-center">
          <div className="text-gray-400 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} UptimeGuard. All rights reserved.
          </div>
          <div className="flex flex-wrap gap-6 text-sm text-gray-400">
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Cookies</a>
            <a href="#" className="hover:text-white transition-colors">Security</a>
          </div>
        </div>
      </div>
    </footer>
  )
}

function SocialLink({ icon }) {
  return (
    <a 
      href="#" 
      className="h-8 w-8 rounded-full bg-gray-800 hover:bg-indigo-600 flex items-center justify-center transition-colors"
    >
      {icon}
    </a>
  )
}

function FooterLink({ href, children }) {
  return (
    <li>
      <a 
        href={href} 
        className="hover:text-white transition-colors duration-200"
      >
        {children}
      </a>
    </li>
  )
}