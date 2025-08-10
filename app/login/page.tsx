"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Login failed")
      }

      // Store token and redirect to dashboard
      localStorage.setItem("token", data.token)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#FDFFFA' }}>
      {/* Left Side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8" style={{ backgroundColor: '#FDFFFA' }}>
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <Link href="/" className="inline-flex items-center gap-2 text-[#3E7EF7] hover:text-[#CC79F0] mb-8 font-medium transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Home
            </Link>

            {/* Logo */}
            <div className="flex items-center gap-3 mb-8">
              <div className="w-8 h-8 bg-[#CC79F0] rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">K</span>
              </div>
              <span className="text-xl font-bold text-[#333135]">KlaroLink</span>
            </div>

            <h1 className="text-3xl font-bold text-[#333135] mb-2">Welcome back</h1>
            <p className="text-[#5F5B62] text-sm">Log in to your KlaroLink</p>
          </div>

          <div className="space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-[#CF2C3A] bg-red-50">
                  <AlertDescription className="text-[#CF2C3A]">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#333135] font-medium text-sm">Email or Username</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder=""
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className="h-12 border-[#F3F3F3] focus:border-[#3E7EF7] focus:ring-[#3E7EF7]/20 rounded-lg bg-white"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#333135] font-medium text-sm">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder=""
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  className="h-12 border-[#F3F3F3] focus:border-[#3E7EF7] focus:ring-[#3E7EF7]/20 rounded-lg bg-white"
                />
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#CC79F0] hover:bg-[#3E7EF7] text-white font-medium rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? "Signing In..." : "Continue"}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#4A4A4A] text-sm">
                Or
              </p>
            </div>

            <Button
              variant="outline"
              className="w-full h-12 border-[#F3F3F3] text-[#4A4A4A] font-medium rounded-lg mt-4 hover:bg-[#F3F3F3] bg-white"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue With Google
            </Button>

            <div className="mt-8 text-center space-y-2">
              <Link href="#" className="text-[#3E7EF7] hover:text-[#CC79F0] text-sm font-medium">
                Forgot password?
              </Link>
              <span className="text-[#5F5B62] mx-2">•</span>
              <Link href="#" className="text-[#3E7EF7] hover:text-[#CC79F0] text-sm font-medium">
                Forgot username?
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[#4A4A4A] text-sm">
                Don't have an account?{" "}
                <Link href="/register" className="text-[#3E7EF7] hover:text-[#CC79F0] font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="flex-1 relative">
        <Image
          src="/images/loginphoto.png"
          alt="Login illustration"
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  )
}
