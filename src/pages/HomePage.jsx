import React, { useState, useEffect } from 'react';
import { Search, MapPin, Calendar, Users, Star, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Button from '../components/Button/Button';
import Card from '../components/Card/Card';
import Input from '../components/Input/Input';
import { destinationsService, propertiesService } from '../services/database';
import analyticsService from '../services/analyticsService';

/**
 * HomePage Component - Voya Travel Platform
 * 
 * Displays featured destinations and properties from the database
 * with real-time search functionality.
 */

const HomePage = () => {
  const navigate = useNavigate();
  const [featuredDestinations, setFeaturedDestinations] = useState([]);
  const [featuredProperties, setFeaturedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchForm, setSearchForm] = useState({
    destination: '',
    checkIn: '',
    checkOut: '',
    guests: '2'
  });

  // Fetch destinations and properties on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch destinations
        const destinations = await destinationsService.getAll();
        setFeaturedDestinations(destinations.slice(0, 6)); // Show first 6 destinations
        
        // Fetch featured properties
        const properties = await propertiesService.getAll({ 
          limit: 6, 
          orderBy: 'created_at', 
          orderDirection: 'desc' 
        });
        setFeaturedProperties(properties);
        
        // Track page view
        analyticsService.trackPageView('/');
        
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Handle search form submission
  const handleSearch = async (e) => {
    e.preventDefault();
    
    // Track search event
    analyticsService.trackEvent('search', 'property_search', {
      destination: searchForm.destination,
      guests: searchForm.guests
    });
    
    // Navigate to search results with query parameters
    const searchParams = new URLSearchParams({
      destination: searchForm.destination,
      checkIn: searchForm.checkIn,
      checkOut: searchForm.checkOut,
      guests: searchForm.guests
    });
    
    navigate(`/search?${searchParams.toString()}`);
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setSearchForm(prev => ({ ...prev, [field]: value }));
  };

  // Experience categories
  const experienceCategories = [
    {
      icon: '🦁',
      title: 'Safari Adventures',
      description: 'Wildlife encounters and game drives',
      count: '24 tours'
    },
    {
      icon: '🏔️',
      title: 'Mountain Treks',
      description: 'Hiking and climbing experiences',
      count: '18 tours'
    },
    {
      icon: '🏖️',
      title: 'Beach Getaways',
      description: 'Coastal relaxation and water sports',
      count: '32 tours'
    },
    {
      icon: '🏛️',
      title: 'Cultural Tours',
      description: 'Local traditions and heritage',
      count: '15 tours'
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Discover the Magic of Africa
            </h1>
            <p className="text-xl md:text-2xl mb-12 text-primary-100">
              Explore breathtaking landscapes, vibrant cultures, and unforgettable adventures 
              across the African continent
            </p>
            
            {/* Search Bar */}
            <form onSubmit={handleSearch} className="bg-white rounded-2xl p-2 shadow-xl max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    placeholder="Where are you going?"
                    className="pl-10 border-0 focus:ring-0"
                    value={searchForm.destination}
                    onChange={(e) => handleInputChange('destination', e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    type="date"
                    placeholder="Check in"
                    className="pl-10 border-0 focus:ring-0"
                    value={searchForm.checkIn}
                    onChange={(e) => handleInputChange('checkIn', e.target.value)}
                  />
                </div>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-neutral-400" />
                  <Input
                    type="number"
                    placeholder="Guests"
                    className="pl-10 border-0 focus:ring-0"
                    value={searchForm.guests}
                    onChange={(e) => handleInputChange('guests', e.target.value)}
                    min="1"
                    max="20"
                  />
                </div>
                <Button
                  type="submit"
                  variant="primary"
                  size="large"
                  className="w-full"
                  icon={Search}
                  loading={loading}
                >
                  Search
                </Button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Featured Destinations */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Featured Destinations
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Handpicked destinations that showcase the best of Africa's natural beauty, 
              wildlife, and cultural heritage
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              // Loading skeleton
              Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 animate-pulse">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-3 bg-gray-200 rounded mb-4"></div>
                  <div className="h-10 bg-gray-200 rounded"></div>
                </div>
              ))
            ) : (
              featuredDestinations.map((destination) => (
                <Card
                  key={destination.id}
                  variant="image"
                  image={destination.image_url}
                  title={destination.name}
                  subtitle={`${destination.region}, ${destination.country}`}
                  description={destination.description}
                  actions={
                    <Button 
                      variant="primary" 
                      fullWidth
                      onClick={() => {
                        analyticsService.trackEvent('click', 'destination_view', { destination_id: destination.id });
                        navigate(`/search?destination=${encodeURIComponent(destination.name)}`);
                      }}
                    >
                      View Properties
                    </Button>
                  }
                  className="h-full"
                />
              ))
            )}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="large" icon={ArrowRight} iconPosition="right">
              View All Destinations
            </Button>
          </div>
        </div>
      </section>

      {/* Experience Categories */}
      <section className="py-20 bg-neutral-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              Explore by Experience
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Choose your adventure type and discover experiences tailored to your interests
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {experienceCategories.map((category, index) => (
              <div
                key={index}
                className="bg-white rounded-xl p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="text-4xl mb-4">{category.icon}</div>
                <h3 className="text-xl font-semibold text-neutral-900 mb-2">
                  {category.title}
                </h3>
                <p className="text-neutral-600 mb-4">
                  {category.description}
                </p>
                <p className="text-sm text-accent-600 font-medium">
                  {category.count}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-accent-500 to-accent-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Start Your African Adventure?
          </h2>
          <p className="text-xl mb-8 text-accent-100">
            Join thousands of travelers who have discovered the magic of Africa with Voya
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button variant="secondary" size="large">
              Browse Tours
            </Button>
            <Button variant="outline" size="large" className="border-white text-white hover:bg-white hover:text-accent-600">
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-900 mb-4">
              What Our Travelers Say
            </h2>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Real experiences from travelers who have explored Africa with us
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                name: 'Sarah Johnson',
                location: 'New York, USA',
                rating: 5,
                comment: 'The Serengeti safari was absolutely incredible. Our guide was knowledgeable and we saw the Big Five!'
              },
              {
                name: 'David Miller',
                location: 'London, UK',
                rating: 5,
                comment: 'Victoria Falls exceeded all expectations. The adventure activities were thrilling and well-organized.'
              },
              {
                name: 'Emma Thompson',
                location: 'Sydney, Australia',
                rating: 5,
                comment: 'Cape Town was beautiful and the cultural experiences were authentic. Highly recommend!'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-neutral-50 rounded-xl p-6">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-accent-500 rounded-full flex items-center justify-center text-white font-semibold mr-4">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-neutral-900">{testimonial.name}</h4>
                    <p className="text-sm text-neutral-600">{testimonial.location}</p>
                  </div>
                </div>
                <div className="flex items-center mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-neutral-700">{testimonial.comment}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
