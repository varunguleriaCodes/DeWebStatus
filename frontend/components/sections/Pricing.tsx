"use client"

import React, { useState } from 'react'
import { motion } from '@/lib/motion'
import { Check, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

export default function Pricing() {
  const [billingCycle, setBillingCycle] = useState('monthly')

  return (
    <section id="pricing" className="py-24 bg-gray-50 dark:bg-gray-900/30">
      <div className="container mx-auto px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
            Simple, transparent pricing
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Choose the plan that is right for your business. All plans include a 14-day free trial.
          </p>
          
          <div className="inline-flex items-center p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <button 
              onClick={() => setBillingCycle('monthly')} 
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                billingCycle === 'monthly' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              Monthly
            </button>
            <button 
              onClick={() => setBillingCycle('annually')} 
              className={cn(
                "px-4 py-2 text-sm font-medium rounded-md transition-all",
                billingCycle === 'annually' 
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm' 
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
              )}
            >
              Annually <span className="text-xs text-green-600 dark:text-green-400">Save 20%</span>
            </button>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {PRICING_PLANS.map((plan, index) => (
            <PricingCard 
              key={index}
              plan={plan}
              billingCycle={billingCycle}
              index={index}
            />
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-16 bg-white dark:bg-gray-800 rounded-xl p-8 shadow-md border border-gray-100 dark:border-gray-700 max-w-4xl mx-auto"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Enterprise Solutions
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Need a custom solution for your large organization? Our enterprise plan offers additional features, custom integrations, and dedicated support.
          </p>
          <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">Contact Sales</Button>
        </motion.div>
      </div>
    </section>
  )
}

function PricingCard({ plan, billingCycle, index }) {
  const price = billingCycle === 'annually' 
    ? Math.round(plan.monthlyPrice * 12 * 0.8) 
    : plan.monthlyPrice

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className={cn(
        "p-8 rounded-xl transition-all duration-300",
        plan.popular 
          ? "bg-gradient-to-br from-indigo-500 to-blue-600 text-white shadow-xl scale-105 lg:scale-110 transform z-10 relative"
          : "bg-white dark:bg-gray-800 shadow-md border border-gray-100 dark:border-gray-700"
      )}
    >
      {plan.popular && (
        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-500 to-amber-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">
          Most Popular
        </div>
      )}
      <h3 className={cn(
        "text-xl font-semibold mb-4",
        plan.popular ? "text-white" : "text-gray-900 dark:text-white"
      )}>
        {plan.name}
      </h3>
      <div className="mb-6">
        <span className={cn(
          "text-4xl font-bold",
          plan.popular ? "text-white" : "text-gray-900 dark:text-white"
        )}>
          ${price}
        </span>
        <span className={cn(
          "text-sm",
          plan.popular ? "text-indigo-100" : "text-gray-500 dark:text-gray-400"
        )}>
          /{billingCycle === 'annually' ? 'year' : 'month'}
        </span>
      </div>
      <div className={cn(
        "mb-8",
        plan.popular ? "text-indigo-100" : "text-gray-600 dark:text-gray-300"
      )}>
        {plan.description}
      </div>
      <ul className="space-y-3 mb-8">
        {plan.features.map((feature, idx) => (
          <li key={idx} className="flex items-start">
            <div className={cn(
              "rounded-full p-1 mr-3 mt-1",
              plan.popular ? "bg-white/20 text-white" : "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
            )}>
              <Check className="h-3 w-3" />
            </div>
            <span className={cn(
              "text-sm",
              plan.popular ? "text-white" : "text-gray-700 dark:text-gray-300"
            )}>
              {typeof feature === 'string' ? (
                feature
              ) : (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger className="flex items-center">
                      {feature.text} <Info className="h-3 w-3 ml-1 inline-block" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs max-w-xs">{feature.tooltip}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              )}
            </span>
          </li>
        ))}
      </ul>
      <Button 
        className={cn(
          "w-full py-6",
          plan.popular 
            ? "bg-white hover:bg-gray-100 text-indigo-600"
            : "bg-indigo-600 hover:bg-indigo-700 text-white"
        )}
      >
        Get Started
      </Button>
    </motion.div>
  )
}

const PRICING_PLANS = [
  {
    name: "Starter",
    monthlyPrice: 29,
    description: "Perfect for small businesses and startups monitoring critical services.",
    features: [
      "10 monitors",
      "1-minute check intervals",
      "Email notifications",
      "5 team members",
      "24h data retention",
      "Basic reporting",
      "Multi-location checks (3 regions)"
    ],
    popular: false
  },
  {
    name: "Professional",
    monthlyPrice: 79,
    description: "Ideal for growing businesses with multiple services to monitor.",
    features: [
      "50 monitors",
      {
        text: "30-second check intervals",
        tooltip: "Monitor your services twice as frequently as the Starter plan for faster incident detection."
      },
      "All notification channels",
      "Unlimited team members",
      "30-day data retention",
      "Advanced reporting",
      "Multi-location checks (7 regions)",
      "API access",
      "Status page"
    ],
    popular: true
  },
  {
    name: "Enterprise",
    monthlyPrice: 199,
    description: "For large organizations requiring comprehensive monitoring solutions.",
    features: [
      "Unlimited monitors",
      "15-second check intervals",
      "Priority support",
      "Custom integrations",
      "90-day data retention",
      "Custom reporting",
      "Multi-location checks (all regions)",
      "SLA guarantees",
      "Dedicated account manager"
    ],
    popular: false
  }
]