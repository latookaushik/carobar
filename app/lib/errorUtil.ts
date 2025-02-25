// lib/errorUtil.ts
// This module provides utility functions for creating error responses to return to the client.

import { NextResponse } from 'next/server';

export function createErrorResponse(message: string, status: number) {
  return NextResponse.json({ error: message }, { status });
}
