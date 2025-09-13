import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import NotificationDropdown from '../Notifications/NotificationDropdown';
import { 
  Menu, 
  X, 
  Search, 
  User, 
  LogOut, 
  Settings,
  Globe
} from 'lucide-react';

const Navigation = ({ logo = 'Voya', logoIcon, items = [], userActions = [], className, ...props }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en');
  
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const defaultItems = [
    { label: 'Home', href: '/' },
    { label: 'Destinations', href: '/destinations' },
    { label: 'Properties', href: '/properties' },
    { label: 'Experiences', href: '/experiences' },
    { label: 'About', href: '/about' },
  ];

  const defaultUserActions = user ? [
    { label: 'Dashboard', href: '/dashboard', icon: Settings },
    { label: 'Profile', href: '/profile', icon: User },
    { label: 'Bookings', href: '/bookings', icon: User },
    { label: 'Sign Out', action: signOut, icon: LogOut },
  ] : [
    { label: 'Sign In', href: '/login', icon: User },
    { label: 'Sign Up', href: '/signup', icon: User },
  ];

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'sw', name: 'Swahili', flag: '🇹🇿' },
  ];

  const baseStyles = 'bg-white shadow-sm border-b border-neutral-200 sticky top-0 z-50';
  const containerStyles = 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8';
  const navStyles = 'flex items-center justify-between h-16';
  const logoStyles = 'flex items-center space-x-2 text-xl font-bold text-primary-600';
  const navItemsStyles = 'hidden md:flex items-center space-x-8';
  const navItemStyles = 'text-neutral-700 hover:text-primary-600 transition-colors duration-200';
  const userActionsStyles = 'hidden md:flex items-center space-x-4';
  const mobileMenuStyles = 'md:hidden absolute top-16 left-0 right-0 bg-white border-b border-neutral-200 shadow-lg';
  const mobileNavStyles = 'px-4 py-6 space-y-4';

  const handleLanguageChange = (languageCode) => {
    setCurrentLanguage(languageCode);
    setIsLanguageMenuOpen(false);
    // Here you would implement actual language switching logic
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
    setIsUserMenuOpen(false);
  };

  const renderIcon = (icon) => {
    if (icon) {
      const IconComponent = icon;
      return <IconComponent className="w-4 h-4" />;
    }
    return null;
  };

  return (
    <nav className={`${baseStyles} ${className}`} {...props}>
      <div className={containerStyles}>
        <div className={navStyles}>
          {/* Logo */}
          <Link to="/" className={logoStyles}>
            {logoIcon && <span>{logoIcon}</span>}
            <span>{logo}</span>
          </Link>

          {/* Desktop Navigation */}
          <div className={navItemsStyles}>
            {(items.length > 0 ? items : defaultItems).map((item) => (
              <Link
                key={item.label}
                to={item.href}
                className={navItemStyles}
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Desktop User Actions */}
          <div className={userActionsStyles}>
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center space-x-2 text-neutral-700 hover:text-primary-600 transition-colors duration-200"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm">
                  {languages.find(lang => lang.code === currentLanguage)?.flag}
                </span>
              </button>

              {isLanguageMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
                  {languages.map((language) => (
                    <button
                      key={language.code}
                      onClick={() => handleLanguageChange(language.code)}
                      className="w-full px-4 py-2 text-left text-sm text-neutral-700 hover:bg-neutral-50 flex items-center space-x-3"
                    >
                      <span>{language.flag}</span>
                      <span>{language.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Notifications */}
            <NotificationDropdown />

            {/* Search */}
            <button className="p-2 text-neutral-700 hover:text-primary-600 transition-colors duration-200">
              <Search className="w-5 h-5" />
            </button>

            {/* User Menu */}
            <div className="relative">
              {user ? (
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-2 text-neutral-700 hover:text-primary-600 transition-colors duration-200"
                >
                  <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                    {profile?.avatar_url ? (
                      <img
                        src={profile.avatar_url}
                        alt={profile.first_name || 'User'}
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <User className="w-4 h-4 text-primary-600" />
                    )}
                  </div>
                  <span className="text-sm font-medium">
                    {profile?.first_name || 'User'}
                  </span>
                </button>
              ) : (
                <Link
                  to="/login"
                  className="flex items-center space-x-2 text-neutral-700 hover:text-primary-600 transition-colors duration-200"
                >
                  <User className="w-5 h-5" />
                  <span className="text-sm font-medium">Sign In</span>
                </Link>
              )}

              {isUserMenuOpen && user && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-neutral-200 py-2 z-50">
                  {(userActions.length > 0 ? userActions : defaultUserActions).map((action) => (
                    <div key={action.label}>
                      {action.href ? (
                        <Link
                          to={action.href}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full"
                          onClick={() => setIsUserMenuOpen(false)}
                        >
                          {renderIcon(action.icon)}
                          <span>{action.label}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            if (action.label === 'Sign Out') {
                              handleSignOut();
                            } else if (action.action) {
                              action.action();
                            }
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 px-4 py-2 text-sm text-neutral-700 hover:bg-neutral-50 w-full"
                        >
                          {renderIcon(action.icon)}
                          <span>{action.label}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-neutral-700 hover:text-primary-600 transition-colors duration-200"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className={mobileMenuStyles}>
            <div className={mobileNavStyles}>
              {/* Mobile Navigation Items */}
              <div className="space-y-2">
                {(items.length > 0 ? items : defaultItems).map((item) => (
                  <Link
                    key={item.label}
                    to={item.href}
                    className="block text-neutral-700 hover:text-primary-600 transition-colors duration-200 py-2"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>

              {/* Mobile User Actions */}
              <div className="pt-4 border-t border-neutral-200">
                <div className="space-y-2">
                  {(userActions.length > 0 ? userActions : defaultUserActions).map((action) => (
                    <div key={action.label}>
                      {action.href ? (
                        <Link
                          to={action.href}
                          className="flex items-center space-x-3 text-neutral-700 hover:text-primary-600 transition-colors duration-200 py-2"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {renderIcon(action.icon)}
                          <span>{action.label}</span>
                        </Link>
                      ) : (
                        <button
                          onClick={() => {
                            if (action.label === 'Sign Out') {
                              handleSignOut();
                            } else if (action.action) {
                              action.action();
                            }
                            setIsMobileMenuOpen(false);
                          }}
                          className="flex items-center space-x-3 text-neutral-700 hover:text-primary-600 transition-colors duration-200 py-2 w-full text-left"
                        >
                          {renderIcon(action.icon)}
                          <span>{action.label}</span>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
