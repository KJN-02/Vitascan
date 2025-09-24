import { type NextRequest, NextResponse } from "next/server"
import { spawn } from "child_process"
import path from "path"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { symptoms } = body

    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json({ success: false, error: "Symptoms array is required" }, { status: 400 })
    }

    // Call Python ML script
    const prediction = await callMLModel(symptoms)

    return NextResponse.json(prediction)
  } catch (error) {
    console.error("Prediction error:", error)
    return NextResponse.json({ success: false, error: "Failed to process prediction" }, { status: 500 })
  }
}

function callMLModel(symptoms: string[]): Promise<any> {
  return new Promise((resolve, reject) => {
    const scriptPath = path.join(process.cwd(), "scripts", "predict.py")
    const pythonProcess = spawn("python3", [scriptPath, JSON.stringify(symptoms)])

    let dataString = ""
    let errorString = ""

    pythonProcess.stdout.on("data", (data) => {
      dataString += data.toString()
    })

    pythonProcess.stderr.on("data", (data) => {
      errorString += data.toString()
    })

    pythonProcess.on("close", (code) => {
      if (code !== 0) {
        console.error("Python script error:", errorString)
        reject(new Error(`Python script failed with code ${code}: ${errorString}`))
        return
      }

      try {
        const result = JSON.parse(dataString.trim())
        resolve(result)
      } catch (parseError) {
        console.error("Failed to parse Python output:", dataString)
        reject(new Error("Failed to parse ML model output"))
      }
    })

    pythonProcess.on("error", (error) => {
      console.error("Failed to start Python process:", error)
      reject(new Error("Failed to start ML prediction process"))
    })
  })
}
