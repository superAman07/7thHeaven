import jsPDF, { GState } from 'jspdf';
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

    // --- 1. HEADER STRIP ---
    doc.setFillColor(...brandColor);
    doc.rect(0, 0, 210, 5, 'F');

    // --- 2. WATERMARK (Big & Centered) ---
    if (order.companyDetails?.logoUrl && order.companyDetails.logoUrl.startsWith('data:image')) {
        try {
            doc.saveGraphicsState();
            const gState = new GState({ opacity: 0.08 }); // Very subtle
            doc.setGState(gState);
            // Centered on A4 (210mm wide): (210-140)/2 = 35
            doc.addImage(order.companyDetails.logoUrl, 'PNG', 35, 80, 140, 140);
            doc.restoreGraphicsState();
        } catch (e) {
            console.warn("Failed to add watermark", e);
        }
    }

    // --- 3. COMPANY LOGO & DETAILS ---
    let headerBottomY = 20; // Start tracking height

    // LOGO: Bigger Size (50w x 25h)
    if (order.companyDetails?.logoUrl && order.companyDetails.logoUrl.startsWith('data:image')) {
        try {
            doc.addImage(order.companyDetails.logoUrl, 'PNG', 14, 10, 50, 25);
            headerBottomY = 40; // Push text down
        } catch (e) {
            console.warn("Failed to add logo", e);
        }
    }

    doc.setFont("helvetica", "bold");
    
    // Auto-Size Company Name
    const companyName = order.companyDetails?.name || "Celsius";
    let titleFontSize = 24;
    if (companyName.length > 20) titleFontSize = 18;
    if (companyName.length > 30) titleFontSize = 14;
    
    doc.setFontSize(titleFontSize);
    doc.setTextColor(...brandColor);
    
    // Position Name below logo or at top
    const nameY = headerBottomY === 40 ? 42 : 25; 
    doc.text(companyName, 14, nameY);

    // Address
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    
    const companyAddr = order.companyDetails?.address || "Premium Fragrances & Scents";
    const startAddrY = nameY + 6;
    
    const splitAddress = doc.splitTextToSize(companyAddr, 80);
    doc.text(splitAddress, 14, startAddrY);
    
    let currentY = startAddrY + (splitAddress.length * 4);
    doc.text(order.companyDetails?.email || "contact@7thheaven.com", 14, currentY);
    currentY += 5;
    doc.text(order.companyDetails?.phone || "+91 98765 43210", 14, currentY);
    
    // Update header bottom to ensure no overlap
    headerBottomY = currentY + 10;


    // --- 4. INVOICE INFO (Right Side) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    doc.setTextColor(220, 220, 220);
    doc.text("INVOICE", 196, 30, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(...secondaryColor);
    doc.text(`Invoice No: ${order.id.toUpperCase().substring(0, 12)}`, 196, 40, { align: "right" });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString()}`, 196, 45, { align: "right" });


    // --- 5. SEPARATOR LINE ---
    // Dynamic Y position based on header height
    const separatorY = Math.max(headerBottomY, 55); 
    doc.setDrawColor(230, 230, 230);
    doc.setLineWidth(0.5);
    doc.line(14, separatorY, 196, separatorY);


    // --- 6. BILL TO ---
    const billToY = separatorY + 10;

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandColor);
    doc.text("BILL TO", 14, billToY);

    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const customerName = order.user?.fullName || order.shippingAddress?.fullName || "Valued Customer";
    doc.text(customerName, 14, billToY + 6);

    const addressLines = doc.splitTextToSize(order.shippingAddress?.fullAddress || "", 150);
    doc.text(addressLines, 14, billToY + 11);

    // Calculate where table should start
    const addressBlockHeight = (addressLines.length * 5) + 20;
    const tableStartY = billToY + addressBlockHeight;


    // --- 7. ITEMS TABLE ---
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
        headStyles: { fillColor: brandColor, textColor: 255, fontSize: 9, fontStyle: 'bold', halign: 'left' }, // Removed cellPadding to fix type error if strictly typed
        columnStyles: {
            0: { cellWidth: 80 },
            4: { halign: 'right' }
        },
        styles: { fontSize: 9, cellPadding: 4 },
    });

    // --- 8. TOTALS CALCULATION ---
    const finalY = (doc as any).lastAutoTable.finalY + 10;

    doc.setDrawColor(220, 220, 220);
    doc.line(120, finalY - 5, 196, finalY - 5);

    let nextY = finalY;

    // Subtotal
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Subtotal:`, 140, nextY);
    doc.text(`Rs. ${order.subtotal.toLocaleString()}`, 196, nextY, { align: 'right' });

    // Discount
    if (order.discount && order.discount > 0) {
        nextY += 5;
        doc.setTextColor(34, 197, 94); // Green
        doc.text(`Discount:`, 140, nextY);
        doc.text(`- Rs. ${order.discount.toLocaleString()}`, 196, nextY, { align: 'right' });
        doc.setTextColor(...secondaryColor);
    }

    // Grand Total
    const finalTotal = order.netAmountPaid || (order.subtotal - (order.discount || 0));
    nextY += 10;

    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandColor);
    doc.text(`Grand Total:`, 140, nextY);
    doc.text(`Rs. ${finalTotal.toLocaleString()}`, 196, nextY, { align: 'right' });


    // --- 9. PROFESSIONAL FOOTER (Bottom Page) ---
    const pageHeight = doc.internal.pageSize.height || 297;
    
    // Authorization / Thank You Section
    const footerTopY = pageHeight - 40;

    doc.setFillColor(250, 250, 250);
    doc.rect(0, footerTopY, 210, 40, 'F'); // Light gray footer background

    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandColor);
    doc.text("Thank you for your business!", 105, footerTopY + 15, { align: "center" });

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150, 150, 150);
    doc.text("Authorized Signatory", 196, footerTopY + 25, { align: "right" });
    
    // Bottom Brand Strip
    doc.setFillColor(...brandColor);
    doc.rect(0, pageHeight - 5, 210, 5, 'F');
    
    // Save
    doc.save(`Invoice_${order.id}.pdf`);
};