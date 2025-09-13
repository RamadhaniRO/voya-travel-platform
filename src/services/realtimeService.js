import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

class RealtimeService {
  constructor() {
    this.channels = new Map();
    this.presenceChannel = null;
    this.presenceState = {};
  }

  // Subscribe to property updates
  subscribeToProperties(callback) {
    const channel = supabase
      .channel('properties')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'properties'
        },
        (payload) => {
          console.log('Property change received:', payload);
          callback(payload);
        }
      )
      .subscribe();

    this.channels.set('properties', channel);
    return channel;
  }

  // Subscribe to booking updates
  subscribeToBookings(userId, callback) {
    const channel = supabase
      .channel('bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `traveler_id=eq.${userId}`
        },
        (payload) => {
          console.log('Booking change received:', payload);
          callback(payload);
          
          // Show toast for booking updates
          if (payload.eventType === 'INSERT') {
            toast.success('New booking confirmed!');
          } else if (payload.eventType === 'UPDATE') {
            toast.success('Booking status updated!');
          }
        }
      )
      .subscribe();

    this.channels.set('bookings', channel);
    return channel;
  }

  // Subscribe to notifications
  subscribeToNotifications(userId, callback) {
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('Notification received:', payload);
          callback(payload);
          
          // Show browser notification if permission granted
          if (Notification.permission === 'granted') {
            new Notification(payload.new.title, {
              body: payload.new.message,
              icon: '/favicon.ico'
            });
          }
        }
      )
      .subscribe();

    this.channels.set('notifications', channel);
    return channel;
  }

  // Subscribe to messages
  subscribeToMessages(userId, callback) {
    const channel = supabase
      .channel('messages')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `recipient_id=eq.${userId}`
        },
        (payload) => {
          console.log('Message received:', payload);
          callback(payload);
          toast.success('New message received!');
        }
      )
      .subscribe();

    this.channels.set('messages', channel);
    return channel;
  }

  // Subscribe to reviews
  subscribeToReviews(propertyId, callback) {
    const channel = supabase
      .channel(`reviews-${propertyId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'reviews',
          filter: `property_id=eq.${propertyId}`
        },
        (payload) => {
          console.log('Review change received:', payload);
          callback(payload);
        }
      )
      .subscribe();

    this.channels.set(`reviews-${propertyId}`, channel);
    return channel;
  }

  // Presence functionality - track online users
  async joinPresence(room, userId, userInfo) {
    try {
      this.presenceChannel = supabase.channel(`presence-${room}`, {
        config: {
          presence: {
            key: userId,
          },
        },
      });

      // Track presence state changes
      this.presenceChannel
        .on('presence', { event: 'sync' }, () => {
          const newState = this.presenceChannel.presenceState();
          this.presenceState = newState;
          console.log('Presence state synced:', newState);
        })
        .on('presence', { event: 'join' }, ({ key, newPresences }) => {
          console.log('User joined:', key, newPresences);
        })
        .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
          console.log('User left:', key, leftPresences);
        });

      // Join the presence channel
      await this.presenceChannel.track({
        user_id: userId,
        user_name: userInfo.name,
        avatar_url: userInfo.avatar_url,
        online_at: new Date().toISOString(),
      });

      return this.presenceChannel;
    } catch (error) {
      console.error('Error joining presence:', error);
      throw error;
    }
  }

  // Leave presence
  async leavePresence() {
    if (this.presenceChannel) {
      await this.presenceChannel.untrack();
      await supabase.removeChannel(this.presenceChannel);
      this.presenceChannel = null;
    }
  }

  // Broadcasting - send messages to multiple users
  async broadcastMessage(channel, event, payload) {
    try {
      const channelInstance = this.channels.get(channel);
      if (channelInstance) {
        await channelInstance.send({
          type: 'broadcast',
          event,
          payload
        });
      }
    } catch (error) {
      console.error('Error broadcasting message:', error);
      throw error;
    }
  }

  // Send real-time message to specific users
  async sendRealtimeMessage(recipientIds, message) {
    try {
      const channel = supabase.channel('realtime-messages');
      
      await channel.send({
        type: 'broadcast',
        event: 'message',
        payload: {
          recipient_ids: recipientIds,
          message,
          timestamp: new Date().toISOString()
        }
      });

      return channel;
    } catch (error) {
      console.error('Error sending real-time message:', error);
      throw error;
    }
  }

  // Subscribe to real-time messages
  subscribeToRealtimeMessages(callback) {
    const channel = supabase
      .channel('realtime-messages')
      .on('broadcast', { event: 'message' }, (payload) => {
        console.log('Real-time message received:', payload);
        callback(payload);
      })
      .subscribe();

    this.channels.set('realtime-messages', channel);
    return channel;
  }

  // Search properties with real-time updates
  async searchProperties(filters, callback) {
    try {
      const { data, error } = await supabase
        .rpc('search_properties', {
          search_query: filters.query || null,
          destination_filter: filters.destination || null,
          min_price: filters.minPrice || null,
          max_price: filters.maxPrice || null,
          property_type_filter: filters.propertyType || null,
          limit_count: filters.limit || 20,
          offset_count: filters.offset || 0
        });

      if (error) {
        console.error('Error searching properties:', error);
        return { error };
      }

      callback(data);

      // Subscribe to updates for search results
      const channel = supabase
        .channel('search-updates')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'properties'
          },
          (payload) => {
            // Re-run search when properties change
            this.searchProperties(filters, callback);
          }
        )
        .subscribe();

      this.channels.set('search-updates', channel);
      return { data };
    } catch (error) {
      console.error('Error searching properties:', error);
      return { error };
    }
  }

  // Get online users count
  getOnlineUsersCount() {
    return Object.keys(this.presenceState).length;
  }

  // Get online users
  getOnlineUsers() {
    return Object.values(this.presenceState).flat();
  }

  // Clean up all subscriptions
  async cleanup() {
    try {
      // Leave presence
      await this.leavePresence();

      // Unsubscribe from all channels
      for (const [name, channel] of this.channels) {
        await supabase.removeChannel(channel);
        console.log(`Unsubscribed from ${name}`);
      }

      this.channels.clear();
    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }

  // Request notification permission
  async requestNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        console.log('Notification permission granted');
        return true;
      }
    }
    return false;
  }

  // Send push notification
  async sendPushNotification(title, body, icon = '/favicon.ico') {
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon,
        tag: 'voya-notification'
      });
    }
  }
}

// Create singleton instance
const realtimeService = new RealtimeService();

export default realtimeService;
