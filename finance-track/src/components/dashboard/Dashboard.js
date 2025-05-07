import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useContext(AuthContext);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  
  // Calculate total budget limit
  const calculateTotalBudget = () => {
    return budgets.reduce((total, budget) => {
      return total + (parseFloat(budget.limit) || 0);
    }, 0).toFixed(2);
  };
  
  // Function to fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      
      const userInfoPromise = axios.get('http://localhost:8080/api/auth/user-info');
      const transactionsPromise = axios.get('http://localhost:8080/api/transactions');
      const budgetsPromise = axios.get('http://localhost:8080/api/budgets');
      const goalsPromise = axios.get('http://localhost:8080/api/goals');
      
      const [userInfoRes, transactionsRes, budgetsRes, goalsRes] = await Promise.all([
        userInfoPromise,
        transactionsPromise,
        budgetsPromise,
        goalsPromise
      ]);
      
      setUserInfo(userInfoRes.data);
      setTransactions(transactionsRes.data);
      setBudgets(budgetsRes.data);
      setGoals(goalsRes.data);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError('Failed to load data');
    } finally {
      setLoading(false);
    }
  };
  
  useEffect(() => {
    fetchAllData();
  }, []);
  
  // Calculate financial summary
  const calculateTotalBalance = () => {
    return transactions.reduce((total, transaction) => {
      const amount = parseFloat(transaction.amount) || 0;
      return transaction.type === 'income' ? total + amount : total - amount;
    }, 0).toFixed(2);
  };
  
  const calculateIncome = () => {
    return transactions
      .filter(transaction => transaction.type === 'income')
      .reduce((total, transaction) => {
        const amount = parseFloat(transaction.amount) || 0;
        return total + amount;
      }, 0)
      .toFixed(2);
  };
  
  const calculateExpenses = () => {
    return transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((total, transaction) => {
        const amount = parseFloat(transaction.amount) || 0;
        return total + amount;
      }, 0)
      .toFixed(2);
  };
  
  // Calculate expense breakdown percentages
  const calculateExpenseBreakdown = () => {
    const expensesByCategory = transactions
      .filter(transaction => transaction.type === 'expense')
      .reduce((acc, transaction) => {
        const category = transaction.category || 'Others';
        if (!acc[category]) {
          acc[category] = 0;
        }
        acc[category] += parseFloat(transaction.amount) || 0;
        return acc;
      }, {});
    
    const totalExpenses = Object.values(expensesByCategory).reduce((sum, amount) => sum + amount, 0);
    
    const percentages = Object.entries(expensesByCategory).map(([category, amount]) => {
      return {
        category,
        amount,
        percentage: totalExpenses > 0 ? Math.round((amount / totalExpenses) * 100) : 0
      };
    });
    
    return percentages.sort((a, b) => b.percentage - a.percentage);
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  // Define colors for expense categories
  const categoryColors = {
    Housing: 'bg-blue-500',
    Food: 'bg-green-500',
    Transport: 'bg-yellow-500',
    Entertainment: 'bg-red-500',
    Utilities: 'bg-purple-500',
    Healthcare: 'bg-pink-500',
    Shopping: 'bg-indigo-500',
    Others: 'bg-gray-500'
  };
  
  // Get expense breakdown data
  const expenseBreakdown = calculateExpenseBreakdown();
  
  // Limit display to 4 budgets and 3 goals
  const displayBudgets = budgets.slice(0, 4);
  const displayGoals = goals.slice(0, 3);
  
  // Check if user is new (no transactions)
  const isNewUser = transactions.length === 0;
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Dashboard</h2>
        </div>
        
        <div className="px-6 py-5">
          <h3 className="text-xl font-semibold mb-4">Welcome to your Finance Tracker!</h3>
          
          {isNewUser && (
            <div className="bg-blue-50 p-4 rounded-lg mb-6">
              <h4 className="font-medium text-gray-800 mb-2">Get Started</h4>
              <p className="text-gray-600 mb-4">Welcome to your finance tracker! Start by adding your income to begin tracking your finances.</p>
              <button 
                onClick={() => navigate('/transactions')}
                className="bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-colors"
              >
                Add your income in transaction
              </button>
            </div>
          )}
          
          <div className="bg-blue-50 p-4 rounded-lg mb-6">
            <h4 className="font-medium text-gray-800 mb-2">Account Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Username</p>
                <p className="font-medium">{userInfo?.username || currentUser?.username || 'User'}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Email</p>
                <p className="font-medium">{userInfo?.email || currentUser?.email || 'email@example.com'}</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h5 className="font-medium text-gray-800 mb-2">Total Balance</h5>
              {transactions.length > 0 ? (
                <>
                  <p className="text-2xl font-bold text-green-600">${calculateTotalBalance()}</p>
                  {transactions.length > 5 && <p className="text-sm text-green-500 mt-1">↑ Recent trend</p>}
                </>
              ) : (
                <p className="text-2xl font-bold text-gray-400">No data</p>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h5 className="font-medium text-gray-800 mb-2">Income</h5>
              {transactions.length > 0 ? (
                <p className="text-2xl font-bold text-blue-600">${calculateIncome()}</p>
              ) : (
                <p className="text-2xl font-bold text-gray-400">No data</p>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h5 className="font-medium text-gray-800 mb-2">Expenses</h5>
              {transactions.length > 0 ? (
                <p className="text-2xl font-bold text-red-600">${calculateExpenses()}</p>
              ) : (
                <p className="text-2xl font-bold text-gray-400">No data</p>
              )}
            </div>
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h5 className="font-medium text-gray-800 mb-2">Total Budget</h5>
              {budgets.length > 0 ? (
                <p className="text-2xl font-bold text-purple-600">${calculateTotalBudget()}</p>
              ) : (
                <p className="text-2xl font-bold text-gray-400">No data</p>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-medium text-gray-800">Budget Status</h5>
                <button 
                  onClick={() => navigate('/budgets')}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {budgets.length > 0 ? (
                <div>
                  {displayBudgets.map((budget, index) => {
                    const spent = parseFloat(budget.spent) || 0;
                    const limit = parseFloat(budget.limit) || 1;
                    const percentage = Math.min((spent / limit) * 100, 100);
                    
                    return (
                      <div key={budget.id || index} className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{budget.category}</span>
                          <span className="text-sm text-gray-600">${spent.toFixed(2)} / ${limit.toFixed(2)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className={`bg-blue-600 h-2.5 rounded-full ${spent > limit ? 'bg-red-600' : ''}`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No budgets found</p>
                  <p className="text-sm text-gray-400">View budgets section to create and manage budgets</p>
                </div>
              )}
              <button 
                onClick={() => navigate('/budgets')}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              >
                Manage Budgets
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-medium text-gray-800">Financial Goals</h5>
                <button 
                  onClick={() => navigate('/goals')}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              {goals.length > 0 ? (
                <div>
                  {displayGoals.map((goal, index) => {
                    const saved = parseFloat(goal.saved) || 0;
                    const target = parseFloat(goal.target) || 1;
                    const percentage = Math.min((saved / target) * 100, 100);
                    
                    return (
                      <div key={goal.id || index} className="mb-3">
                        <div className="flex justify-between mb-1">
                          <span className="text-sm font-medium text-gray-700">{goal.name}</span>
                          <span className="text-sm text-gray-600">{Math.round(percentage)}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full" 
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No financial goals found</p>
                  <p className="text-sm text-gray-400">Visit goals section to set and track your savings goals</p>
                </div>
              )}
              <button 
                onClick={() => navigate('/goals')}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              >
                Manage Goals
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h5 className="font-medium text-gray-800">Recent Transactions</h5>
                <button 
                  onClick={() => navigate('/transactions')}
                  className="text-blue-500 hover:text-blue-700 text-sm font-medium"
                >
                  View All
                </button>
              </div>
              
              {transactions.length > 0 ? (
                <div className="divide-y divide-gray-200">
                  {transactions.slice(0, 5).map((transaction, index) => {
                    const amount = parseFloat(transaction.amount) || 0;
                    
                    return (
                      <div key={transaction.id || index} className="py-3 flex items-center justify-between">
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                            transaction.type === 'income' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}
                          </div>
                          <div>
                            <p className="font-medium text-gray-800">{transaction.description}</p>
                            <p className="text-xs text-gray-500">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-medium ${
                            transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}${amount.toFixed(2)}
                          </p>
                          <p className="text-xs text-gray-500">{new Date(transaction.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No transactions found</p>
                  <p className="text-sm text-gray-400">Visit transactions section to add and manage your financial activity</p>
                </div>
              )}
              
              <button 
                onClick={() => navigate('/transactions')}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              >
                View All Transactions
              </button>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <h5 className="font-medium text-gray-800 mb-4">Expense Breakdown</h5>
              
              {expenseBreakdown.length > 0 ? (
                <div>
                  {expenseBreakdown.map((item, index) => (
                    <div key={index} className="mb-3">
                      <div className="flex justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">{item.category}</span>
                        <span className="text-sm text-gray-600">{item.percentage}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`${categoryColors[item.category] || 'bg-gray-500'} h-2.5 rounded-full`}
                          style={{ width: `${item.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">No expense data found</p>
                  <p className="text-sm text-gray-400">Add expense transactions to view breakdown</p>
                </div>
              )}
              
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <h6 className="text-sm font-medium text-gray-700 mb-2">Spending Tips</h6>
                <p className="text-sm text-gray-600">
                  {expenseBreakdown.length > 0 
                    ? `Your highest spending category is ${expenseBreakdown[0]?.category}. Consider setting a budget to manage these expenses.`
                    : 'Start tracking your expenses to receive personalized spending tips.'}
                </p>
              </div>
              
              <button 
                onClick={() => navigate('/reports')}
                className="mt-4 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition-colors"
              >
                View Full Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;