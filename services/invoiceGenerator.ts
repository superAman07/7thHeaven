import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define the shape of data needed for the invoice
export interface InvoiceData {
    id: string;
    createdAt: string | Date;
    subtotal: number;
    user?: { // Make user optional
        fullName: string;
        email: string;
        phone: string;
    };
    shippingAddress: {
        fullName?: string; // Add fullName to shippingAddress definition
        fullAddress: string;
        city: string;
        state: string;
        pincode: string;
        country: string;
        phone?: string;
    };
    items: Array<{
        name?: string; 
        product?: { name: string };
        quantity: number;
        priceAtPurchase?: number; 
        size?: string;
    }>;
}

export const generateInvoice = (order: InvoiceData) => {
    const doc = new jsPDF();

    // --- Header ---
    doc.setFontSize(20);
    doc.setTextColor(221, 176, 64); // Brand Color #ddb040
    doc.text("7th Heaven", 14, 22);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text("Premium Fragrances & Scents", 14, 28);

    doc.setFontSize(16);
    doc.setTextColor(0);
    doc.text("INVOICE", 140, 22);

    // --- Order Details ---
    doc.setFontSize(10);
    doc.text(`Order ID: ${order.id.toUpperCase()}`, 140, 30);
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 140, 35);

    // --- Line Separator ---
    doc.setDrawColor(200);
    doc.line(14, 45, 196, 45);

    // --- Billing/Shipping Info ---
    doc.setFontSize(12);
    doc.text("Bill To:", 14, 55);
    
    doc.setFontSize(10);

    // FIX: Handle missing user object safely by falling back to shipping details
    const customerName = order.user?.fullName || order.shippingAddress?.fullName || "Valued Customer";
    const customerPhone = order.user?.phone || order.shippingAddress?.phone || "N/A";

    doc.text(customerName, 14, 62);
    doc.text(order.shippingAddress?.fullAddress || "", 14, 67);
    doc.text(`${order.shippingAddress?.city || ""}, ${order.shippingAddress?.state || ""} - ${order.shippingAddress?.pincode || ""}`, 14, 72);
    doc.text(`Phone: ${customerPhone}`, 14, 77);

    // --- Items Table ---
    const tableBody = order.items.map(item => [
        item.product?.name || item.name || "Product",
        item.size || "N/A",
        item.quantity,
        `Rs. ${item.priceAtPurchase || 0}`,
        `Rs. ${(item.priceAtPurchase || 0) * item.quantity}`
    ]);

    autoTable(doc, {
        startY: 85,
        head: [['Item', 'Size', 'Qty', 'Price', 'Total']],
        body: tableBody,
        theme: 'grid',
        headStyles: { fillColor: [221, 176, 64], textColor: 255 }, // Brand color header
        styles: { fontSize: 9 },
    });

    // --- Totals ---
    // @ts-ignore (lastAutoTable is added by the plugin)
    const finalY = doc.lastAutoTable.finalY + 10;

    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`Rs. ${order.subtotal}`, 170, finalY, { align: 'right' });

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text(`Grand Total:`, 140, finalY + 10);
    doc.text(`Rs. ${order.subtotal}`, 170, finalY + 10, { align: 'right' });

    // --- Footer ---
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100);
    doc.text("Thank you for shopping with 7th Heaven!", 105, 280, { align: "center" });

    // Save File
    doc.save(`Invoice_${order.id}.pdf`);
};