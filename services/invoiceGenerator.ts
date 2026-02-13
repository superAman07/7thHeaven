import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Define the shape of data needed for the invoice
export interface InvoiceData {
    id: string;
    createdAt: string | Date;
    subtotal: number;
    discount?: number;
    netAmountPaid?: number;
    mlmOptInRequested?: boolean;
    companyDetails?: {
        name: string;
        address: string;
        phone: string;
        email: string;
        logoUrl?: string;
    };
    user?: {
        fullName: string;
        email: string;
        phone: string;
    };
    shippingAddress: {
        fullName?: string;
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

    const brandColor: [number, number, number] = [221, 176, 64];
    const secondaryColor: [number, number, number] = [60, 60, 60];
    const lightGray: [number, number, number] = [240, 240, 240];

    doc.setFillColor(...brandColor);
    doc.rect(0, 0, 210, 5, 'F');

    if (order.companyDetails?.logoUrl && order.companyDetails.logoUrl.startsWith('data:image')) {
        try {
            doc.addImage(order.companyDetails.logoUrl, 'PNG', 14, 10, 40, 15);
        } catch (e) {
            console.warn("Failed to add logo to PDF", e);
        }
    }

    const companyName = order.companyDetails?.name || "Celsius";
    let titleFontSize = 24;
    
    // Shrink font if name is too long
    if (companyName.length > 20) titleFontSize = 18;
    if (companyName.length > 30) titleFontSize = 14;
    
    doc.setFontSize(titleFontSize);
    doc.setTextColor(...brandColor);
    
    // Move text down (Y=35) if logo is present, otherwise keep at 25
    const nameY = (order.companyDetails?.logoUrl && order.companyDetails.logoUrl.startsWith('data:image')) ? 35 : 25;
    doc.text(companyName, 14, nameY);
    // --- 3. DYNAMIC ADDRESS ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    
    const companyAddr = order.companyDetails?.address || "Premium Fragrances & Scents";
    const startAddrY = nameY + 6;
    
    const splitAddress = doc.splitTextToSize(companyAddr, 80);
    doc.text(splitAddress, 14, startAddrY);
    
    let currentY = startAddrY + (splitAddress.length * 4);
    doc.text(order.companyDetails?.email || "jchindia@gmail.com", 14, currentY);
    doc.text(order.companyDetails?.phone || "+91 98765 43210", 14, currentY + 5);


    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(220, 220, 220);
    doc.text("INVOICE", 196, 30, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.text(`Invoice No: ${order.id.toUpperCase()}`, 196, 40, { align: "right" });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 196, 45, { align: "right" });

    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(14, 50, 196, 50);

    const customerName = order.user?.fullName || order.shippingAddress?.fullName || "Valued Customer";
    const customerPhone = order.user?.phone || order.shippingAddress?.phone || "N/A";

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandColor);
    doc.text("BILL TO", 14, 60);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    doc.text(customerName, 14, 66);

    const addressLines = doc.splitTextToSize(order.shippingAddress?.fullAddress || "", 80);
    doc.text(addressLines, 14, 71);

    const tableStartY = Math.max(currentY + 10, 90);

    const tableBody = order.items.map(item => [
        item.product?.name || item.name || "Product",
        item.size || "Standard",
        item.quantity,
        `Rs. ${item.priceAtPurchase?.toLocaleString() || '0'}`,
        `Rs. ${((item.priceAtPurchase || 0) * item.quantity).toLocaleString()}`
    ]);

    autoTable(doc, {
        startY: tableStartY,
        head: [['ITEM DESCRIPTION', 'SIZE', 'QTY', 'UNIT PRICE', 'AMOUNT']],
        body: tableBody,
        theme: 'grid',
        headStyles: {
            fillColor: brandColor,
            textColor: 255,
            fontSize: 9,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 3
        },
        columnStyles: {
            0: { cellWidth: 80 },
            1: { cellWidth: 30 },
            2: { cellWidth: 20, halign: 'center' },
            3: { cellWidth: 30, halign: 'right' },
            4: { cellWidth: 30, halign: 'right' }
        },
        bodyStyles: {
            fontSize: 9,
            textColor: 60,
            cellPadding: 3
        },
        alternateRowStyles: {
            fillColor: lightGray
        },
        margin: { left: 14, right: 14 }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setDrawColor(220, 220, 220);
    doc.line(120, finalY - 5, 196, finalY - 5);

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal:`, 140, finalY);
    doc.text(`Rs. ${order.subtotal.toLocaleString()}`, 196, finalY, { align: 'right' });

    let nextY = finalY;
    if (order.discount && order.discount > 0) {
        nextY += 5;
        doc.setTextColor(34, 197, 94);
        doc.text(`Discount:`, 140, nextY);
        doc.text(`- Rs. ${order.discount.toLocaleString()}`, 196, nextY, { align: 'right' });
        doc.setTextColor(...secondaryColor);
    }

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandColor);
    const finalTotal = order.netAmountPaid || (order.subtotal - (order.discount || 0));
    doc.text(`Grand Total:`, 140, nextY + 12);
    doc.text(`Rs. ${finalTotal.toLocaleString()}`, 196, nextY + 12, { align: 'right' });

    doc.setFillColor(245, 245, 245);
    doc.roundedRect(14, finalY + 20, 182, 20, 2, 2, 'F');

    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(60, 60, 60);
    doc.text("Thank you for your business!", 105, finalY + 32, { align: "center" });

    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(...brandColor);
    doc.rect(0, pageHeight - 5, 210, 5, 'F');

    doc.save(`Invoice_${order.id}.pdf`);
};