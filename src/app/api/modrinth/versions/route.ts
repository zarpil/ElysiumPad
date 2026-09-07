import { NextRequest, NextResponse } from 'next/server';
import { getModrinthProjectVersions } from '@/lib/modrinth';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    const version = searchParams.get('version');
    const loader = searchParams.get('loader');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Project ID required' }, { status: 400 });
    }

    const versions = await getModrinthProjectVersions(
      id,
      loader ? [loader] : undefined,
      version ? [version] : undefined
    );

    return NextResponse.json({ success: true, versions });
  } catch (error: any) {
    console.error('Error in /api/modrinth/versions:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch versions' },
      { status: 500 }
    );
  }
}
