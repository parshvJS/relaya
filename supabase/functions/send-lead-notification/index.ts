import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface LeadNotification {
  name: string;
  email: string;
  website?: string;
  inquiryType: string;
  message: string;
  submittedAt: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const resendApiKey = Deno.env.get("RESEND_API_KEY");
    
    if (!resendApiKey) {
      console.log("RESEND_API_KEY not configured - skipping email notification");
      return new Response(
        JSON.stringify({ success: true, skipped: true, message: "Email notifications not configured" }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    const lead: LeadNotification = await req.json();

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #1a1a2e; border-bottom: 2px solid #6366f1; padding-bottom: 10px;">
          🎯 New Lead Received
        </h2>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <p style="margin: 8px 0;"><strong>Name:</strong> ${lead.name}</p>
          <p style="margin: 8px 0;"><strong>Email:</strong> <a href="mailto:${lead.email}">${lead.email}</a></p>
          ${lead.website ? `<p style="margin: 8px 0;"><strong>Website:</strong> <a href="${lead.website}">${lead.website}</a></p>` : ''}
          <p style="margin: 8px 0;"><strong>Inquiry Type:</strong> ${lead.inquiryType}</p>
        </div>
        
        <div style="background: #fff; border: 1px solid #e2e8f0; padding: 20px; border-radius: 8px;">
          <h3 style="margin-top: 0; color: #475569;">Message:</h3>
          <p style="color: #334155; line-height: 1.6;">${lead.message}</p>
        </div>
        
        <p style="color: #94a3b8; font-size: 12px; margin-top: 20px;">
          Submitted at: ${new Date(lead.submittedAt).toLocaleString()}
        </p>
      </div>
    `;

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendApiKey}`,
      },
      body: JSON.stringify({
        from: "Lead Notifications <notifications@resend.dev>",
        to: ["admin@yourdomain.com"], // Update this with your email
        subject: `New Lead: ${lead.name} - ${lead.inquiryType}`,
        html: emailHtml,
      }),
    });

    if (!res.ok) {
      const error = await res.text();
      console.error("Resend API error:", error);
      throw new Error(`Failed to send email: ${error}`);
    }

    const data = await res.json();
    console.log("Lead notification email sent:", data.id);

    return new Response(
      JSON.stringify({ success: true, emailId: data.id }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error sending lead notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);
