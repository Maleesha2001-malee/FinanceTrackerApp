import React from 'react';

function ProfileTab({ userInfo, handleUserInfoChange }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <div className="h-24 w-24 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-4xl font-semibold">
          {userInfo.username && userInfo.username.charAt(0).toUpperCase()}
        </div>
      </div>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={userInfo.fullName}
            onChange={handleUserInfoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
          <p className="mt-1 text-sm text-gray-500">This is not User name you can't change username</p>
        </div>
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email Address
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={userInfo.email}
            onChange={handleUserInfoChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
      </div>
    </div>
  );
}

export default ProfileTab;