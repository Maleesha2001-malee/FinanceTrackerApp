import React, { useState, useEffect } from 'react';

function GoalModal({ isOpen, onClose, onSave, goal, isEditing }) {
  const [formData, setFormData] = useState({
    name: '',
    target: '',
    saved: '',
    currentAmount: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form with goal data if editing
  useEffect(() => {
    if (goal && isEditing) {
      setFormData({
        name: goal.name || '',
        target: goal.target ? goal.target.toString() : '',
        saved: goal.saved ? goal.saved.toString() : '',
        currentAmount: goal.currentAmount ? goal.currentAmount.toString() : (goal.saved ? goal.saved.toString() : '')
      });
    } else {
      // Reset form for new goal
      setFormData({
        name: '',
        target: '',
        saved: '',
        currentAmount: ''
      });
    }
  }, [goal, isEditing]);

  const validate = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Goal name is required';
    }
    
    if (!formData.target) {
      newErrors.target = 'Target amount is required';
    } else if (isNaN(parseFloat(formData.target)) || parseFloat(formData.target) <= 0) {
      newErrors.target = 'Target amount must be a positive number';
    }
    
    if (formData.saved && (isNaN(parseFloat(formData.saved)) || parseFloat(formData.saved) < 0)) {
      newErrors.saved = 'Saved amount must be a non-negative number';
    }
    
    if (formData.currentAmount && (isNaN(parseFloat(formData.currentAmount)) || parseFloat(formData.currentAmount) < 0)) {
      newErrors.currentAmount = 'Current amount must be a non-negative number';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
    
    // Optionally sync saved and currentAmount if they should be linked
    if (name === 'saved') {
      setFormData(prev => ({ ...prev, currentAmount: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Convert amount values to numbers before saving
      const dataToSave = {
        ...formData,
        target: parseFloat(formData.target),
        saved: formData.saved ? parseFloat(formData.saved) : 0,
        currentAmount: formData.currentAmount ? parseFloat(formData.currentAmount) : 0
      };
      
      await onSave(dataToSave, isEditing ? goal.id : null);
      onClose();
    } catch (error) {
      console.error('Error saving goal:', error);
      setErrors(prev => ({ 
        ...prev, 
        submit: error.message || 'Failed to save goal' 
      }));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            {isEditing ? 'Edit Goal' : 'Add New Goal'}
          </h3>
        </div>
        
        <form onSubmit={handleSubmit} className="px-6 py-4">
          {errors.submit && (
            <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
              {errors.submit}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">
              Goal Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
              placeholder="e.g. New Car, Vacation, Emergency Fund"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="target">
              Target Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="text"
                id="target"
                name="target"
                value={formData.target}
                onChange={handleChange}
                className={`w-full pl-7 pr-3 py-2 border rounded-md ${errors.target ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0.00"
              />
            </div>
            {errors.target && (
              <p className="mt-1 text-xs text-red-500">{errors.target}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="saved">
              Already Saved
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="text"
                id="saved"
                name="saved"
                value={formData.saved}
                onChange={handleChange}
                className={`w-full pl-7 pr-3 py-2 border rounded-md ${errors.saved ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0.00"
              />
            </div>
            {errors.saved && (
              <p className="mt-1 text-xs text-red-500">{errors.saved}</p>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="currentAmount">
              Current Amount
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">$</span>
              </div>
              <input
                type="text"
                id="currentAmount"
                name="currentAmount"
                value={formData.currentAmount}
                onChange={handleChange}
                className={`w-full pl-7 pr-3 py-2 border rounded-md ${errors.currentAmount ? 'border-red-500' : 'border-gray-300'}`}
                placeholder="0.00"
              />
            </div>
            {errors.currentAmount && (
              <p className="mt-1 text-xs text-red-500">{errors.currentAmount}</p>
            )}
          </div>
          
          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-blue-500 text-white rounded-md text-sm font-medium hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default GoalModal;