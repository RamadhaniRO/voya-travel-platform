import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Users, Calendar, DollarSign, MapPin } from 'lucide-react';
import Button from '../components/Button/Button';
import { useAuth } from '../contexts/AuthContext';
import analyticsService from '../services/analyticsService';

const DashboardPage = () => {
  const { user, getUserAnalytics } = useAuth();
  const [metrics, setMetrics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userAnalytics, setUserAnalytics] = useState(null);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Track dashboard view
        analyticsService.trackPageView('/dashboard');
        
        if (user) {
          // Get user analytics
          const analytics = await getUserAnalytics();
          setUserAnalytics(analytics.data);
          
          // Set metrics based on user role and analytics
          const userMetrics = [
            {
              title: 'Total Bookings',
              value: analytics.data?.total_bookings || '0',
              change: '+12.5%',
              trend: 'up',
              icon: Calendar,
              color: 'text-blue-600'
            },
            {
              title: 'Total Spent',
              value: `$${analytics.data?.total_spent || '0'}`,
              change: '+6.2%',
              trend: 'up',
              icon: DollarSign,
              color: 'text-green-600'
            },
            {
              title: 'Properties Hosted',
              value: analytics.data?.properties_hosted || '0',
              change: '+3.1%',
              trend: 'up',
              icon: MapPin,
              color: 'text-yellow-600'
            },
            {
              title: 'Average Rating',
              value: analytics.data?.average_rating ? analytics.data.average_rating.toFixed(1) : '0.0',
              change: '+0.2',
              trend: 'up',
              icon: Users,
              color: 'text-purple-600'
            }
          ];
          
          setMetrics(userMetrics);
        } else {
          // Default metrics for non-authenticated users
          setMetrics([
            {
              title: 'Total Bookings',
              value: '1,248',
              change: '+12.5%',
              trend: 'up',
              icon: Calendar,
              color: 'text-blue-600'
            },
            {
              title: 'Total Revenue',
              value: '$86,429',
              change: '+6.2%',
              trend: 'up',
              icon: DollarSign,
              color: 'text-green-600'
            },
            {
              title: 'Active Users',
              value: '5,782',
              change: '+3.1%',
              trend: 'up',
              icon: Users,
              color: 'text-yellow-600'
            },
            {
              title: 'New Listings',
              value: '342',
              change: '-3.0%',
              trend: 'down',
              icon: MapPin,
              color: 'text-red-600'
            }
          ]);
        }
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [user, getUserAnalytics]);

  return (
    <div className="min-h-screen bg-neutral-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900">Dashboard Overview</h1>
          <p className="text-neutral-600 mt-2">
            {user ? `Welcome back, ${user.user_metadata?.first_name || 'User'}!` : 'Welcome! Here\'s what\'s happening with your travel platform.'}
          </p>
          {userAnalytics?.favorite_destination && (
            <p className="text-sm text-neutral-500 mt-1">
              Your favorite destination: {userAnalytics.favorite_destination}
            </p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-8 bg-gray-200 rounded"></div>
                  </div>
                  <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                </div>
                <div className="mt-4">
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            metrics.map((metric, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-neutral-600">{metric.title}</p>
                    <p className="text-2xl font-bold text-neutral-900 mt-1">{metric.value}</p>
                  </div>
                  <div className={`p-3 rounded-full ${metric.color} bg-opacity-10`}>
                    <metric.icon className={`w-6 h-6 ${metric.color}`} />
                  </div>
                </div>
                <div className="flex items-center mt-4">
                  {metric.trend === 'up' ? (
                    <TrendingUp className="w-4 h-4 text-green-500 mr-2" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-500 mr-2" />
                  )}
                  <span className={`text-sm font-medium ${
                    metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {metric.change} from last month
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h2 className="text-xl font-semibold text-neutral-900 mb-6">Quick Actions</h2>
          <div className="flex flex-wrap gap-3">
            <Button variant="primary" icon={Users}>
              Add New Listing
            </Button>
            <Button variant="outline" icon={Calendar}>
              Manage Bookings
            </Button>
            <Button variant="outline" icon={DollarSign}>
              View Reports
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
