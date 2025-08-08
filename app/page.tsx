"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ArrowRight, BarChart3, Palette, Share2, MessageSquare, Star, Users, ChevronDown, Facebook, Instagram, Linkedin, Check } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState } from "react"

// FAQ Component
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-shadow last:border-b-0">
      <button
        className="w-full py-6 px-6 text-left flex justify-between items-center hover:bg-shadow transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-header">{question}</span>
        <ChevronDown className={`h-5 w-5 text-subheader transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          <p className="text-body leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between bg-white shadow-sm rounded-full px-6 py-3 border border-shadow">
          <div className="flex items-center gap-2">
            <Image src="/images/klarolink-logo.png" alt="KlaroLink" width={200} height={50} className="h-8 w-auto" />
          </div>
          <div className="hidden md:flex items-center gap-6 text-header font-semibold">
            <Link href="#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-primary transition-colors">Pricing</Link>
            <Link href="#about" className="hover:text-primary transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-header hover:bg-shadow">Log in</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-primary text-primary-foreground hover:bg-primary/90">Sign up free</Button>
            </Link>
          </div>
        </nav>
      </header>
      {/* Hero Section */}
      <main className="container mx-auto px-4 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl lg:text-6xl font-bold leading-tight mb-6 text-header">
              Collect feedback from your customers with <span className="text-subheader">one simple link</span>
            </h1>
            <p className="text-xl mb-8 leading-relaxed text-body">
              Create beautiful feedback pages, gather valuable insights, and grow your business with KlaroLink - the feedback-focused platform for small businesses.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">Try 7 Days Free<ArrowRight className="ml-2 h-4 w-4" /></Button>
              </Link>
              <p className="text-sm text-subheader self-center">*Pro trial auto renews into paid plan. Cancel anytime.</p>
            </div>
          </div>
          <div className="relative">
            {/* Demo: Live feedback page & dashboard snapshot with subtle motion */}
            <div className="bg-card rounded-3xl p-8 border border-shadow shadow-lg overflow-hidden">
              {/* Floating bubbles background animation */}
              <div className="pointer-events-none absolute inset-0 opacity-30 [mask-image:radial-gradient(white,transparent_75%)]">
                <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary/30 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-0 right-0 w-40 h-40 bg-primary/30 rounded-full blur-3xl animate-[pulse_3s_ease-in-out_infinite]"></div>
              </div>

              <div className="relative grid gap-4">
                {/* 1) Customer-facing feedback page preview */}
                <div className="bg-tertiary rounded-2xl p-5 shadow-2xl text-white hover:translate-y-[-2px] transition-transform">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold">Klara Café</h3>
                      <p className="text-xs text-white/80">klaracafe.klarolink.com</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Star className="h-4 w-4 text-yellow-300 fill-current" />
                        <span className="text-sm font-medium">Rate your experience</span>
                      </div>
                      <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star key={star} className="h-5 w-5 text-yellow-300 fill-current" />
                        ))}
                      </div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <MessageSquare className="h-4 w-4 text-white" />
                        <span className="text-sm font-medium">Tell us what stood out</span>
                      </div>
                      <div className="text-xs text-white/80">“Great latte art and friendly staff. Wi‑Fi could be faster.”</div>
                    </div>
                    <div className="bg-white/10 rounded-xl p-3">
                      <div className="flex items-center gap-2 mb-1">
                        <Share2 className="h-4 w-4 text-white" />
                        <span className="text-sm font-medium">Connect with us</span>
                      </div>
                      <div className="flex gap-2 text-[#2C5580]">
                        <div className="bg-white rounded-full px-2 py-1 text-xs text-[#2C5580]">@klaracafe</div>
                        <div className="bg-white rounded-full px-2 py-1 text-xs text-[#2C5580]">klaracafe.com</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2) Dashboard snapshot: insights & link */}
                <div className="bg-shadow rounded-2xl p-5 shadow-xl hover:translate-y-[-2px] transition-transform">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-5 w-5 text-header" />
                      <span className="text-sm font-semibold text-header">Insights snapshot</span>
                    </div>
                    <div className="text-[10px] text-subheader">Last 7 days</div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-header">
                    <div className="rounded-lg bg-card p-3">
                      <div className="text-[10px] text-subheader">Avg Rating</div>
                      <div className="text-lg font-bold flex items-center gap-1">4.6<Star className="h-3 w-3 text-yellow-400 fill-current"/></div>
                    </div>
                    <div className="rounded-lg bg-card p-3">
                      <div className="text-[10px] text-subheader">Submissions</div>
                      <div className="text-lg font-bold">128</div>
                    </div>
                    <div className="rounded-lg bg-card p-3">
                      <div className="text-[10px] text-subheader">Completion</div>
                      <div className="text-lg font-bold">92%</div>
                    </div>
                  </div>
                  <div className="mt-3 bg-card rounded-lg p-3 text-header text-xs flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Share2 className="h-3 w-3" />
                      <span>yourbiz.klarolink.com</span>
                    </div>
                    <div className="flex items-center gap-1 text-success">
                      <Check className="h-3 w-3" />
                      <span>Copied</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Ambient motion caret */}
            <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 text-subheader animate-bounce">
              <ChevronDown className="h-6 w-6" />
            </div>
          </div>
        </div>
      </main>
      {/* Features Section */}
      <section id="features" className="py-20 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-header mb-4">Everything you need to collect feedback</h2>
            <p className="text-xl text-subheader max-w-2xl mx-auto">Powerful features designed specifically for small businesses to gather, analyze, and act on customer feedback.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="border border-shadow shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <MessageSquare className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-header">Custom Feedback Forms</h3>
                <p className="text-body">Create personalized feedback forms with drag-and-drop builder. Add ratings, text fields, and more.</p>
              </CardContent>
            </Card>
            <Card className="border border-shadow shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-header">Analytics Dashboard</h3>
                <p className="text-body">Track feedback trends, completion rates, and customer satisfaction with detailed analytics.</p>
              </CardContent>
            </Card>
            <Card className="border border-shadow shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Palette className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-header">Brand Customization</h3>
                <p className="text-body">Customize colors, backgrounds, and layouts to match your brand perfectly.</p>
              </CardContent>
            </Card>
            <Card className="border border-shadow shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Share2 className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-header">Social Media Links</h3>
                <p className="text-body">Add your social media profiles and website links to increase engagement.</p>
              </CardContent>
            </Card>
            <Card className="border border-shadow shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-header">Customer Insights</h3>
                <p className="text-body">Understand your customers better with detailed feedback analysis and trends.</p>
              </CardContent>
            </Card>
            <Card className="border border-shadow shadow-sm hover:shadow-md transition-shadow bg-white">
              <CardContent className="p-8">
                <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center mb-4">
                  <Star className="h-6 w-6 text-secondary" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-header">Rating System</h3>
                <p className="text-body">Collect star ratings and reviews to build trust and improve your services.</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
      {/* Subtle Pricing Preview */}
      <section className="py-16 bg-card">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-header mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-subheader max-w-xl mx-auto">
              Choose the plan that fits your business needs. Start free, upgrade when you're ready.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Starter Plan - Compact */}
            <div className="bg-shadow rounded-xl p-6 text-center">
              <h3 className="text-xl font-bold text-header mb-2">Starter</h3>
              <div className="text-3xl font-bold text-header mb-3">₱199<span className="text-sm font-normal">/mo</span></div>
              <p className="text-subheader mb-4">Perfect for small businesses</p>
              <ul className="text-sm text-body space-y-1 mb-6">
                <li>• 1 feedback link</li>
                <li>• Up to 100 responses</li>
                <li>• Basic analytics</li>
              </ul>
              <Link href="/register?plan=starter">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Business Plan - Compact */}
            <div className="bg-gradient-to-br from-primary to-secondary rounded-xl p-6 text-center text-white relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-card text-header px-3 py-1 rounded-full text-xs font-semibold">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-bold mb-2">Business</h3>
              <div className="text-3xl font-bold mb-3">₱599<span className="text-sm font-normal">/mo</span></div>
              <p className="text-white/80 mb-4">For growing businesses</p>
              <ul className="text-sm text-white/80 space-y-1 mb-6">
                <li>• Unlimited feedback links</li>
                <li>• Unlimited responses</li>
                <li>• Advanced analytics</li>
              </ul>
              <Link href="/register?plan=business">
                <Button className="w-full bg-white text-primary hover:bg-white/90">
                  Try Free for 7 Days
                </Button>
              </Link>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link href="/pricing" className="text-subheader hover:text-header font-medium inline-flex items-center gap-2">
              View detailed pricing and features
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Analytics Preview Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="grid grid-cols-2 gap-4">
                <Card className="bg-primary text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <BarChart3 className="h-8 w-8 mb-3" />
                    <div className="text-2xl font-bold mb-1">4.8/5</div>
                    <div className="text-sm opacity-90">Average Rating</div>
                  </CardContent>
                </Card>
                <Card className="bg-white text-header border border-shadow shadow-lg">
                  <CardContent className="p-6">
                    <MessageSquare className="h-8 w-8 mb-3 text-secondary" />
                    <div className="text-2xl font-bold mb-1">1,247</div>
                    <div className="text-sm text-body">Feedback Received</div>
                  </CardContent>
                </Card>
                <Card className="bg-secondary text-white border-0 shadow-lg">
                  <CardContent className="p-6">
                    <Users className="h-8 w-8 mb-3" />
                    <div className="text-2xl font-bold mb-1">89%</div>
                    <div className="text-sm opacity-90">Response Rate</div>
                  </CardContent>
                </Card>
                <Card className="bg-white text-header border border-shadow shadow-lg">
                  <CardContent className="p-6">
                    <Star className="h-8 w-8 mb-3 text-warning" />
                    <div className="text-2xl font-bold mb-1">95%</div>
                    <div className="text-sm text-body">Satisfaction</div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-4xl font-bold text-header mb-6">
                Analyze your feedback and keep your customers engaged
              </h2>
              <p className="text-xl text-body mb-8 leading-relaxed">
                Track your engagement over time, monitor satisfaction levels and learn what's converting your audience. Make informed decisions to keep them coming back.
              </p>
              <Link href="/register">
                <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
                  Get started for free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Got questions?</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">Find answers to common questions about KlaroLink</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <FAQItem
                question="Why do I need a feedback collection tool?"
                answer="Customer feedback is crucial for business growth. KlaroLink makes it easy to collect, organize, and analyze feedback from your customers in one centralized location, helping you make data-driven decisions to improve your products and services."
              />
              <FAQItem
                question="Is KlaroLink the original feedback collection platform?"
                answer="KlaroLink is built specifically for small businesses who want a simple, effective way to collect customer feedback. While there are other feedback tools, KlaroLink focuses on ease of use and actionable insights."
              />
              <FAQItem
                question="Can you get insights and analytics from KlaroLink?"
                answer="Yes! KlaroLink provides comprehensive analytics including response rates, satisfaction scores, feedback trends, and detailed reports to help you understand your customers better and identify areas for improvement."
              />
              <FAQItem
                question="Is KlaroLink safe to use for my business?"
                answer="Absolutely. KlaroLink uses enterprise-grade security measures to protect your data and your customers' information. All feedback is encrypted and stored securely, and we comply with privacy regulations."
              />
              <FAQItem
                question="How much does KlaroLink cost?"
                answer="KlaroLink offers a free 7-day trial with full access to all features. After the trial, our plans start at $9/month for small businesses, with enterprise options available for larger organizations."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Jumpstart your feedback collection today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of businesses already using KlaroLink to improve their customer experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <div className="flex items-center gap-3">
              <input
                type="text"
                placeholder="yourbusiness/"
                className="px-4 py-3 rounded-lg border-2 border-white/20 bg-white/10 backdrop-blur-sm focus:outline-none focus:border-white text-white placeholder-white/70"
              />
              <Link href="/register">
                <Button size="lg" className="bg-white text-secondary hover:bg-white/90 px-8">
                  Claim your KlaroLink
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-header text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="text-white/80 hover:text-white transition-colors">About</Link></li>
                <li><Link href="/contact" className="text-white/80 hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/#features" className="text-white/80 hover:text-white transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="text-white/80 hover:text-white transition-colors">Pricing</Link></li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-white">Support & Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/help" className="text-white/80 hover:text-white transition-colors">Help/Support</Link></li>
                <li><Link href="/terms" className="text-white/80 hover:text-white transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="text-white/80 hover:text-white transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-white/20 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="outline" className="!border-white/30 !text-white !bg-transparent hover:!bg-white hover:!text-header">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
                    Get started for free
                  </Button>
                </Link>
              </div>

              {/* Social Media Icons */}
              <div className="flex items-center gap-4">
                <Link href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <Instagram className="h-5 w-5" />
                </Link>
                <Link href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <Facebook className="h-5 w-5" />
                </Link>
                <Link href="#" className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center hover:bg-primary transition-colors">
                  <Linkedin className="h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 text-center text-white/80 text-sm">
              <p>© 2025 KlaroLink. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
