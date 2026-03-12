// lib/services/shipquickr.ts

export interface ShipquickrOrderItem {
  productName: string;
  category: string;
  quantity: number;
  price: number;
}

export interface ShipquickrOrderPayload {
  orderId: string;
  orderDate: string;
  customerName: string;
  mobile: string;
  email: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMode: string;
  totalAmount: number;
  physicalWeight: number; 
  length: number;         
  breadth: number;        
  height: number;         
  items: ShipquickrOrderItem[];
}

export async function pushOrderToShipquickr(payload: ShipquickrOrderPayload) {
  const apiUrl = process.env.SHIPQUICKR_API_URL;
  const apiKey = process.env.SHIPQUICKR_MERCHANT_API_KEY;

  if (!apiUrl || !apiKey) {
    console.error('Shipquickr Integration: Missing API URL or API Key in environment variables.');
    return { success: false, error: 'Missing configuration' };
  }

  try {
    const response = await fetch(`${apiUrl}/orders/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
        const errorText = await response.text();
        console.error('Shipquickr API Error Details:', errorText);
        throw new Error(`Shipquickr API responded with status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Successfully pushed order ${payload.orderId} to Shipquickr.`);
    return { success: true, data };
  } catch (error) {
    console.error(`Failed to push order ${payload.orderId} to Shipquickr:`, error);
    // Note: Future feature could log this orderId into a 'FailedSyncs' database table for retry
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}
