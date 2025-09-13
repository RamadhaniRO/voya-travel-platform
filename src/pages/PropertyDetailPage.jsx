import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Star, MapPin, Users, Calendar, Wifi, Car, Utensils, Waves } from 'lucide-react';
import Button from '../components/Button/Button';
import Card from '../components/Card/Card';
import { propertiesService, bookingsService } from '../services/database';
import { useAuth } from '../contexts/AuthContext';
import analyticsService from '../services/analyticsService';

const PropertyDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const propertyData = await propertiesService.getById(id);
        setProperty(propertyData);
        
        // Track property view
        analyticsService.trackEvent('view', 'property_detail', { property_id: id });
        
      } catch (error) {
        console.error('Error fetching property:', error);
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProperty();
    }
  }, [id, navigate]);

  // Handle booking
  const handleBookNow = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setBookingLoading(true);
      
      // Track booking attempt
      analyticsService.trackEvent('click', 'book_now', { property_id: id });
      
      // Navigate to booking page
      navigate(`/booking/${id}`);
      
    } catch (error) {
      console.error('Error initiating booking:', error);
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle contact host
  const handleContactHost = () => {
    if (!user) {
      navigate('/login');
      return;
    }
    
    // Track contact host event
    analyticsService.trackEvent('click', 'contact_host', { property_id: id });
    
    // TODO: Implement messaging system
    alert('Messaging system coming soon!');
  };

  // Amenity icons mapping
  const amenityIcons = {
    wifi: Wifi,
    parking: Car,
    restaurant: Utensils,
    beach_access: Waves,
    pool: Waves,
    spa: Waves,
    gym: Waves,
    airport_shuttle: Car,
    pets_allowed: Users
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-4"></div>
            <div className="h-64 bg-gray-200 rounded mb-6"></div>
            <div className="h-4 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 bg-gray-200 rounded mb-4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-8">Property Not Found</h1>
          <Button variant="outline" onClick={() => navigate('/search')}>
            Back to Search
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Property Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-neutral-900 mb-2">{property.name}</h1>
          <div className="flex items-center text-neutral-600 mb-4">
            <MapPin className="w-5 h-5 mr-2" />
            <span>{property.destination_name}, {property.country}</span>
          </div>
          <div className="flex items-center mb-4">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-5 h-5 ${i < Math.floor(property.rating || 0) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
              />
            ))}
            <span className="ml-2 text-sm text-neutral-600">
              {property.rating ? property.rating.toFixed(1) : 'No ratings yet'}
            </span>
          </div>
        </div>

        {/* Property Images */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            {property.images && property.images[0] ? (
              <img 
                src={property.images[0]} 
                alt={property.name}
                className="w-full h-96 object-cover rounded-lg"
              />
            ) : (
              <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
                <span className="text-gray-500">No image available</span>
              </div>
            )}
          </div>
          <div className="space-y-4">
            {property.images && property.images.slice(1, 4).map((image, index) => (
              <img 
                key={index}
                src={image} 
                alt={`${property.name} ${index + 2}`}
                className="w-full h-28 object-cover rounded-lg"
              />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Property Details */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <h2 className="text-2xl font-bold mb-4">About this property</h2>
              <p className="text-neutral-700 mb-6">{property.description}</p>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-2 text-neutral-600" />
                  <span className="text-sm text-neutral-600">Up to {property.max_guests} guests</span>
                </div>
                <div className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-neutral-600" />
                  <span className="text-sm text-neutral-600">{property.property_type}</span>
                </div>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold mb-3">Amenities</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {property.amenities.map((amenity, index) => {
                      const IconComponent = amenityIcons[amenity] || Users;
                      return (
                        <div key={index} className="flex items-center">
                          <IconComponent className="w-4 h-4 mr-2 text-neutral-600" />
                          <span className="text-sm text-neutral-600 capitalize">{amenity.replace('_', ' ')}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </Card>
          </div>

          {/* Booking Card */}
          <div>
            <Card>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-teal-600 mb-2">
                  ${property.price_per_night}
                  <span className="text-lg font-normal text-neutral-600">/night</span>
                </div>
                <div className="text-sm text-neutral-600">
                  {property.currency} • {property.property_type}
                </div>
              </div>
              
              <div className="space-y-4">
                <Button 
                  variant="primary" 
                  fullWidth 
                  size="large"
                  onClick={handleBookNow}
                  loading={bookingLoading}
                >
                  Book Now
                </Button>
                <Button 
                  variant="outline" 
                  fullWidth 
                  size="large"
                  onClick={handleContactHost}
                >
                  Contact Host
                </Button>
              </div>
              
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div className="text-sm text-neutral-600 text-center">
                  <p className="mb-2">🔒 Secure booking</p>
                  <p className="mb-2">📧 Instant confirmation</p>
                  <p>💰 Best price guarantee</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetailPage;
