import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import { useAuth } from '../contexts/AuthContext';
import analyticsService from '../services/analyticsService';

const LoginPage = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Track login attempt
      analyticsService.trackEvent('click', 'login_attempt', { email: formData.email });
      
      const result = await signIn(formData.email, formData.password);
      
      if (result.error) {
        setError(result.error.message);
        analyticsService.trackEvent('error', 'login_failed', { error: result.error.message });
      } else {
        analyticsService.trackEvent('success', 'login_success', { email: formData.email });
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      analyticsService.trackEvent('error', 'login_error', { error: err.message });
    } finally {
      setLoading(false);
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-neutral-900">Welcome Back</h1>
          <p className="text-neutral-600 mt-2">Sign in to continue your African journey</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <Input 
            label="Email Address" 
            type="email"
            placeholder="Enter your email address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Enter your password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
          />
          
          <div className="flex items-center justify-between mt-6">
            <label className="flex items-center">
              <input type="checkbox" className="rounded border-neutral-300 text-accent-600" />
              <span className="ml-2 text-sm text-neutral-700">Remember me</span>
            </label>
            <a href="#" className="text-sm text-accent-600 hover:text-accent-500">
              Forgot Password?
            </a>
          </div>
          
          <Button 
            type="submit"
            variant="primary" 
            fullWidth 
            size="large" 
            className="mt-6"
            loading={loading}
          >
            Login
          </Button>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Don't have an account?{' '}
              <Link to="/signup" className="text-accent-600 hover:text-accent-500">
                Sign up
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
