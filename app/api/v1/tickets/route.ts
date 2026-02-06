import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendTicketConfirmationEmail } from '@/lib/email';

/**
 * @swagger
 * /api/v1/tickets:
 *   get:
 *     summary: Get Support Tickets
 *     tags:
 *       - Support
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of tickets
 *   post:
 *     summary: Create Support Ticket
 *     tags:
 *       - Support
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - category
 *               - message
 *             properties:
 *               subject:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [Order Issue, Payment, Product, Other]
 *               message:
 *                 type: string
 *     responses:
 *       200:
 *         description: Ticket created
 */

// GET - Fetch user's tickets
export async function GET(req: NextRequest) {
    try {
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const tickets = await prisma.supportTicket.findMany({
            where: { userId },
            include: {
                responses: {
                    orderBy: { createdAt: 'asc' }
                }
            },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ success: true, tickets });
    } catch (error) {
        console.error('Fetch Tickets Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST - Create new ticket
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { subject, category, message, guestEmail, guestPhone, guestName } = body;

        if (!subject || !category || !message) {
            return NextResponse.json({ error: 'Subject, category, and message are required' }, { status: 400 });
        }

        let userId = await getUserIdFromToken(req);
        
        // If not logged in, require guest details
        if (!userId && (!guestEmail || !guestPhone || !guestName)) {
            return NextResponse.json({ 
                error: 'Please provide your name, email, and phone number' 
            }, { status: 400 });
        }

        let userEmail = guestEmail;
        let userName = guestName;
        let linkedUser = null;

        // If logged in, get user details
        if (userId) {
            linkedUser = await prisma.user.findUnique({
                where: { id: userId },
                select: { id: true, email: true, fullName: true }
            });
            userEmail = linkedUser?.email;
            userName = linkedUser?.fullName || 'Customer';
        } else {
            // Check if guest email/phone matches a registered user
            linkedUser = await prisma.user.findFirst({
                where: {
                    OR: [
                        { email: guestEmail?.toLowerCase() },
                        { phone: guestPhone }
                    ]
                },
                select: { id: true, email: true, fullName: true }
            });
            
            if (linkedUser) {
                // Found a matching user - link the ticket to them!
                userId = linkedUser.id;
                userEmail = linkedUser.email || guestEmail;
                userName = linkedUser.fullName || guestName;
            }
        }

        const ticket = await prisma.supportTicket.create({
            data: {
                subject,
                category,
                message,
                userId: userId || null,
                // Only store guest info if NOT linked to a user
                guestEmail: userId ? null : guestEmail,
                guestPhone: userId ? null : guestPhone,
                guestName: userId ? null : guestName
            }
        });

        // Send confirmation email
        if (userEmail) {
            sendTicketConfirmationEmail(userEmail, ticket.id, subject, userName || 'Customer')
                .catch(err => console.error('Ticket confirmation email error:', err));
        }

        // Create notification for linked users
        if (userId) {
            await prisma.notification.create({
                data: {
                    userId,
                    title: 'Ticket Submitted',
                    body: `Your support ticket "${subject}" has been received. We'll respond within 24-48 hours.`,
                    type: 'TICKET'
                }
            });
        }

        return NextResponse.json({ 
            success: true, 
            message: linkedUser && !await getUserIdFromToken(req) 
                ? 'Ticket submitted! We found your account and linked this ticket to it.'
                : 'Ticket submitted successfully! We will get back to you soon.',
            ticket 
        });
    } catch (error) {
        console.error('Create Ticket Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}