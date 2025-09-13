import React, { useState, useEffect } from 'react';

// Safe import utility with fallbacks
export const safeImport = async (importFn, fallbackComponent, componentName) => {
  try {
    const module = await importFn();
    return module.default || module;
  } catch (error) {
    console.warn(`Failed to import ${componentName}:`, error.message);
    return fallbackComponent;
  }
};

// Safe context provider wrapper
export const SafeProvider = ({ 
  Provider, 
  FallbackProvider, 
  children, 
  providerName,
  ...props 
}) => {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Test if the provider can be instantiated
    try {
      if (Provider && typeof Provider === 'function') {
        // Provider is available
        setHasError(false);
      } else {
        throw new Error(`${providerName} is not available`);
      }
    } catch (err) {
      console.warn(`Provider ${providerName} failed:`, err.message);
      setHasError(true);
      setError(err);
    }
  }, [Provider, providerName]);

  if (hasError || !Provider) {
    console.warn(`Using fallback for ${providerName}`);
    return <FallbackProvider {...props}>{children}</FallbackProvider>;
  }

  try {
    return <Provider {...props}>{children}</Provider>;
  } catch (err) {
    console.error(`Error rendering ${providerName}:`, err);
    return <FallbackProvider {...props}>{children}</FallbackProvider>;
  }
};

// App state management
export const useAppState = () => {
  const [appState, setAppState] = useState({
    isInitialized: false,
    hasErrors: false,
    errors: [],
    services: {
      auth: 'loading',
      notifications: 'loading',
      database: 'loading',
      analytics: 'loading'
    }
  });

  const updateServiceState = (service, status, error = null) => {
    setAppState(prev => ({
      ...prev,
      services: {
        ...prev.services,
        [service]: status
      },
      errors: error ? [...prev.errors, { service, error }] : prev.errors,
      hasErrors: error ? true : prev.hasErrors
    }));
  };

  const markInitialized = () => {
    setAppState(prev => ({
      ...prev,
      isInitialized: true
    }));
  };

  return {
    appState,
    updateServiceState,
    markInitialized
  };
};

// Service initialization manager
export const useServiceManager = () => {
  const { appState, updateServiceState, markInitialized } = useAppState();

  const initializeServices = async () => {
    console.log('🚀 Starting service initialization...');

    const services = [
      { name: 'auth', importFn: () => import('../contexts/AuthContext') },
      { name: 'notifications', importFn: () => import('../contexts/NotificationContext') },
      { name: 'database', importFn: () => import('../services/database') },
      { name: 'analytics', importFn: () => import('../services/analyticsService') }
    ];

    const initPromises = services.map(async ({ name, importFn }) => {
      try {
        console.log(`📦 Loading ${name} service...`);
        await importFn();
        updateServiceState(name, 'ready');
        console.log(`✅ ${name} service loaded successfully`);
      } catch (error) {
        console.warn(`⚠️ ${name} service failed to load:`, error.message);
        updateServiceState(name, 'error', error.message);
      }
    });

    await Promise.allSettled(initPromises);
    
    console.log('🎉 Service initialization complete');
    markInitialized();
  };

  return {
    appState,
    initializeServices
  };
};
