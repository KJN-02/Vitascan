"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Loader2, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/hooks/use-auth"

// Full list of symptoms
const allSymptoms = [
  "Itching",
  "Skin rash",
  "Nodal skin eruptions",
  "Continuous sneezing",
  "Shivering",
  "Chills",
  "Joint pain",
  "Stomach pain",
  "Acidity",
  "Ulcers on tongue",
  "Muscle wasting",
  "Vomiting",
  "Burning micturition",
  "Spotting urination",
  "Fatigue",
  "Weight gain",
  "Anxiety",
  "Cold hands and feet",
  "Mood swings",
  "Weight loss",
  "Restlessness",
  "Lethargy",
  "Patches in throat",
  "Irregular sugar level",
  "Cough",
  "High fever",
  "Sunken eyes",
  "Breathlessness",
  "Sweating",
  "Dehydration",
  "Indigestion",
  "Headache",
  "Yellowish skin",
  "Dark urine",
  "Nausea",
  "Loss of appetite",
  "Pain behind the eyes",
  "Back pain",
  "Constipation",
  "Abdominal pain",
  "Diarrhea",
  "Mild fever",
  "Yellow urine",
  "Yellowing of eyes",
  "Acute liver failure",
  "Fluid overload",
  "Swelling of stomach",
  "Swelled lymph nodes",
  "Malaise",
  "Blurred and distorted vision",
  "Phlegm",
  "Throat irritation",
  "Redness of eyes",
  "Sinus pressure",
  "Runny nose",
  "Congestion",
  "Chest pain",
  "Weakness in limbs",
  "Fast heart rate",
  "Pain during bowel movements",
  "Pain in anal region",
  "Bloody stool",
  "Irritation in anus",
  "Neck pain",
  "Dizziness",
  "Cramps",
  "Bruising",
  "Obesity",
  "Swollen legs",
  "Swollen blood vessels",
  "Puffy face and eyes",
  "Enlarged thyroid",
  "Brittle nails",
  "Swollen extremities",
  "Excessive hunger",
  "Extra-marital contacts",
  "Drying and tingling lips",
  "Slurred speech",
  "Knee pain",
  "Hip joint pain",
  "Muscle weakness",
  "Stiff neck",
  "Swelling joints",
  "Movement stiffness",
  "Spinning movements",
  "Loss of balance",
  "Unsteadiness",
  "Weakness of one body side",
  "Loss of smell",
  "Bladder discomfort",
  "Foul smell of urine",
  "Continuous feel of urine",
  "Passage of gases",
  "Internal itching",
  "Toxic look (typhos)",
  "Depression",
  "Irritability",
  "Muscle pain",
  "Altered sensorium",
  "Red spots over body",
  "Belly pain",
  "Abnormal menstruation",
  "Dischromic patches",
  "Watering from eyes",
  "Increased appetite",
  "Polyuria",
  "Family history",
  "Mucoid sputum",
  "Rusty sputum",
  "Lack of concentration",
  "Visual disturbances",
  "Receiving blood transfusion",
  "Receiving unsterile injections",
  "Coma",
  "Stomach bleeding",
  "Distention of abdomen",
  "History of alcohol consumption",
  "Fluid overload",
  "Blood in sputum",
  "Prominent veins on calf",
  "Palpitations",
  "Painful walking",
  "Pus-filled pimples",
  "Blackheads",
  "Scarring",
  "Skin peeling",
  "Silver-like dusting",
  "Small dents in nails",
  "Inflammatory nails",
  "Blister",
  "Red sore around nose",
  "Yellow crust ooze",
]

// Common symptoms for quick selection
const commonSymptoms = ["Headache", "High fever", "Cough", "Fatigue", "Nausea", "Breathlessness"]

export default function SymptomChecker() {
  const [searchInput, setSearchInput] = useState("")
  const [filteredSymptoms, setFilteredSymptoms] = useState<string[]>([])
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)
  const { user, addScan } = useAuth()

  // Filter symptoms based on search input
  useEffect(() => {
    if (searchInput.trim() === "") {
      setFilteredSymptoms([])
      return
    }

    const filtered = allSymptoms
      .filter((symptom) => symptom.toLowerCase().includes(searchInput.toLowerCase()))
      .slice(0, 10) // Limit to 10 results for better UX

    setFilteredSymptoms(filtered)
    setShowDropdown(true)
  }, [searchInput])

  const handleSymptomSelect = (symptom: string) => {
    if (!selectedSymptoms.includes(symptom)) {
      setSelectedSymptoms([...selectedSymptoms, symptom])
    }
    setSearchInput("")
    setFilteredSymptoms([])
    setShowDropdown(false)
  }

  const handleRemoveSymptom = (symptom: string) => {
    setSelectedSymptoms(selectedSymptoms.filter((s) => s !== symptom))
  }

  const handleAnalyze = async () => {
    if (selectedSymptoms.length === 0) return

    setIsLoading(true)
    setAnalysisResult(null)

    try {
      // Call ML prediction API
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          symptoms: selectedSymptoms,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setAnalysisResult(result)

        // Save scan to user's history if logged in
        if (user) {
          await addScan(selectedSymptoms)
        }
      } else {
        setAnalysisResult({
          success: false,
          error: result.error || "Analysis failed",
        })
      }
    } catch (error) {
      console.error("Analysis error:", error)
      setAnalysisResult({
        success: false,
        error: "Failed to analyze symptoms. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container max-w-4xl py-8 md:py-12">
      <div className="space-y-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tighter md:text-4xl text-center">AI Symptom Checker</h1>
        <p className="text-muted-foreground md:text-xl text-center">
          Search for symptoms or select from common symptoms below to get an AI-powered health assessment.
        </p>
      </div>

      <div className="bg-black text-white p-8 rounded-lg">
        <div className="relative mb-6">
          <Input
            placeholder="SEARCH"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="bg-transparent border-white text-white text-center h-12 text-lg placeholder:text-gray-400"
            onFocus={() => setShowDropdown(true)}
          />

          {/* Search dropdown */}
          {showDropdown && filteredSymptoms.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-gray-800 border border-gray-700 rounded-md shadow-lg max-h-60 overflow-auto">
              {filteredSymptoms.map((symptom, index) => (
                <div
                  key={index}
                  className="px-4 py-2 hover:bg-gray-700 cursor-pointer"
                  onClick={() => handleSymptomSelect(symptom)}
                >
                  {symptom}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Selected symptoms */}
        {selectedSymptoms.length > 0 && (
          <div className="mb-6">
            <p className="text-gray-400 mb-2">Selected Symptoms:</p>
            <div className="flex flex-wrap gap-2">
              {selectedSymptoms.map((symptom, index) => (
                <Badge key={index} className="bg-primary text-white px-3 py-1 flex items-center gap-1">
                  {symptom}
                  <button
                    onClick={() => handleRemoveSymptom(symptom)}
                    className="ml-1 hover:bg-primary-foreground/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Remove {symptom}</span>
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        <p className="text-white mb-2 font-medium">COMMON SYMPTOMS:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          {commonSymptoms.map((symptom, index) => (
            <Button
              key={index}
              variant="outline"
              className={`border-white hover:bg-white/10 ${
                selectedSymptoms.includes(symptom) ? "bg-white/20 text-white" : "text-black bg-white"
              }`}
              onClick={() => {
                if (selectedSymptoms.includes(symptom)) {
                  handleRemoveSymptom(symptom)
                } else {
                  handleSymptomSelect(symptom)
                }
              }}
            >
              {symptom}
            </Button>
          ))}
        </div>

        <Button
          className="w-full mb-6 bg-primary hover:bg-primary/90"
          onClick={handleAnalyze}
          disabled={selectedSymptoms.length === 0 || isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Analyzing...
            </>
          ) : (
            "Analyze Symptoms"
          )}
        </Button>

        <Card className="bg-transparent border-white">
          <CardContent className="p-6 min-h-[200px]">
            {isLoading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
                <p>Analyzing symptoms with AI...</p>
              </div>
            ) : analysisResult ? (
              <div className="space-y-4">
                {analysisResult.success ? (
                  <>
                    <div className="text-center">
                      <h3 className="text-xl font-semibold text-white mb-2">AI Analysis Results</h3>
                      <div className="bg-primary/20 rounded-lg p-4 mb-4">
                        <p className="text-lg font-medium text-white">
                          Primary Prediction: {analysisResult.primary_prediction}
                        </p>
                        <p className="text-sm text-gray-300">Confidence: {analysisResult.confidence}%</p>
                      </div>
                    </div>

                    {analysisResult.top_predictions && analysisResult.top_predictions.length > 1 && (
                      <div>
                        <h4 className="font-medium text-white mb-2">Other Possibilities:</h4>
                        <div className="space-y-2">
                          {analysisResult.top_predictions.slice(1, 4).map((pred, index) => (
                            <div key={index} className="flex justify-between text-sm">
                              <span className="text-gray-300">{pred.disease}</span>
                              <span className="text-gray-400">{pred.confidence}%</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {analysisResult.recommendations && (
                      <div>
                        <h4 className="font-medium text-white mb-2">Recommendations:</h4>
                        <ul className="text-sm text-gray-300 space-y-1">
                          {analysisResult.recommendations.slice(0, 3).map((rec, index) => (
                            <li key={index}>• {rec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="text-xs text-gray-400 mt-4 p-3 bg-gray-800/50 rounded">
                      ⚠️ This AI analysis is for informational purposes only and should not replace professional medical
                      advice.
                    </div>
                  </>
                ) : (
                  <div className="text-center text-red-400">
                    <p>Analysis Error: {analysisResult.error}</p>
                    <p className="text-sm text-gray-400 mt-2">Make sure the ML model is set up correctly.</p>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-center">
                OUTPUT
                <br />
                Select symptoms and click "Analyze Symptoms" to see AI-powered results
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
