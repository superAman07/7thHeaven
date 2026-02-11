import { Resend } from 'resend';

// Initialize Resend with API Key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions): Promise<boolean> {
  try {
    const data = await resend.emails.send({
      from: 'Celsius <onboarding@resend.dev>', // Default sender for testing
      to: [to],
      subject: subject,
      html: html,
      replyTo: replyTo,
    });

    if (data.error) {
      console.error('❌ Resend Error:', data.error);
      return false;
    }

    console.log(`📧 Email sent to ${to}: ${subject} (ID: ${data.data?.id})`);
    return true;
  } catch (error) {
    console.error('❌ Email send failed:', error);
    return false;
  }
}

// Convenience function for order confirmation emails
export async function sendOrderConfirmation(email: string, orderDetails: {
  orderId: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}) {
  const itemsHtml = orderDetails.items.map(item =>
    `<tr><td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name}</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity}</td><td style="padding: 8px; border-bottom: 1px solid #eee;">₹${item.price.toLocaleString()}</td></tr>`
  ).join('');

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ddb040; margin: 0; font-size: 28px;">Celsius</h1>
        <p style="color: #fff; margin: 10px 0 0;">Order Confirmation</p>
      </div>
      <div style="background: #fff; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Thank you for your order, ${orderDetails.customerName}!</h2>
        <p style="color: #666;">Your order <strong>#${orderDetails.orderId}</strong> has been confirmed and is being processed.</p>
        
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 12px; text-align: left;">Item</th>
              <th style="padding: 12px; text-align: left;">Qty</th>
              <th style="padding: 12px; text-align: left;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="2" style="padding: 12px; font-weight: bold;">Total</td>
              <td style="padding: 12px; font-weight: bold; color: #ddb040;">₹${orderDetails.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        
        <p style="color: #666; font-size: 14px;">We'll send you another email when your order ships.</p>
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://main.d28eoqxdlhl7na.amplifyapp.com/track-order" style="background: #ddb040; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Your Order</a>
        </div>
      </div>
      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">© 2026 Celsius. All rights reserved.</p>
    </div>
  `;

  return sendEmail({ to: email, subject: `Order Confirmed! #${orderDetails.orderId.slice(-8).toUpperCase()}`, html });
}

// Order status update email
export async function sendOrderStatusUpdate(email: string, details: {
  orderId: string;
  customerName: string;
  status: string;
  message?: string;
}) {
  const statusColors: Record<string, string> = {
    PROCESSING: '#3b82f6',
    SHIPPED: '#8b5cf6',
    OUT_FOR_DELIVERY: '#f59e0b',
    DELIVERED: '#22c55e',
    CANCELLED: '#ef4444',
  };

  const statusEmoji: Record<string, string> = {
    PROCESSING: '⏳',
    SHIPPED: '📦',
    OUT_FOR_DELIVERY: '🚚',
    DELIVERED: '✅',
    CANCELLED: '❌',
  };

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ddb040; margin: 0; font-size: 28px;">Celsius</h1>
        <p style="color: #fff; margin: 10px 0 0;">Order Update</p>
      </div>
      <div style="background: #fff; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${details.customerName}!</h2>
        <p style="color: #666;">Your order <strong>#${details.orderId.slice(-8).toUpperCase()}</strong> has been updated:</p>
        
        <div style="background: ${statusColors[details.status] || '#666'}; color: #fff; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <span style="font-size: 40px;">${statusEmoji[details.status] || '📋'}</span>
          <h3 style="margin: 10px 0 0; font-size: 24px;">${details.status.replace(/_/g, ' ')}</h3>
        </div>
        
        ${details.message ? `<p style="color: #666; background: #f5f5f5; padding: 15px; border-radius: 5px;">${details.message}</p>` : ''}
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://main.d28eoqxdlhl7na.amplifyapp.com/track-order" style="background: #ddb040; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Track Your Order</a>
        </div>
      </div>
      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">© 2026 Celsius. All rights reserved.</p>
    </div>
  `;

  return sendEmail({ to: email, subject: `Order Update: ${details.status.replace(/_/g, ' ')} - #${details.orderId.slice(-8).toUpperCase()}`, html });
}

// OTP email
export async function sendOTPEmail(email: string, otp: string, name: string = 'Customer') {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ddb040; margin: 0; font-size: 28px;">Celsius</h1>
        <p style="color: #fff; margin: 10px 0 0;">Login Verification</p>
      </div>
      <div style="background: #fff; padding: 30px; border-radius: 0 0 10px 10px; text-align: center;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name}!</h2>
        <p style="color: #666;">Your one-time password (OTP) is:</p>
        
        <div style="background: linear-gradient(135deg, #ddb040 0%, #f59e0b 100%); color: #000; font-size: 36px; font-weight: bold; letter-spacing: 8px; padding: 20px 40px; border-radius: 10px; display: inline-block; margin: 20px 0;">
          ${otp}
        </div>
        
        <p style="color: #999; font-size: 14px;">This code expires in 10 minutes. Do not share it with anyone.</p>
      </div>
      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">© 2026 Celsius. All rights reserved.</p>
    </div>
  `;

  return sendEmail({ to: email, subject: `Your Celsius Login OTP: ${otp}`, html });
}

// Welcome email for new users
export async function sendWelcomeEmail(email: string, name: string, referralCode?: string) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ddb040; margin: 0; font-size: 28px;">Welcome to Celsius!</h1>
        <p style="color: #fff; margin: 10px 0 0;">Your journey to premium fragrances begins</p>
      </div>
      <div style="background: #fff; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name}! 🎉</h2>
        <p style="color: #666;">Thank you for joining the Celsius family. We're thrilled to have you!</p>
        
        ${referralCode ? `
        <div style="background: linear-gradient(135deg, #fef3c7 0%, #fffbeb 100%); border: 2px dashed #ddb040; padding: 20px; border-radius: 10px; margin: 25px 0; text-align: center;">
          <h3 style="color: #92400e; margin: 0 0 10px 0; font-size: 16px; text-transform: uppercase; letter-spacing: 1px;">Your Exclusive Referral Code</h3>
          <div style="font-size: 32px; font-weight: 800; color: #1a1a1a; letter-spacing: 2px; font-family: monospace;">${referralCode}</div>
          <p style="color: #92400e; margin: 10px 0 0 0; font-size: 13px;">Share this code to earn rewards!</p>
        </div>
        ` : ''}

        <div style="background: #f5f5f5; padding: 20px; border-radius: 10px; margin: 20px 0;">
          <h3 style="color: #333; margin-top: 0;">What's next?</h3>
          <ul style="color: #666; padding-left: 20px;">
            <li>Explore our exclusive collection of premium fragrances</li>
            <li>Become a VIP member to unlock special discounts</li>
            <li>Refer friends and earn rewards</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://www.celsiuspop.com" style="background: #ddb040; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Start Shopping</a>
        </div>
      </div>
      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">© 2026 Celsius. All rights reserved.</p>
    </div>
  `;

  return sendEmail({ to: email, subject: `Welcome to Celsius, ${name}! 🎉`, html });
}


// Ticket Confirmation Email
export async function sendTicketConfirmationEmail(
  to: string,
  ticketId: string,
  subject: string,
  customerName: string
) {
  const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #E6B422 0%, #D4A420 100%); padding: 30px; text-align: center;">
                <h1 style="color: #1a1a2e; margin: 0; font-size: 28px;">Ticket Received!</h1>
            </div>
            <div style="padding: 30px; color: #ffffff;">
                <p style="font-size: 16px;">Dear <strong>${customerName}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6;">Thank you for reaching out to us. We have received your support request and our team will get back to you shortly.</p>
                
                <div style="background: rgba(230, 180, 34, 0.1); border-left: 4px solid #E6B422; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #E6B422; font-weight: bold;">Ticket ID: #${ticketId.slice(-8).toUpperCase()}</p>
                    <p style="margin: 10px 0 0 0; color: #cccccc;">Subject: ${subject}</p>
                </div>
                
                <p style="font-size: 14px; color: #888888; line-height: 1.6;">You can track the status of your ticket on our Contact Us page. We typically respond within 24-48 hours.</p>
                
                <p style="font-size: 16px; margin-top: 30px;">Best regards,<br><strong style="color: #E6B422;">Celsius Support Team</strong></p>
            </div>
        </div>
    `;

  await sendEmail({
    to,
    subject: `Ticket Received: ${subject} - Celsius`,
    html
  });
}

// Ticket Response Email
export async function sendTicketResponseEmail(
  to: string,
  ticketId: string,
  ticketSubject: string,
  responseMessage: string,
  customerName: string
) {
  const html = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-radius: 16px; overflow: hidden;">
            <div style="background: linear-gradient(135deg, #E6B422 0%, #D4A420 100%); padding: 30px; text-align: center;">
                <h1 style="color: #1a1a2e; margin: 0; font-size: 28px;">New Response to Your Ticket</h1>
            </div>
            <div style="padding: 30px; color: #ffffff;">
                <p style="font-size: 16px;">Dear <strong>${customerName}</strong>,</p>
                <p style="font-size: 16px; line-height: 1.6;">Our support team has responded to your ticket.</p>
                
                <div style="background: rgba(230, 180, 34, 0.1); border-left: 4px solid #E6B422; padding: 15px; margin: 20px 0; border-radius: 4px;">
                    <p style="margin: 0; color: #E6B422; font-weight: bold;">Ticket: #${ticketId.slice(-8).toUpperCase()}</p>
                    <p style="margin: 5px 0; color: #cccccc; font-size: 14px;">${ticketSubject}</p>
                </div>
                
                <div style="background: rgba(255,255,255,0.05); padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0; color: #E6B422; font-size: 14px; font-weight: bold;">Response:</p>
                    <p style="margin: 10px 0 0 0; color: #ffffff; line-height: 1.6;">${responseMessage}</p>
                </div>
                
                <p style="font-size: 14px; color: #888888;">Visit the Contact Us page to view the full conversation and respond if needed.</p>
                
                <p style="font-size: 16px; margin-top: 30px;">Best regards,<br><strong style="color: #E6B422;">Celsius Support Team</strong></p>
            </div>
        </div>
    `;

  await sendEmail({
    to,
    subject: `Response to Ticket #${ticketId.slice(-8).toUpperCase()} - Celsius`,
    html
  });
}

export async function sendAccountStatusUpdate(email: string, name: string, isBlocked: boolean) {
  const statusText = isBlocked ? 'Suspended' : 'Reactivated';
  const color = isBlocked ? '#ef4444' : '#22c55e';
  const emoji = isBlocked ? '⛔' : '✅';

  const message = isBlocked
    ? 'Your account has been suspended due to policy violations or security concerns. You will not be able to login or place orders.'
    : 'Good news! Your account has been reactivated. You can now login and access all features.';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f9f9f9; padding: 20px;">
      <div style="background: linear-gradient(135deg, #1a1a1a 0%, #333 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
        <h1 style="color: #ddb040; margin: 0; font-size: 28px;">Celsius</h1>
        <p style="color: #fff; margin: 10px 0 0;">Account Status Update</p>
      </div>
      <div style="background: #fff; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #333; margin-top: 0;">Hi ${name},</h2>
        
        <div style="background: ${isBlocked ? '#fee2e2' : '#dcfce7'}; color: ${isBlocked ? '#991b1b' : '#166534'}; padding: 20px; border-radius: 10px; text-align: center; margin: 20px 0;">
          <span style="font-size: 40px;">${emoji}</span>
          <h3 style="margin: 10px 0 0; font-size: 24px;">Account ${statusText}</h3>
        </div>
        
        <p style="color: #666; font-size: 16px; line-height: 1.6;">${message}</p>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="https://main.d28eoqxdlhl7na.amplifyapp.com/contact-us" style="background: #ddb040; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">Contact Support</a>
        </div>
      </div>
      <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">© 2026 Celsius. All rights reserved.</p>
    </div>
  `;

  return sendEmail({ to: email, subject: `Account Status Update - Celsius`, html });
}