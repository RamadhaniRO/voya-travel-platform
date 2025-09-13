import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../Button/Button'
import Input from '../Input/Input'

const UserProfile = ({ className }) => {
  const { profile, updateProfile, signOut } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || '',
    last_name: profile?.last_name || '',
    phone: profile?.phone || '',
    nationality: profile?.nationality || '',
    preferred_language: profile?.preferred_language || 'en'
  })

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSave = async () => {
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const result = await updateProfile(formData)
      
      if (result.error) {
        setError(result.error.message)
      } else {
        setSuccess('Profile updated successfully!')
        setIsEditing(false)
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setFormData({
      first_name: profile?.first_name || '',
      last_name: profile?.last_name || '',
      phone: profile?.phone || '',
      nationality: profile?.nationality || '',
      preferred_language: profile?.preferred_language || 'en'
    })
    setIsEditing(false)
    setError('')
    setSuccess('')
  }

  if (!profile) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500 mx-auto mb-4"></div>
        <p className="text-neutral-600">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-neutral-900">Profile</h2>
        <div className="flex gap-2">
          {!isEditing ? (
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              Edit Profile
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSave}
                loading={loading}
              >
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm mb-4">
          {error}
        </div>
      )}

      {success && (
        <div className="p-3 bg-success-50 border border-success-200 rounded-lg text-success-700 text-sm mb-4">
          {success}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Email
          </label>
          <Input
            value={profile.email}
            disabled
            className="bg-neutral-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Role
          </label>
          <Input
            value={profile.role}
            disabled
            className="bg-neutral-50"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            First Name
          </label>
          {isEditing ? (
            <Input
              value={formData.first_name}
              onChange={(e) => handleInputChange('first_name', e.target.value)}
              placeholder="Enter your first name"
            />
          ) : (
            <Input
              value={profile.first_name || 'Not provided'}
              disabled
              className="bg-neutral-50"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Last Name
          </label>
          {isEditing ? (
            <Input
              value={formData.last_name}
              onChange={(e) => handleInputChange('last_name', e.target.value)}
              placeholder="Enter your last name"
            />
          ) : (
            <Input
              value={profile.last_name || 'Not provided'}
              disabled
              className="bg-neutral-50"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Phone
          </label>
          {isEditing ? (
            <Input
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              placeholder="Enter your phone number"
            />
          ) : (
            <Input
              value={profile.phone || 'Not provided'}
              disabled
              className="bg-neutral-50"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Nationality
          </label>
          {isEditing ? (
            <Input
              value={formData.nationality}
              onChange={(e) => handleInputChange('nationality', e.target.value)}
              placeholder="Enter your nationality"
            />
          ) : (
            <Input
              value={profile.nationality || 'Not provided'}
              disabled
              className="bg-neutral-50"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Preferred Language
          </label>
          {isEditing ? (
            <select
              value={formData.preferred_language}
              onChange={(e) => handleInputChange('preferred_language', e.target.value)}
              className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="en">English</option>
              <option value="sw">Swahili</option>
            </select>
          ) : (
            <Input
              value={profile.preferred_language === 'en' ? 'English' : 'Swahili'}
              disabled
              className="bg-neutral-50"
            />
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Member Since
          </label>
          <Input
            value={new Date(profile.created_at).toLocaleDateString()}
            disabled
            className="bg-neutral-50"
          />
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-neutral-200">
        <Button
          variant="outline"
          onClick={signOut}
          className="text-error-600 border-error-200 hover:bg-error-50"
        >
          Sign Out
        </Button>
      </div>
    </div>
  )
}

export default UserProfile
