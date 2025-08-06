import { 
  Globe, 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Youtube, 
  Github,
  Mail,
  Phone,
  MapPin,
  MessageCircle,
  Music,
  Camera,
  Video,
  Smartphone,
  type LucideIcon
} from "lucide-react"

export interface SocialPlatform {
  id: string
  name: string
  icon: LucideIcon
  baseUrl: string
  urlPattern: RegExp
  placeholder: string
  description: string
  category: 'social' | 'professional' | 'content' | 'contact' | 'other'
  color: string
  validation: {
    required: boolean
    minLength?: number
    maxLength?: number
    customValidation?: (url: string) => string | null
  }
}

export const SOCIAL_PLATFORMS: Record<string, SocialPlatform> = {
  website: {
    id: 'website',
    name: 'Website',
    icon: Globe,
    baseUrl: '',
    urlPattern: /^https?:\/\/.+\..+/,
    placeholder: 'https://yourwebsite.com',
    description: 'Your business website or homepage',
    category: 'other',
    color: '#6366f1',
    validation: {
      required: true,
      minLength: 10,
      maxLength: 200,
      customValidation: (url: string) => {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return 'Website URL must start with http:// or https://'
        }
        return null
      }
    }
  },
  instagram: {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    baseUrl: 'https://instagram.com/',
    urlPattern: /^https?:\/\/(www\.)?instagram\.com\/[a-zA-Z0-9._]+\/?$/,
    placeholder: 'https://instagram.com/yourusername',
    description: 'Your Instagram profile',
    category: 'social',
    color: '#E4405F',
    validation: {
      required: true,
      customValidation: (url: string) => {
        if (!url.includes('instagram.com/')) {
          return 'Please enter a valid Instagram URL'
        }
        return null
      }
    }
  },
  twitter: {
    id: 'twitter',
    name: 'Twitter / X',
    icon: Twitter,
    baseUrl: 'https://twitter.com/',
    urlPattern: /^https?:\/\/(www\.)?(twitter\.com|x\.com)\/[a-zA-Z0-9_]+\/?$/,
    placeholder: 'https://twitter.com/yourusername',
    description: 'Your Twitter/X profile',
    category: 'social',
    color: '#1DA1F2',
    validation: {
      required: true,
      customValidation: (url: string) => {
        if (!url.includes('twitter.com/') && !url.includes('x.com/')) {
          return 'Please enter a valid Twitter/X URL'
        }
        return null
      }
    }
  },
  facebook: {
    id: 'facebook',
    name: 'Facebook',
    icon: Facebook,
    baseUrl: 'https://facebook.com/',
    urlPattern: /^https?:\/\/(www\.)?facebook\.com\/[a-zA-Z0-9.]+\/?$/,
    placeholder: 'https://facebook.com/yourpage',
    description: 'Your Facebook page or profile',
    category: 'social',
    color: '#1877F2',
    validation: {
      required: true,
      customValidation: (url: string) => {
        if (!url.includes('facebook.com/')) {
          return 'Please enter a valid Facebook URL'
        }
        return null
      }
    }
  },
  linkedin: {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    baseUrl: 'https://linkedin.com/in/',
    urlPattern: /^https?:\/\/(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?$/,
    placeholder: 'https://linkedin.com/in/yourprofile',
    description: 'Your LinkedIn profile or company page',
    category: 'professional',
    color: '#0A66C2',
    validation: {
      required: true,
      customValidation: (url: string) => {
        if (!url.includes('linkedin.com/')) {
          return 'Please enter a valid LinkedIn URL'
        }
        return null
      }
    }
  },
  youtube: {
    id: 'youtube',
    name: 'YouTube',
    icon: Youtube,
    baseUrl: 'https://youtube.com/',
    urlPattern: /^https?:\/\/(www\.)?youtube\.com\/(channel\/|c\/|user\/|@)[a-zA-Z0-9_-]+\/?$/,
    placeholder: 'https://youtube.com/@yourchannel',
    description: 'Your YouTube channel',
    category: 'content',
    color: '#FF0000',
    validation: {
      required: true,
      customValidation: (url: string) => {
        if (!url.includes('youtube.com/')) {
          return 'Please enter a valid YouTube URL'
        }
        return null
      }
    }
  },
  tiktok: {
    id: 'tiktok',
    name: 'TikTok',
    icon: Music,
    baseUrl: 'https://tiktok.com/',
    urlPattern: /^https?:\/\/(www\.)?tiktok\.com\/@[a-zA-Z0-9._]+\/?$/,
    placeholder: 'https://tiktok.com/@yourusername',
    description: 'Your TikTok profile',
    category: 'content',
    color: '#000000',
    validation: {
      required: true,
      customValidation: (url: string) => {
        if (!url.includes('tiktok.com/@')) {
          return 'Please enter a valid TikTok URL (must include @username)'
        }
        return null
      }
    }
  },
  github: {
    id: 'github',
    name: 'GitHub',
    icon: Github,
    baseUrl: 'https://github.com/',
    urlPattern: /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9-]+\/?$/,
    placeholder: 'https://github.com/yourusername',
    description: 'Your GitHub profile',
    category: 'professional',
    color: '#181717',
    validation: {
      required: true,
      customValidation: (url: string) => {
        if (!url.includes('github.com/')) {
          return 'Please enter a valid GitHub URL'
        }
        return null
      }
    }
  },
  whatsapp: {
    id: 'whatsapp',
    name: 'WhatsApp',
    icon: MessageCircle,
    baseUrl: 'https://wa.me/',
    urlPattern: /^https?:\/\/wa\.me\/[0-9]+$/,
    placeholder: 'https://wa.me/1234567890',
    description: 'Your WhatsApp business number',
    category: 'contact',
    color: '#25D366',
    validation: {
      required: true,
      customValidation: (url: string) => {
        if (!url.includes('wa.me/')) {
          return 'Please enter a valid WhatsApp URL (wa.me/phonenumber)'
        }
        return null
      }
    }
  },
  email: {
    id: 'email',
    name: 'Email',
    icon: Mail,
    baseUrl: 'mailto:',
    urlPattern: /^mailto:[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    placeholder: 'mailto:contact@yourbusiness.com',
    description: 'Your business email address',
    category: 'contact',
    color: '#EA4335',
    validation: {
      required: true,
      customValidation: (url: string) => {
        if (!url.startsWith('mailto:')) {
          return 'Email must start with mailto:'
        }
        const email = url.replace('mailto:', '')
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        if (!emailPattern.test(email)) {
          return 'Please enter a valid email address'
        }
        return null
      }
    }
  },
  phone: {
    id: 'phone',
    name: 'Phone',
    icon: Phone,
    baseUrl: 'tel:',
    urlPattern: /^tel:\+?[0-9\s\-\(\)]+$/,
    placeholder: 'tel:+1234567890',
    description: 'Your business phone number',
    category: 'contact',
    color: '#34A853',
    validation: {
      required: true,
      customValidation: (url: string) => {
        if (!url.startsWith('tel:')) {
          return 'Phone number must start with tel:'
        }
        return null
      }
    }
  }
}

export const PLATFORM_CATEGORIES = {
  social: { name: 'Social Media', platforms: ['instagram', 'twitter', 'facebook', 'tiktok'] },
  professional: { name: 'Professional', platforms: ['linkedin', 'github'] },
  content: { name: 'Content', platforms: ['youtube'] },
  contact: { name: 'Contact', platforms: ['email', 'phone', 'whatsapp'] },
  other: { name: 'Other', platforms: ['website'] }
}

export function validateSocialUrl(platform: string, url: string): string | null {
  if (!url.trim()) {
    return 'URL is required'
  }

  const platformConfig = SOCIAL_PLATFORMS[platform]
  if (!platformConfig) {
    return 'Invalid platform'
  }

  // Check length constraints
  if (platformConfig.validation.minLength && url.length < platformConfig.validation.minLength) {
    return `URL must be at least ${platformConfig.validation.minLength} characters`
  }

  if (platformConfig.validation.maxLength && url.length > platformConfig.validation.maxLength) {
    return `URL must be no more than ${platformConfig.validation.maxLength} characters`
  }

  // Run custom validation
  if (platformConfig.validation.customValidation) {
    const customError = platformConfig.validation.customValidation(url)
    if (customError) {
      return customError
    }
  }

  // Check URL pattern
  if (!platformConfig.urlPattern.test(url)) {
    return `Please enter a valid ${platformConfig.name} URL`
  }

  return null
}

export function getSocialPlatformsByCategory() {
  return Object.entries(PLATFORM_CATEGORIES).map(([categoryId, category]) => ({
    id: categoryId,
    name: category.name,
    platforms: category.platforms.map(platformId => SOCIAL_PLATFORMS[platformId])
  }))
}

export function getAllSocialPlatforms() {
  return Object.values(SOCIAL_PLATFORMS)
}
