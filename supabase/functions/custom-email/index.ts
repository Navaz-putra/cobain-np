
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, email, name, redirectTo } = await req.json();
    
    console.log(`Email to be sent to: ${email}, type: ${type}, name: ${name}`);
    
    // Here we would customize the email template based on the type
    // For example, for 'confirmation', we'd generate a professional email template
    // This is a placeholder for actual email sending logic
    // In a real implementation, you would use this data to customize the email template
    // through Supabase's email templates or another email service
    
    const emailContent = {
      subject: "Konfirmasi Pendaftaran COBAIN - Verifikasi Email Anda",
      body: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <img src="https://your-logo-url.com" alt="COBAIN Logo" style="max-width: 150px; display: block; margin-bottom: 20px;">
          
          <h1 style="color: #2563EB; margin-bottom: 20px;">Verifikasi Alamat Email Anda</h1>
          
          <p>Yang terhormat ${name},</p>
          
          <p>Terima kasih telah mendaftar di platform COBAIN. Untuk melanjutkan proses pendaftaran, silakan verifikasi alamat email Anda dengan mengklik tombol di bawah ini:</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="{verification_link}" style="background-color: #2563EB; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">Verifikasi Email</a>
          </div>
          
          <p>Jika Anda tidak dapat mengklik tombol di atas, silakan salin dan tempel tautan berikut ke browser Anda:</p>
          <p style="word-break: break-all; color: #2563EB;">{verification_link}</p>
          
          <p>Link ini akan kedaluwarsa dalam 24 jam. Jika Anda tidak melakukan pendaftaran ini, silakan abaikan email ini.</p>
          
          <p>Terima kasih,<br>Tim COBAIN</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eaeaea; font-size: 12px; color: #666;">
            <p>Email ini dikirim secara otomatis, mohon tidak membalas email ini.</p>
            <p>© 2025 COBAIN. All rights reserved.</p>
          </div>
        </div>
      `,
    };
    
    return new Response(
      JSON.stringify({
        success: true,
        message: "Email template customized",
        emailContent,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error in custom-email function:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
