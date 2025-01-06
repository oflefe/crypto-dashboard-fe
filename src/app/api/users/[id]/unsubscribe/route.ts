import { NextResponse } from "next/server";

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const { id } = await params;
  const url = new URL(request.url);
  const symbol = url.searchParams.get("symbol");

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/${id}/unsubscribe?symbol=${symbol}`,
      {
        method: "DELETE",
      }
    );

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Error unsubscribing from pair:", error);
    return NextResponse.json(
      { error: "Failed to unsubscribe from pair" },
      { status: 500 }
    );
  }
}
