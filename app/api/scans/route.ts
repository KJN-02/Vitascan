import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { scanId, symptoms, date, userName } = body

    console.log("Creating shared scan with data:", { scanId, symptoms, date, userName })

    // Validate required fields
    if (!symptoms || !Array.isArray(symptoms) || symptoms.length === 0) {
      return NextResponse.json({ success: false, error: "Symptoms are required" }, { status: 400 })
    }

    if (!userName) {
      return NextResponse.json({ success: false, error: "User name is required" }, { status: 400 })
    }

    // Generate a unique ID for the shared scan
    const shareId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)

    // Set expiration date (30 days from now)
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + 30)

    const { data, error } = await supabase
      .from("shared_scans")
      .insert({
        id: shareId,
        scan_id: scanId,
        user_name: userName,
        symptoms,
        date,
        expires_at: expiresAt.toISOString(),
      })
      .select()
      .single()

    if (error) {
      console.error("Supabase error:", error)
      return NextResponse.json(
        { success: false, error: "Failed to create shared scan: " + error.message },
        { status: 500 },
      )
    }

    const baseUrl =
      process.env.NEXT_PUBLIC_BASE_URL ||
      (request.headers.get("host") ? `https://${request.headers.get("host")}` : "http://localhost:3000")

    const shareUrl = `${baseUrl}/shared/${shareId}`

    console.log("Successfully created shared scan:", { shareId, shareUrl })

    return NextResponse.json({
      success: true,
      shareId,
      shareUrl,
      data,
    })
  } catch (error) {
    console.error("Error creating shared scan:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to create shared scan: " + (error instanceof Error ? error.message : "Unknown error"),
      },
      { status: 500 },
    )
  }
}
