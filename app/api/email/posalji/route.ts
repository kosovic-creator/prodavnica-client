import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
  try {
    const { email, subject, text, html } = await request.json();

    if (!email || !subject || (!text && !html)) {
      return NextResponse.json({
        error: 'Email, subject i sadržaj (text ili html) su obavezni'
      }, { status: 400 });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return NextResponse.json({
        success: false,
        message: 'Email servis nije konfigurisan'
      });
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      text: text || undefined,
      html: html || undefined,
    };

    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Email uspešno poslat'
    });

  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Greška pri slanju email-a',
      details: error instanceof Error ? error.message : 'Nepoznata greška'
    }, { status: 500 });
  }
}