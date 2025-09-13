import { supabase } from '../lib/supabase';

class EdgeFunctionsService {
  constructor() {
    this.baseUrl = import.meta.env.VITE_SUPABASE_URL;
  }

  // Generic function to call Edge Functions
  async callFunction(functionName, data = {}) {
    try {
      const { data: result, error } = await supabase.functions.invoke(functionName, {
        body: data
      });

      if (error) {
        console.error(`Error calling ${functionName}:`, error);
        return { error };
      }

      return { data: result };
    } catch (error) {
      console.error(`Error calling ${functionName}:`, error);
      return { error };
    }
  }

  // Send email notification
  async sendEmail(to, subject, template, data = {}) {
    return await this.callFunction('voya-api', {
      path: '/api/send-email',
      method: 'POST',
      body: { to, subject, template, data }
    });
  }

  // Process payment
  async processPayment(bookingId, amount, currency, paymentMethod) {
    return await this.callFunction('voya-api', {
      path: '/api/process-payment',
      method: 'POST',
      body: { booking_id: bookingId, amount, currency, payment_method: paymentMethod }
    });
  }

  // Generate analytics report
  async generateReport(startDate, endDate, reportType) {
    return await this.callFunction('voya-api', {
      path: '/api/generate-report',
      method: 'POST',
      body: { start_date: startDate, end_date: endDate, report_type: reportType }
    });
  }

  // Process image
  async processImage(imageUrl, width, height, quality) {
    return await this.callFunction('voya-api', {
      path: '/api/process-image',
      method: 'POST',
      body: { image_url: imageUrl, width, height, quality }
    });
  }

  // Send notification
  async sendNotification(userId, title, message, type = 'system') {
    return await this.callFunction('voya-api', {
      path: '/api/send-notification',
      method: 'POST',
      body: { user_id: userId, title, message, type }
    });
  }

  // Get analytics data
  async getAnalytics(startDate, endDate, metrics = []) {
    return await this.callFunction('voya-api', {
      path: '/api/analytics',
      method: 'POST',
      body: { start_date: startDate, end_date: endDate, metrics }
    });
  }
}

// Create singleton instance
const edgeFunctionsService = new EdgeFunctionsService();

export default edgeFunctionsService;
