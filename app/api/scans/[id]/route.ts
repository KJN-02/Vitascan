import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase-server"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const supabase = await createClient()
    const { id } = params

    const { data: sharedScan, error } = await supabase
      .from("shared_scans")
      .select("*")
      .eq("id", id)
      .gt("expires_at", new Date().toISOString())
      .single()

    if (error || !sharedScan) {
      return NextResponse.json({ success: false, error: "Scan not found or expired" }, { status: 404 })
    }

    return NextResponse.json({ success: true, scan: sharedScan })
  } catch (error) {
    console.error("Error fetching shared scan:", error)
    return NextResponse.json({ success: false, error: "Failed to fetch scan" }, { status: 500 })
  }
}
