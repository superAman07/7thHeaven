import jsPDF, { GState } from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoiceData {
    id: string;
    createdAt: string | Date;
    subtotal: number;
    discount?: number;
    netAmountPaid?: number;
    couponCode?: string;
    mlmOptInRequested?: boolean;
    companyDetails?: {
        name: string;
        address: string;
        phone: string;
        gstNumber?: string;
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
    const black: [number, number, number] = [0, 0, 0];
    const pageWidth = 210;
    const marginLeft = 14;
    const marginRight = 196;

    // --- 1. TOP BRAND STRIP ---
    doc.setFillColor(...brandColor);
    doc.rect(0, 0, pageWidth, 4, 'F');

    // --- 2. WATERMARK (Subtle) ---
    if (order.companyDetails?.logoUrl && order.companyDetails.logoUrl.startsWith('data:image')) {
        try {
            doc.saveGraphicsState();
            const gState = new GState({ opacity: 0.06 });
            doc.setGState(gState);
            doc.addImage(order.companyDetails.logoUrl, 'PNG', 35, 90, 140, 140);
            doc.restoreGraphicsState();
        } catch (e) {
            console.warn("Failed to add watermark", e);
        }
    }

    // --- 3. LOGO ---
    let headerBottomY = 20;
    if (order.companyDetails?.logoUrl && order.companyDetails.logoUrl.startsWith('data:image')) {
        try {
            doc.addImage(order.companyDetails.logoUrl, 'PNG', marginLeft, 10, 40, 20);
            headerBottomY = 35;
        } catch (e) {
            console.warn("Failed to add logo", e);
        }
    }

    // --- 4. "INVOICE" TITLE (Right-aligned, prominent) ---
    doc.setFont("helvetica", "bold");
    doc.setFontSize(26);
    doc.setTextColor(200, 200, 200);
    doc.text("INVOICE", marginRight, 22, { align: "right" });

    // --- 5. COMPANY NAME & GSTIN (Left, below logo) ---
    const companyName = order.companyDetails?.name || "Celsius";
    let titleFontSize = 13;
    if (companyName.length > 25) titleFontSize = 11;
    if (companyName.length > 35) titleFontSize = 9.5;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(titleFontSize);
    doc.setTextColor(...black);
    const nameY = headerBottomY === 35 ? 38 : 25;
    doc.text(companyName, marginLeft, nameY);

    let currentY = nameY;
    if (order.companyDetails?.gstNumber) {
        currentY += 5;
        doc.setFont("helvetica", "normal");
        doc.setFontSize(9);
        doc.setTextColor(100, 100, 100);
        doc.text(`GSTIN: ${order.companyDetails.gstNumber}`, marginLeft, currentY);
    }

    // --- 6. INVOICE META (Right-aligned) ---
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...secondaryColor);
    doc.text(`Invoice No: ${order.id.toUpperCase().substring(0, 14)}`, marginRight, 32, { align: "right" });
    doc.text(`Date: ${new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, marginRight, 37, { align: "right" });

    // --- 7. SEPARATOR ---
    const separatorY = Math.max(currentY + 8, 48);
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, separatorY, marginRight, separatorY);

    // --- 8. BILL TO & SHIP TO (Two columns) ---
    const billToY = separatorY + 8;

    // Left: BILL TO
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandColor);
    doc.text("BILL TO", marginLeft, billToY);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(...black);
    const customerName = order.user?.fullName || order.shippingAddress?.fullName || "Valued Customer";
    doc.text(customerName, marginLeft, billToY + 5);

    doc.setTextColor(80, 80, 80);
    const fullAddr = [
        order.shippingAddress?.fullAddress,
        order.shippingAddress?.city,
        order.shippingAddress?.state,
        order.shippingAddress?.pincode
    ].filter(Boolean).join(', ');
    const addressLines = doc.splitTextToSize(fullAddr, 85);
    doc.text(addressLines, marginLeft, billToY + 10);

    if (order.shippingAddress?.phone) {
        const phoneY = billToY + 10 + (addressLines.length * 4);
        doc.text(`Phone: ${order.shippingAddress.phone}`, marginLeft, phoneY);
    }

    // Right: ORDER DETAILS box
    const boxX = 120;
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(boxX, billToY - 3, 76, 22, 2, 2, 'F');

    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(120, 120, 120);
    doc.text("Order ID:", boxX + 4, billToY + 3);
    doc.text("Payment:", boxX + 4, billToY + 10);

    doc.setFont("helvetica", "bold");
    doc.setTextColor(...black);
    doc.text(order.id.toUpperCase().substring(0, 14), boxX + 72, billToY + 3, { align: "right" });
    doc.setTextColor(34, 139, 34);
    doc.text("PAID", boxX + 72, billToY + 10, { align: "right" });

    // --- 9. ITEMS TABLE ---
    const addressBlockHeight = (addressLines.length * 4) + 22;
    const tableStartY = billToY + Math.max(addressBlockHeight, 25);

    const tableBody = order.items.map(item => [
        item.product?.name || item.name || "Product",
        item.size || "-",
        item.quantity.toString(),
        `Rs. ${(item.priceAtPurchase || 0).toLocaleString('en-IN')}`,
        `Rs. ${((item.priceAtPurchase || 0) * item.quantity).toLocaleString('en-IN')}`
    ]);

    autoTable(doc, {
        startY: tableStartY,
        head: [['ITEM DESCRIPTION', 'SIZE', 'QTY', 'UNIT PRICE', 'AMOUNT']],
        body: tableBody,
        theme: 'grid',
        headStyles: {
            fillColor: [40, 40, 40],
            textColor: 255,
            fontSize: 8,
            fontStyle: 'bold',
            halign: 'left',
            cellPadding: 4
        },
        bodyStyles: {
            fontSize: 8.5,
            cellPadding: 4,
            textColor: [50, 50, 50]
        },
        alternateRowStyles: {
            fillColor: [250, 250, 250]
        },
        columnStyles: {
            0: { cellWidth: 75 },
            1: { halign: 'center', cellWidth: 20 },
            2: { halign: 'center', cellWidth: 15 },
            3: { halign: 'right', cellWidth: 35 },
            4: { halign: 'right', cellWidth: 35 }
        },
        styles: { lineColor: [220, 220, 220], lineWidth: 0.3 },
    });

    // --- 10. TOTALS SECTION ---
    const finalY = (doc as any).lastAutoTable.finalY + 8;
    const totalsX = 130;

    let nextY = finalY;

    // Separator above totals
    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(totalsX, nextY - 3, marginRight, nextY - 3);

    // Subtotal
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...secondaryColor);
    doc.text("Subtotal:", totalsX, nextY);
    doc.setFont("helvetica", "bold");
    doc.text(`Rs. ${order.subtotal.toLocaleString('en-IN')}`, marginRight, nextY, { align: 'right' });

    // Discount
    if (order.discount && order.discount > 0) {
        nextY += 7;
        const discountPercent = Math.round((order.discount / order.subtotal) * 100);

        doc.setFont("helvetica", "normal");
        doc.setTextColor(34, 197, 94);
        doc.text(`Discount (${discountPercent}% off):`, totalsX, nextY);
        doc.setFont("helvetica", "bold");
        doc.text(`- Rs. ${order.discount.toLocaleString('en-IN')}`, marginRight, nextY, { align: 'right' });

        // Coupon code badge
        if (order.couponCode) {
            nextY += 5;
            doc.setFontSize(7);
            doc.setTextColor(100, 100, 100);
            doc.text(`Coupon: ${order.couponCode}`, totalsX, nextY);
        }
    }

    // Grand Total highlight box
    nextY += 10;
    doc.setFillColor(248, 245, 235);
    doc.roundedRect(totalsX - 2, nextY - 5, 70, 12, 1, 1, 'F');

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...black);
    doc.text("Grand Total:", totalsX, nextY);

    const finalTotal = order.netAmountPaid || (order.subtotal - (order.discount || 0));
    doc.setTextColor(...brandColor);
    doc.text(`Rs. ${finalTotal.toLocaleString('en-IN')}`, marginRight, nextY, { align: 'right' });

    // --- 11. TERMS & CONDITIONS ---
    const termsY = nextY + 20;

    doc.setDrawColor(220, 220, 220);
    doc.setLineWidth(0.3);
    doc.line(marginLeft, termsY, marginRight, termsY);

    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(100, 100, 100);
    doc.text("TERMS & CONDITIONS", marginLeft, termsY + 6);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(7);
    doc.setTextColor(130, 130, 130);

    const terms = [
        "1. This is a computer-generated invoice and does not require a physical signature.",
        "2. Discount percentage shown is approximate (rounded off). Actual savings are reflected in the selling price.",
        "3. Goods once sold will not be taken back or exchanged unless under our return policy.",
        "4. All disputes are subject to jurisdiction of the courts in Mumbai, Maharashtra.",
        "5. For queries or returns, please contact us within 7 days of delivery."
    ];

    let termY = termsY + 11;
    terms.forEach((t) => {
        const splitTerm = doc.splitTextToSize(t, 180);
        doc.text(splitTerm, marginLeft, termY);
        termY += splitTerm.length * 3.5;
    });

    // --- 12. FOOTER ---
    const pageHeight = doc.internal.pageSize.height || 297;
    const footerTopY = pageHeight - 25;

    // Footer separator
    doc.setDrawColor(220, 220, 220);
    doc.line(marginLeft, footerTopY, marginRight, footerTopY);

    // Thank you message
    doc.setFontSize(9);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...brandColor);
    doc.text("Thank you for your business!", 105, footerTopY + 8, { align: "center" });

    // Authorized signatory
    doc.setFontSize(7);
    doc.setFont("helvetica", "italic");
    doc.setTextColor(160, 160, 160);
    doc.text("Authorized Signatory", marginRight, footerTopY + 14, { align: "right" });

    // Company name in footer
    doc.setFont("helvetica", "normal");
    doc.setTextColor(180, 180, 180);
    doc.text(companyName, marginLeft, footerTopY + 14);

    // Bottom brand strip
    doc.setFillColor(...brandColor);
    doc.rect(0, pageHeight - 4, pageWidth, 4, 'F');

    // Save
    doc.save(`Invoice_${order.id}.pdf`);
};