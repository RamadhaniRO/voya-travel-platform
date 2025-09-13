import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Calendar, Users, DollarSign, CreditCard } from 'lucide-react';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import Card from '../components/Card/Card';
import StripePayment from '../components/Payment/StripePayment';
import { propertiesService, bookingsService } from '../services/database';
import { useAuth } from '../contexts/AuthContext';
import analyticsService from '../services/analyticsService';
import edgeFunctionsService from '../services/edgeFunctionsService';

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [bookingData, setBookingData] = useState({
    checkIn: '',
    checkOut: '',
    guests: 1,
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    specialRequests: ''
  });
  const [error, setError] = useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  // Fetch property details
  useEffect(() => {
    const fetchProperty = async () => {
      try {
        setLoading(true);
        const propertyData = await propertiesService.getById(id);
        setProperty(propertyData);
        
        // Pre-fill user data
        setBookingData(prev => ({
          ...prev,
          firstName: user.user_metadata?.first_name || '',
          lastName: user.user_metadata?.last_name || '',
          email: user.email || ''
        }));
        
        // Track booking page view
        analyticsService.trackEvent('view', 'booking_page', { property_id: id });
        
      } catch (error) {
        console.error('Error fetching property:', error);
        navigate('/search');
      } finally {
        setLoading(false);
      }
    };

    if (id && user) {
      fetchProperty();
    }
  }, [id, user, navigate]);

  // Handle input changes
  const handleInputChange = (field, value) => {
    setBookingData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user makes changes
    if (error) {
      setError('');
    }
  };

  // Validate booking data
  const validateBookingData = () => {
    if (!bookingData.checkIn || !bookingData.checkOut) {
      setError('Please select check-in and check-out dates');
      return false;
    }

    if (new Date(bookingData.checkIn) >= new Date(bookingData.checkOut)) {
      setError('Check-out date must be after check-in date');
      return false;
    }

    if (bookingData.guests > property.max_guests) {
      setError(`Maximum ${property.max_guests} guests allowed`);
      return false;
    }

    if (!bookingData.firstName || !bookingData.lastName || !bookingData.email) {
      setError('Please fill in all required fields');
      return false;
    }

    return true;
  };

  // Calculate total price
  const calculateTotalPrice = () => {
    if (!property || !bookingData.checkIn || !bookingData.checkOut) return 0;
    
    const checkIn = new Date(bookingData.checkIn);
    const checkOut = new Date(bookingData.checkOut);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    
    return nights * property.price_per_night;
  };

  // Handle payment success
  const handlePaymentSuccess = async (paymentMethod) => {
    try {
      setBookingLoading(true);
      setError('');

      // Validate booking data first
      if (!validateBookingData()) {
        setBookingLoading(false);
        return;
      }

      // Create booking
      const booking = {
        property_id: id,
        traveler_id: user.id,
        check_in_date: bookingData.checkIn,
        check_out_date: bookingData.checkOut,
        total_price: calculateTotalPrice(),
        status: 'confirmed'
      };

      const result = await bookingsService.create(booking);
      
      if (result.error) {
        setError(result.error.message);
        analyticsService.trackEvent('error', 'booking_failed', { error: result.error.message });
      } else {
        analyticsService.trackEvent('success', 'booking_created', { booking_id: result.data.id });
        
        // Process payment
        const paymentResult = await edgeFunctionsService.processPayment(
          result.data.id,
          calculateTotalPrice(),
          'USD',
          'stripe'
        );

        if (paymentResult.error) {
          setError('Booking created but payment failed. Please contact support.');
        } else {
          // Send confirmation email
          await edgeFunctionsService.sendEmail(
            bookingData.email,
            'Booking Confirmation',
            'booking_confirmation',
            {
              property_name: property.name,
              check_in: bookingData.checkIn,
              check_out: bookingData.checkOut,
              total_price: calculateTotalPrice()
            }
          );

          navigate(`/booking-success/${result.data.id}`);
        }
      }
    } catch (error) {
      setError('An unexpected error occurred');
      analyticsService.trackEvent('error', 'booking_error', { error: error.message });
    } finally {
      setBookingLoading(false);
    }
  };

  // Handle payment error
  const handlePaymentError = (error) => {
    setError(error.message || 'Payment failed. Please try again.');
    analyticsService.trackEvent('error', 'payment_failed', { error: error.message });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-8"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">Book Your Adventure</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Booking Form */}
          <div className="lg:col-span-2">
            <Card className="mb-6">
              <h2 className="text-xl font-semibold mb-6">Booking Details</h2>
              
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-6">
                {/* Dates and Guests */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Check In
                    </label>
                    <Input
                      type="date"
                      value={bookingData.checkIn}
                      onChange={(e) => handleInputChange('checkIn', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Calendar className="w-4 h-4 inline mr-1" />
                      Check Out
                    </label>
                    <Input
                      type="date"
                      value={bookingData.checkOut}
                      onChange={(e) => handleInputChange('checkOut', e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Users className="w-4 h-4 inline mr-1" />
                      Guests
                    </label>
                    <Input
                      type="number"
                      min="1"
                      max={property.max_guests}
                      value={bookingData.guests}
                      onChange={(e) => handleInputChange('guests', parseInt(e.target.value))}
                      required
                    />
                  </div>
                </div>

                {/* Guest Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="First Name"
                    placeholder="Enter your first name"
                    value={bookingData.firstName}
                    onChange={(e) => handleInputChange('firstName', e.target.value)}
                    required
                  />
                  <Input
                    label="Last Name"
                    placeholder="Enter your last name"
                    value={bookingData.lastName}
                    onChange={(e) => handleInputChange('lastName', e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Email"
                    type="email"
                    placeholder="Enter your email"
                    value={bookingData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    required
                  />
                  <Input
                    label="Phone"
                    placeholder="Enter your phone number"
                    value={bookingData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                  />
                </div>

                <Input
                  label="Special Requests"
                  placeholder="Any special requests or notes?"
                  value={bookingData.specialRequests}
                  onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                />
              </div>
            </Card>
          </div>

          {/* Booking Summary */}
          <div>
            <Card>
              <h3 className="text-lg font-semibold mb-4">Booking Summary</h3>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">{property.name}</h4>
                  <p className="text-sm text-gray-600">{property.destination_name}</p>
                </div>

                {bookingData.checkIn && bookingData.checkOut && (
                  <>
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-sm">
                        <span>Check-in:</span>
                        <span>{new Date(bookingData.checkIn).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Check-out:</span>
                        <span>{new Date(bookingData.checkOut).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Guests:</span>
                        <span>{bookingData.guests}</span>
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-sm">
                        <span>Price per night:</span>
                        <span>${property.price_per_night}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Nights:</span>
                        <span>{Math.ceil((new Date(bookingData.checkOut) - new Date(bookingData.checkIn)) / (1000 * 60 * 60 * 24))}</span>
                      </div>
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>${calculateTotalPrice()}</span>
                      </div>
                    </div>
                  </>
                )}

                {bookingData.checkIn && bookingData.checkOut ? (
                  <StripePayment
                    amount={calculateTotalPrice()}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                    loading={bookingLoading}
                  />
                ) : (
                  <div className="text-center text-gray-500 py-8">
                    Please select check-in and check-out dates to proceed with payment
                  </div>
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;
