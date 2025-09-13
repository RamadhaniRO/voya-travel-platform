import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import Button from '../Button/Button'
import Input from '../Input/Input'

const AuthForm = ({ mode = 'signin', onSuccess, onError, className }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  const { signIn, signUp } = useAuth()

  const isSignUp = mode === 'signup'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let result
      
      if (isSignUp) {
        result = await signUp({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        })
      } else {
        result = await signIn({
          email: formData.email,
          password: formData.password,
        })
      }

      if (result.error) {
        setError(result.error.message)
        onError?.(result.error)
      } else {
        onSuccess?.(result.data)
      }
    } catch (err) {
      setError(err.message)
      onError?.(err)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {error && (
        <div className="p-3 bg-error-50 border border-error-200 rounded-lg text-error-700 text-sm">
          {error}
        </div>
      )}

      {isSignUp && (
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="First Name"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            required
            placeholder="Enter your first name"
          />
          <Input
            label="Last Name"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            required
            placeholder="Enter your last name"
          />
        </div>
      )}

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleInputChange('email', e.target.value)}
        required
        placeholder="Enter your email"
      />

      <Input
        label="Password"
        type="password"
        value={formData.password}
        onChange={(e) => handleInputChange('password', e.target.value)}
        required
        placeholder="Enter your password"
      />

      <Button
        type="submit"
        loading={loading}
        fullWidth
        className="mt-6"
      >
        {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
      </Button>
    </form>
  )
}

export default AuthForm
