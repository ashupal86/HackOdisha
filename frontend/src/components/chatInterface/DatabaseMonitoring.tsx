import React from 'react';

interface DatabaseMonitoringProps {
  className?: string;
}

const DatabaseMonitoring: React.FC<DatabaseMonitoringProps> = ({ className = "" }) => {
  // Mock data for database monitoring
  const mockMetrics = {
    activeQueries: 23,
    avgResponseTime: 145,
    dbLoad: 67,
    querySuccess: 98.7
  };

  const mockRealtimeData = {
    queryActivity: [60, 75, 45, 80, 65, 90, 70, 85],
    performance: [85, 70, 90, 65, 75, 95, 80, 88],
    errorRate: [2, 1, 3, 0, 1, 0, 2, 1]
  };

  const recentQueries = [
    { id: 1, user: 'john.doe', query: 'SELECT * FROM users...', status: 'approved', time: '2m ago' },
    { id: 2, user: 'jane.smith', query: 'UPDATE products SET...', status: 'pending', time: '5m ago' },
    { id: 3, user: 'admin', query: 'DELETE FROM temp_table...', status: 'approved', time: '8m ago' },
  ];

  const MiniChart = ({ data, color, height = 24 }: { data: number[]; color: string; height?: number }) => (
    <div className="flex items-end space-x-0.5" style={{ height: `${height}px` }}>
      {data.map((value, index) => (
        <div
          key={index}
          className={`w-1 ${color} rounded-sm transition-all duration-300`}
          style={{ height: `${(value / 100) * height}px` }}
        />
      ))}
    </div>
  );

  return (
    <div className={`w-80 bg-white border-l border-gray-200 shadow-lg ${className}`}>
      <div className="h-full flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">DB Monitor</h2>
              <p className="text-xs text-gray-500">Real-time Analytics</p>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Key Metrics */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">System Metrics</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg p-3 border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-blue-600 font-medium">Active Queries</span>
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                </div>
                <div className="text-xl font-bold text-blue-900">{mockMetrics.activeQueries}</div>
              </div>

              <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-lg p-3 border border-green-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-green-600 font-medium">Success Rate</span>
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
                <div className="text-xl font-bold text-green-900">{mockMetrics.querySuccess}%</div>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-purple-600 font-medium">Avg Response</span>
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                </div>
                <div className="text-xl font-bold text-purple-900">{mockMetrics.avgResponseTime}ms</div>
              </div>

              <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-lg p-3 border border-yellow-200">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-yellow-600 font-medium">DB Load</span>
                  <div className={`w-2 h-2 rounded-full ${mockMetrics.dbLoad > 80 ? 'bg-red-500' : mockMetrics.dbLoad > 60 ? 'bg-yellow-500' : 'bg-green-500'}`}></div>
                </div>
                <div className="text-xl font-bold text-yellow-900">{mockMetrics.dbLoad}%</div>
              </div>
            </div>
          </div>

          {/* Real-time Charts */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Real-time Activity</h3>
            <div className="space-y-4">
              {/* Query Activity */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 font-medium">Query Activity</span>
                  <span className="text-xs text-blue-600">Live</span>
                </div>
                <MiniChart data={mockRealtimeData.queryActivity} color="bg-blue-500" height={32} />
              </div>

              {/* Performance */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 font-medium">Performance</span>
                  <span className="text-xs text-green-600">Optimal</span>
                </div>
                <MiniChart data={mockRealtimeData.performance} color="bg-green-500" height={32} />
              </div>

              {/* Error Rate */}
              <div className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600 font-medium">Error Rate</span>
                  <span className="text-xs text-red-600">Low</span>
                </div>
                <MiniChart data={mockRealtimeData.errorRate} color="bg-red-500" height={32} />
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Activity</h3>
            <div className="space-y-2">
              {recentQueries.map((query) => (
                <div key={query.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-medium text-gray-700">{query.user}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      query.status === 'approved' ? 'bg-green-100 text-green-700' :
                      query.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {query.status}
                    </span>
                  </div>
                  <div className="text-xs text-gray-600 font-mono truncate mb-1">
                    {query.query}
                  </div>
                  <div className="text-xs text-gray-500">{query.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* System Health */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">System Health</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Database</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium text-xs">Online</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">AI Guardian</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-green-600 font-medium text-xs">Active</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Blockchain Logger</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-green-600 font-medium text-xs">Synced</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Admin Oversight</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-blue-600 font-medium text-xs">Enabled</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-gray-50">
          <div className="text-center">
            <div className="text-xs text-gray-500">Last updated</div>
            <div className="text-xs font-medium text-gray-700">Just now</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatabaseMonitoring;