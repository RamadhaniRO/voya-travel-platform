import { supabase } from '../lib/supabase'

// Destinations
export const destinationsService = {
  async getAll() {
    const { data, error } = await supabase
      .from('destinations')
      .select('*')
      .order('name')
    
    if (error) throw error
    return data
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
  },

  async getById(id) {
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
