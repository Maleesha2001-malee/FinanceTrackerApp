import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Budget() {
  const [budgets, setBudgets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    id: null,
    category: '',
    limit: '',
    spent: '0',
    period: 'monthly',
    description: '',
  });

  // Fetch all budgets from the API
  const fetchBudgets = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get('http://localhost:8080/api/budgets', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      setBudgets(response.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching budgets:', err);
      // Provide more detailed error information to help debugging
      if (err.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        setError(`Failed to load budgets: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
      } else if (err.request) {
        // The request was made but no response was received
        setError('Failed to load budgets: No response from server. Check network connection.');
      } else {
        // Something happened in setting up the request that triggered an Error
        setError('Failed to load budgets: ' + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
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
      category: '',
      limit: '',
      spent: '0',
      period: 'monthly',
      description: '',
    });
    setIsEditing(false);
    setShowForm(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem('token');
      // Ensure values are converted to numbers
      const processedBudgetData = {
        ...formData,
        limit: parseFloat(formData.limit),
        spent: parseFloat(formData.spent || 0)
      };

      if (isEditing) {
        // Update existing budget
        await axios.put(
          `http://localhost:8080/api/budgets/${formData.id}`, 
          processedBudgetData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      } else {
        // Create new budget
        await axios.post(
          'http://localhost:8080/api/budgets', 
          processedBudgetData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }
        );
      }
      
      // Reset form and refresh budgets
      resetForm();
      fetchBudgets();
    } catch (err) {
      console.error(`Error ${isEditing ? 'updating' : 'adding'} budget:`, err);
      setError(`Failed to ${isEditing ? 'update' : 'add'} budget: ` + (err.response?.data?.message || err.message));
    }
  };

  const handleEdit = (budget) => {
    setFormData({
      id: budget.id,
      category: budget.category,
      limit: budget.limit.toString(),
      spent: budget.spent.toString(),
      period: budget.period,
      description: budget.description || '',
    });
    setIsEditing(true);
    setShowForm(true);
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this budget?')) {
      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:8080/api/budgets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        // Refresh budgets
        fetchBudgets();
      } catch (err) {
        console.error('Error deleting budget:', err);
        setError('Failed to delete budget: ' + (err.response?.data?.message || err.message));
      }
    }
  };

  // Calculate total budget amount
  const calculateTotalBudget = () => {
    return budgets.reduce((total, budget) => {
      return total + (parseFloat(budget.limit) || 0);
    }, 0).toFixed(2);
  };

  // Calculate total spent across all budgets
  const calculateTotalSpent = () => {
    return budgets.reduce((total, budget) => {
      return total + (parseFloat(budget.spent) || 0);
    }, 0).toFixed(2);
  };

  // Calculate overall spending percentage
  const calculateOverallSpending = () => {
    const totalSpent = budgets.reduce((total, budget) => total + (parseFloat(budget.spent) || 0), 0);
    const totalBudget = budgets.reduce((total, budget) => total + (parseFloat(budget.limit) || 0), 0);
    
    return totalBudget > 0 ? Math.min(Math.round((totalSpent / totalBudget) * 100), 100) : 0;
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
            {isEditing ? 'Edit Budget Category' : 'Monthly Budget'}
          </h2>
          {!showForm ? (
            <button 
              onClick={() => { setShowForm(true); setIsEditing(false); }}
              className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
            >
              + Add Budget Category
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
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Groceries, Utilities, Entertainment"
                  />
                </div>
                
                <div>
                  <label htmlFor="limit" className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Limit
                  </label>
                  <input
                    type="number"
                    id="limit"
                    name="limit"
                    value={formData.limit}
                    onChange={handleChange}
                    step="0.01"
                    min="0.01"
                    required
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="spent" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Spent Amount
                  </label>
                  <input
                    type="number"
                    id="spent"
                    name="spent"
                    value={formData.spent}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="period" className="block text-sm font-medium text-gray-700 mb-1">
                    Budget Period
                  </label>
                  <select
                    id="period"
                    name="period"
                    value={formData.period}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="monthly">Monthly</option>
                    <option value="weekly">Weekly</option>
                    <option value="yearly">Yearly</option>
                  </select>
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
                    placeholder="Add notes about this budget category"
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
                  {isEditing ? 'Update Budget' : 'Save Budget'}
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
              <h5 className="font-medium text-gray-800 mb-2">Total Spent</h5>
              <p className="text-2xl font-bold text-red-600">${calculateTotalSpent()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h5 className="font-medium text-gray-800 mb-2">Total Budget</h5>
              <p className="text-2xl font-bold text-blue-600">${calculateTotalBudget()}</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h5 className="font-medium text-gray-800 mb-2">Overall Spending</h5>
              <div className="flex items-center">
                <div className="w-full bg-gray-200 rounded-full h-2.5 mr-2 flex-grow">
                  <div 
                    className={`h-2.5 rounded-full ${
                      calculateOverallSpending() > 90 ? 'bg-red-600' : 
                      calculateOverallSpending() > 75 ? 'bg-yellow-500' : 'bg-green-600'
                    }`}
                    style={{ width: `${calculateOverallSpending()}%` }}
                  ></div>
                </div>
                <span className="text-sm font-medium">{calculateOverallSpending()}%</span>
              </div>
            </div>
          </div>
          
          {/* Budgets list */}
          {budgets.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Period
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
                  {budgets.map((budget) => {
                    // Ensure budget data are processed as numbers
                    const spent = parseFloat(budget.spent) || 0;
                    const limit = parseFloat(budget.limit) || 1; // Avoid division by zero
                    const percentage = Math.min((spent / limit) * 100, 100);
                    
                    // Determine status color based on percentage
                    const statusColor = 
                      percentage > 90 ? 'red' : 
                      percentage > 75 ? 'yellow' : 
                      'green';
                    
                    return (
                      <tr key={budget.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {budget.category}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {budget.description || 'No description'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                          {budget.period}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className={`h-2.5 rounded-full ${
                                statusColor === 'red' ? 'bg-red-600' : 
                                statusColor === 'yellow' ? 'bg-yellow-500' : 
                                'bg-green-600'
                              }`} 
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-xs text-gray-500">{Math.round(percentage)}%</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <span className={`${percentage > 90 ? 'text-red-600' : 'text-green-600'}`}>
                            ${spent.toFixed(2)}
                          </span>
                          <span className="text-gray-500"> / ${limit.toFixed(2)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-3">
                            <button
                              onClick={() => handleEdit(budget)}
                              className="text-blue-600 hover:text-blue-800"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(budget.id)}
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">No budget categories found</h3>
              <p className="text-gray-500 mb-6">Start managing your finances by setting up budget categories.</p>
              <button 
                onClick={() => setShowForm(true)}
                className="bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              >
                Create Your First Budget
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Budget;