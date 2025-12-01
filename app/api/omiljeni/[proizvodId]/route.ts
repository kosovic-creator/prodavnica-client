import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/authOptions';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ proizvodId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { proizvodId } = await params;

    await prisma.omiljeni.deleteMany({
      where: {
        korisnikId: session.user.id,
        proizvodId: proizvodId
      }
    });

    return NextResponse.json({ message: 'Removed from omiljeni' });
  } catch (error) {
    console.error('Error removing omiljeni:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}