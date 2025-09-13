import { supabase } from '../lib/supabase';

class AnalyticsService {
  constructor() {
    this.sessionId = this.generateSessionId();
    this.startTime = Date.now();
    this.events = [];
  }

  // Generate unique session ID
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Track page view
  trackPageView(page, properties = {}) {
    const event = {
      type: 'page_view',
      page,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        user_agent: navigator.userAgent,
        screen_resolution: `${screen.width}x${screen.height}`,
        language: navigator.language,
        referrer: document.referrer
      }
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Track user action
  trackAction(action, properties = {}) {
    const event = {
      type: 'action',
      action,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        page: window.location.pathname
      }
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Track search
  trackSearch(query, filters = {}, resultsCount = 0) {
    const event = {
      type: 'search',
      action: 'search',
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      properties: {
        query,
        filters,
        results_count: resultsCount,
        page: window.location.pathname
      }
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Track booking
  trackBooking(bookingId, propertyId, amount, currency = 'USD') {
    const event = {
      type: 'booking',
      action: 'booking_created',
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      properties: {
        booking_id: bookingId,
        property_id: propertyId,
        amount,
        currency,
        page: window.location.pathname
      }
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Track conversion
  trackConversion(type, value, properties = {}) {
    const event = {
      type: 'conversion',
      action: type,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        value,
        page: window.location.pathname
      }
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Track error
  trackError(error, context = {}) {
    const event = {
      type: 'error',
      action: 'error_occurred',
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      properties: {
        error_message: error.message,
        error_stack: error.stack,
        context,
        page: window.location.pathname,
        user_agent: navigator.userAgent
      }
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Track performance
  trackPerformance(metric, value, properties = {}) {
    const event = {
      type: 'performance',
      action: metric,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        value,
        page: window.location.pathname
      }
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Track user engagement
  trackEngagement(action, duration = null, properties = {}) {
    const event = {
      type: 'engagement',
      action,
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
      properties: {
        ...properties,
        duration,
        page: window.location.pathname
      }
    };

    this.events.push(event);
    this.sendEvent(event);
  }

  // Send event to Supabase
  async sendEvent(event) {
    try {
      // Store in local analytics table
      const { error } = await supabase
        .from('analytics_events')
        .insert([{
          session_id: event.session_id,
          event_type: event.type,
          action: event.action,
          properties: event.properties,
          timestamp: event.timestamp
        }]);

      if (error) {
        console.error('Error sending analytics event:', error);
      }
    } catch (error) {
      console.error('Error sending analytics event:', error);
    }
  }

  // Get session analytics
  async getSessionAnalytics(sessionId = null) {
    try {
      const id = sessionId || this.sessionId;
      
      const { data, error } = await supabase
        .from('analytics_events')
        .select('*')
        .eq('session_id', id)
        .order('timestamp', { ascending: true });

      if (error) {
        console.error('Error getting session analytics:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error getting session analytics:', error);
      return { error };
    }
  }

  // Get user analytics
  async getUserAnalytics(userId, startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('properties->>user_id', userId);

      if (startDate) {
        query = query.gte('timestamp', startDate);
      }

      if (endDate) {
        query = query.lte('timestamp', endDate);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) {
        console.error('Error getting user analytics:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error getting user analytics:', error);
      return { error };
    }
  }

  // Get page analytics
  async getPageAnalytics(page, startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('properties->>page', page);

      if (startDate) {
        query = query.gte('timestamp', startDate);
      }

      if (endDate) {
        query = query.lte('timestamp', endDate);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) {
        console.error('Error getting page analytics:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error getting page analytics:', error);
      return { error };
    }
  }

  // Get conversion analytics
  async getConversionAnalytics(startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'conversion');

      if (startDate) {
        query = query.gte('timestamp', startDate);
      }

      if (endDate) {
        query = query.lte('timestamp', endDate);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) {
        console.error('Error getting conversion analytics:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error getting conversion analytics:', error);
      return { error };
    }
  }

  // Get search analytics
  async getSearchAnalytics(startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'search');

      if (startDate) {
        query = query.gte('timestamp', startDate);
      }

      if (endDate) {
        query = query.lte('timestamp', endDate);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) {
        console.error('Error getting search analytics:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error getting search analytics:', error);
      return { error };
    }
  }

  // Get error analytics
  async getErrorAnalytics(startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'error');

      if (startDate) {
        query = query.gte('timestamp', startDate);
      }

      if (endDate) {
        query = query.lte('timestamp', endDate);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) {
        console.error('Error getting error analytics:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error getting error analytics:', error);
      return { error };
    }
  }

  // Get performance analytics
  async getPerformanceAnalytics(startDate = null, endDate = null) {
    try {
      let query = supabase
        .from('analytics_events')
        .select('*')
        .eq('event_type', 'performance');

      if (startDate) {
        query = query.gte('timestamp', startDate);
      }

      if (endDate) {
        query = query.lte('timestamp', endDate);
      }

      const { data, error } = await query.order('timestamp', { ascending: false });

      if (error) {
        console.error('Error getting performance analytics:', error);
        return { error };
      }

      return { data };
    } catch (error) {
      console.error('Error getting performance analytics:', error);
      return { error };
    }
  }

  // Get dashboard analytics
  async getDashboardAnalytics(startDate = null, endDate = null) {
    try {
      const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
      const end = endDate || new Date().toISOString();

      const [
        pageViews,
        conversions,
        searches,
        errors,
        performance
      ] = await Promise.all([
        this.getPageAnalytics(null, start, end),
        this.getConversionAnalytics(start, end),
        this.getSearchAnalytics(start, end),
        this.getErrorAnalytics(start, end),
        this.getPerformanceAnalytics(start, end)
      ]);

      return {
        pageViews: pageViews.data || [],
        conversions: conversions.data || [],
        searches: searches.data || [],
        errors: errors.data || [],
        performance: performance.data || [],
        period: { start, end }
      };
    } catch (error) {
      console.error('Error getting dashboard analytics:', error);
      return { error };
    }
  }

  // Track session end
  trackSessionEnd() {
    const duration = Date.now() - this.startTime;
    this.trackEngagement('session_end', duration);
  }

  // Initialize analytics
  init() {
    // Track session start
    this.trackEngagement('session_start');

    // Track page view
    this.trackPageView(window.location.pathname);

    // Track performance metrics
    if (window.performance) {
      window.addEventListener('load', () => {
        const perfData = window.performance.timing;
        const loadTime = perfData.loadEventEnd - perfData.navigationStart;
        this.trackPerformance('page_load_time', loadTime);
      });
    }

    // Track session end on page unload
    window.addEventListener('beforeunload', () => {
      this.trackSessionEnd();
    });

    // Track errors
    window.addEventListener('error', (event) => {
      this.trackError(event.error, {
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno
      });
    });

    // Track unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError(new Error(event.reason), {
        type: 'unhandled_promise_rejection'
      });
    });
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

export default analyticsService;
