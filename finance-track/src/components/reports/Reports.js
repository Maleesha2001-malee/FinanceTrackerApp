import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { LineChart, BarChart, PieChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Bar, Pie, Cell } from 'recharts';

function Reports() {
  const { currentUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('expenses');
  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0], // Jan 1st of current year
    endDate: new Date().toISOString().split('T')[0] // Today
  });
  const [transactions, setTransactions] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#8dd1e1'];
  
  // Fetch data on component mount and when date range changes
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        // Fetch transactions within date range
        const transactionsResponse = await axios.get(`http://localhost:8080/api/transactions?startDate=${dateRange.startDate}&endDate=${dateRange.endDate}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch budgets
        const budgetsResponse = await axios.get('http://localhost:8080/api/budgets', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        // Fetch goals
        const goalsResponse = await axios.get('http://localhost:8080/api/goals', {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        setTransactions(transactionsResponse.data);
        setBudgets(budgetsResponse.data);
        setGoals(goalsResponse.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching data for reports:', err);
        if (err.response) {
          setError(`Failed to load data: ${err.response.status} - ${err.response.data?.message || 'Unknown error'}`);
        } else if (err.request) {
          setError('Failed to load data: No response from server. Check network connection.');
        } else {
          setError('Failed to load data: ' + err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [dateRange]);
  
  // Handle date range changes
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange(prev => ({ ...prev, [name]: value }));
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // EXPENSES TAB DATA PREPARATION
  const prepareExpensesData = () => {
    // Filter transactions to only include expenses
    const expenses = transactions.filter(t => t.type === 'expense');
    
    // Group expenses by category
    const expensesByCategory = expenses.reduce((acc, expense) => {
      const category = expense.category || 'Others';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += parseFloat(expense.amount);
      return acc;
    }, {});
    
    // Format for PieChart
    const pieData = Object.keys(expensesByCategory).map((category, index) => ({
      name: category,
      value: expensesByCategory[category]
    }));
    
    // Group expenses by month for the line chart
    const expensesByMonth = expenses.reduce((acc, expense) => {
      const date = new Date(expense.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += parseFloat(expense.amount);
      return acc;
    }, {});
    
    // Format for LineChart
    const lineData = Object.keys(expensesByMonth).map(monthYear => ({
      month: monthYear,
      amount: expensesByMonth[monthYear]
    })).sort((a, b) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`);
    });
    
    return { pieData, lineData };
  };
  
  // INCOME TAB DATA PREPARATION
  const prepareIncomeData = () => {
    // Filter transactions to only include income
    const incomes = transactions.filter(t => t.type === 'income');
    
    // Group income by category
    const incomeByCategory = incomes.reduce((acc, income) => {
      const category = income.category || 'Others';
      if (!acc[category]) {
        acc[category] = 0;
      }
      acc[category] += parseFloat(income.amount);
      return acc;
    }, {});
    
    // Format for PieChart
    const pieData = Object.keys(incomeByCategory).map((category, index) => ({
      name: category,
      value: incomeByCategory[category]
    }));
    
    // Group income by month for the line chart
    const incomeByMonth = incomes.reduce((acc, income) => {
      const date = new Date(income.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!acc[monthYear]) {
        acc[monthYear] = 0;
      }
      acc[monthYear] += parseFloat(income.amount);
      return acc;
    }, {});
    
    // Format for LineChart
    const lineData = Object.keys(incomeByMonth).map(monthYear => ({
      month: monthYear,
      amount: incomeByMonth[monthYear]
    })).sort((a, b) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`);
    });
    
    return { pieData, lineData };
  };
  
  // SAVINGS TAB DATA PREPARATION
  const prepareSavingsData = () => {
    // Data for each goal's progress
    const goalsData = goals.map(goal => ({
      name: goal.name,
      current: parseFloat(goal.currentAmount) || 0,
      remaining: parseFloat(goal.target) - (parseFloat(goal.currentAmount) || 0)
    }));
    
    // Total savings progress over time (estimated with monthly snapshots)
    const savingsLineData = [];
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setMonth(today.getMonth() - i);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      // Simple linear progression (purely illustrative - in a real app this would come from historical data)
      const progressFactor = (6 - i) / 6;
      const totalSaved = goals.reduce((sum, goal) => {
        return sum + progressFactor * parseFloat(goal.currentAmount || 0);
      }, 0);
      
      savingsLineData.push({
        month: monthYear,
        amount: totalSaved
      });
    }
    
    return { goalsData, savingsLineData };
  };
  
  // TRENDS TAB DATA PREPARATION
  const prepareTrendsData = () => {
    // Prepare monthly comparison data (income vs expenses)
    const monthlyData = [];
    const monthsMap = {};
    
    transactions.forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.toLocaleString('default', { month: 'short' })} ${date.getFullYear()}`;
      
      if (!monthsMap[monthYear]) {
        monthsMap[monthYear] = { month: monthYear, income: 0, expense: 0, savings: 0 };
      }
      
      if (transaction.type === 'income') {
        monthsMap[monthYear].income += parseFloat(transaction.amount);
      } else {
        monthsMap[monthYear].expense += parseFloat(transaction.amount);
      }
      
      // Calculate savings (income - expenses)
      monthsMap[monthYear].savings = monthsMap[monthYear].income - monthsMap[monthYear].expense;
    });
    
    // Convert to array and sort by date
    Object.values(monthsMap).forEach(data => {
      monthlyData.push(data);
    });
    
    monthlyData.sort((a, b) => {
      const [aMonth, aYear] = a.month.split(' ');
      const [bMonth, bYear] = b.month.split(' ');
      return new Date(`${aMonth} 1, ${aYear}`) - new Date(`${bMonth} 1, ${bYear}`);
    });
    
    // Budget vs actual spending by category
    const budgetComparison = [];
    
    budgets.forEach(budget => {
      // Find actual spending for this category
      let actualSpending = 0;
      transactions.forEach(transaction => {
        if (transaction.type === 'expense' && transaction.category === budget.category) {
          actualSpending += parseFloat(transaction.amount);
        }
      });
      
      budgetComparison.push({
        category: budget.category,
        budget: parseFloat(budget.limit),
        actual: actualSpending
      });
    });
    
    return { monthlyData, budgetComparison };
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Prepare data based on active tab
  let expensesData, incomeData, savingsData, trendsData;
  if (activeTab === 'expenses') {
    expensesData = prepareExpensesData();
  } else if (activeTab === 'income') {
    incomeData = prepareIncomeData();
  } else if (activeTab === 'savings') {
    savingsData = prepareSavingsData();
  } else if (activeTab === 'trends') {
    trendsData = prepareTrendsData();
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        <div className="px-6 py-5 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Reports & Analytics</h2>
          
          {/* Date Range Selector */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <div className="flex space-x-2">
                <input
                  type="date"
                  name="startDate"
                  value={dateRange.startDate}
                  onChange={handleDateRangeChange}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <span className="text-gray-500">-</span>
                <input
                  type="date"
                  name="endDate"
                  value={dateRange.endDate}
                  onChange={handleDateRangeChange}
                  className="px-2 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('expenses')}
            className={`px-6 py-4 text-center flex-1 ${
              activeTab === 'expenses'
                ? 'bg-blue-500 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setActiveTab('income')}
            className={`px-6 py-4 text-center flex-1 ${
              activeTab === 'income'
                ? 'bg-blue-500 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setActiveTab('savings')}
            className={`px-6 py-4 text-center flex-1 ${
              activeTab === 'savings'
                ? 'bg-blue-500 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Savings
          </button>
          <button
            onClick={() => setActiveTab('trends')}
            className={`px-6 py-4 text-center flex-1 ${
              activeTab === 'trends'
                ? 'bg-blue-500 text-white font-medium'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            Trends
          </button>
        </div>
        
        {/* Tab Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {/* EXPENSES TAB */}
          {activeTab === 'expenses' && (
            <div>
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Expense Distribution by Category</h3>
                {expensesData.pieData.length > 0 ? (
                  <div className="h-72 flex justify-center">
                    <PieChart width={400} height={300}>
                      <Pie
                        data={expensesData.pieData}
                        cx={200}
                        cy={150}
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {expensesData.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend />
                    </PieChart>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No expense data available for this period</div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Expense Trend</h3>
                {expensesData.lineData.length > 0 ? (
                  <div className="h-72">
                    <LineChart
                      width={800}
                      height={300}
                      data={expensesData.lineData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#ff7300" name="Expenses" activeDot={{ r: 8 }} />
                    </LineChart>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No expense trend data available</div>
                )}
              </div>
            </div>
          )}

          {/* INCOME TAB */}
          {activeTab === 'income' && (
            <div>
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Income Sources</h3>
                {incomeData.pieData.length > 0 ? (
                  <div className="h-72 flex justify-center">
                    <PieChart width={400} height={300}>
                      <Pie
                        data={incomeData.pieData}
                        cx={200}
                        cy={150}
                        innerRadius={60}
                        outerRadius={100}
                        fill="#8884d8"
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {incomeData.pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend />
                    </PieChart>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No income data available for this period</div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Income Trend</h3>
                {incomeData.lineData.length > 0 ? (
                  <div className="h-72">
                    <LineChart
                      width={800}
                      height={300}
                      data={incomeData.lineData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#00C49F" name="Income" activeDot={{ r: 8 }} />
                    </LineChart>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No income trend data available</div>
                )}
              </div>
            </div>
          )}

          {/* SAVINGS TAB */}
          {activeTab === 'savings' && (
            <div>
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Savings Goals Progress</h3>
                {savingsData.goalsData.length > 0 ? (
                  <div className="h-72">
                    <BarChart
                      width={800}
                      height={300}
                      data={savingsData.goalsData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="current" stackId="a" fill="#82ca9d" name="Current Amount" />
                      <Bar dataKey="remaining" stackId="a" fill="#d3d3d3" name="Remaining" />
                    </BarChart>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No savings goals found</div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Savings Growth Over Time</h3>
                {savingsData.savingsLineData.length > 0 ? (
                  <div className="h-72">
                    <LineChart
                      width={800}
                      height={300}
                      data={savingsData.savingsLineData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" stroke="#8884d8" name="Total Savings" activeDot={{ r: 8 }} />
                    </LineChart>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No savings trend data available</div>
                )}
              </div>
            </div>
          )}

          {/* TRENDS TAB */}
          {activeTab === 'trends' && (
            <div>
              <div className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Income vs Expenses vs Savings</h3>
                {trendsData.monthlyData.length > 0 ? (
                  <div className="h-72">
                    <BarChart
                      width={800}
                      height={300}
                      data={trendsData.monthlyData}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="income" fill="#00C49F" name="Income" />
                      <Bar dataKey="expense" fill="#FF8042" name="Expenses" />
                      <Bar dataKey="savings" fill="#8884d8" name="Savings" />
                    </BarChart>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No trend data available</div>
                )}
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">Budget vs Actual Spending</h3>
                {trendsData.budgetComparison.length > 0 ? (
                  <div className="h-72">
                    <BarChart
                      width={800}
                      height={300}
                      data={trendsData.budgetComparison}
                      margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" />
                      <YAxis />
                      <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                      <Legend />
                      <Bar dataKey="budget" fill="#8884d8" name="Budget" />
                      <Bar dataKey="actual" fill="#82ca9d" name="Actual" />
                    </BarChart>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">No budget comparison data available</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Reports;