import { NextRequest, NextResponse } from 'next/server';
import { getUserIdFromToken } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { sendTicketResponseEmail } from '@/lib/email';

// GET - Fetch single ticket
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const ticket = await prisma.supportTicket.findUnique({
            where: { id },
            include: {
                user: { select: { fullName: true, email: true, phone: true } },
                responses: { orderBy: { createdAt: 'asc' } }
            }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, ticket });
    } catch (error) {
        console.error('Fetch Ticket Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST - Add response to ticket
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { message } = body;

        if (!message) {
            return NextResponse.json({ error: 'Message is required' }, { status: 400 });
        }

        const ticket = await prisma.supportTicket.findUnique({
            where: { id },
            include: { user: { select: { email: true, fullName: true, id: true } } }
        });

        if (!ticket) {
            return NextResponse.json({ error: 'Ticket not found' }, { status: 404 });
        }

        // Create response
        const response = await prisma.ticketResponse.create({
            data: {
                ticketId: id,
                message,
                isAdmin: true
            }
        });

        // Get email for notification
        const recipientEmail = ticket.user?.email || ticket.guestEmail;
        const recipientName = ticket.user?.fullName || ticket.guestName || 'Customer';

        // Send email notification
        if (recipientEmail) {
            sendTicketResponseEmail(recipientEmail, ticket.id, ticket.subject, message, recipientName)
                .catch(err => console.error('Ticket response email error:', err));
        }

        // Create notification for logged-in users
        if (ticket.userId) {
            await prisma.notification.create({
                data: {
                    userId: ticket.userId,
                    title: 'Ticket Response',
                    body: `Admin has responded to your ticket: "${ticket.subject}"`,
                    type: 'TICKET'
                }
            });
        }

        return NextResponse.json({ success: true, response });
    } catch (error) {
        console.error('Add Response Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// PUT - Update ticket status
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const userId = await getUserIdFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user?.isAdmin) {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        const body = await req.json();
        const { status } = body;

        if (!['OPEN', 'CLOSED'].includes(status)) {
            return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
        }

        const ticket = await prisma.supportTicket.update({
            where: { id },
            data: { status }
        });

        return NextResponse.json({ success: true, ticket });
    } catch (error) {
        console.error('Update Ticket Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}