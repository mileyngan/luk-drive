import React, { useState, useEffect } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';
import {
  TrendingUp, Download, Filter, TrendingDown, Users, BookOpen, DollarSign,
  AlertTriangle, CheckCircle, Clock, Target, Activity
} from 'lucide-react';

// Mock API service
const api = {
  get: async (url, config = {}) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Mock data based on endpoint
    if (url.includes('/analytics/enrollment')) {
      return {
        data: {
          totalEnrolled: 1247,
          enrollmentTrends: [
            { period: 'Jan', count: 120 },
            { period: 'Feb', count: 145 },
            { period: 'Mar', count: 178 },
            { period: 'Apr', count: 203 },
            { period: 'May', count: 234 },
            { period: 'Jun', count: 267 }
          ],
          demographics: {
            genderStats: { male: 520, female: 727 }
          }
        }
      };
    }
    
    if (url.includes('/analytics/progress')) {
      return {
        data: {
          kpis: {
            completionRate: 78,
            avgScore: 85
          },
          performanceBySubject: {
            'Mathematics': { avgScore: 82, completionRate: 75 },
            'Science': { avgScore: 88, completionRate: 82 },
            'Literature': { avgScore: 79, completionRate: 69 },
            'History': { avgScore: 84, completionRate: 73 }
          },
          performanceByDifficulty: {
            'easy': { avgScore: 92, completionRate: 95 },
            'medium': { avgScore: 78, completionRate: 72 },
            'hard': { avgScore: 65, completionRate: 58 }
          },
          performanceByChapter: {
            'Chapter 1': { avgScore: 85, completionRate: 92, scores: [85, 90, 78, 82, 88] },
            'Chapter 2': { avgScore: 78, completionRate: 85, scores: [78, 82, 75, 80, 79] },
            'Chapter 3': { avgScore: 82, completionRate: 79, scores: [82, 85, 78, 84, 81] }
          }
        }
      };
    }
    
    if (url.includes('/analytics/revenue')) {
      return {
        data: {
          totalRevenue: 2450000,
          monthlyTrends: [
            { month: 'Jan', revenue: 380000 },
            { month: 'Feb', revenue: 420000 },
            { month: 'Mar', revenue: 450000 },
            { month: 'Apr', revenue: 480000 },
            { month: 'May', revenue: 510000 },
            { month: 'Jun', revenue: 540000 }
          ],
          revenueByType: {
            subscription: 1800000,
            one_time: 650000
          }
        }
      };
    }
    
    if (url.includes('/analytics/predictive')) {
      return {
        data: {
          dropoutPrediction: {
            riskDistribution: { high: 45, medium: 78, low: 324 },
            atRiskStudents: [
              { student: { first_name: 'John', last_name: 'Doe' }, riskLevel: 'high', riskScore: 85 },
              { student: { first_name: 'Jane', last_name: 'Smith' }, riskLevel: 'high', riskScore: 78 },
              { student: { first_name: 'Mike', last_name: 'Johnson' }, riskLevel: 'medium', riskScore: 65 }
            ]
          }
        }
      };
    }
    
    return { data: {} };
  }
};

const AnalyticsDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [analyticsData, setAnalyticsData] = useState({
    enrollment: null,
    progress: null,
    revenue: null,
    predictive: null
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    dimension: 'monthly',
    startDate: '',
    endDate: ''
  });
  const [showExportModal, setShowExportModal] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchAnalyticsData();
  }, [filters]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const [enrollmentRes, progressRes, revenueRes, predictiveRes] = await Promise.all([
        api.get('/analytics/enrollment', { params: filters }),
        api.get('/analytics/progress', { params: filters }),
        api.get('/analytics/revenue', { params: filters }),
        api.get('/analytics/predictive')
      ]);

      setAnalyticsData({
        enrollment: enrollmentRes.data,
        progress: progressRes.data,
        revenue: revenueRes.data,
        predictive: predictiveRes.data
      });
    } catch (err) {
      console.error('Analytics fetch error:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (reportType) => {
    try {
      setExporting(true);
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const data = JSON.stringify(analyticsData[reportType], null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `${reportType}_report_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export report');
    } finally {
      setExporting(false);
      setShowExportModal(false);
    }
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Activity className="mr-3 text-blue-600" size={32} />
          Business Intelligence & Analytics
        </h1>
        <div className="flex gap-3">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Download className="mr-2" size={16} />
            Export Reports
          </button>
          <button
            onClick={fetchAnalyticsData}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Filter className="mr-2" size={16} />
            Refresh
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Time Dimension</label>
            <select
              value={filters.dimension}
              onChange={(e) => setFilters({...filters, dimension: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button
            onClick={fetchAnalyticsData}
            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'overview', label: 'Overview' },
              { key: 'progress', label: 'Learning Progress' },
              { key: 'revenue', label: 'Revenue Analytics' },
              { key: 'predictive', label: 'Predictive Insights' }
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  activeTab === tab.key
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Users className="mx-auto text-blue-600 mb-3" size={32} />
              <h3 className="text-2xl font-bold text-blue-600 mb-1">
                {analyticsData.enrollment?.totalEnrolled || 0}
              </h3>
              <p className="text-gray-600 mb-2">Total Students</p>
              <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                <TrendingUp size={14} className="mr-1" />
                +12% this month
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <BookOpen className="mx-auto text-green-600 mb-3" size={32} />
              <h3 className="text-2xl font-bold text-green-600 mb-1">
                {analyticsData.progress?.kpis?.completionRate || 0}%
              </h3>
              <p className="text-gray-600 mb-2">Completion Rate</p>
              <div className="inline-flex items-center px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full">
                <CheckCircle size={14} className="mr-1" />
                On track
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <Target className="mx-auto text-yellow-600 mb-3" size={32} />
              <h3 className="text-2xl font-bold text-yellow-600 mb-1">
                {analyticsData.progress?.kpis?.avgScore || 0}
              </h3>
              <p className="text-gray-600 mb-2">Avg Score</p>
              <div className="inline-flex items-center px-2 py-1 bg-yellow-100 text-yellow-800 text-sm rounded-full">
                <Clock size={14} className="mr-1" />
                Improving
              </div>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm text-center">
              <DollarSign className="mx-auto text-purple-600 mb-3" size={32} />
              <h3 className="text-2xl font-bold text-purple-600 mb-1">
                {analyticsData.revenue?.totalRevenue || 0}
              </h3>
              <p className="text-gray-600 mb-2">Total Revenue (XAF)</p>
              <div className="inline-flex items-center px-2 py-1 bg-purple-100 text-purple-800 text-sm rounded-full">
                <TrendingUp size={14} className="mr-1" />
                +8% this month
              </div>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Enrollment Trends</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analyticsData.enrollment?.enrollmentTrends || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="period" />
                  <YAxis />
                  <Tooltip />
                  <Area type="monotone" dataKey="count" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Student Demographics</h3>
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-2">Gender Distribution</p>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={Object.entries(analyticsData.enrollment?.demographics?.genderStats || {}).map(([key, value]) => ({
                        name: key.charAt(0).toUpperCase() + key.slice(1),
                        value
                      }))}
                      cx="50%"
                      cy="50%"
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                      label
                    >
                      {Object.entries(analyticsData.enrollment?.demographics?.genderStats || {}).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'progress' && (
        <div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Performance by Subject</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(analyticsData.progress?.performanceBySubject || {}).map(([subject, data]) => ({
                  subject,
                  avgScore: Math.round(data.avgScore),
                  completionRate: Math.round(data.completionRate)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="subject" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#8884d8" name="Avg Score" />
                  <Bar dataKey="completionRate" fill="#82ca9d" name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-4">Performance by Difficulty</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(analyticsData.progress?.performanceByDifficulty || {}).map(([difficulty, data]) => ({
                  difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
                  avgScore: Math.round(data.avgScore),
                  completionRate: Math.round(data.completionRate)
                }))}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="difficulty" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="avgScore" fill="#ffc658" name="Avg Score" />
                  <Bar dataKey="completionRate" fill="#ff7300" name="Completion %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">Chapter Performance Details</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chapter</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Avg Score</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completion Rate</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Attempts</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(analyticsData.progress?.performanceByChapter || {}).map(([chapter, data]) => (
                    <tr key={chapter}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{chapter}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Math.round(data.avgScore)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{Math.round(data.completionRate)}%</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{data.scores.length}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${
                              data.avgScore >= 70 ? 'bg-green-600' : data.avgScore >= 50 ? 'bg-yellow-600' : 'bg-red-600'
                            }`}
                            style={{ width: `${data.avgScore}%` }}
                          ></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'revenue' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Revenue Trends</h3>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData.revenue?.monthlyTrends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`${value} XAF`, 'Revenue']} />
                <Legend />
                <Line type="monotone" dataKey="revenue" stroke="#8884d8" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Revenue by Type</h3>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(analyticsData.revenue?.revenueByType || {}).map(([type, amount]) => ({
                    name: type.replace('_', ' ').toUpperCase(),
                    value: amount
                  }))}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {Object.entries(analyticsData.revenue?.revenueByType || {}).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} XAF`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === 'predictive' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4 flex items-center">
              <AlertTriangle className="mr-2 text-orange-500" size={20} />
              At-Risk Students
            </h3>
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-2">Risk Distribution</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'High Risk', value: analyticsData.predictive?.dropoutPrediction?.riskDistribution?.high || 0 },
                      { name: 'Medium Risk', value: analyticsData.predictive?.dropoutPrediction?.riskDistribution?.medium || 0 },
                      { name: 'Low Risk', value: analyticsData.predictive?.dropoutPrediction?.riskDistribution?.low || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={60}
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    <Cell fill="#dc3545" />
                    <Cell fill="#ffc107" />
                    <Cell fill="#28a745" />
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-md">
              <div className="flex items-center">
                <AlertTriangle className="text-yellow-600 mr-2" size={16} />
                <p className="text-yellow-800 text-sm">
                  <strong>Action Required:</strong> {analyticsData.predictive?.dropoutPrediction?.atRiskStudents?.length || 0} students need intervention
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Top At-Risk Students</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Student</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Risk Score</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analyticsData.predictive?.dropoutPrediction?.atRiskStudents?.slice(0, 5).map((student, index) => (
                    <tr key={index}>
                      <td className="px-4 py-2 text-sm text-gray-900">
                        {student.student.first_name} {student.student.last_name}
                      </td>
                      <td className="px-4 py-2">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          student.riskLevel === 'high' 
                            ? 'bg-red-100 text-red-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {student.riskLevel.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-sm text-gray-900">{student.riskScore}%</td>
                      <td className="px-4 py-2">
                        <button className="text-blue-600 hover:text-blue-900 text-sm font-medium">
                          Contact
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Export Modal */}
      {showExportModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Export Analytics Report</h3>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>
            <p className="text-gray-600 mb-4">Choose the type of report to export:</p>
            <div className="space-y-3">
              <button
                onClick={() => handleExport('enrollment')}
                disabled={exporting}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2"></div>
                ) : (
                  <Users className="mr-2" size={16} />
                )}
                Enrollment Report
              </button>
              <button
                onClick={() => handleExport('progress')}
                disabled={exporting}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-600 mr-2"></div>
                ) : (
                  <BookOpen className="mr-2" size={16} />
                )}
                Progress Report
              </button>
              <button
                onClick={() => handleExport('revenue')}
                disabled={exporting}
                className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                {exporting ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                ) : (
                  <DollarSign className="mr-2" size={16} />
                )}
                Revenue Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;