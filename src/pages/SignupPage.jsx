import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Button from '../components/Button/Button';
import Input from '../components/Input/Input';
import { useAuth } from '../contexts/AuthContext';
import analyticsService from '../services/analyticsService';

const SignupPage = () => {
  const navigate = useNavigate();
  const { signUp } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    if (!agreedToTerms) {
      setError('Please agree to the Terms of Service and Privacy Policy');
      setLoading(false);
      return;
    }

    try {
      // Track signup attempt
      analyticsService.trackEvent('click', 'signup_attempt', { email: formData.email });
      
      const result = await signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        role: 'traveler'
      });
      
      if (result.error) {
        setError(result.error.message);
        analyticsService.trackEvent('error', 'signup_failed', { error: result.error.message });
      } else {
        analyticsService.trackEvent('success', 'signup_success', { email: formData.email });
        navigate('/dashboard');
      }
    } catch (err) {
      setError('An unexpected error occurred');
      analyticsService.trackEvent('error', 'signup_error', { error: err.message });
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
          <h1 className="text-3xl font-bold text-neutral-900">Create Your Account</h1>
          <p className="text-neutral-600 mt-2">Join our community of travelers exploring Africa</p>
        </div>
        
        <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-sm p-8">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="First Name" 
              placeholder="Enter your first name"
              value={formData.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              required
            />
            <Input 
              label="Last Name" 
              placeholder="Enter your last name"
              value={formData.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              required
            />
          </div>
          
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="Enter your email address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            required
          />
          <Input 
            label="Phone Number" 
            placeholder="Enter your phone number"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
          />
          <Input 
            label="Password" 
            type="password" 
            placeholder="Create a password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            required
          />
          <Input 
            label="Confirm Password" 
            type="password" 
            placeholder="Confirm your password"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            required
          />
          
          <div className="mt-6">
            <label className="flex items-start">
              <input 
                type="checkbox" 
                className="rounded border-neutral-300 text-accent-600 mt-1"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
              />
              <span className="ml-2 text-sm text-neutral-700">
                I agree to the{' '}
                <a href="#" className="text-accent-600 hover:text-accent-500">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-accent-600 hover:text-accent-500">
                  Privacy Policy
                </a>
              </span>
            </label>
          </div>
          
          <Button 
            type="submit"
            variant="primary" 
            fullWidth 
            size="large" 
            className="mt-6"
            loading={loading}
          >
            Create Account
          </Button>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-neutral-600">
              Already have an account?{' '}
              <Link to="/login" className="text-accent-600 hover:text-accent-500">
                Sign in
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupPage;
