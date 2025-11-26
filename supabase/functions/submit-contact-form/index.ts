import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ContactFormRequest {
  name: string;
  email: string;
  phone?: string;
  company?: string;
  message: string;
  sourcePage?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, company, message, sourcePage }: ContactFormRequest = await req.json();

    console.log("Processing contact form submission:", { name, email, sourcePage });

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    // Store submission in database
    const { data, error: dbError } = await supabase
      .from("contact_submissions")
      .insert({
        name,
        email,
        phone,
        company,
        message,
        source_page: sourcePage || "paraplanning",
      })
      .select()
      .single();

    if (dbError) {
      console.error("Database error:", dbError);
      throw new Error(`Failed to store submission: ${dbError.message}`);
    }

    console.log("Contact submission stored:", data.id);

    // Send notification email to company
    const emailHtml = `
      <h2>New Contact Form Submission</h2>
      <p><strong>From:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
      ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
      <p><strong>Source:</strong> ${sourcePage || "paraplanning"} page</p>
      <hr>
      <p><strong>Message:</strong></p>
      <p>${message.replace(/\n/g, "<br>")}</p>
      <hr>
      <p style="color: #666; font-size: 12px;">Submission ID: ${data.id}</p>
    `;

    const emailResponse = await resend.emails.send({
      from: "FlowPulse Contacts <onboarding@resend.dev>",
      to: ["support@flowpulse.co.uk"],
      subject: `New Contact: ${name} - ${sourcePage || "Paraplanning"}`,
      html: emailHtml,
    });

    console.log("Notification email sent:", emailResponse);

    // Send confirmation email to user
    const confirmationHtml = `
      <h2>Thank you for contacting FlowPulse</h2>
      <p>Dear ${name},</p>
      <p>We have received your inquiry and will get back to you as soon as possible.</p>
      <p>A member of our team will review your message and respond within 24 hours.</p>
      <br>
      <p>Best regards,</p>
      <p><strong>The FlowPulse Team</strong></p>
      <hr>
      <p style="color: #666; font-size: 12px;">This is an automated confirmation email.</p>
    `;

    await resend.emails.send({
      from: "FlowPulse Support <onboarding@resend.dev>",
      to: [email],
      subject: "We received your message - FlowPulse",
      html: confirmationHtml,
    });

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Contact form submitted successfully",
        id: data.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in submit-contact-form function:", error);
    return new Response(
      JSON.stringify({ 
        success: false,
        error: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
