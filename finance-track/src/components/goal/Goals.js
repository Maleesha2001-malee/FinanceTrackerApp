import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Goals() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    name: '',
    target: '',
    currentAmount: '0',
    description: '',
    deadline: new Date().toISOString().split('T')[0]
  });

  // Fetch all goals from the API
  const fetchGoals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/goals', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setGoals(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching goals:', err);
      // Provide more detailed error information to help debugging
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Failed to load goals: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('Failed to load goals: No response from server. Check network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Failed to load goals: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      id: null,
      name: '',
      target: '',
      currentAmount: '0',
      description: '',
      deadline: new Date().toISOString().split('T')[0]
    });
    setIsEditing(false);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      // Ensure values are converted to numbers
      const processedGoalData = {
        ...formData,
        target: parseFloat(formData.target),
        currentAmount: parseFloat(formData.currentAmount || 0),
        saved: parseFloat(formData.currentAmount || 0) // Sync saved with currentAmount
      };

      if (isEditing) {
        // Update existing goal
        await axios.put(
          `http://localhost:8080/api/goals/${formData.id}`, 
          processedGoalData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Create new goal
        await axios.post(
          'http://localhost:8080/api/goals', 
          processedGoalData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Reset form and refresh goals
      resetForm();
      fetchGoals();
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} goal:`, err);
      setError(`Failed to ${isEditing ? 'update' : 'add'} goal: ` + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (goal) => {
    setFormData({
      id: goal.id,
      name: goal.name,
      target: goal.target.toString(),
      currentAmount: goal.currentAmount.toString(),
      description: goal.description || '',
      deadline: goal.deadline ? new Date(goal.deadline).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsEditing(true);
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/goals/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Refresh goals
        fetchGoals();
      } catch (err) {
        console.error('Error deleting goal:', err);
        setError('Failed to delete goal: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Calculate total savings across all goals
  const calculateTotalSavings = () => {
    return goals.reduce((total, goal) => {
      return total + (parseFloat(goal.currentAmount) || 0);
    }, 0).toFixed(2);
  };

  // Calculate total target amount across all goals
  const calculateTotalTarget = () => {
    return goals.reduce((total, goal) => {
      return total + (parseFloat(goal.target) || 0);
    }, 0).toFixed(2);
  };

  // Calculate overall progress percentage
  const calculateOverallProgress = () => {
    const totalSaved = goals.reduce((total, goal) => total + (parseFloat(goal.currentAmount) || 0), 0);
    const totalTarget = goals.reduce((total, goal) => total + (parseFloat(goal.target) || 0), 0);
    
    return totalTarget > 0 ? Math.min(Math.round((totalSaved / totalTarget) * 100), 100) : 0;
  };

  // Calculate time remaining for a goal
  const getTimeRemaining = (deadline) => {
    if (!deadline) return 'No deadline';
    
    const now = new Date();
    const targetDate = new Date(deadline);
    const timeDiff = targetDate - now;
    
    if (timeDiff <= 0) return 'Deadline passed';
    
    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const months = Math.floor(days / 30);
    const years = Math.floor(months / 12);
    
    if (years > 0) {
      return `${years} year${years > 1 ? 's' : ''} ${months % 12} month${(months % 12) !== 1 ? 's' : ''}`;
    } else if (months > 0) {
      return `${months} month${months > 1 ? 's' : ''} ${days % 30} day${(days % 30) !== 1 ? 's' : ''}`;
    } else {
      return `${days} day${days !== 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Financial Goal' : 'My Financial Goals'}
          </h2>
          {!showForm ? (
            <button 
              onClick={() => { setShowForm(true); setIsEditing(false); }}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              + Add New Goal
            </button>
          ) : (
            <button 
              onClick={resetForm}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50 transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
        
        {showForm && (
          <div className="p-6 border-b border-gray-200">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Name
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="target" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Amount
                  </label>
                  <input
                    type="number"
                    id="target"
                    name="target"
                    value={formData.target}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="currentAmount" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Amount
                  </label>
                  <input
                    type="number"
                    id="currentAmount"
                    name="currentAmount"
                    value={formData.currentAmount}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    id="deadline"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  ></textarea>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  className={`text-white py-2 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-colors ${
                    isEditing ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 'bg-blue-500 hover:bg-blue-600 focus:ring-blue-500'
                  }`}
                >
                  {isEditing ? 'Update Goal' : 'Save Goal'}
                </button>
              </div>
            </form>
          </div>
        )}
        
        <div className="px-6 py-5">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}
          
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h5 className="font-medium text-gray-800 mb-2">Total Saved</h5>
              <p className="text-2xl font-bold text-green-600">${calculateTotalSavings()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h5 className="font-medium text-gray-800 mb-2">Total Goals</h5>
              <p className="text-2xl font-bold text-blue-600">${calculateTotalTarget()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h5 className="font-medium text-gray-800 mb-2">Overall Progress</h5>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 flex-grow">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${calculateOverallProgress()}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{calculateOverallProgress()}%</span>
              </div>
            </div>
          </div>
          
          {/* Goals list */}
          {goals.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Goal Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Target Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {goals.map((goal) => {
                    // Ensure goal data are processed as numbers
                    const currentAmount = parseFloat(goal.currentAmount) || 0;
                    const target = parseFloat(goal.target) || 1; // Avoid division by zero
                    const percentage = Math.min((currentAmount / target) * 100, 100);
                    
                    return (
                      <tr key={goal.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {goal.name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {goal.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {goal.deadline ? (
                            <div>
                              <div>{new Date(goal.deadline).toLocaleDateString()}</div>
                              <div className="text-xs text-gray-400">{getTimeRemaining(goal.deadline)} remaining</div>
                            </div>
                          ) : 'No deadline'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-blue-600 h-2.5 rounded-full" 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{Math.round(percentage)}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className="text-green-600">${currentAmount.toFixed(2)}</span>
                          <span className="text-gray-500"> / ${target.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleEdit(goal)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(goal.id)}
                              className="text-red-600 hover:text-red-800"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-12 w-12 mx-auto text-gray-400 mb-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No financial goals found</h3>
              <p className="text-gray-500 mb-6">Start saving for your future by setting some financial goals.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              >
                Create Your First Goal
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Goals;