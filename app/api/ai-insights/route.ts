import { NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { db } from "@/lib/database-adapter"
import { promises as fs } from "fs"
import path from "path"

// Simple in-memory cache (safe for small workloads; resets on server restart)
// Keyed by businessId; value contains data and a signature of current submissions
const cache = new Map<number, { data: any; signature: string; expiresAt: number }>()

const CACHE_DIR = path.join(process.cwd(), ".cache", "ai-insights")

async function readFileCache(businessId: number) {
  try {
    const file = path.join(CACHE_DIR, `business_${businessId}.json`)
    const raw = await fs.readFile(file, "utf8")
    return JSON.parse(raw)
  } catch {
    return null
  }
}

async function writeFileCache(businessId: number, payload: any) {
  try {
    await fs.mkdir(CACHE_DIR, { recursive: true })
    const file = path.join(CACHE_DIR, `business_${businessId}.json`)
    await fs.writeFile(file, JSON.stringify(payload), "utf8")
  } catch (e) {
    console.warn("AI file cache write failed:", (e as any)?.message)
  }
}

function makeSignature(submissions: any[]) {
  // Compact signature: count + latest submitted_at
  const count = submissions.length
  const latest = submissions[0]?.submitted_at || "0"
  return `${count}:${latest}`
}

function buildPrompt(businessName: string, submissions: any[]) {
  const compact = submissions.map((s) => ({
    submitted_at: s.submitted_at,
    data: s.submission_data,
  }))

  return `You are a senior customer experience analyst and business intelligence expert. Analyze customer feedback for the business "${businessName}".

Return ONLY valid JSON that matches this TypeScript shape:
{
  "sentiment": {
    "overall": "positive" | "neutral" | "negative",
    "positivePct": number,    // 0-100
    "neutralPct": number,     // 0-100
    "negativePct": number,    // 0-100
    "summary": string,
    "confidenceScore": number // 0-100, how confident you are in this analysis
  },
  "keyThemes": Array<{
    theme: string;
    mentions: number;
    sentiment: "positive" | "neutral" | "negative";
    impact: "high" | "medium" | "low";
    examples: string[] // 2-3 specific customer quotes
  }>,
  "urgentIssues": Array<{
    issue: string;
    severity: "critical" | "high" | "medium";
    affectedCustomers: number;
    businessImpact: string;
    suggestedAction: string;
    timeframe: string // "immediate", "1-2 weeks", "1 month"
  }>,
  "positiveHighlights": Array<{
    highlight: string;
    frequency: number;
    businessValue: string;
    amplificationStrategy: string
  }>,
  "recommendations": Array<{
    category: "operations" | "service" | "product" | "marketing" | "training";
    action: string;
    priority: "high" | "medium" | "low";
    effort: "low" | "medium" | "high";
    expectedImpact: string;
    roi: "high" | "medium" | "low";
    timeline: string
  }>,
  "trendAnalysis": {
    "summary": string,
    "improving": Array<{ area: string; evidence: string; momentum: "strong" | "moderate" | "weak" }>,
    "declining": Array<{ area: string; evidence: string; urgency: "high" | "medium" | "low" }>,
    "emerging": Array<{ trend: string; significance: string; monitoring: string }>
  },
  "businessMetrics": {
    "customerRetentionRisk": number, // 0-100
    "revenueImpactScore": number, // 0-100
    "competitivePosition": "leading" | "competitive" | "lagging",
    "growthOpportunities": string[],
    "churnPredictors": string[]
  },
  "conclusion": {
    "strength": string,
    "needsImprovement": string,
    "action": string,
    "nextReviewDate": string // suggested date for next analysis
  }
}

Data to analyze (ISO dates; each has a data object of fieldId->value including optional rating, message, feedback, etc.):
${JSON.stringify(compact).slice(0, 18000)}

Guidelines:
- Be specific to the data. Avoid generic platitudes.
- If ratings exist (1-5), use them for sentiment percentages. Otherwise infer from text.
- Group similar topics into coherent themes with business impact.
- Prioritize actionable insights that drive business value.
- Consider customer lifetime value and retention in your analysis.
- Provide specific, measurable recommendations with clear ROI.
- The output MUST be valid JSON with double quotes, no backticks, no extra commentary.`
}

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const token = authHeader.substring(7)
    const authPayload = verifyToken(token)
    if (!authPayload) return NextResponse.json({ error: "Invalid token" }, { status: 401 })

    const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        error: "Missing Google Gemini API key. Set GOOGLE_GEMINI_API_KEY in your environment.",
      }, { status: 400 })
    }

    // Optional: force refresh bypasses cache
    const { searchParams } = new URL(request.url)
    const force = searchParams.get("force") === "true"

    // Load business and submissions
    const businessId = authPayload.businessId
    const business = await db.getBusiness(businessId)
    if (!business) return NextResponse.json({ error: "Business not found" }, { status: 404 })

    // Get up to 1000 latest submissions for analysis (adjust as needed)
    const submissions = await db.getFeedbackSubmissions(businessId, 1000)
    const signature = makeSignature(submissions)

    const now = Date.now()
    const cached = cache.get(businessId)
    if (!force && cached && cached.signature === signature && cached.expiresAt > now) {
      return NextResponse.json({ ...cached.data, cached: true, cacheSource: 'memory' })
    }

    // Check file cache (for longer-lived cache across restarts)
    if (!force) {
      const fileCached = await readFileCache(businessId)
      if (fileCached && fileCached.signature === signature && fileCached.expiresAt > now) {
        cache.set(businessId, fileCached) // hydrate memory cache
        return NextResponse.json({ ...fileCached.data, cached: true, cacheSource: 'file' })
      }
    }

    // Lazy import so the app can build even if the package isn't installed yet
    const { GoogleGenerativeAI } = await import("@google/generative-ai")
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" })

    const prompt = buildPrompt(business.name, submissions)

    const result = await model.generateContent(prompt)
    const text = result.response.text()

    let json: any
    try {
      json = JSON.parse(text)
    } catch (e) {
      // Attempt to salvage JSON if the model wrapped it in code fences
      const match = text.match(/\{[\s\S]*\}/)
      if (!match) throw new Error("AI response was not valid JSON")
      json = JSON.parse(match[0])
    }

    const data = { insights: json, generatedAt: new Date().toISOString() }

    // Cache for 10 minutes (memory + file)
    const cacheEntry = { data, signature, expiresAt: now + 10 * 60 * 1000 }
    cache.set(businessId, cacheEntry)
    await writeFileCache(businessId, cacheEntry)

    return NextResponse.json(data)
  } catch (error: any) {
    console.error("AI Insights Error:", error?.message || error)
    return NextResponse.json({ error: "Failed to generate AI insights" }, { status: 500 })
  }
}

