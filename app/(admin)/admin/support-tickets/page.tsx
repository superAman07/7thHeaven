'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

interface TicketResponse {
    id: string;
    message: string;
    isAdmin: boolean;
    createdAt: string;
}

interface User {
    fullName: string;
    email: string;
    phone: string;
}

interface Ticket {
    id: string;
    subject: string;
    category: string;
    message: string;
    status: string;
    userId: string | null;
    user: User | null;
    guestName: string | null;
    guestEmail: string | null;
    guestPhone: string | null;
    createdAt: string;
    responses: TicketResponse[];
}

const CATEGORIES: Record<string, string> = {
    'ORDER_ISSUE': 'Order Issue',
    'PAYMENT': 'Payment Problem',
    'PRODUCT_QUERY': 'Product Query',
    'RETURN_REFUND': 'Return / Refund',
    '7TH_HEAVEN_CLUB': '7th Heaven Club',
    'WEBSITE': 'Website Issue',
    'OTHER': 'Other'
};

export default function AdminSupportTicketsPage() {
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [responseText, setResponseText] = useState('');
    const [sending, setSending] = useState(false);
    const [statusFilter, setStatusFilter] = useState<string>('');

    useEffect(() => {
        fetchTickets();
    }, [statusFilter]);

    const fetchTickets = async () => {
        try {
            const url = statusFilter 
                ? `/api/v1/admin/tickets?status=${statusFilter}` 
                : '/api/v1/admin/tickets';
            const res = await axios.get(url);
            if (res.data.success) {
                setTickets(res.data.tickets);
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to fetch tickets');
        } finally {
            setLoading(false);
        }
    };

    const handleSendResponse = async () => {
        if (!selectedTicket || !responseText.trim()) {
            toast.error('Please enter a response');
            return;
        }

        setSending(true);
        try {
            const res = await axios.post(`/api/v1/admin/tickets/${selectedTicket.id}`, {
                message: responseText
            });
            if (res.data.success) {
                toast.success('Response sent successfully!');
                setResponseText('');
                // Refresh ticket
                const ticketRes = await axios.get(`/api/v1/admin/tickets/${selectedTicket.id}`);
                if (ticketRes.data.success) {
                    setSelectedTicket(ticketRes.data.ticket);
                    // Update in list
                    setTickets(prev => prev.map(t => 
                        t.id === selectedTicket.id ? ticketRes.data.ticket : t
                    ));
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to send response');
        } finally {
            setSending(false);
        }
    };

    const handleStatusChange = async (ticketId: string, newStatus: string) => {
        try {
            const res = await axios.put(`/api/v1/admin/tickets/${ticketId}`, { status: newStatus });
            if (res.data.success) {
                toast.success(`Ticket marked as ${newStatus}`);
                setTickets(prev => prev.map(t => 
                    t.id === ticketId ? { ...t, status: newStatus } : t
                ));
                if (selectedTicket?.id === ticketId) {
                    setSelectedTicket({ ...selectedTicket, status: newStatus });
                }
            }
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to update status');
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getCustomerInfo = (ticket: Ticket) => {
        if (ticket.user) {
            return {
                name: ticket.user.fullName,
                email: ticket.user.email,
                phone: ticket.user.phone,
                type: 'Registered'
            };
        }
        return {
            name: ticket.guestName || 'Unknown',
            email: ticket.guestEmail || 'N/A',
            phone: ticket.guestPhone || 'N/A',
            type: 'Guest'
        };
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '50px', height: '50px', border: '4px solid #E6B422', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 15px' }}></div>
                    <p style={{ color: '#666' }}>Loading tickets...</p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ padding: '30px', background: '#f5f5f5', minHeight: '100vh' }}>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', flexWrap: 'wrap', gap: '15px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '28px', color: '#333' }}>Support Tickets</h1>
                    <p style={{ margin: '5px 0 0', color: '#666' }}>Manage customer support requests</p>
                </div>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <select 
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        style={{ padding: '10px 15px', borderRadius: '8px', border: '1px solid #ddd', fontSize: '14px', cursor: 'pointer' }}
                    >
                        <option value="">All Tickets</option>
                        <option value="OPEN">Open Only</option>
                        <option value="CLOSED">Closed Only</option>
                    </select>
                </div>
            </div>

            {/* Stats Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '15px', marginBottom: '30px' }}>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Total Tickets</p>
                    <h3 style={{ margin: '5px 0 0', fontSize: '28px', color: '#333' }}>{tickets.length}</h3>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Open</p>
                    <h3 style={{ margin: '5px 0 0', fontSize: '28px', color: '#28a745' }}>{tickets.filter(t => t.status === 'OPEN').length}</h3>
                </div>
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' }}>
                    <p style={{ margin: 0, color: '#888', fontSize: '14px' }}>Closed</p>
                    <h3 style={{ margin: '5px 0 0', fontSize: '28px', color: '#6c757d' }}>{tickets.filter(t => t.status === 'CLOSED').length}</h3>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: selectedTicket ? '1fr 1fr' : '1fr', gap: '20px' }}>
                {/* Tickets List */}
                <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
                    <div style={{ padding: '20px', borderBottom: '1px solid #eee' }}>
                        <h3 style={{ margin: 0, fontSize: '18px' }}>All Tickets</h3>
                    </div>
                    <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                        {tickets.length === 0 ? (
                            <div style={{ padding: '40px', textAlign: 'center', color: '#888' }}>
                                <p>No tickets found</p>
                            </div>
                        ) : (
                            tickets.map(ticket => {
                                const customer = getCustomerInfo(ticket);
                                return (
                                    <div 
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        style={{ 
                                            padding: '15px 20px', 
                                            borderBottom: '1px solid #eee', 
                                            cursor: 'pointer',
                                            background: selectedTicket?.id === ticket.id ? '#fff9e6' : 'white',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                <span style={{ 
                                                    background: ticket.status === 'OPEN' ? '#28a745' : '#6c757d',
                                                    color: 'white',
                                                    padding: '2px 8px',
                                                    borderRadius: '10px',
                                                    fontSize: '10px',
                                                    fontWeight: '600'
                                                }}>
                                                    {ticket.status}
                                                </span>
                                                <span style={{ fontSize: '11px', color: '#888' }}>#{ticket.id.slice(-8).toUpperCase()}</span>
                                            </div>
                                            <span style={{ fontSize: '11px', color: '#888' }}>{formatDate(ticket.createdAt)}</span>
                                        </div>
                                        <h5 style={{ margin: '0 0 5px', fontSize: '14px', fontWeight: '600' }}>{ticket.subject}</h5>
                                        <p style={{ margin: 0, fontSize: '12px', color: '#666' }}>
                                            <span style={{ background: '#E6B422', color: 'white', padding: '1px 6px', borderRadius: '4px', fontSize: '10px', marginRight: '8px' }}>
                                                {CATEGORIES[ticket.category] || ticket.category}
                                            </span>
                                            {customer.name}
                                        </p>
                                        {ticket.responses.length > 0 && (
                                            <span style={{ fontSize: '11px', color: '#28a745', marginTop: '5px', display: 'inline-block' }}>
                                                ✓ {ticket.responses.length} response(s)
                                            </span>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>

                {/* Ticket Detail Panel */}
                {selectedTicket && (
                    <div style={{ background: 'white', borderRadius: '12px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
                        {/* Header */}
                        <div style={{ padding: '20px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div>
                                <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '5px' }}>
                                    <h3 style={{ margin: 0, fontSize: '16px' }}>{selectedTicket.subject}</h3>
                                </div>
                                <p style={{ margin: 0, fontSize: '12px', color: '#888' }}>
                                    #{selectedTicket.id.slice(-8).toUpperCase()} • {formatDate(selectedTicket.createdAt)}
                                </p>
                            </div>
                            <button
                                onClick={() => setSelectedTicket(null)}
                                style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' }}
                            >×</button>
                        </div>

                        {/* Customer Info */}
                        <div style={{ padding: '15px 20px', background: '#f8f9fa', borderBottom: '1px solid #eee' }}>
                            {(() => {
                                const customer = getCustomerInfo(selectedTicket);
                                return (
                                    <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', fontSize: '13px' }}>
                                        <div><strong>Name:</strong> {customer.name}</div>
                                        <div><strong>Email:</strong> {customer.email}</div>
                                        <div><strong>Phone:</strong> {customer.phone}</div>
                                        <div><strong>Type:</strong> <span style={{ background: customer.type === 'Registered' ? '#28a745' : '#ffc107', color: customer.type === 'Registered' ? 'white' : '#333', padding: '1px 6px', borderRadius: '4px', fontSize: '10px' }}>{customer.type}</span></div>
                                    </div>
                                );
                            })()}
                        </div>

                        {/* Status Actions */}
                        <div style={{ padding: '15px 20px', borderBottom: '1px solid #eee', display: 'flex', gap: '10px', alignItems: 'center' }}>
                            <span style={{ fontSize: '13px', color: '#666' }}>Status:</span>
                            <button
                                onClick={() => handleStatusChange(selectedTicket.id, 'OPEN')}
                                style={{ 
                                    padding: '5px 12px', 
                                    borderRadius: '5px', 
                                    border: 'none', 
                                    cursor: 'pointer',
                                    background: selectedTicket.status === 'OPEN' ? '#28a745' : '#e0e0e0',
                                    color: selectedTicket.status === 'OPEN' ? 'white' : '#666',
                                    fontSize: '12px'
                                }}
                            >Open</button>
                            <button
                                onClick={() => handleStatusChange(selectedTicket.id, 'CLOSED')}
                                style={{ 
                                    padding: '5px 12px', 
                                    borderRadius: '5px', 
                                    border: 'none', 
                                    cursor: 'pointer',
                                    background: selectedTicket.status === 'CLOSED' ? '#6c757d' : '#e0e0e0',
                                    color: selectedTicket.status === 'CLOSED' ? 'white' : '#666',
                                    fontSize: '12px'
                                }}
                            >Closed</button>
                        </div>

                        {/* Messages */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: '20px', maxHeight: '300px' }}>
                            {/* Original Message */}
                            <div style={{ marginBottom: '15px' }}>
                                <div style={{ background: '#f0f0f0', padding: '12px', borderRadius: '8px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                        <span style={{ fontWeight: '600', fontSize: '12px', color: '#333' }}>Customer</span>
                                        <span style={{ fontSize: '11px', color: '#888' }}>{formatDate(selectedTicket.createdAt)}</span>
                                    </div>
                                    <p style={{ margin: 0, fontSize: '13px', whiteSpace: 'pre-wrap' }}>{selectedTicket.message}</p>
                                </div>
                            </div>

                            {/* Responses */}
                            {selectedTicket.responses.map(response => (
                                <div key={response.id} style={{ marginBottom: '15px' }}>
                                    <div style={{ 
                                        background: response.isAdmin ? 'linear-gradient(135deg, #E6B422, #D4A420)' : '#f0f0f0', 
                                        color: response.isAdmin ? 'white' : '#333',
                                        padding: '12px', 
                                        borderRadius: '8px',
                                        marginLeft: response.isAdmin ? '20px' : '0'
                                    }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <span style={{ fontWeight: '600', fontSize: '12px' }}>{response.isAdmin ? 'Admin' : 'Customer'}</span>
                                            <span style={{ fontSize: '11px', opacity: 0.8 }}>{formatDate(response.createdAt)}</span>
                                        </div>
                                        <p style={{ margin: 0, fontSize: '13px', whiteSpace: 'pre-wrap' }}>{response.message}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Reply Box */}
                        <div style={{ padding: '15px 20px', borderTop: '1px solid #eee', background: '#f8f9fa' }}>
                            <textarea
                                value={responseText}
                                onChange={(e) => setResponseText(e.target.value)}
                                placeholder="Type your response here..."
                                rows={3}
                                style={{ 
                                    width: '100%', 
                                    padding: '10px', 
                                    borderRadius: '8px', 
                                    border: '1px solid #ddd', 
                                    fontSize: '13px',
                                    resize: 'none',
                                    marginBottom: '10px'
                                }}
                            />
                            <button
                                onClick={handleSendResponse}
                                disabled={sending || !responseText.trim()}
                                style={{ 
                                    background: 'linear-gradient(135deg, #E6B422, #D4A420)', 
                                    color: 'white', 
                                    border: 'none', 
                                    padding: '10px 25px', 
                                    borderRadius: '8px', 
                                    fontSize: '14px', 
                                    fontWeight: '600',
                                    cursor: sending ? 'not-allowed' : 'pointer',
                                    opacity: sending || !responseText.trim() ? 0.6 : 1
                                }}
                            >
                                {sending ? 'Sending...' : 'Send Response'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}