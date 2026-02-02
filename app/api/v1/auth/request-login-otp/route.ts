import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { sendOTPEmail } from '@/lib/email';

const requestLoginOtpSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validation = requestLoginOtpSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ success: false, error: { message: 'Invalid input.', details: validation.error.flatten().fieldErrors } }, { status: 400 });
    }

    const { email } = validation.data;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        error: {
          message: 'No account found with this email. Please sign up to continue.',
          code: 'USER_NOT_FOUND'
        }
      }, { status: 404 });
    }

    if (user.isBlocked) {
      return NextResponse.json({
        success: false,
        error: { message: 'Your account has been suspended. Please contact support.' }
      }, { status: 403 });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const salt = await bcrypt.genSalt(10);
    const otpHash = await bcrypt.hash(otp, salt);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        otpHash,
        otpExpiry,
      },
    });


    try {
        console.log("Attempting to send email to:", email);
        await sendOTPEmail(email, otp, user.fullName || 'Customer');
        console.log("Email sent successfully!");
    } catch (emailError: any) {
        console.error('CRITICAL EMAIL FAIL:', emailError);
        return NextResponse.json({ 
            success: false, 
            error: { 
                message: 'EMAIL SEND FAILED', 
                details: emailError.message || JSON.stringify(emailError) 
            } 
        }, { status: 500 });
    }

    return NextResponse.json({ 
      success: true, 
      message: `OTP sent to ${email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}`,
      phone: user.phone
    });

  } catch (error) {
    console.error('Error in /api/v1/auth/request-login-otp:', error);
    return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
  }
}

// import { NextRequest, NextResponse } from 'next/server';
// import { z } from 'zod';
// import prisma from '@/lib/prisma';
// import bcrypt from 'bcryptjs';
// import { sendOTPEmail } from '@/lib/email';

// const requestLoginOtpSchema = z.object({
//   phone: z.string().regex(/^\d{10}$/, { message: 'Phone number must be 10 digits' }),
// });

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const validation = requestLoginOtpSchema.safeParse(body);

//     if (!validation.success) {
//       return NextResponse.json({ success: false, error: { message: 'Invalid input.', details: validation.error.flatten().fieldErrors } }, { status: 400 });
//     }

//     const { phone } = validation.data;

//     const user = await prisma.user.findUnique({
//       where: { phone },
//     });

//     if (!user) {
//       return NextResponse.json({
//         success: false,
//         error: {
//           message: 'No account found with this phone number. Please sign up to continue.',
//           code: 'USER_NOT_FOUND'
//         }
//       }, { status: 404 });
//     }

//     const otp = Math.floor(100000 + Math.random() * 900000).toString();
//     const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

//     const salt = await bcrypt.genSalt(10);
//     const otpHash = await bcrypt.hash(otp, salt);

//     await prisma.user.update({
//       where: { id: user.id },
//       data: {
//         otpHash,
//         otpExpiry,
//       },
//     });

//     console.log(`--- LOGIN OTP for ${phone}: ${otp} ---`);

//     if (user.email) {
//       sendOTPEmail(user.email, otp, user.fullName || 'Customer').catch(err => 
//         console.error('OTP email error:', err)
//       );
//     }
//     return NextResponse.json({ 
//       success: true, 
//       message: user.email 
//         ? `OTP has been sent to your email (${user.email.replace(/(.{2})(.*)(@.*)/, '$1***$3')}).` 
//         : 'OTP has been sent to your phone number.', 
//       debugOtp: otp 
//     });

//   } catch (error) {
//     console.error('Error in /api/v1/auth/request-login-otp:', error);
//     return NextResponse.json({ success: false, error: { message: 'An unexpected error occurred.' } }, { status: 500 });
//   }
// }