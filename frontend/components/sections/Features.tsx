"use client"

import React from 'react'
import { Bell, Clock, Server, Zap, Shield, Globe } from 'lucide-react'
import { motion } from '@/lib/motion'

export default function Features() {
  return (
    <section id="features" className="py-24 bg-gray-50 dark:bg-gray-900/30">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Everything you need for reliable monitoring
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Our comprehensive platform provides all the tools you need to ensure your services are always running smoothly.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {FEATURES.map((feature, index) => (
            <FeatureCard 
              key={index}
              icon={feature.icon}
              title={feature.title}
              description={feature.description}
              index={index}
            />
          ))}
        </div>

      </div>
    </section>
  )
}

function FeatureCard({ icon: Icon, title, description, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="group relative p-6 bg-white dark:bg-gray-800 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300"
    >
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-t-xl transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300"></div>
      <div className="mb-4 p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-lg inline-block">
        <Icon className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">{title}</h3>
      <p className="text-gray-600 dark:text-gray-300">{description}</p>
    </motion.div>
  )
}

const FEATURES = [
  {
    icon: Bell,
    title: "Instant Alerts",
    description: "Get notified immediately when your services experience downtime via SMS, email, Slack, or webhook."
  },
  {
    icon: Clock,
    title: "24/7 Monitoring",
    description: "Round-the-clock monitoring from multiple locations worldwide to ensure accurate uptime data."
  },
  {
    icon: Server,
    title: "Detailed Reports",
    description: "Comprehensive reports and analytics to track your service performance and identify trends."
  },
  {
    icon: Shield,
    title: "SSL Monitoring",
    description: "Monitor certificate expiration and security configurations to prevent unexpected downtime."
  },
  {
    icon: Zap,
    title: "Performance Metrics",
    description: "Track response times, loading speeds, and other key performance indicators."
  },
  {
    icon: Globe,
    title: "Global Checks",
    description: "Monitor from 10+ regions worldwide to ensure your services work for all users regardless of location."
  }
]