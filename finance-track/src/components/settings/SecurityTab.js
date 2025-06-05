import React from 'react';

function SecurityTab({ 
  passwordData, 
  handlePasswordChange, 
  updatePassword, 
  deleteAccount, 
  logoutAllDevices, // Added this new prop
  loading 
}) {
  return (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900">Security Settings</h3>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-4">Change Password</h4>
          <div className="space-y-4">
            <div>
              <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordData.currentPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordData.newPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordData.confirmPassword}
                onChange={handlePasswordChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <button 
              onClick={updatePassword}
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                loading ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
              } transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50`}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-4">Login Sessions</h4>
          <div className="bg-gray-50 p-4 rounded-md">
            <div className="flex justify-between items-center mb-3">
              <div>
                <p className="text-sm font-medium text-gray-700">Current Session</p>
                <p className="text-xs text-gray-500">Started: Today at {new Date().toLocaleTimeString()}</p>
              </div>
              <div className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">
                Active
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-4 border-t border-gray-200">
          <h4 className="text-sm font-medium text-red-600 mb-4">Danger Zone</h4>
          <button 
            onClick={deleteAccount}
            className="border border-red-600 text-red-600 px-4 py-2 rounded-md font-medium hover:bg-red-50 transition-colors"
          >
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
}

export default SecurityTab;