import React from 'react';

// Fallback components for when imports fail
export const FallbackNavigation = () => (
  <nav className="bg-white shadow-sm border-b">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex justify-between h-16">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-900">Voya</h1>
          </div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">Navigation Loading...</div>
        </div>
      </div>
    </div>
  </nav>
);

export const FallbackPage = ({ title = "Page Loading...", children }) => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">
        This page is loading. If it doesn't load, there might be a configuration issue.
      </p>
      {children}
    </div>
  </div>
);

export const FallbackHomePage = () => (
  <FallbackPage title="Welcome to Voya Travel Platform">
    <div className="space-y-3">
      <p className="text-sm text-gray-500">
        The homepage is loading. This might be due to missing data or configuration.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm hover:bg-blue-700"
      >
        Reload Page
      </button>
    </div>
  </FallbackPage>
);

export const FallbackAuthProvider = ({ children }) => {
  console.warn('Using fallback AuthProvider - authentication features may not work');
  return (
    <div>
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <div className="flex">
          <div className="ml-3">
            <p className="text-sm text-yellow-700">
              <strong>Development Mode:</strong> Authentication is not configured. Some features may not work.
            </p>
          </div>
        </div>
      </div>
      {children}
    </div>
  );
};

export const FallbackNotificationProvider = ({ children }) => {
  console.warn('Using fallback NotificationProvider - notifications may not work');
  return <>{children}</>;
};
