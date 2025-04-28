import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [emailAvailable, setEmailAvailable] = useState(null);
  
  const navigate = useNavigate();
  const { register, checkUsernameAvailability, checkEmailAvailability } = useContext(AuthContext);

  // Debounce for checking username availability
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (formData.username.length > 2) {
        const isAvailable = await checkUsernameAvailability(formData.username);
        setUsernameAvailable(isAvailable);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.username, checkUsernameAvailability]);

  // Debounce for checking email availability
  useEffect(() => {
    const timeoutId = setTimeout(async () => {
      if (formData.email.length > 5 && formData.email.includes('@')) {
        const isAvailable = await checkEmailAvailability(formData.email);
        setEmailAvailable(isAvailable);
      }
    }, 500);
    return () => clearTimeout(timeoutId);
  }, [formData.email, checkEmailAvailability]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific field error when user starts typing again
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validate username
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    // Validate full name
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required';
    }
    
    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    // Validate password
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    // Validate confirm password
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      await register({
        username: formData.username,
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password
      });
      
      setMessage('Registration successful! Redirecting to login...');
      // Clear form
      setFormData({
        username: '',
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // Redirect to login after brief delay
      setTimeout(() => {
        navigate('/login');
      }, 2000);
      
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="px-6 py-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Create Account</h2>
            
            {/* Success/Error Message */}
            {message && (
              <div className={`${message.includes('successful') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border px-4 py-3 rounded mb-4`}>
                {message}
              </div>
            )}
            
            <form onSubmit={handleSubmit}>
              {/* Username Field */}
              <div className="mb-4">
                <label htmlFor="username" className="block text-gray-700 text-sm font-medium mb-2">
                  Username
                </label>
                <input
                  type="text"
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.username ? 'border-red-500' : usernameAvailable === false ? 'border-red-500' : usernameAvailable ? 'border-green-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Choose a username"
                />
                {errors.username && <p className="text-red-500 text-xs mt-1">{errors.username}</p>}
                {formData.username.length > 2 && usernameAvailable !== null && (
                  <p className={`text-xs mt-1 ${usernameAvailable ? 'text-green-500' : 'text-red-500'}`}>
                    {usernameAvailable ? 'Username available' : 'Username already taken'}
                  </p>
                )}
              </div>
              
              {/* Full Name Field */}
              <div className="mb-4">
                <label htmlFor="fullName" className="block text-gray-700 text-sm font-medium mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.fullName ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Your full name"
                />
                {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
              </div>
              
              {/* Email Field */}
              <div className="mb-4">
                <label htmlFor="email" className="block text-gray-700 text-sm font-medium mb-2">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.email ? 'border-red-500' : emailAvailable === false ? 'border-red-500' : emailAvailable ? 'border-green-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Your email address"
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                {formData.email.length > 5 && formData.email.includes('@') && emailAvailable !== null && (
                  <p className={`text-xs mt-1 ${emailAvailable ? 'text-green-500' : 'text-red-500'}`}>
                    {emailAvailable ? 'Email available' : 'Email already registered'}
                  </p>
                )}
              </div>
              
              {/* Password Field */}
              <div className="mb-4">
                <label htmlFor="password" className="block text-gray-700 text-sm font-medium mb-2">
                  Password
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Create a password"
                />
                {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
              </div>
              
              {/* Confirm Password Field */}
              <div className="mb-6">
                <label htmlFor="confirmPassword" className="block text-gray-700 text-sm font-medium mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'} rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500`}
                  placeholder="Confirm your password"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
              </div>
              
              {/* Submit Button */}
              <div className="mb-6">
                <button
                  type="submit"
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
                  disabled={loading}
                >
                  {loading ? 'Creating Account...' : 'Register'}
                </button>
              </div>
              
              {/* Login Link */}
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <a href="/login" className="text-blue-500 hover:text-blue-600">
                    Login
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;