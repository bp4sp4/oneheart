"use client"

import React from 'react'
import { usePathname } from 'next/navigation'
import Footer from './Footer'

export default function FooterWrapper() {
  const pathname = usePathname() || ''

  // hide footer on quiz and result pages (and subpaths)
  if (pathname.startsWith('/quiz') || pathname.startsWith('/result')) return null

  return <Footer />
}
