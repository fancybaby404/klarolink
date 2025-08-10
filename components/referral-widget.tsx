"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Share2, Gift, Trophy, Star, Users, Copy, Check } from "lucide-react"

interface ReferralWidgetProps {
  businessId: number
  businessSlug: string
  businessName: string
  onReferralCreate?: (referralCode: string) => void
}

export function ReferralWidget({ businessId, businessSlug, businessName, onReferralCreate }: ReferralWidgetProps) {
  const [referralData, setReferralData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [referredEmail, setReferredEmail] = useState("")
  const [isCreatingReferral, setIsCreatingReferral] = useState(false)
  const [showReferralDialog, setShowReferralDialog] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)

  useEffect(() => {
    fetchReferralData()
  }, [businessId])

  const fetchReferralData = async () => {
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch(`/api/referrals?businessId=${businessId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReferralData(data)
      }
    } catch (error) {
      // Error handling
    } finally {
      setLoading(false)
    }
  }

  const createReferral = async () => {
    if (!referredEmail.trim()) return

    setIsCreatingReferral(true)
    try {
      const token = localStorage.getItem("token")
      if (!token) return

      const response = await fetch("/api/referrals", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          businessId,
          referredEmail: referredEmail.trim(),
        }),
      })

      if (response.ok) {
        const result = await response.json()
        setReferredEmail("")
        setShowReferralDialog(false)
        await fetchReferralData()
        onReferralCreate?.(result.referralCode)
      }
    } catch (error) {
      // Error handling
    } finally {
      setIsCreatingReferral(false)
    }
  }

  const copyReferralLink = async (referralCode: string) => {
    const referralUrl = `${window.location.origin}/${businessSlug}?ref=${referralCode}`
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopiedCode(referralCode)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (error) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea")
      textArea.value = referralUrl
      document.body.appendChild(textArea)
      textArea.select()
      document.execCommand("copy")
      document.body.removeChild(textArea)
      setCopiedCode(referralCode)
      setTimeout(() => setCopiedCode(null), 2000)
    }
  }

  const shareOnSocial = (platform: string, referralCode: string) => {
    const referralUrl = `${window.location.origin}/${businessSlug}?ref=${referralCode}`
    const message = `Check out ${businessName} and share your feedback! I think you'll love it.`
    
    let shareUrl = ""
    switch (platform) {
      case "facebook":
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralUrl)}`
        break
      case "twitter":
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}&url=${encodeURIComponent(referralUrl)}`
        break
      case "linkedin":
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(referralUrl)}`
        break
      case "whatsapp":
        shareUrl = `https://wa.me/?text=${encodeURIComponent(message + " " + referralUrl)}`
        break
    }

    if (shareUrl) {
      window.open(shareUrl, "_blank", "width=600,height=400")
      
      // Track the share
      fetch("/api/referrals/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          referralCode,
          action: "share",
          platform,
          url: referralUrl,
          businessId,
        }),
      })
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!referralData?.settings?.referral_enabled) {
    return null
  }

  return (
    <div className="space-y-4">
      {/* Points and Badges Display */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            Your Rewards
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{referralData?.points?.balance || 0}</div>
              <div className="text-sm text-gray-600">Points Available</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{referralData?.badges?.length || 0}</div>
              <div className="text-sm text-gray-600">Badges Earned</div>
            </div>
          </div>
          
          {referralData?.badges && referralData.badges.length > 0 && (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 mb-2">Recent Badges:</div>
              <div className="flex flex-wrap gap-2">
                {referralData.badges.slice(0, 3).map((badge: any) => (
                  <Badge key={badge.id} variant="secondary" className="flex items-center gap-1">
                    <span>{badge.badge_icon}</span>
                    {badge.badge_name}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Refer Friends
          </CardTitle>
          <CardDescription>
            Earn {referralData?.settings?.points_per_referral || 50} points for each successful referral!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Dialog open={showReferralDialog} onOpenChange={setShowReferralDialog}>
              <DialogTrigger asChild>
                <Button className="w-full">
                  <Gift className="h-4 w-4 mr-2" />
                  Invite a Friend
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Invite a Friend</DialogTitle>
                  <DialogDescription>
                    Enter your friend's email to send them a personalized invitation.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="email">Friend's Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="friend@example.com"
                      value={referredEmail}
                      onChange={(e) => setReferredEmail(e.target.value)}
                    />
                  </div>
                  <Button 
                    onClick={createReferral} 
                    disabled={isCreatingReferral || !referredEmail.trim()}
                    className="w-full"
                  >
                    {isCreatingReferral ? "Creating..." : "Create Referral Link"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Active Referrals */}
            {referralData?.referrals && referralData.referrals.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-700 mb-2">Your Referrals:</div>
                <div className="space-y-2">
                  {referralData.referrals.slice(0, 3).map((referral: any) => (
                    <div key={referral.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <div className="text-sm font-medium">{referral.referred_email}</div>
                        <div className="text-xs text-gray-500">
                          Status: <span className={`capitalize ${referral.status === 'completed' ? 'text-green-600' : 'text-orange-600'}`}>
                            {referral.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => copyReferralLink(referral.referral_code)}
                        >
                          {copiedCode === referral.referral_code ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => shareOnSocial("whatsapp", referral.referral_code)}
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
