import { NextResponse } from "next/server";

export async function GET() {
  try {
    const backendUrl =
      process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
    const response = await fetch(`${backendUrl}/ticker/pairs`);

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch data from the backend" },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: "An error occurred while fetching data from the backend" },
      { status: 500 }
    );
  }
}
