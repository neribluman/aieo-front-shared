import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { email, url } = await request.json();

    await resend.emails.send({
      from: 'onboarding@resend.dev', // Use this until you verify your domain
      to: 'neriabluman@gmail.com',
      subject: 'New Analysis Request from xfunnel.ai',
      html: `
        <h2>New Analysis Request</h2>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Product URL:</strong> ${url}</p>
        <p><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
      `
    });

    return Response.json({ success: true });
  } catch (error) {
    console.error('Email error:', error);
    return Response.json({ error: 'Failed to send email' }, { status: 500 });
  }
} 