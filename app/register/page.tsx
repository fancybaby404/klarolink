"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Upload, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import Image from "next/image"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    businessName: "",
    email: "",
    password: "",
    confirmPassword: "",
    profileImage: "",
  })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match")
      setLoading(false)
      return
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long")
      setLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.businessName,
          email: formData.email,
          password: formData.password,
          profileImage: formData.profileImage,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Registration failed")
      }

      // Store token and redirect to dashboard
      localStorage.setItem("token", data.token)
      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setFormData((prev) => ({ ...prev, profileImage: e.target?.result as string }))
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#E6ECF0] to-[#A9D3F0] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 text-[#2C5580] hover:text-[#5D8BB0] mb-6 font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>

          {/* Logo */}
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="w-10 h-10 bg-[#2C5580] rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">K</span>
            </div>
            <span className="text-2xl font-bold text-[#2C5580]">KlaroLink</span>
          </div>

          <h1 className="text-3xl font-bold text-[#2C5580] mb-2">Create Your Account</h1>
          <p className="text-[#5D8BB0] text-lg">Start collecting feedback from your customers today</p>
        </div>

        <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
          <CardContent className="p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive" className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="businessName" className="text-[#2C5580] font-medium">Business Name</Label>
                <Input
                  id="businessName"
                  type="text"
                  placeholder="Enter your business name"
                  value={formData.businessName}
                  onChange={(e) => setFormData((prev) => ({ ...prev, businessName: e.target.value }))}
                  required
                  className="h-12 border-[#5D8BB0]/30 focus:border-[#2C5580] focus:ring-[#2C5580]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="text-[#2C5580] font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  required
                  className="h-12 border-[#5D8BB0]/30 focus:border-[#2C5580] focus:ring-[#2C5580]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-[#2C5580] font-medium">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Create a secure password"
                  value={formData.password}
                  onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                  required
                  className="h-12 border-[#5D8BB0]/30 focus:border-[#2C5580] focus:ring-[#2C5580]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-[#2C5580] font-medium">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className="h-12 border-[#5D8BB0]/30 focus:border-[#2C5580] focus:ring-[#2C5580]/20"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="profileImage" className="text-[#2C5580] font-medium">Profile Image (Optional)</Label>
                <div className="flex items-center gap-4">
                  {formData.profileImage ? (
                    <img
                      src={formData.profileImage || "/placeholder.svg"}
                      alt="Profile"
                      className="w-16 h-16 rounded-full object-cover border-2 border-[#A9D3F0]"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-[#E6ECF0] flex items-center justify-center border-2 border-[#A9D3F0]">
                      <Upload className="h-6 w-6 text-[#5D8BB0]" />
                    </div>
                  )}
                  <Input
                    id="profileImage"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="flex-1 border-[#5D8BB0]/30 focus:border-[#2C5580] focus:ring-[#2C5580]/20"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full h-12 bg-[#2C5580] hover:bg-[#5D8BB0] text-white font-medium text-lg transition-colors"
                disabled={loading}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </Button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-[#5D8BB0]">
                Already have an account?{" "}
                <Link href="/login" className="text-[#2C5580] hover:text-[#5D8BB0] font-medium transition-colors">
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
