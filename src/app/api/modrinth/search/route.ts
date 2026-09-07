import { NextRequest, NextResponse } from 'next/server';
import { searchModrinthMods } from '@/lib/modrinth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q') || '';
    const version = searchParams.get('version') || undefined;
    const loader = searchParams.get('loader') || undefined;
    const limit = Number(searchParams.get('limit')) || 20;

    const hits = await searchModrinthMods({
      query,
      version,
      loader,
      limit,
    });

    return NextResponse.json({ success: true, hits });
  } catch (error: any) {
    console.error('Error in /api/modrinth/search:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to search mods' },
      { status: 500 }
    );
  }
}
