"use client"

import React from 'react'
import { motion } from '@/lib/motion'
import { Star } from 'lucide-react'

export default function Testimonials() {
  return (
    <section id="testimonials" className="py-24">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Trusted by thousands of companies
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300">
            Do not just take our word for it — hear what our customers have to say about UptimeGuard.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {TESTIMONIALS.map((testimonial, index) => (
            <TestimonialCard 
              key={index} 
              testimonial={testimonial} 
              index={index} 
            />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mt-20 text-center"
        >
          <div className="inline-flex flex-wrap justify-center gap-8 md:gap-12">
            {COMPANIES.map((company, index) => (
              <div key={index} className="text-gray-400 dark:text-gray-600 hover:text-gray-800 dark:hover:text-gray-300 transition-colors duration-200">
                <p className="text-xl md:text-2xl font-bold">{company}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

function TestimonialCard({ testimonial, index }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-xl shadow-md hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:border-gray-700"
    >
      <div className="flex items-center space-x-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <Star 
            key={i} 
            className="h-5 w-5" 
            fill={i < testimonial.rating ? "currentColor" : "none"} 
            color={i < testimonial.rating ? "#F59E0B" : "#D1D5DB"}
          />
        ))}
      </div>
      <p className="text-gray-700 dark:text-gray-300 mb-6">{testimonial.text}</p>
      <div className="flex items-center">
        <div className="h-12 w-12 rounded-full overflow-hidden mr-4">
          <img 
            src={testimonial.avatar} 
            alt={testimonial.name} 
            className="h-full w-full object-cover"
          />
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white">{testimonial.name}</p>
          <p className="text-sm text-gray-500 dark:text-gray-400">{testimonial.role}, {testimonial.company}</p>
        </div>
      </div>
    </motion.div>
  )
}

const TESTIMONIALS = [
  {
    text: "UptimeGuard has been a game-changer for our team. We've reduced our response time to incidents by 70% and our customers have noticed the improvement.",
    name: "Sarah Johnson",
    role: "CTO",
    company: "TechNova",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    rating: 5
  },
  {
    text: "The detailed reports and analytics have helped us identify performance bottlenecks we weren't even aware of. Highly recommend for any tech team.",
    name: "Michael Chen",
    role: "DevOps Lead",
    company: "CloudStream",
    avatar: "https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    rating: 5
  },
  {
    text: "Setting up alerts was incredibly easy, and the dashboard is intuitive. We've been able to maintain our 99.9% uptime promise to customers.",
    name: "Alex Rodriguez",
    role: "Engineering Manager",
    company: "Dataflow",
    avatar: "https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    rating: 4
  },
  {
    text: "The global monitoring has been crucial for our international user base. We can now detect regional issues before our customers report them.",
    name: "Emma Wilson",
    role: "Product Owner",
    company: "GlobalTech",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    rating: 5
  },
  {
    text: "Customer support has been exceptional. Whenever we've had questions, the team has been quick to respond and helpful.",
    name: "David Park",
    role: "IT Director",
    company: "MediaPulse",
    avatar: "https://images.pexels.com/photos/1516680/pexels-photo-1516680.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    rating: 5
  },
  {
    text: "We've tried several monitoring solutions, but UptimeGuard offers the best balance of features, ease of use, and pricing for our needs.",
    name: "Olivia Martinez",
    role: "SRE Team Lead",
    company: "FinTech Solutions",
    avatar: "https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=2",
    rating: 4
  }
]

const COMPANIES = [
  "TechNova", "CloudStream", "Dataflow", "GlobalTech", "MediaPulse", "FinTech Solutions"
]