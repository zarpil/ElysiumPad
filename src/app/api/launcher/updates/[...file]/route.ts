import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

const UPDATES_DIR = path.join(process.cwd(), 'public', 'updates');

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ file: string[] }> }
) {
  try {
    const resolvedParams = await params;
    const fileParts = resolvedParams.file || [];
    const fileName = fileParts.join('/');

    // Prevenir Path Traversal
    const safeFileName = path.normalize(fileName).replace(/^(\.\.[\/\\])+/, '');
    const filePath = path.join(UPDATES_DIR, safeFileName);

    try {
      const stats = await fs.stat(filePath);
      if (!stats.isFile()) {
        return new NextResponse('Not Found', { status: 404 });
      }

      const fileBuffer = await fs.readFile(filePath);
      const ext = path.extname(safeFileName).toLowerCase();

      let contentType = 'application/octet-stream';
      if (ext === '.yml' || ext === '.yaml') {
        contentType = 'text/yaml; charset=utf-8';
      } else if (ext === '.json') {
        contentType = 'application/json';
      } else if (ext === '.exe') {
        contentType = 'application/vnd.microsoft.portable-executable';
      }

      return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
          'Content-Type': contentType,
          'Content-Length': stats.size.toString(),
          // Cache busting para el manifiesto y cache inmutable para los binarios
          'Cache-Control': ext === '.yml' ? 'no-cache, no-store, must-revalidate' : 'public, max-age=31536000, immutable',
        },
      });
    } catch {
      // Si el launcher pide latest.yml pero aún no se ha publicado ninguna actualización superior
      if (safeFileName === 'latest.yml') {
        return new NextResponse(null, { status: 204 }); // 204 No Content: No hay nueva actualización
      }
      return new NextResponse('File Not Found', { status: 404 });
    }
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
