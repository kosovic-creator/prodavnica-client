// ...removed deprecated config export...
import { NextRequest, NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  [key: string]: unknown;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('slika') as File;
    const id = formData.get('id') as string;

    if (!file || typeof file === 'string' || !id) {
      return NextResponse.json({ error: 'Podaci nisu poslati' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload na Cloudinary
    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'web-trgovina',
          public_id: `${id}_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      slika: result.secure_url
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Greška pri uploadu slike' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const body = await req.json();
    const { slikaUrl } = body;

    if (!slikaUrl) {
      return NextResponse.json({ error: 'URL slike nije prosleđen' }, { status: 400 });
    }

    // Extract public_id from Cloudinary URL
    if (slikaUrl.includes('cloudinary.com')) {
      try {
        const publicId = slikaUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.log('Error deleting from Cloudinary:', error);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json({ error: 'Greška pri brisanju slike' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('slika') as File;
    const id = formData.get('id') as string;
    const oldImageUrl = formData.get('oldImageUrl') as string;

    if (!file || typeof file === 'string' || !id) {
      return NextResponse.json({ error: 'Podaci nisu poslati' }, { status: 400 });
    }

    // Delete old image from Cloudinary if it exists
    if (oldImageUrl && oldImageUrl.includes('cloudinary.com')) {
      try {
        const publicId = oldImageUrl.split('/').slice(-2).join('/').split('.')[0];
        await cloudinary.uploader.destroy(publicId);
      } catch (error) {
        console.error('Error deleting old image:', error);
      }
    }

    // Upload new image to Cloudinary
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const result = await new Promise<CloudinaryUploadResult>((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        {
          resource_type: 'auto',
          folder: 'web-trgovina',
          public_id: `${id}_${Date.now()}`,
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result as CloudinaryUploadResult);
        }
      ).end(buffer);
    });

    return NextResponse.json({
      success: true,
      slika: result.secure_url
    });

  } catch (error) {
    console.error('Update error:', error);
    return NextResponse.json({ error: 'Greška pri ažuriranju slike' }, { status: 500 });
  }
}