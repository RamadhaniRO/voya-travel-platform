-- Voya Travel Platform Database Schema
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_stat_statements";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- Enable uuid_generate_v4 function
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- Create custom types
CREATE TYPE user_role AS ENUM ('traveler', 'host', 'admin');
CREATE TYPE booking_status AS ENUM ('pending', 'confirmed', 'cancelled', 'completed');
CREATE TYPE property_type AS ENUM ('hotel', 'apartment', 'villa', 'lodge', 'camp', 'resort', 'guesthouse', 'hostel', 'campsite');
CREATE TYPE amenity_type AS ENUM ('wifi', 'pool', 'spa', 'gym', 'restaurant', 'bar', 'parking', 'airport_shuttle', 'pets_allowed', 'beach_access');
CREATE TYPE notification_type AS ENUM ('booking', 'payment', 'message', 'reminder', 'promotion', 'system');
CREATE TYPE email_status AS ENUM ('pending', 'sent', 'failed', 'delivered', 'opened', 'clicked');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'refunded');
CREATE TYPE payment_method AS ENUM ('card', 'bank_transfer', 'paypal', 'stripe');

-- Users table (extends Supabase auth.users)
CREATE TABLE public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    first_name TEXT,
    last_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'traveler',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Destinations table
CREATE TABLE public.destinations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    country TEXT NOT NULL,
    region TEXT,
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Properties table
CREATE TABLE public.properties (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    host_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    destination_id UUID REFERENCES public.destinations(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    property_type property_type NOT NULL,
    max_guests INTEGER NOT NULL,
    price_per_night DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    amenities TEXT[],
    images TEXT[],
    is_available BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bookings table
CREATE TABLE public.bookings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    traveler_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    check_in_date DATE,
    check_out_date DATE,
    total_price DECIMAL(10, 2) NOT NULL,
    status booking_status DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Reviews table
CREATE TABLE public.reviews (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reviewer_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    comment TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.destinations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies
CREATE POLICY "Users can view their own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Anyone can view destinations" ON public.destinations
    FOR SELECT USING (true);

CREATE POLICY "Anyone can view available properties" ON public.properties
    FOR SELECT USING (is_available = true);

-- Notifications table
CREATE TABLE public.notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    type notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email notifications tracking table
CREATE TABLE public.email_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    template_name TEXT NOT NULL,
    recipient_email TEXT NOT NULL,
    variables JSONB,
    status email_status DEFAULT 'pending',
    sent_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE public.payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    status payment_status DEFAULT 'pending',
    method payment_method NOT NULL,
    stripe_payment_intent_id TEXT,
    transaction_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table for communication between users
CREATE TABLE public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    recipient_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE CASCADE,
    subject TEXT,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Search history table
CREATE TABLE public.search_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB,
    results_count INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Property amenities junction table
CREATE TABLE public.property_amenities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
    amenity amenity_type NOT NULL,
    UNIQUE(property_id, amenity)
);

-- Analytics events table
CREATE TABLE public.analytics_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    action TEXT NOT NULL,
    properties JSONB,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- Create index for analytics queries
CREATE INDEX idx_analytics_events_session_id ON public.analytics_events(session_id);
CREATE INDEX idx_analytics_events_event_type ON public.analytics_events(event_type);
CREATE INDEX idx_analytics_events_timestamp ON public.analytics_events(timestamp);
CREATE INDEX idx_analytics_events_user_id ON public.analytics_events(user_id);

-- Update properties table to use proper amenities
ALTER TABLE public.properties DROP COLUMN IF EXISTS amenities;

-- RLS Policies for new tables
CREATE POLICY "Users can view their own notifications" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own email notifications" ON public.email_notifications
    FOR SELECT USING (auth.uid()::text = recipient_email OR auth.jwt() ->> 'role' = 'admin');

CREATE POLICY "Users can view their own payments" ON public.payments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.bookings 
            WHERE bookings.id = payments.booking_id 
            AND bookings.traveler_id = auth.uid()
        )
    );

CREATE POLICY "Users can view their own messages" ON public.messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = recipient_id);

CREATE POLICY "Users can send messages" ON public.messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);

CREATE POLICY "Users can view their own search history" ON public.search_history
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Anyone can view property amenities" ON public.property_amenities
    FOR SELECT USING (true);

CREATE POLICY "Users can view their own analytics" ON public.analytics_events
    FOR SELECT USING (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Users can insert their own analytics" ON public.analytics_events
    FOR INSERT WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

CREATE POLICY "Admins can view all analytics" ON public.analytics_events
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE profiles.id = auth.uid() 
            AND profiles.role = 'admin'
        )
    );

-- Database Functions for Enhanced Features

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'first_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'last_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'role', 'traveler')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_properties_updated_at BEFORE UPDATE ON public.properties
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON public.payments
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to send notification on booking creation
CREATE OR REPLACE FUNCTION public.notify_booking_created()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify the host
  INSERT INTO public.notifications (user_id, type, title, message)
  SELECT 
    p.host_id,
    'booking',
    'New Booking Request',
    'You have a new booking request for ' || p.name
  FROM public.properties p
  WHERE p.id = NEW.property_id;
  
  -- Notify the traveler
  INSERT INTO public.notifications (user_id, type, title, message)
  VALUES (
    NEW.traveler_id,
    'booking',
    'Booking Confirmed',
    'Your booking request has been submitted successfully'
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for booking notifications
CREATE TRIGGER on_booking_created
  AFTER INSERT ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.notify_booking_created();

-- Function to calculate property rating
CREATE OR REPLACE FUNCTION public.calculate_property_rating(property_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
  avg_rating DECIMAL(3,2);
BEGIN
  SELECT COALESCE(AVG(rating), 0) INTO avg_rating
  FROM public.reviews
  WHERE property_id = property_uuid;
  
  RETURN avg_rating;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to search properties with full-text search
CREATE OR REPLACE FUNCTION public.search_properties(
  search_query TEXT,
  destination_filter UUID DEFAULT NULL,
  min_price DECIMAL DEFAULT NULL,
  max_price DECIMAL DEFAULT NULL,
  property_type_filter property_type DEFAULT NULL,
  limit_count INTEGER DEFAULT 20,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  property_type property_type,
  price_per_night DECIMAL,
  rating DECIMAL,
  image_url TEXT,
  destination_name TEXT,
  country TEXT,
  region TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.name,
    p.description,
    p.property_type,
    p.price_per_night,
    public.calculate_property_rating(p.id) as rating,
    COALESCE(p.images[1], '') as image_url,
    d.name as destination_name,
    d.country,
    d.region
  FROM public.properties p
  JOIN public.destinations d ON p.destination_id = d.id
  WHERE 
    p.is_available = true
    AND (search_query IS NULL OR p.name ILIKE '%' || search_query || '%' 
         OR p.description ILIKE '%' || search_query || '%'
         OR d.name ILIKE '%' || search_query || '%')
    AND (destination_filter IS NULL OR p.destination_id = destination_filter)
    AND (min_price IS NULL OR p.price_per_night >= min_price)
    AND (max_price IS NULL OR p.price_per_night <= max_price)
    AND (property_type_filter IS NULL OR p.property_type = property_type_filter)
  ORDER BY rating DESC, p.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user activity analytics
CREATE OR REPLACE FUNCTION public.get_user_analytics(user_uuid UUID)
RETURNS TABLE (
  total_bookings INTEGER,
  total_spent DECIMAL,
  favorite_destination TEXT,
  average_rating DECIMAL,
  properties_hosted INTEGER,
  total_revenue DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    (SELECT COUNT(*)::INTEGER FROM public.bookings WHERE traveler_id = user_uuid) as total_bookings,
    (SELECT COALESCE(SUM(total_price), 0) FROM public.bookings WHERE traveler_id = user_uuid) as total_spent,
    (SELECT d.name FROM public.destinations d 
     JOIN public.properties p ON d.id = p.destination_id
     JOIN public.bookings b ON p.id = b.property_id
     WHERE b.traveler_id = user_uuid
     GROUP BY d.name ORDER BY COUNT(*) DESC LIMIT 1) as favorite_destination,
    (SELECT COALESCE(AVG(rating), 0) FROM public.reviews WHERE reviewer_id = user_uuid) as average_rating,
    (SELECT COUNT(*)::INTEGER FROM public.properties WHERE host_id = user_uuid) as properties_hosted,
    (SELECT COALESCE(SUM(b.total_price), 0) FROM public.bookings b
     JOIN public.properties p ON b.property_id = p.id
     WHERE p.host_id = user_uuid) as total_revenue;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert sample destinations
INSERT INTO public.destinations (name, country, region, description, image_url) VALUES
('Serengeti National Park', 'Tanzania', 'Northern Tanzania', 'Famous for wildlife and migration', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'),
('Victoria Falls', 'Zambia', 'Southern Africa', 'One of the largest waterfalls in the world', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'),
('Cape Town', 'South Africa', 'Western Cape', 'Beautiful coastal city with Table Mountain', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800'),
('Maasai Mara Reserve', 'Kenya', 'Southwestern Kenya', 'Iconic savannah landscapes and wildlife', 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?w=800'),
('Zanzibar Island', 'Tanzania', 'Zanzibar Archipelago', 'Pristine beaches and rich history', 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800'),
('Pyramids of Giza', 'Egypt', 'Giza', 'Ancient wonders of the world', 'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=800');

-- Sample properties will be inserted after users are created
