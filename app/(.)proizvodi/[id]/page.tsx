import React from 'react';
import { getProizvodById } from '@/lib/actions';
import ImageModalClient from './ImageModalClient';
import { notFound } from 'next/navigation';

interface InterceptedImagePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function InterceptedImagePage({ params }: InterceptedImagePageProps) {
  const resolvedParams = await params;

  console.log('Intercepted image route - loading product:', resolvedParams.id);
  const result = await getProizvodById(resolvedParams.id);

  if (!result.success || !result.data || !result.data.slike || result.data.slike.length === 0) {
    console.log('Intercepted image route - product or images not found:', resolvedParams.id);
    notFound();
  }

  console.log('Intercepted image route - images loaded:', result.data.slike);
  return <ImageModalClient proizvod={{ ...result.data, slika: result.data.slike?.[0] ?? '' }} />;
}