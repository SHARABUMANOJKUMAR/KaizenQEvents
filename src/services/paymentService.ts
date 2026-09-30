export const PAYMENT_WEBHOOK_URL = 'https://script.google.com/macros/s/AKfycbyfQkaJ7i5Flo_W3LajRbSNH2ay53vRjAT5zKbra9uIvXtfhbrMLhU_x9Xwa2myfy43/exec'; // New Agentic AI webhook

export interface RazorpayOrderResponse {
  result: string;
  orderId: string;
  amount: number;
  error?: string;
}

export interface VerifyPaymentResponse {
  result: string;
  message?: string;
  error?: string;
}

export const paymentService = {
  createOrder: async (data: any): Promise<RazorpayOrderResponse> => {
    try {
      const response = await fetch(PAYMENT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...data, action: 'createOrder' }),
      });
      
      const text = await response.text();
      
      let result;
      try {
        result = JSON.parse(text);
      } catch (parseError) {
        if (text.includes('Webhook Endpoint Active')) {
          throw new Error("Configuration Error: The Google Apps Script is returning the doGet() response instead of doPost(). Please ensure you deploy as a 'New Version' and select 'Execute as: Me' and 'Who has access: Anyone'.");
        }
        throw new Error("Invalid response from server: " + text.substring(0, 100));
      }

      if (result.result === 'error') {
        throw new Error(result.error);
      }
      return result;
    } catch (error: any) {
      console.error('Failed to create Razorpay order:', error);
      throw new Error(error.message || 'Payment initiation failed.');
    }
  },

  verifyPayment: async (data: any): Promise<VerifyPaymentResponse> => {
    try {
      const response = await fetch(PAYMENT_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({ ...data, action: 'verifyPayment' }),
      });
      const result = await response.json();
      if (result.result === 'error') {
        throw new Error(result.error);
      }
      return result;
    } catch (error: any) {
      console.error('Failed to verify payment:', error);
      throw new Error(error.message || 'Payment verification failed.');
    }
  }
};
