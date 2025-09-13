import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Card from '../components/Card/Card';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import { propertiesService } from '../services/database';
import analyticsService from '../services/analyticsService';

const SearchResultsPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    query: searchParams.get('destination') || '',
    minPrice: '',
    maxPrice: '',
    propertyType: '',
    guests: searchParams.get('guests') || '2'
  });

  // Fetch search results based on URL parameters
  useEffect(() => {
    const fetchSearchResults = async () => {
      try {
        setLoading(true);
        
        // Build search filters from URL params
        const searchFilters = {
          query: searchParams.get('destination') || '',
          minPrice: searchParams.get('minPrice') || null,
          maxPrice: searchParams.get('maxPrice') || null,
          propertyType: searchParams.get('propertyType') || null,
          limit: 20
        };

        // Track search event
        analyticsService.trackEvent('search', 'property_search_results', searchFilters);

        // Fetch properties using the search function
        const results = await propertiesService.search(searchFilters);
        setSearchResults(results);
        
      } catch (error) {
        console.error('Error fetching search results:', error);
        setSearchResults([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSearchResults();
  }, [searchParams]);

  // Handle filter changes
  const handleFilterChange = (field, value) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Apply filters
  const applyFilters = async () => {
    try {
      setLoading(true);
      
      const searchFilters = {
        query: filters.query,
        minPrice: filters.minPrice || null,
        maxPrice: filters.maxPrice || null,
        propertyType: filters.propertyType || null,
        limit: 20
      };

      const results = await propertiesService.search(searchFilters);
      setSearchResults(results);
      
      // Update URL with new filters
      const newParams = new URLSearchParams();
      Object.entries(searchFilters).forEach(([key, value]) => {
        if (value) newParams.set(key, value);
      });
      navigate(`/search?${newParams.toString()}`);
      
    } catch (error) {
      console.error('Error applying filters:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-neutral-900 mb-8">
          Search Results {searchResults.length > 0 && `(${searchResults.length} properties)`}
        </h1>
        
        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-lg font-semibold mb-4">Filters</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Input
              label="Search"
              placeholder="Property name or location"
              value={filters.query}
              onChange={(e) => handleFilterChange('query', e.target.value)}
            />
            <Input
              label="Min Price"
              type="number"
              placeholder="Min price per night"
              value={filters.minPrice}
              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
            />
            <Input
              label="Max Price"
              type="number"
              placeholder="Max price per night"
              value={filters.maxPrice}
              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
            />
            <div className="flex items-end">
              <Button 
                variant="primary" 
                fullWidth 
                onClick={applyFilters}
                loading={loading}
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
        
        {/* Results */}
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
          ) : searchResults.length > 0 ? (
            searchResults.map((property) => (
              <Card
                key={property.id}
                variant="image"
                image={property.images?.[0]}
                title={property.name}
                subtitle={`${property.destination_name}, ${property.country}`}
                description={property.description}
                rating={property.rating}
                price={`$${property.price_per_night}/night`}
                actions={
                  <Button 
                    variant="primary" 
                    fullWidth
                    onClick={() => {
                      analyticsService.trackEvent('click', 'property_view', { property_id: property.id });
                      navigate(`/property/${property.id}`);
                    }}
                  >
                    View Details
                  </Button>
                }
              />
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No properties found</h3>
              <p className="text-gray-600 mb-4">Try adjusting your search criteria</p>
              <Button 
                variant="outline" 
                onClick={() => navigate('/')}
              >
                Back to Home
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchResultsPage;
