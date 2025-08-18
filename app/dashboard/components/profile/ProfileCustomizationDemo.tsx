"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  Palette, 
  MousePointer, 
  Eye, 
  Smartphone, 
  Monitor, 
  Upload,
  Camera,
  User,
  ArrowRight,
  Sparkles
} from "lucide-react"

interface ProfileCustomizationDemoProps {
  onNavigateToProfile?: () => void
}

export function ProfileCustomizationDemo({ onNavigateToProfile }: ProfileCustomizationDemoProps) {
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    {
      icon: Palette,
      title: "Background Customization",
      description: "Choose from solid colors or upload custom background images",
      color: "bg-purple-100 text-purple-600",
      preview: "🎨"
    },
    {
      icon: MousePointer,
      title: "Button Styling",
      description: "Customize button colors, text, and hover effects",
      color: "bg-blue-100 text-blue-600",
      preview: "🔘"
    },
    {
      icon: Eye,
      title: "Live Preview",
      description: "See changes instantly with real-time preview",
      color: "bg-green-100 text-green-600",
      preview: "👁️"
    },
    {
      icon: Smartphone,
      title: "Responsive Design",
      description: "Preview how your form looks on different devices",
      color: "bg-orange-100 text-orange-600",
      preview: "📱"
    }
  ]

  const layoutFeatures = [
    {
      title: "Navigation Sidebar",
      description: "Fixed navigation with smooth scrolling",
      icon: "📋"
    },
    {
      title: "Content Area",
      description: "Scrollable customization sections",
      icon: "⚙️"
    },
    {
      title: "Live Preview",
      description: "Real-time form appearance preview",
      icon: "👀"
    }
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-secondary/5">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <div>
              <CardTitle className="text-xl">Profile Customization</CardTitle>
              <CardDescription className="text-base">
                Comprehensive form customization with live preview
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="secondary" className="gap-1">
              <Palette className="h-3 w-3" />
              Background Customization
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <MousePointer className="h-3 w-3" />
              Button Styling
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Eye className="h-3 w-3" />
              Live Preview
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Monitor className="h-3 w-3" />
              Responsive Design
            </Badge>
          </div>
          
          <Button 
            onClick={onNavigateToProfile}
            className="gap-2 bg-primary hover:bg-primary/90"
          >
            <Palette className="h-4 w-4" />
            Open Profile Customization
            <ArrowRight className="h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* Three-Column Layout Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5 text-primary" />
            Three-Column Layout
          </CardTitle>
          <CardDescription>
            Modern interface with navigation, content, and live preview
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 h-64 border border-shadow rounded-lg overflow-hidden">
            {/* Left Column */}
            <div className="bg-white border-r border-shadow p-4">
              <h4 className="font-semibold text-sm mb-3 text-header">Navigation</h4>
              <div className="space-y-2">
                {["Business Profile", "Profile Image", "Form Background", "Button Styling"].map((item, index) => (
                  <div 
                    key={item}
                    className={`text-xs p-2 rounded ${
                      index === 1 ? 'bg-primary/10 text-primary' : 'text-subheader'
                    }`}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>

            {/* Middle Column */}
            <div className="bg-background p-4 overflow-hidden">
              <h4 className="font-semibold text-sm mb-3 text-header">Content</h4>
              <div className="space-y-3">
                <div className="h-4 bg-shadow rounded w-3/4"></div>
                <div className="h-8 bg-white border border-shadow rounded"></div>
                <div className="h-4 bg-shadow rounded w-1/2"></div>
                <div className="h-6 bg-primary/10 rounded w-2/3"></div>
              </div>
            </div>

            {/* Right Column */}
            <div className="bg-white border-l border-shadow p-4">
              <h4 className="font-semibold text-sm mb-3 text-header">Live Preview</h4>
              <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded p-3 h-32">
                <div className="bg-white/90 rounded p-2 h-full">
                  <div className="h-2 bg-shadow rounded mb-2"></div>
                  <div className="h-2 bg-shadow rounded w-2/3 mb-2"></div>
                  <div className="h-4 bg-primary rounded mt-auto"></div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4">
            {layoutFeatures.map((feature, index) => (
              <div key={feature.title} className="text-center">
                <div className="text-2xl mb-2">{feature.icon}</div>
                <h5 className="font-medium text-sm text-header">{feature.title}</h5>
                <p className="text-xs text-subheader">{feature.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Feature Showcase */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Key Features
          </CardTitle>
          <CardDescription>
            Comprehensive customization capabilities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature, index) => {
              const Icon = feature.icon
              return (
                <div 
                  key={feature.title}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    currentFeature === index 
                      ? 'border-primary bg-primary/5' 
                      : 'border-shadow hover:border-primary/50'
                  }`}
                  onClick={() => setCurrentFeature(index)}
                >
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${feature.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-header mb-1">
                        {feature.title}
                      </h4>
                      <p className="text-xs text-subheader">
                        {feature.description}
                      </p>
                    </div>
                    <div className="text-lg">{feature.preview}</div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Customization Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Background Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Palette className="h-5 w-5 text-primary" />
              Background Options
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-purple-400 to-pink-400"></div>
              <div>
                <p className="text-sm font-medium text-header">Solid Colors</p>
                <p className="text-xs text-subheader">Color picker with hex input</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-gradient-to-br from-blue-400 to-green-400 flex items-center justify-center">
                <Upload className="h-4 w-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-header">Background Images</p>
                <p className="text-xs text-subheader">Upload JPG, PNG, WebP (max 5MB)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <MousePointer className="h-5 w-5 text-primary" />
              Button Styling
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
                <div className="w-4 h-2 bg-white rounded"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-header">Background Color</p>
                <p className="text-xs text-subheader">Customize button appearance</p>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded bg-secondary flex items-center justify-center">
                <div className="w-4 h-2 bg-white rounded"></div>
              </div>
              <div>
                <p className="text-sm font-medium text-header">Hover Effects</p>
                <p className="text-xs text-subheader">Interactive button states</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
