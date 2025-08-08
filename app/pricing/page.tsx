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

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Header */}
      <header className="container mx-auto px-4 py-6">
        <nav className="flex items-center justify-between bg-white shadow-sm rounded-full px-6 py-3 border border-shadow">
          <div className="flex items-center gap-2">
            <Link href="/">
              <Image src="/images/klarolink-logo.png" alt="KlaroLink" width={200} height={50} className="h-8 w-auto" />
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6 text-header font-semibold">
            <Link href="/#features" className="hover:text-primary transition-colors">Features</Link>
            <Link href="/pricing" className="hover:text-primary transition-colors text-primary">Pricing</Link>
            <Link href="/#about" className="hover:text-primary transition-colors">About</Link>
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
      <section className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-5xl font-bold text-header mb-4">
          Pick your plan. Make it yours.
        </h1>
        <p className="text-xl text-body mb-8 max-w-2xl mx-auto">
          Simple pricing with powerful feedback collection tools to grow your business.
        </p>


      </section>

      {/* Pricing Cards */}
      <section className="container mx-auto px-4 pb-20">
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Starter Plan */}
          <Card className="border border-shadow shadow-sm hover:shadow-md transition-shadow bg-white">
            <CardHeader className="text-center pb-8">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-header mb-2">Starter</h3>
                <p className="text-subheader">Perfect for small businesses getting started</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-header">₱199</span>
                  <span className="text-subheader">/month</span>
                </div>
                <p className="text-sm text-body mt-2">Billed monthly</p>
              </div>
              <Link href="/register?plan=starter">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-3">
                  Get started
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-body">Create 1 feedback link</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-body">Basic feedback forms</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-body">Basic analytics dashboard</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-body">Up to 100 responses/month</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-body">Email support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-body">Basic customization</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Business Plan - Featured */}
          <Card className="border-2 border-primary shadow-md hover:shadow-lg transition-shadow bg-white relative">
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="bg-primary text-primary-foreground px-6 py-2 rounded-full text-sm font-semibold">
                Most Popular
              </div>
            </div>
            <CardHeader className="text-center pb-8 pt-8">
              <div className="mb-4">
                <h3 className="text-2xl font-bold text-header mb-2">Business</h3>
                <p className="text-subheader">For growing businesses that need advanced features</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-4xl font-bold text-header">₱599</span>
                  <span className="text-subheader">/month</span>
                </div>
                <p className="text-sm text-body mt-2">Billed monthly</p>
              </div>
              <Link href="/register?plan=business">
                <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 text-lg py-3">
                  Try free for 7 days
                </Button>
              </Link>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-header font-medium">Everything in Starter, plus:</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-body">Unlimited feedback links</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-body">Unlimited responses</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-body">Advanced analytics & insights</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-body">Export data (CSV, Excel)</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-body">Priority support</span>
                </div>
                <div className="flex items-center gap-3">
                  <Check className="h-5 w-5 text-success" />
                  <span className="text-body">Full brand customization</span>
                </div>
                <div className="flex items-center gap-3">
                  <Star className="h-5 w-5 text-warning fill-current" />
                  <span className="text-header font-medium">AI conclusions (coming soon)</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Features Comparison */}
      <section className="container mx-auto px-4 py-20 bg-card">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-header mb-4">Compare plans</h2>
          <p className="text-xl text-subheader max-w-2xl mx-auto">
            Choose the plan that fits your business needs
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-3 gap-8">
            {/* Feature Column */}
            <div className="space-y-6">
              <div className="h-20"></div> {/* Spacer for headers */}
              <div className="space-y-4">
                <div className="py-4 text-header font-medium">Feedback Links</div>
                <div className="py-4 text-header font-medium">Monthly Responses</div>
                <div className="py-4 text-header font-medium">Analytics Dashboard</div>
                <div className="py-4 text-header font-medium">Data Export</div>
                <div className="py-4 text-header font-medium">Brand Customization</div>
                <div className="py-4 text-header font-medium">Support</div>
                <div className="py-4 text-header font-medium">AI Insights</div>
              </div>
            </div>

            {/* Starter Column */}
            <div className="text-center space-y-6">
              <div className="bg-white border border-shadow rounded-lg p-6">
                <h3 className="text-xl font-bold text-header mb-2">Starter</h3>
                <div className="text-2xl font-bold text-header">₱199<span className="text-sm font-normal">/mo</span></div>
              </div>
              <div className="space-y-4">
                <div className="py-4 text-body">1 link</div>
                <div className="py-4 text-body">Up to 100</div>
                <div className="py-4 text-body">Basic</div>
                <div className="py-4 text-body">—</div>
                <div className="py-4 text-body">Basic</div>
                <div className="py-4 text-body">Email</div>
                <div className="py-4 text-body">—</div>
              </div>
            </div>

            {/* Business Column */}
            <div className="text-center space-y-6">
              <div className="bg-primary rounded-lg p-6 text-primary-foreground">
                <h3 className="text-xl font-bold mb-2">Business</h3>
                <div className="text-2xl font-bold">₱599<span className="text-sm font-normal">/mo</span></div>
              </div>
              <div className="space-y-4">
                <div className="py-4 text-header font-medium">Unlimited</div>
                <div className="py-4 text-header font-medium">Unlimited</div>
                <div className="py-4 text-header font-medium">Advanced</div>
                <div className="py-4 text-header font-medium">CSV, Excel</div>
                <div className="py-4 text-header font-medium">Full</div>
                <div className="py-4 text-header font-medium">Priority</div>
                <div className="py-4 text-header font-medium">Coming Soon</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-header mb-12">
            Trusted by businesses across the Philippines
          </h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg p-6 border border-shadow shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <Users className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold text-header">500+</div>
              </div>
              <p className="text-body">Businesses using KlaroLink</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-shadow shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <MessageSquare className="h-8 w-8 text-secondary" />
                <div className="text-2xl font-bold text-header">25K+</div>
              </div>
              <p className="text-body">Feedback responses collected</p>
            </div>
            <div className="bg-white rounded-lg p-6 border border-shadow shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <BarChart3 className="h-8 w-8 text-primary" />
                <div className="text-2xl font-bold text-header">4.8/5</div>
              </div>
              <p className="text-body">Average customer satisfaction</p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-secondary">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Pricing FAQ</h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">Common questions about our pricing plans</p>
          </div>
          <div className="max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              <PricingFAQItem
                question="Can I change my plan anytime?"
                answer="Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately for your next monthly billing cycle."
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
                answer="Absolutely. You can cancel your subscription at any time from your account settings. Your plan will remain active until the end of your current month."
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
                answer="We offer a 7-day free trial for the Business plan. You can cancel anytime during your first month if you're not satisfied, and you'll only be charged for the days you used."
              />
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-primary">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to start collecting feedback?
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join hundreds of Philippine businesses already using KlaroLink to improve their customer experience
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link href="/register?plan=business">
              <Button size="lg" className="bg-white text-primary hover:bg-white/90 px-8">
                Start 7-day free trial
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/register?plan=starter">
              <Button size="lg" variant="outline" className="!border-white/30 !text-white !bg-transparent hover:!bg-white hover:!text-header px-8">
                Start with Starter plan
              </Button>
            </Link>
          </div>
          <p className="text-sm text-white/80 mt-6">
            No credit card required • Cancel anytime • 7-day free trial
          </p>
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
