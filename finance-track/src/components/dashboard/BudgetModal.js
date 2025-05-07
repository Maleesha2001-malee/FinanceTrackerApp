import React, { useState, useEffect } from 'react';
import axios from 'axios';

function BudgetModal({ isOpen, onClose, budget, onSave, isEdit }) {
  const [formData, setFormData] = useState({
    category: '',
    limit: 0,
    spent: 0
  });
  const [error, setError] = useState('');

  useEffect(() => {
    // If editing, populate the form with budget data
    if (budget && isEdit) {
      setFormData({
        category: budget.category || '',
        limit: budget.limit || 0,
        spent: budget.spent || 0
      });
    } else {
      // Reset form for new budget
      setFormData({
        category: '',
        limit: 0,
        spent: 0
      });
    }
  }, [budget, isEdit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === 'category' ? value : parseFloat(value)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Validate form data
      if (!formData.category) {
        setError('Category is required');
        return;
      }
      if (formData.limit <= 0) {
        setError('Budget limit must be greater than zero');
        return;
      }

      // Call the onSave function passed from parent
      await onSave(formData, isEdit ? budget.id : null);
      onClose();
    } catch (err) {
      setError(err.message || 'Error saving budget');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">{isEdit ? 'Edit Budget' : 'Create New Budget'}</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
              Category
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="category"
              name="category"
              type="text"
              placeholder="e.g. Housing, Food, Transport"
              value={formData.category}
              onChange={handleChange}
            />
          </div>
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="limit">
              Monthly Limit ($)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="limit"
              name="limit"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.limit}
              onChange={handleChange}
            />
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="spent">
              Already Spent ($)
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="spent"
              name="spent"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.spent}
              onChange={handleChange}
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="submit"
            >
              {isEdit ? 'Save Changes' : 'Create Budget'}
            </button>
            <button
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default BudgetModal;