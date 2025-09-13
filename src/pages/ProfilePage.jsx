import React from 'react';
import UserProfile from '../components/UserProfile/UserProfile';

const ProfilePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-900 mb-2">My Profile</h1>
          <p className="text-neutral-600">Manage your account settings and personal information</p>
        </div>
        
        <UserProfile />
      </div>
    </div>
  );
};

export default ProfilePage;
