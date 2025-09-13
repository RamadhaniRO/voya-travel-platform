import { supabase, isSupabaseConfigured } from '../lib/supabase'

// Mock data for development when Supabase is not configured
const mockDestinations = [
  {
    id: 1,
    name: 'Serengeti National Park',
    country: 'Tanzania',
    region: 'Northern Tanzania',
    description: 'Experience the great wildebeest migration and witness Africa\'s most spectacular wildlife.',
    image_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Maasai Mara Reserve',
    country: 'Kenya',
    region: 'Southwestern Kenya',
    description: 'Discover the iconic savannah landscapes and rich cultural heritage of the Maasai people.',
    image_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: 3,
    name: 'Victoria Falls',
    country: 'Zimbabwe',
    region: 'Matabeleland North',
    description: 'Marvel at one of the world\'s largest waterfalls and enjoy thrilling adventure activities.',
    image_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: 4,
    name: 'Cape Town',
    country: 'South Africa',
    region: 'Western Cape',
    description: 'Explore the vibrant city, stunning beaches, and iconic Table Mountain.',
    image_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: 5,
    name: 'Zanzibar Island',
    country: 'Tanzania',
    region: 'Zanzibar',
    description: 'Relax on pristine beaches and immerse yourself in the island\'s rich history.',
    image_url: null,
    created_at: new Date().toISOString()
  },
  {
    id: 6,
    name: 'Pyramids of Giza',
    country: 'Egypt',
    region: 'Giza',
    description: 'Step back in time and explore one of the ancient world\'s greatest wonders.',
    image_url: null,
    created_at: new Date().toISOString()
  }
];

const mockProperties = [
  {
    id: 1,
    name: 'Serengeti Luxury Lodge',
    destination_name: 'Serengeti National Park',
    country: 'Tanzania',
    description: 'Experience the magic of the Serengeti with luxury accommodations and guided safaris.',
    price_per_night: 350,
    currency: 'USD',
    max_guests: 4,
    property_type: 'Lodge',
    rating: 4.9,
    images: [],
    amenities: ['wifi', 'pool', 'restaurant', 'safari_tours'],
    created_at: new Date().toISOString()
  },
  {
    id: 2,
    name: 'Maasai Mara Camp',
    destination_name: 'Maasai Mara Reserve',
    country: 'Kenya',
    description: 'Authentic tented camp experience in the heart of the Maasai Mara.',
    price_per_night: 280,
    currency: 'USD',
    max_guests: 6,
    property_type: 'Camp',
    rating: 4.8,
    images: [],
    amenities: ['wifi', 'guided_tours', 'cultural_experience'],
    created_at: new Date().toISOString()
  }
];

// Generic function to handle database operations
const handleDatabaseOperation = async (operation, fallbackData = []) => {
  if (!isSupabaseConfigured()) {
    console.warn('Supabase not configured. Using mock data.');
    return { data: fallbackData, error: null };
  }
  
  try {
    return await operation();
  } catch (error) {
    console.error('Database operation failed:', error);
    return { data: fallbackData, error };
  }
};

// Destinations
export const destinationsService = {
  async getAll() {
    return await handleDatabaseOperation(async () => {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('name')
      
      if (error) throw error
      return data
    }, mockDestinations);
  },

  async getById(id) {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async create(destination) {
    const { data, error } = await supabase
      .from('destinations')
      .insert(destination)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('destinations')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('destinations')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Properties
export const propertiesService = {
  async getAll(filters = {}) {
    return await handleDatabaseOperation(async () => {
      let query = supabase
        .from('properties')
        .select(`
          *,
          destinations (name, country, region),
          profiles!properties_host_id_fkey (first_name, last_name, avatar_url)
        `)
        .eq('is_available', true)

      if (filters.destinationId) {
        query = query.eq('destination_id', filters.destinationId)
      }
      if (filters.propertyType) {
        query = query.eq('property_type', filters.propertyType)
      }
      if (filters.maxGuests) {
        query = query.gte('max_guests', filters.maxGuests)
      }
      if (filters.priceRange) {
        query = query.gte('price_per_night', filters.priceRange.min)
          .lte('price_per_night', filters.priceRange.max)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) throw error
      return data
    }, mockProperties);
  },

  async getById(id) {
    return await handleDatabaseOperation(async () => {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          destinations (name, country, region),
          profiles!properties_host_id_fkey (first_name, last_name, avatar_url, phone)
        `)
        .eq('id', id)
        .single()
      
      if (error) throw error
      return data
    }, mockProperties.find(p => p.id === parseInt(id)) || mockProperties[0]);
  },

  async getByHost(hostId) {
    const { data, error } = await supabase
      .from('properties')
      .select(`
        *,
        destinations (name, country, region)
      `)
      .eq('host_id', hostId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(property) {
    const { data, error } = await supabase
      .from('properties')
      .insert(property)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('properties')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('properties')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Bookings
export const bookingsService = {
  async getAllByUser(userId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        properties (
          name,
          images,
          destinations (name, country)
        )
      `)
      .eq('traveler_id', userId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async getByProperty(propertyId) {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        profiles!bookings_traveler_id_fkey (first_name, last_name, email)
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(booking) {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async cancel(id) {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Reviews
export const reviewsService = {
  async getByProperty(propertyId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles!reviews_reviewer_id_fkey (first_name, last_name, avatar_url)
      `)
      .eq('property_id', propertyId)
      .order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  },

  async create(review) {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('reviews')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  },

  async delete(id) {
    const { error } = await supabase
      .from('reviews')
      .delete()
      .eq('id', id)
    
    if (error) throw error
  }
}

// Profiles
export const profilesService = {
  async getById(id) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) throw error
    return data
  },

  async update(id, updates) {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    
    if (error) throw error
    return data
  }
}

// Search
export const searchService = {
  async searchProperties(filters) {
    let query = supabase
      .from('properties')
      .select(`
        *,
        destinations (name, country, region),
        profiles!properties_host_id_fkey (first_name, last_name, avatar_url)
      `)
      .eq('is_available', true)

    if (filters.destination) {
      query = query.ilike('destinations.name', `%${filters.destination}%`)
    }
    if (filters.checkIn && filters.checkOut) {
      // Check for availability (simplified - in real app you'd check against existing bookings)
      query = query.eq('is_available', true)
    }
    if (filters.guests) {
      query = query.gte('max_guests', filters.guests)
    }
    if (filters.propertyType) {
      query = query.eq('property_type', filters.propertyType)
    }
    if (filters.priceRange) {
      query = query.gte('price_per_night', filters.priceRange.min)
        .lte('price_per_night', filters.priceRange.max)
    }

    const { data, error } = await query.order('created_at', { ascending: false })
    
    if (error) throw error
    return data
  }
}
