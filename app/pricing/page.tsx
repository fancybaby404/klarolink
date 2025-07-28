"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Check, ArrowRight, Star, Users, BarChart3, MessageSquare, ChevronDown } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useState } from "react"

// FAQ Component
function PricingFAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b border-[#A9D3F0] last:border-b-0">
      <button
        className="w-full py-6 px-6 text-left flex justify-between items-center hover:bg-[#E6ECF0] transition-colors"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-lg font-semibold text-[#2C5580]">{question}</span>
        <ChevronDown className={`h-5 w-5 text-[#5D8BB0] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="px-6 pb-6">
          <p className="text-[#5D8BB0] leading-relaxed">{answer}</p>
        </div>
      )}
    </div>
  )
}

export default function PricingPage() {
  return (
    <div className="min-h-screen" style={{ fontFamily: 'Poppins, sans-serif', background: '#E6ECF0' }}>
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between bg-white shadow-sm rounded-full px-6 py-3">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image src="/images/klarolink-logo.png" alt="KlaroLink" width={200} height={50} className="h-8 w-auto" />
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6 text-[#2C5580] font-semibold">
            <Link href="/#features" className="hover:text-[#5D8BB0] transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-[#5D8BB0] transition-colors text-[#5D8BB0]">Pricing</Link>
            <Link href="/#about" className="hover:text-[#5D8BB0] transition-colors">About</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-[#2C5580] hover:bg-[#A9D3F0]">Log in</Button>
            </Link>
            <Link href="/register">
              <Button className="bg-[#2C5580] text-white hover:bg-[#5D8BB0]">Sign up free</Button>
            </Link>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-[#2C5580] mb-4">
          Pick your plan. Make it yours.
        </h1>
        <p className="text-xl text-[#5D8BB0] mb-8 max-w-2xl mx-auto">
          Simple pricing with powerful feedback collection tools to grow your business.
        </p>
        
        {/* Billing Toggle */}
        <div className="flex items-center justify-center gap-4 mb-12">
          <span className="text-[#5D8BB0] font-medium">Monthly</span>
          <div className="bg-[#2C5580] text-white px-4 py-2 rounded-full text-sm font-semibold">
            Annual (Save up to 20%)
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter Plan */}
          <Card className="border-2 border-[#A9D3F0] shadow-lg hover:shadow-xl transition-shadow bg-white">
            <CardHeader className="text-center pb-8">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-[#2C5580] mb-2">Starter</h3>
                <p className="text-[#5D8BB0]">Perfect for small businesses getting started</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-[#2C5580]">₱199</span>
                  <span className="text-[#5D8BB0]">/month</span>
                </div>
                <p className="text-sm text-[#5D8BB0] mt-2">Billed monthly • ₱2,388 annually</p>
              </div>
              <Link href="/register?plan=starter">
                <Button className="w-full bg-[#A9D3F0] text-[#2C5580] hover:bg-[#5D8BB0] hover:text-white text-lg py-3">
                  Get started
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#5D8BB0]" />
                  <span className="text-[#2C5580]">Create 1 feedback link</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#5D8BB0]" />
                  <span className="text-[#2C5580]">Basic feedback forms</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#5D8BB0]" />
                  <span className="text-[#2C5580]">Basic analytics dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#5D8BB0]" />
                  <span className="text-[#2C5580]">Up to 100 responses/month</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#5D8BB0]" />
                  <span className="text-[#2C5580]">Email support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#5D8BB0]" />
                  <span className="text-[#2C5580]">Basic customization</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Plan - Featured */}
          <Card className="border-2 border-[#2C5580] shadow-xl hover:shadow-2xl transition-shadow bg-white relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-[#2C5580] text-white px-6 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            </div>
            <CardHeader className="text-center pb-8 pt-8">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-[#2C5580] mb-2">Business</h3>
                <p className="text-[#5D8BB0]">For growing businesses that need advanced features</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-[#2C5580]">₱599</span>
                  <span className="text-[#5D8BB0]">/month</span>
                </div>
                <p className="text-sm text-[#5D8BB0] mt-2">Billed monthly • ₱5,750 annually</p>
              </div>
              <Link href="/register?plan=business">
                <Button className="w-full bg-[#2C5580] text-white hover:bg-[#5D8BB0] text-lg py-3">
                  Try free for 7 days
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#2C5580]" />
                  <span className="text-[#2C5580] font-medium">Everything in Starter, plus:</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#2C5580]" />
                  <span className="text-[#2C5580]">Unlimited feedback links</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#2C5580]" />
                  <span className="text-[#2C5580]">Unlimited responses</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#2C5580]" />
                  <span className="text-[#2C5580]">Advanced analytics & insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#2C5580]" />
                  <span className="text-[#2C5580]">Export data (CSV, Excel)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#2C5580]" />
                  <span className="text-[#2C5580]">Priority support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-[#2C5580]" />
                  <span className="text-[#2C5580]">Full brand customization</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-yellow-500 fill-current" />
                  <span className="text-[#2C5580] font-medium">AI conclusions (coming soon)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="container mx-auto px-4 py-20 bg-white">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-[#2C5580] mb-4">Compare plans</h2>
          <p className="text-xl text-[#5D8BB0] max-w-2xl mx-auto">
            Choose the plan that fits your business needs
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8">
            {/* Feature Column */}
            <div className="space-y-6">
              <div className="h-20"></div> {/* Spacer for headers */}
              <div className="space-y-4">
                <div className="py-4 text-[#2C5580] font-medium">Feedback Links</div>
                <div className="py-4 text-[#2C5580] font-medium">Monthly Responses</div>
                <div className="py-4 text-[#2C5580] font-medium">Analytics Dashboard</div>
                <div className="py-4 text-[#2C5580] font-medium">Data Export</div>
                <div className="py-4 text-[#2C5580] font-medium">Brand Customization</div>
                <div className="py-4 text-[#2C5580] font-medium">Support</div>
                <div className="py-4 text-[#2C5580] font-medium">AI Insights</div>
              </div>
            </div>

            {/* Starter Column */}
            <div className="text-center space-y-6">
              <div className="bg-[#E6ECF0] rounded-lg p-6">
                <h3 className="text-xl font-bold text-[#2C5580] mb-2">Starter</h3>
                <div className="text-2xl font-bold text-[#2C5580]">₱199<span className="text-sm font-normal">/mo</span></div>
              </div>
              <div className="space-y-4">
                <div className="py-4 text-[#5D8BB0]">1 link</div>
                <div className="py-4 text-[#5D8BB0]">Up to 100</div>
                <div className="py-4 text-[#5D8BB0]">Basic</div>
                <div className="py-4 text-[#5D8BB0]">—</div>
                <div className="py-4 text-[#5D8BB0]">Basic</div>
                <div className="py-4 text-[#5D8BB0]">Email</div>
                <div className="py-4 text-[#5D8BB0]">—</div>
              </div>
            </div>

            {/* Business Column */}
            <div className="text-center space-y-6">
              <div className="bg-[#2C5580] rounded-lg p-6 text-white">
                <h3 className="text-xl font-bold mb-2">Business</h3>
                <div className="text-2xl font-bold">₱599<span className="text-sm font-normal">/mo</span></div>
              </div>
              <div className="space-y-4">
                <div className="py-4 text-[#2C5580] font-medium">Unlimited</div>
                <div className="py-4 text-[#2C5580] font-medium">Unlimited</div>
                <div className="py-4 text-[#2C5580] font-medium">Advanced</div>
                <div className="py-4 text-[#2C5580] font-medium">CSV, Excel</div>
                <div className="py-4 text-[#2C5580] font-medium">Full</div>
                <div className="py-4 text-[#2C5580] font-medium">Priority</div>
                <div className="py-4 text-[#2C5580] font-medium">Coming Soon</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20" style={{ background: '#E6ECF0' }}>
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-[#2C5580] mb-12">
            Trusted by businesses across the Philippines
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8 text-[#5D8BB0]" />
                <div className="text-2xl font-bold text-[#2C5580]">500+</div>
              </div>
              <p className="text-[#5D8BB0]">Businesses using KlaroLink</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-8 w-8 text-[#5D8BB0]" />
                <div className="text-2xl font-bold text-[#2C5580]">25K+</div>
              </div>
              <p className="text-[#5D8BB0]">Feedback responses collected</p>
            </div>
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-8 w-8 text-[#5D8BB0]" />
                <div className="text-2xl font-bold text-[#2C5580]">4.8/5</div>
              </div>
              <p className="text-[#5D8BB0]">Average customer satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-gradient-to-br from-[#2C5580] to-[#5D8BB0]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Pricing FAQ</h2>
            <p className="text-xl text-[#A9D3F0] max-w-2xl mx-auto">Common questions about our pricing plans</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              <PricingFAQItem
                question="Can I change my plan anytime?"
                answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
              />
              <PricingFAQItem
                question="Is there a free trial available?"
                answer="Yes, we offer a 7-day free trial for the Business plan. No credit card required to start your trial."
              />
              <PricingFAQItem
                question="What payment methods do you accept?"
                answer="We accept all major credit cards (Visa, Mastercard, American Express), PayPal, and GCash for Philippine customers."
              />
              <PricingFAQItem
                question="Can I cancel my subscription anytime?"
                answer="Absolutely. You can cancel your subscription at any time from your account settings. Your plan will remain active until the end of your current billing period."
              />
              <PricingFAQItem
                question="Do you offer discounts for annual billing?"
                answer="Yes! Save up to 20% when you choose annual billing. Annual plans are billed once per year and offer significant savings."
              />
              <PricingFAQItem
                question="What happens if I exceed my response limit on the Starter plan?"
                answer="If you exceed 100 responses on the Starter plan, we'll notify you and suggest upgrading to Business for unlimited responses. Your existing data remains safe."
              />
              <PricingFAQItem
                question="Is my data secure and backed up?"
                answer="Yes, all your feedback data is encrypted, securely stored, and regularly backed up. We follow industry-standard security practices to protect your information."
              />
              <PricingFAQItem
                question="Can I get a refund if I'm not satisfied?"
                answer="We offer a 30-day money-back guarantee. If you're not completely satisfied with KlaroLink, contact us within 30 days for a full refund."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#5D8BB0] to-[#A9D3F0]">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-[#2C5580] mb-4">
            Ready to start collecting feedback?
          </h2>
          <p className="text-xl text-[#2C5580] mb-8 max-w-2xl mx-auto">
            Join hundreds of Philippine businesses already using KlaroLink to improve their customer experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register?plan=business">
              <Button size="lg" className="bg-[#2C5580] text-white hover:bg-[#5D8BB0] px-8">
                Start 7-day free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register?plan=starter">
              <Button size="lg" variant="outline" className="border-[#2C5580] text-[#2C5580] hover:bg-[#2C5580] hover:text-white px-8">
                Start with Starter plan
              </Button>
            </Link>
          </div>
          <p className="text-sm text-[#5D8BB0] mt-6">
            No credit card required • Cancel anytime • 30-day money-back guarantee
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-[#2C5580] to-[#5D8BB0] text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Company */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#A9D3F0]">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/about" className="hover:text-[#A9D3F0] transition-colors">About</Link></li>
                <li><Link href="/contact" className="hover:text-[#A9D3F0] transition-colors">Contact</Link></li>
              </ul>
            </div>

            {/* Product */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#A9D3F0]">Product</h3>
              <ul className="space-y-3">
                <li><Link href="/#features" className="hover:text-[#A9D3F0] transition-colors">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-[#A9D3F0] transition-colors">Pricing</Link></li>
              </ul>
            </div>

            {/* Support & Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-4 text-[#A9D3F0]">Support & Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/help" className="hover:text-[#A9D3F0] transition-colors">Help/Support</Link></li>
                <li><Link href="/terms" className="hover:text-[#A9D3F0] transition-colors">Terms of Service</Link></li>
                <li><Link href="/privacy" className="hover:text-[#A9D3F0] transition-colors">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="border-t border-[#5D8BB0] pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-4">
                <Link href="/login">
                  <Button variant="outline" className="border-[#A9D3F0] text-[#A9D3F0] hover:bg-[#A9D3F0] hover:text-[#2C5580]">
                    Log in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button className="bg-[#A9D3F0] text-[#2C5580] hover:bg-white hover:text-[#2C5580]">
                    Get started for free
                  </Button>
                </Link>
              </div>
            </div>

            {/* Copyright */}
            <div className="mt-8 text-center text-[#A9D3F0] text-sm">
              <p>© 2025 KlaroLink. All rights reserved.</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
