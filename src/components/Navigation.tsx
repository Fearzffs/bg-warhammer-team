'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Youtube, Gamepad2, FileText, Users, LogOut, Menu, X, Shield, Calendar } from 'lucide-react'
import { useState } from 'react'

export default function Navigation() {
  const { user, profile, signOut } = useAuth()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const isAdmin = profile?.role === 'admin'
  const isLoggedIn = profile?.role === 'admin' || profile?.role === 'team_member' || profile?.role === 'tryout'

  const navLinks = [
    { href: '/', label: 'Home', icon: Gamepad2 },
    { href: '/calendar', label: 'Calendar', icon: Calendar },
    { href: '/news', label: 'News', icon: FileText },
    { href: '/players', label: 'Players', icon: Users },
    { href: '/matches', label: 'Matches', icon: Shield },
    { href: '/documents', label: 'Documents', icon: FileText },
  ]

  if (isAdmin) {
    navLinks.push({ href: '/admin', label: 'Admin', icon: Users })
  }

  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 relative z-[60]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout (lg and up) - Single Row */}
        <div className="hidden lg:flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-xl font-bold text-white">
              BG Warhammer
            </Link>
            <div className="flex gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
           
            {user ? (
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>

        {/* Medium Screens Layout (md to lg) - Two Rows */}
        <div className="hidden md:block lg:hidden">
          {/* First Row - Logo Only */}
          <div className="flex items-center justify-center h-12 border-b border-zinc-800/50">
            <Link href="/" className="text-xl font-bold text-white">
              BG Warhammer
            </Link>
          </div>
          
          {/* Second Row - All Navigation + Social + Auth */}
          <div className="flex items-center justify-between h-12">
            <div className="flex gap-3">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm font-medium transition-colors ${
                    pathname === link.href
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                >
                  <link.icon className="w-4 h-4" />
                  {link.label}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center gap-3">
          
              {user ? (
                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1 px-3 py-1 text-sm font-medium text-zinc-300 hover:text-white transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              ) : (
                <Link
                  href="/login"
                  className="px-3 py-1 text-sm font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
                >
                  Sign In
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Small Screens - Logo and Hamburger */}
        <div className="md:hidden flex items-center justify-between h-16">
          <Link href="/" className="text-xl font-bold text-white">
            BG Warhammer
          </Link>
          <button
            className="text-zinc-400 hover:text-white"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="md:hidden fixed top-16 left-0 right-0 bottom-0 bg-black bg-opacity-50 z-30"
            onClick={() => setMobileMenuOpen(false)}
          />
          
          {/* Mobile Menu */}
          <div className="md:hidden fixed top-16 left-0 right-0 bg-zinc-900 border-b border-zinc-800 z-50 shadow-lg">
            <div className="px-2 pt-2 pb-3 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-base font-medium ${
                    pathname === link.href
                      ? 'bg-zinc-800 text-white'
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
                  }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <link.icon className="w-5 h-5" />
                  {link.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-zinc-800">
             
                {user ? (
                  <button
                    onClick={() => {
                      signOut()
                      setMobileMenuOpen(false)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-base font-medium text-zinc-400 hover:text-white"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                ) : (
                  <Link
                    href="/login"
                    className="block px-3 py-2 text-base font-medium bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors text-center"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  )
}