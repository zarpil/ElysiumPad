import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { generateUploadPresignedUrl, deleteR2Object } from '@/lib/r2';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const body = await req.json();
    const { fileName, assetType, fileSize, sha1, contentType } = body;

    const launcher = await prisma.launcherConfig.findUnique({
      where: { slug },
      include: { user: { select: { plan: true } } },
    });

    if (!launcher) {
      return NextResponse.json({ success: false, error: 'Launcher no encontrado' }, { status: 404 });
    }

    if (launcher.user.plan === 'FREE') {
      return NextResponse.json(
        {
          success: false,
          error: 'La subida de archivos y mods propios requiere una suscripción PRO o LIFETIME',
        },
        { status: 403 }
      );
    }

    const r2Key = `launchers/${launcher.id}/${Date.now()}-${fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`;

    let uploadUrl = '';
    let publicUrl = '';

    // Si Cloudflare R2 está configurado genera URL presignada, sino simula URL para dev
    if (process.env.R2_ACCOUNT_ID && process.env.R2_ACCESS_KEY_ID) {
      const presigned = await generateUploadPresignedUrl(r2Key, contentType || 'application/octet-stream');
      uploadUrl = presigned.uploadUrl;
      publicUrl = presigned.publicUrl;
    } else {
      uploadUrl = `/mock-upload/${r2Key}`;
      publicUrl = `https://cdn.elysiumpad.local/${r2Key}`;
    }

    const asset = await prisma.customAsset.create({
      data: {
        launcherId: launcher.id,
        fileName,
        r2Path: r2Key,
        downloadUrl: publicUrl,
        fileSize: Number(fileSize) || 0,
        sha1: sha1 || null,
        assetType: assetType || 'MOD',
      },
    });

    return NextResponse.json({
      success: true,
      asset,
      uploadUrl,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { searchParams } = new URL(req.url);
    const assetId = searchParams.get('assetId');

    if (!assetId) {
      return NextResponse.json({ success: false, error: 'assetId requerido' }, { status: 400 });
    }

    const asset = await prisma.customAsset.findUnique({
      where: { id: assetId },
    });

    if (asset && process.env.R2_ACCOUNT_ID) {
      try {
        await deleteR2Object(asset.r2Path);
      } catch (err) {
        console.warn('Could not delete from R2:', err);
      }
    }

    await prisma.customAsset.delete({
      where: { id: assetId },
    });

    return NextResponse.json({ success: true, message: 'Asset eliminado' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
