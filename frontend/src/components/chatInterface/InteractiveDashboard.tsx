export interface Metric {
  label: string;
  value: number | string;
  trend: 'up' | 'down';
  change: string;
}

interface ChartItem {
  type: string;
  count: number;
  percentage: number;
}

interface TimelineItem {
  time: string;
  queries: number;
}

interface ActivityItem {
  user: string;
  action: string;
  status: 'approved' | 'pending' | 'other';
  time: string;
}

export interface DashboardContent {
  title: string;
  metrics: Metric[];
  charts: {
    queryTypes: ChartItem[];
    timelineData: TimelineItem[];
  };
  recentActivity: ActivityItem[];
}

interface DashboardProps {
  data: DashboardContent; // no nested "content"
}


export function InteractiveDashboard({ data }: DashboardProps) {
  const { title, metrics, charts, recentActivity } = data;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mb-6">
      <div className="flex items-center space-x-3 mb-6">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900">{title}</h3>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {metrics.map((metric, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">{metric.label}</span>
              <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                metric.trend === 'up' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
              }`}>
                {metric.change}
              </span>
            </div>
            <div className="text-2xl font-bold text-gray-900">{metric.value}</div>
          </div>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Query Types Chart */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Query Types Distribution</h4>
          <div className="space-y-3">
            {charts.queryTypes.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-green-500' :
                    index === 2 ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <span className="text-sm font-medium text-gray-700">{item.type}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">{item.count}</span>
                  <span className="text-xs text-gray-500">({item.percentage}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Timeline Chart */}
        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <h4 className="text-lg font-semibold text-gray-900 mb-4">Query Timeline (24h)</h4>
          <div className="flex items-end justify-between h-32 space-x-2">
            {charts.timelineData.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-1">
                <div 
                  className="bg-blue-500 rounded-t w-full"
                  style={{ height: `${(item.queries / 300) * 100}%` }}
                ></div>
                <span className="text-xs text-gray-500 mt-2">{item.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
        <h4 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h4>
        <div className="space-y-3">
          {recentActivity.map((activity, index) => (
            <div key={index} className="flex items-center justify-between py-2">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-medium text-blue-700">{activity.user.charAt(0).toUpperCase()}</span>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-900">{activity.user}</span>
                  <span className="text-sm text-gray-600 ml-1">{activity.action}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  activity.status === 'approved' ? 'bg-green-100 text-green-700' :
                  activity.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {activity.status}
                </span>
                <span className="text-xs text-gray-500">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
