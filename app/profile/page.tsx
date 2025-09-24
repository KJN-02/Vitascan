"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  FileText,
  User,
  Activity,
  Share2,
  Check,
  Loader2,
  Brain,
  TrendingUp,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import Link from "next/link"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"

export default function Profile() {
  const { user, profile, scans, loading, refreshScans } = useAuth()
  const router = useRouter()
  const [sharingStates, setSharingStates] = useState<Record<string, "idle" | "loading" | "success" | "error">>({})
  const [expandedScans, setExpandedScans] = useState<Record<string, boolean>>({})
  const [scanAnalyses, setScanAnalyses] = useState<Record<string, any>>({})
  const [analyzingScans, setAnalyzingScans] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      refreshScans()
    }
  }, [user, refreshScans])

  const handleShare = async (scan: any) => {
    setSharingStates((prev) => ({ ...prev, [scan.id]: "loading" }))

    try {
      const response = await fetch("/api/scans", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scanId: scan.id,
          symptoms: scan.symptoms,
          date: scan.date,
          userName: profile?.name || "Anonymous",
        }),
      })

      const data = await response.json()

      if (data.success) {
        // Copy the shareable link to clipboard
        await navigator.clipboard.writeText(data.shareUrl)
        setSharingStates((prev) => ({ ...prev, [scan.id]: "success" }))

        // Reset state after 3 seconds
        setTimeout(() => {
          setSharingStates((prev) => ({ ...prev, [scan.id]: "idle" }))
        }, 3000)
      } else {
        setSharingStates((prev) => ({ ...prev, [scan.id]: "error" }))
        setTimeout(() => {
          setSharingStates((prev) => ({ ...prev, [scan.id]: "idle" }))
        }, 3000)
      }
    } catch (error) {
      console.error("Error sharing scan:", error)
      setSharingStates((prev) => ({ ...prev, [scan.id]: "error" }))
      setTimeout(() => {
        setSharingStates((prev) => ({ ...prev, [scan.id]: "idle" }))
      }, 3000)
    }
  }

  const getShareButtonContent = (scanId: string) => {
    const state = sharingStates[scanId] || "idle"

    switch (state) {
      case "loading":
        return (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Sharing...
          </>
        )
      case "success":
        return (
          <>
            <Check className="h-4 w-4" />
            Link Copied!
          </>
        )
      case "error":
        return (
          <>
            <Share2 className="h-4 w-4" />
            Try Again
          </>
        )
      default:
        return (
          <>
            <Share2 className="h-4 w-4" />
            Share Link
          </>
        )
    }
  }

  const toggleScanExpansion = async (scanId: string, symptoms: string[]) => {
    const isExpanded = expandedScans[scanId]

    setExpandedScans((prev) => ({
      ...prev,
      [scanId]: !isExpanded,
    }))

    // If expanding and we don't have analysis yet, fetch it
    if (!isExpanded && !scanAnalyses[scanId] && !analyzingScans[scanId]) {
      setAnalyzingScans((prev) => ({ ...prev, [scanId]: true }))

      try {
        const response = await fetch("/api/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            symptoms: symptoms,
          }),
        })

        const result = await response.json()
        setScanAnalyses((prev) => ({
          ...prev,
          [scanId]: result,
        }))
      } catch (error) {
        console.error("Error analyzing scan:", error)
        setScanAnalyses((prev) => ({
          ...prev,
          [scanId]: {
            success: false,
            error: "Failed to analyze symptoms",
          },
        }))
      } finally {
        setAnalyzingScans((prev) => ({ ...prev, [scanId]: false }))
      }
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 70) return "text-green-400"
    if (confidence >= 50) return "text-yellow-400"
    return "text-red-400"
  }

  const getConfidenceLevel = (confidence: number) => {
    if (confidence >= 70) return "High"
    if (confidence >= 50) return "Medium"
    return "Low"
  }

  if (loading) {
    return (
      <div className="container py-8 md:py-12">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p>Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    return null
  }

  return (
    <div className="container py-8 md:py-12">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tighter md:text-4xl">Profile Dashboard</h1>
        <p className="text-muted-foreground md:text-xl">Welcome back, {profile.name}!</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Profile Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium">Name</p>
                <p className="text-muted-foreground">{profile.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium">Email</p>
                <p className="text-muted-foreground">{profile.email}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Health Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span>Total Scans</span>
                <span className="font-medium">{scans.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last Scan</span>
                <span className="font-medium">
                  {scans.length > 0 ? new Date(scans[0].date).toLocaleDateString() : "No scans yet"}
                </span>
              </div>
            </CardContent>
          </Card>

          <Button asChild className="w-full">
            <Link href="/symptom-checker">New Symptom Check</Link>
          </Button>
        </div>

        {/* Scan History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Previous Scans
              </CardTitle>
              <CardDescription>Your symptom check history with AI analysis</CardDescription>
            </CardHeader>
            <CardContent>
              {scans.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">No scans yet</p>
                  <Button asChild>
                    <Link href="/symptom-checker">Start Your First Scan</Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {scans.map((scan) => (
                    <Card key={scan.id} className="border-l-4 border-l-primary">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(scan.date).toLocaleDateString("en-US", {
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleScanExpansion(scan.id, scan.symptoms)}
                              className="flex items-center gap-2"
                            >
                              <Brain className="h-4 w-4" />
                              {expandedScans[scan.id] ? (
                                <>
                                  Hide Analysis
                                  <ChevronUp className="h-4 w-4" />
                                </>
                              ) : (
                                <>
                                  View Analysis
                                  <ChevronDown className="h-4 w-4" />
                                </>
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleShare(scan)}
                              disabled={sharingStates[scan.id] === "loading"}
                              className="flex items-center gap-2"
                            >
                              {getShareButtonContent(scan.id)}
                            </Button>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div>
                            <p className="font-medium mb-2">Symptoms:</p>
                            <div className="flex flex-wrap gap-2">
                              {scan.symptoms.map((symptom, index) => (
                                <Badge key={index} variant="secondary">
                                  {symptom}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Expanded Analysis Section */}
                          {expandedScans[scan.id] && (
                            <div className="mt-4 pt-4 border-t">
                              {analyzingScans[scan.id] ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="flex flex-col items-center gap-2">
                                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    <p className="text-sm text-muted-foreground">Analyzing symptoms with AI...</p>
                                  </div>
                                </div>
                              ) : scanAnalyses[scan.id] ? (
                                <div className="space-y-4">
                                  {scanAnalyses[scan.id].success ? (
                                    <>
                                      {/* Primary Prediction */}
                                      <div className="bg-primary/5 rounded-lg p-4">
                                        <div className="flex items-center gap-2 mb-2">
                                          <Brain className="h-4 w-4 text-primary" />
                                          <h4 className="font-semibold">AI Analysis Results</h4>
                                        </div>
                                        <div className="space-y-3">
                                          <div>
                                            <p className="text-lg font-medium">
                                              {scanAnalyses[scan.id].primary_prediction}
                                            </p>
                                            <div className="flex items-center gap-2 mt-1">
                                              <span
                                                className={`text-sm font-medium ${getConfidenceColor(scanAnalyses[scan.id].confidence)}`}
                                              >
                                                {scanAnalyses[scan.id].confidence}% Confidence
                                              </span>
                                              <Badge
                                                variant="outline"
                                                className={getConfidenceColor(scanAnalyses[scan.id].confidence)}
                                              >
                                                {getConfidenceLevel(scanAnalyses[scan.id].confidence)}
                                              </Badge>
                                            </div>
                                            <Progress
                                              value={scanAnalyses[scan.id].confidence}
                                              className="w-full h-2 mt-2"
                                            />
                                          </div>
                                        </div>
                                      </div>

                                      {/* Analysis Summary */}
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-muted/50 rounded-lg p-3">
                                          <h5 className="font-medium text-sm mb-2 flex items-center gap-1">
                                            <TrendingUp className="h-3 w-3" />
                                            Analysis Summary
                                          </h5>
                                          <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Symptoms Analyzed:</span>
                                              <span>{scanAnalyses[scan.id].matched_count || scan.symptoms.length}</span>
                                            </div>
                                            <div className="flex justify-between">
                                              <span className="text-muted-foreground">Model Accuracy:</span>
                                              <span>
                                                {scanAnalyses[scan.id].model_info?.accuracy
                                                  ? `${(scanAnalyses[scan.id].model_info.accuracy * 100).toFixed(1)}%`
                                                  : "N/A"}
                                              </span>
                                            </div>
                                          </div>
                                        </div>

                                        <div className="bg-muted/50 rounded-lg p-3">
                                          <h5 className="font-medium text-sm mb-2">Symptom Recognition</h5>
                                          <div className="space-y-1 text-xs">
                                            {scanAnalyses[scan.id].symptoms_analyzed && (
                                              <div>
                                                <span className="text-green-600">
                                                  ✓ Recognized ({scanAnalyses[scan.id].symptoms_analyzed.length})
                                                </span>
                                              </div>
                                            )}
                                            {scanAnalyses[scan.id].unmatched_symptoms &&
                                              scanAnalyses[scan.id].unmatched_symptoms.length > 0 && (
                                                <div>
                                                  <span className="text-yellow-600">
                                                    ⚠ Unrecognized ({scanAnalyses[scan.id].unmatched_symptoms.length})
                                                  </span>
                                                </div>
                                              )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Alternative Predictions */}
                                      {scanAnalyses[scan.id].top_predictions &&
                                        scanAnalyses[scan.id].top_predictions.length > 1 && (
                                          <div className="bg-muted/30 rounded-lg p-3">
                                            <h5 className="font-medium text-sm mb-2">Alternative Possibilities</h5>
                                            <div className="space-y-2">
                                              {scanAnalyses[scan.id].top_predictions.slice(1, 3).map((pred, index) => (
                                                <div key={index} className="flex items-center justify-between text-sm">
                                                  <span>{pred.disease}</span>
                                                  <div className="flex items-center gap-2">
                                                    <span className={`text-xs ${getConfidenceColor(pred.confidence)}`}>
                                                      {pred.confidence}%
                                                    </span>
                                                    <Progress value={pred.confidence} className="w-12 h-1" />
                                                  </div>
                                                </div>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                      {/* Health Recommendations */}
                                      {scanAnalyses[scan.id].recommendations && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                                          <h5 className="font-medium text-sm mb-2 flex items-center gap-1 text-blue-700 dark:text-blue-300">
                                            <AlertTriangle className="h-3 w-3" />
                                            Health Recommendations
                                          </h5>
                                          <ul className="space-y-1 text-xs">
                                            {scanAnalyses[scan.id].recommendations.slice(0, 3).map((rec, index) => (
                                              <li key={index} className="flex items-start gap-1">
                                                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                                                <span className="text-blue-800 dark:text-blue-200">{rec}</span>
                                              </li>
                                            ))}
                                          </ul>
                                        </div>
                                      )}

                                      {/* Disclaimer */}
                                      <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800">
                                        <AlertTriangle className="h-3 w-3 text-red-600" />
                                        <AlertDescription className="text-xs text-red-800 dark:text-red-200">
                                          <strong>Medical Disclaimer:</strong> This AI analysis is for informational
                                          purposes only and should not replace professional medical advice.
                                        </AlertDescription>
                                      </Alert>
                                    </>
                                  ) : (
                                    <div className="text-center py-4">
                                      <div className="text-red-500 text-sm font-medium mb-1">
                                        <AlertTriangle className="h-4 w-4 mx-auto mb-1" />
                                        Analysis Error
                                      </div>
                                      <p className="text-red-400 text-xs">{scanAnalyses[scan.id].error}</p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="text-center py-4">
                                  <p className="text-muted-foreground text-sm">
                                    Click "View Analysis" to see AI-powered results
                                  </p>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
