"use client"

import React from 'react'
import { useRouter } from 'next/navigation'
import { ArrowRight, Shield, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { motion } from '@/lib/motion'

export default function Hero() {
  const router = useRouter()

  return (
    <section className="container mx-auto px-6 pt-30 pb-20 md:pt-20 md:pb-24">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <div className="flex items-center mb-6 space-x-2">
            <span className="px-3 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-300 rounded-full text-sm font-medium">
              New: 99.99% SLA Guarantee
            </span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight">
            Monitor Your Services With <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-blue-500 dark:from-indigo-400 dark:to-blue-300">Confidence</span>
          </h1>
          <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
            Get instant alerts when your services go down. Monitor uptime, performance, and ensure your business never misses a beat.
          </p>
          
          <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Button 
              onClick={() => router.push('/dashboard')} 
              className="group px-6 py-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-lg"
            >
              Start Monitoring
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button 
              variant="outline" 
              className="px-6 py-6 border-2 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-800 border-gray-200 dark:border-gray-700 rounded-xl text-lg"
            >
              View Demo
            </Button>
          </div>
          
          <div className="mt-10 flex flex-col sm:flex-row items-start sm:items-center space-y-3 sm:space-y-0 sm:space-x-6">
            {[
              { text: "5,000+ businesses monitored" },
              { text: "99.9% uptime guarantee" },
              { text: "24/7 support included" }
            ].map((item, i) => (
              <div key={i} className="flex items-center">
                <CheckCircle className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mr-2" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="relative"
        >
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl blur-xl opacity-30 dark:opacity-40 animate-pulse"></div>
          <div className="relative bg-white dark:bg-gray-800 shadow-xl rounded-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
            <img
              src="https://images.pexels.com/photos/7988079/pexels-photo-7988079.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2"
              alt="Dashboard"
              className="w-full h-auto rounded-t-lg"
            />
            <div className="p-6 bg-white dark:bg-gray-800">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Shield className="h-5 w-5 text-green-500" />
                  <span className="font-medium text-gray-900 dark:text-white">All Systems Operational</span>
                </div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Updated 2m ago</span>
              </div>
              <div className="space-y-3">
                {[
                  { name: "API Service", status: "Operational", uptime: "99.98%" },
                  { name: "Web Application", status: "Operational", uptime: "100%" },
                  { name: "Database Cluster", status: "Operational", uptime: "99.99%" }
                ].map((service, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-900/50 rounded-lg">
                    <span className="font-medium text-gray-800 dark:text-gray-200">{service.name}</span>
                    <div className="flex items-center space-x-4">
                      <span className="flex items-center">
                        <span className="h-2 w-2 rounded-full bg-green-500 mr-2"></span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">{service.status}</span>
                      </span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{service.uptime}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}