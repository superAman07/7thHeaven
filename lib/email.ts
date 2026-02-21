import { Resend } from 'resend';

const getResend = () => new Resend(process.env.RESEND_API_KEY!);

// SITE CONFIGURATION
const SITE_URL = 'https://www.celsiuspop.com';
const LOGO_URL = `${SITE_URL}/assets/images/logo.png`;

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions): Promise<boolean> {
  try {
    const data = await getResend().emails.send({
      from: 'Celsius <support@celsiuspop.com>', // Update this once you verify your domain in Resend
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

// ----------------------------------------------------------------------
// 1. ORDER CONFIRMATION EMAIL
// ----------------------------------------------------------------------
export async function sendOrderConfirmation(email: string, orderDetails: {
  orderId: string;
  customerName: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
  subtotal?: number;
  discount?: number;
}) {
  const itemsHtml = orderDetails.items.map(item =>
    `<tr>
            <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333;">${item.name}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333; text-align: center;">${item.quantity}</td>
            <td style="padding: 12px; border-bottom: 1px solid #eee; color: #333; text-align: right;">₹${item.price.toLocaleString()}</td>
        </tr>`
  ).join('');

  const subtotalRow = orderDetails.subtotal ? `
        <tr>
            <td colspan="2" style="padding: 10px 15px; font-weight: 600; text-align: right; border-top: 2px solid #eee; color: #666;">Subtotal</td>
            <td style="padding: 10px 15px; font-weight: 600; text-align: right; border-top: 2px solid #eee; color: #333;">₹${orderDetails.subtotal.toLocaleString()}</td>
        </tr>` : '';

  const discountRow = orderDetails.discount ? `
        <tr>
            <td colspan="2" style="padding: 5px 15px; font-weight: 600; text-align: right; color: #22c55e;">Discount</td>
            <td style="padding: 5px 15px; font-weight: 600; text-align: right; color: #22c55e;">- ₹${orderDetails.discount.toLocaleString()}</td>
        </tr>` : '';

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 20px;">
      
      <!-- HEADER with LOGO -->
      <div style="background: #0d0b09; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="${LOGO_URL}" alt="Celsius" style="max-height: 50px; width: auto;" />
      </div>

      <!-- BODY -->
      <div style="background: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h2 style="color: #333; margin-top: 0; font-weight: 600; text-align: center;">Order Confirmed!</h2>
        <p style="color: #666; text-align: center; margin-bottom: 30px;">
            Hi ${orderDetails.customerName}, your order <strong>#${orderDetails.orderId}</strong> is confirmed.
        </p>

        <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px;">
          <thead>
            <tr style="background: #f9f9f9; text-transform: uppercase; font-size: 12px; letter-spacing: 1px;">
              <th style="padding: 12px; text-align: left; color: #888;">Item</th>
              <th style="padding: 12px; text-align: center; color: #888;">Qty</th>
              <th style="padding: 12px; text-align: right; color: #888;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
          <tfoot>
            ${subtotalRow}
            ${discountRow}
            <tr>
              <td colspan="2" style="padding: 15px; font-weight: 700; text-align: right; border-top: 1px solid #eee;">Total Paid</td>
              <td style="padding: 15px; font-weight: 700; text-align: right; color: #ddb040; border-top: 1px solid #eee; font-size: 16px;">₹${orderDetails.total.toLocaleString()}</td>
            </tr>
          </tfoot>
        </table>
        
        <div style="text-align: center; margin-top: 40px;">
          <a href="${SITE_URL}/track-order" style="background: #ddb040; color: #000; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 1px;">Track Your Order</a>
        </div>
      </div>

      <!-- FOOTER -->
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>&copy; 2026 Celsius. All rights reserved.</p>
        <p><a href="${SITE_URL}" style="color: #999; text-decoration: none;">Visit Store</a></p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject: `Order Confirmed! #${orderDetails.orderId}`, html });
}

// ----------------------------------------------------------------------
// 2. ORDER STATUS UPDATE EMAIL
// ----------------------------------------------------------------------
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
    PROCESSING: 'Processing ⏳',
    SHIPPED: 'Shipped 📦',
    OUT_FOR_DELIVERY: 'Out for Delivery 🚚',
    DELIVERED: 'Delivered ✅',
    CANCELLED: 'Cancelled ❌',
  };

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 20px;">
      
      <div style="background: #0d0b09; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="${LOGO_URL}" alt="Celsius" style="max-height: 50px; width: auto;" />
      </div>

      <div style="background: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; text-align: center;">
        <h2 style="color: #333; margin-top: 0;">Order Update</h2>
        <p style="color: #666;">Hi ${details.customerName}, your order <strong>#${details.orderId}</strong> status has changed:</p>
        
        <div style="background: ${statusColors[details.status] || '#666'}; color: #fff; padding: 20px; border-radius: 8px; margin: 30px 0; display: inline-block; min-width: 200px;">
          <h3 style="margin: 0; font-size: 18px; text-transform: uppercase; letter-spacing: 1px;">
            ${statusEmoji[details.status] || details.status}
          </h3>
        </div>
        
        ${details.message ? `<p style="background: #f9f9f9; padding: 15px; border-radius: 4px; color: #555; font-style: italic;">"${details.message}"</p>` : ''}
        
        <div style="margin-top: 40px;">
          <a href="${SITE_URL}/track-order" style="background: #ddb040; color: #000; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; text-transform: uppercase;">Track Order</a>
        </div>
      </div>
      
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>&copy; 2026 Celsius. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject: `Order Update: ${details.status} - #${details.orderId}`, html });
}

// ----------------------------------------------------------------------
// 3. OTP EMAIL
// ----------------------------------------------------------------------
export async function sendOTPEmail(email: string, otp: string, name: string = 'Customer') {
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 20px;">
      <div style="background: #0d0b09; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="${LOGO_URL}" alt="Celsius" style="max-height: 50px; width: auto;" />
      </div>

      <div style="background: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; text-align: center;">
        <h2 style="color: #333; margin-top: 0;">Login Verification</h2>
        <p style="color: #666;">Hi ${name}, use the code below to securely login to your account.</p>
        
        <div style="background: #fdf6e3; border: 2px dashed #ddb040; color: #333; font-size: 32px; font-weight: 700; letter-spacing: 6px; padding: 20px; border-radius: 8px; display: inline-block; margin: 25px 0;">
          ${otp}
        </div>
        
        <p style="color: #999; font-size: 13px;">This code expires in 10 minutes. Do not share it.</p>
      </div>
       <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>&copy; 2026 Celsius. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject: `Your Login Code: ${otp}`, html });
}

// ----------------------------------------------------------------------
// 4. WELCOME EMAIL
// ----------------------------------------------------------------------
export async function sendWelcomeEmail(email: string, name: string, referralCode?: string) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 20px;">
      <div style="background: #0d0b09; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="${LOGO_URL}" alt="Celsius" style="max-height: 50px; width: auto;" />
      </div>

      <div style="background: #ffffff; padding: 40px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #333; margin-top: 0; text-align: center;">Welcome to Celsius!</h2>
        <p style="color: #666; text-align: center;">Hi ${name}, thank you for joining our exclusive community of fragrance lovers.</p>
        
        ${referralCode ? `
        <div style="background: #fffbeb; border: 1px solid #fcd34d; padding: 20px; border-radius: 8px; margin: 30px 0; text-align: center;">
          <h3 style="color: #92400e; margin: 0 0 5px 0; font-size: 14px; text-transform: uppercase;">Your Referral Code</h3>
          <div style="font-size: 24px; font-weight: 800; color: #1a1a1a; letter-spacing: 1px; font-family: monospace;">${referralCode}</div>
          <p style="color: #92400e; margin: 5px 0 0 0; font-size: 12px;">Share & Earn Rewards</p>
        </div>
        ` : ''}

        <div style="background: #fafafa; padding: 20px; border-radius: 8px; border: 1px solid #eee;">
          <h3 style="color: #333; font-size: 16px; margin-top: 0;">What's Next?</h3>
          <ul style="color: #666; padding-left: 20px; margin-bottom: 0;">
            <li style="margin-bottom: 8px;">Explore our signature collections</li>
            <li style="margin-bottom: 8px;">Enjoy member-only perks</li>
            <li>Track your orders easily</li>
          </ul>
        </div>
        
        <div style="text-align: center; margin-top: 30px;">
          <a href="${SITE_URL}" style="background: #ddb040; color: #000; padding: 12px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; text-transform: uppercase; font-size: 14px;">Start Shopping</a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>&copy; 2026 Celsius. All rights reserved.</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject: `Welcome to Celsius, ${name}!`, html });
}

// ----------------------------------------------------------------------
// 5. TICKET CONFIRMATION
// ----------------------------------------------------------------------
export async function sendTicketConfirmationEmail(to: string, ticketId: string, subject: string, customerName: string) {
  const html = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 20px;">
            <div style="background: #0d0b09; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <img src="${LOGO_URL}" alt="Celsius" style="max-height: 50px; width: auto;" />
            </div>
            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 8px 8px;">
                <h2 style="color: #333; margin-top: 0; text-align: center;">Support Ticket Received</h2>
                <p style="color: #666;">Dear ${customerName},</p>
                <p style="color: #666;">We have received your request. Our team is looking into it.</p>
                
                <div style="background: #f8f9fa; border-left: 4px solid #ddb040; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #333; font-weight: bold;">Ticket: #${ticketId}</p>
                    <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">"${subject}"</p>
                </div>
                
                <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px;">We usually respond within 24 hours.</p>
            </div>
        </div>
    `;

  await sendEmail({ to, subject: `Ticket Received: ${subject}`, html });
}

// ----------------------------------------------------------------------
// 6. TICKET RESPONSE
// ----------------------------------------------------------------------
export async function sendTicketResponseEmail(to: string, ticketId: string, ticketSubject: string, responseMessage: string, customerName: string) {
  const html = `
        <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 20px;">
            <div style="background: #0d0b09; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
                <img src="${LOGO_URL}" alt="Celsius" style="max-height: 50px; width: auto;" />
            </div>
            <div style="background: #ffffff; padding: 40px; border-radius: 0 0 8px 8px;">
                <h2 style="color: #333; margin-top: 0; text-align: center;">New Reply to Ticket</h2>
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 25px;">
                   <p style="margin: 0; font-weight: bold; color: #333;">Support Replied:</p>
                   <p style="margin: 10px 0 0 0; color: #555; line-height: 1.6;">${responseMessage}</p>
                </div>
                <div style="text-align: center;">
                    <a href="${SITE_URL}/contact-us" style="color: #ddb040; text-decoration: none; font-weight: bold;">View Ticket</a>
                </div>
            </div>
        </div>
    `;

  await sendEmail({ to, subject: `Re: Ticket #${ticketId}`, html });
}

// ----------------------------------------------------------------------
// 7. ACCOUNT STATUS UPDATE
// ----------------------------------------------------------------------
export async function sendAccountStatusUpdate(email: string, name: string, isBlocked: boolean) {
  const statusText = isBlocked ? 'Suspended' : 'Reactivated';
  const color = isBlocked ? '#ef4444' : '#22c55e';
  const message = isBlocked
    ? 'Your account has been suspended due to policy violations.'
    : 'Good news! Your account has been reactivated.';

  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 20px;">
      <div style="background: #0d0b09; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="${LOGO_URL}" alt="Celsius" style="max-height: 50px; width: auto;" />
      </div>
      <div style="background: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; text-align: center;">
        <h2 style="color: #333; margin-top: 0;">Account Status Update</h2>
        <p style="color: #666; margin-bottom: 30px;">Hi ${name},</p>
        
        <div style="border: 1px solid ${color}; color: ${color}; padding: 15px; border-radius: 8px; display: inline-block; font-weight: bold; margin-bottom: 20px;">
          Account ${statusText}
        </div>
        
        <p style="color: #555;">${message}</p>
      </div>
    </div>
  `;

  return sendEmail({ to: email, subject: `Account Status Update`, html });
}

export async function sendNotifyMeConfirmation(email: string, collectionName: string) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 20px;">
      <div style="background: #0d0b09; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="${LOGO_URL}" alt="Celsius" style="max-height: 50px; width: auto;" />
      </div>
      <div style="background: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; text-align: center;">
        <h2 style="color: #333; margin-top: 0; font-weight: 600;">You're on the List!</h2>
        <p style="color: #666; margin-bottom: 30px;">
          We'll notify you as soon as <strong>${collectionName}</strong> launches. Get ready for something extraordinary.
        </p>
        
        <div style="background: #fdfbf7; border: 1px solid rgba(182,144,46,0.2); padding: 25px; border-radius: 8px; margin: 30px 0;">
          <p style="margin: 0; color: #B6902E; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 2px;">Exclusive Early Access</p>
          <p style="margin: 10px 0 0; color: #666; font-size: 13px;">You'll be among the first to know when this collection drops.</p>
        </div>
        
        <div style="margin-top: 30px;">
          <a href="${SITE_URL}/collections/perfumes" style="background: #ddb040; color: #000; padding: 14px 30px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 1px;">Browse Collections</a>
        </div>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>&copy; 2026 Celsius. All rights reserved.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: `You're In! We'll Notify You When ${collectionName} Launches`, html });
}
// ----------------------------------------------------------------------
// 9. NOTIFY ME - COLLECTION LAUNCH NOTIFICATION
// ----------------------------------------------------------------------
export async function sendCollectionLaunchEmail(email: string, collectionName: string, collectionSlug: string) {
  const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 20px;">
      <div style="background: #0d0b09; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="${LOGO_URL}" alt="Celsius" style="max-height: 50px; width: auto;" />
      </div>
      <div style="background: #ffffff; padding: 40px; border-radius: 0 0 8px 8px; text-align: center;">
        <p style="color: #B6902E; font-size: 11px; font-weight: 700; letter-spacing: 4px; text-transform: uppercase; margin-bottom: 5px;">It's Here</p>
        <h2 style="color: #333; margin-top: 0; font-size: 28px; font-weight: 600;">${collectionName} Has Launched!</h2>
        <p style="color: #666; margin-bottom: 30px; line-height: 1.6;">
          The wait is over. The collection you signed up for is now live. Be among the first to explore and shop these exclusive new fragrances.
        </p>
        
        <div style="margin: 40px 0;">
          <a href="${SITE_URL}/collections/${collectionSlug}" style="background: #ddb040; color: #000; padding: 16px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Shop Now</a>
        </div>
        
        <p style="color: #999; font-size: 12px;">You received this because you subscribed to launch notifications for ${collectionName}.</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
        <p>&copy; 2026 Celsius. All rights reserved.</p>
      </div>
    </div>
  `;
  return sendEmail({ to: email, subject: `🎉 ${collectionName} is Live! Shop Now`, html });
}
// 10. CUSTOM NOTIFY EMAIL (Admin-composed)
export async function sendCustomNotifyEmail(
    email: string, customSubject: string, customBody: string,
    collectionName: string, collectionSlug: string
) {
    const formattedBody = customBody.replace(/\n/g, '<br/>');
    const html = `
    <div style="font-family: 'Helvetica Neue', Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #f4f4f4; padding: 20px;">
      <div style="background: #0d0b09; padding: 30px; text-align: center; border-radius: 8px 8px 0 0;">
        <img src="${LOGO_URL}" alt="Celsius" style="max-height: 50px; width: auto;" />
      </div>
      <div style="background: #ffffff; padding: 40px; border-radius: 0 0 8px 8px;">
        <h2 style="color: #333; margin-top: 0; font-size: 24px; font-weight: 600; text-align: center;">${customSubject}</h2>
        <div style="color: #555; font-size: 15px; line-height: 1.8; margin: 25px 0;">${formattedBody}</div>
        <div style="text-align: center; margin: 35px 0;">
          <a href="${SITE_URL}/collections/${collectionSlug}" style="background: #ddb040; color: #000; padding: 16px 40px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Shop ${collectionName}</a>
        </div>
        <p style="color: #999; font-size: 12px; text-align: center;">You received this because you subscribed to launch notifications for ${collectionName}.</p>
      </div>
      <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;"><p>&copy; 2026 Celsius. All rights reserved.</p></div>
    </div>`;
    return sendEmail({ to: email, subject: customSubject, html });
}