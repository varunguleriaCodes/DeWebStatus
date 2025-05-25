/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

// This is a simple implementation of motion components
// based on the framer-motion API structure but using CSS transitions

import React, { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface MotionProps extends React.HTMLAttributes<HTMLDivElement> {
  initial?: Record<string, any>
  animate?: Record<string, any>
  whileInView?: Record<string, any>
  viewport?: {
    once?: boolean
    margin?: string
  }
  transition?: {
    duration?: number
    delay?: number
    ease?: string
  }
}

export const motion = {
  div: ({
    initial,
    animate,
    whileInView,
    viewport,
    transition,
    className,
    ...props
  }: MotionProps) => {
    const [isInView, setIsInView] = useState(false)
    const ref = useRef<HTMLDivElement>(null)
    const [style, setStyle] = useState(initial || {})

    useEffect(() => {
      if (!whileInView) return

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setIsInView(true)
            if (viewport?.once) {
              observer.disconnect()
            }
          } else if (!viewport?.once) {
            setIsInView(false)
          }
        },
        {
          root: null,
          rootMargin: viewport?.margin || '0px',
          threshold: 0.1,
        }
      )

      if (ref.current) {
        observer.observe(ref.current)
      }

      return () => {
        if (ref.current) {
          observer.unobserve(ref.current)
        }
      }
    }, [whileInView, viewport])

    useEffect(() => {
      if (animate) {
        setStyle({
          ...style,
          ...animate,
          transition: `all ${transition?.duration || 0.3}s ${
            transition?.ease || 'ease-in-out'
          } ${transition?.delay || 0}s`,
        })
      }
    }, [animate])

    useEffect(() => {
      if (whileInView && isInView) {
        setStyle({
          ...style,
          ...whileInView,
          transition: `all ${transition?.duration || 0.3}s ${
            transition?.ease || 'ease-in-out'
          } ${transition?.delay || 0}s`,
        })
      } else if (whileInView && !isInView) {
        setStyle({
          ...style,
          ...initial,
          transition: `all ${transition?.duration || 0.3}s ${
            transition?.ease || 'ease-in-out'
          } ${transition?.delay || 0}s`,
        })
      }
    }, [isInView, whileInView, initial])

    return (
      <div
        ref={ref}
        className={cn(className)}
        style={style}
        {...props}
      />
    )
  },
}