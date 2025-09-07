import { InteractiveDashboard, DashboardContent } from './InteractiveDashboard';
// ----- Types -----
interface PerformanceMetric {
  metric: string;
  value: number | string;
  benchmark: string;
  status: 'excellent' | 'good' | 'average';
}

interface TopQuery {
  query: string;
  count: number;
  avgTime: string;
}

interface UserActivity {
  user: string;
  queries: number;
  approval_rate: string;
}

interface SecurityAlert {
  type: string;
  description: string;
  severity: 'high' | 'medium';
}

interface Log {
  id: string;
  timestamp: string;
  query: string;
  user: string;
  status: 'approved' | 'auto-approved' | 'rejected';
  approver: string;
  gasUsed: string;
}

interface LogSummary {
  totalLogs: number;
  approvedQueries: number;
  rejectedQueries: number;
  blockchainIntegrity: string;
}

interface ServiceStatus {
  name: string;
  status: string;
  uptime: string;
  response: string;
}

interface Command {
  cmd: string;
  desc: string;
}

// Discriminated union for InteractiveTool
type InteractiveToolData =
  | { type: 'dashboard'; data: DashboardContent } // InteractiveDashboard handles its own typing
  | {
      type: 'analytics';
      content: {
        title: string;
        performanceMetrics: PerformanceMetric[];
        topQueries: TopQuery[];
        userActivity: UserActivity[];
        securityAlerts: SecurityAlert[];
      };
    }
  | { type: 'logs'; content: { title: string; logs: Log[]; summary: LogSummary } }
  | { type: 'status'; content: { title: string; services: ServiceStatus[]; version: string; lastUpdate: string; totalUptime: string } }
  | { type: 'help'; content: { title: string; commands: Command[]; examples: string[]; safety: string[] } };

interface InteractiveToolProps {
  data: InteractiveToolData;
}


// ----- Component -----
export function InteractiveTool({ data }: InteractiveToolProps) {
  // --- Dashboard ---
if (data.type === 'dashboard') {
  return <InteractiveDashboard data={data.data} />;
}

  // --- Analytics ---
  if (data.type === 'analytics') {
    const { title, performanceMetrics, topQueries, userActivity, securityAlerts } = data.content;

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            {/* icon */}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {performanceMetrics.map((metric, idx) => (
            <div key={idx} className="bg-gradient-to-br from-gray-50 to-green-50 rounded-xl p-4 border border-gray-100">
              <div className="text-sm font-medium text-gray-600 mb-1">{metric.metric}</div>
              <div className="text-2xl font-bold text-gray-900 mb-1">{metric.value}</div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-500">{metric.benchmark}</span>
                <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                  metric.status === 'excellent'
                    ? 'bg-green-100 text-green-700'
                    : metric.status === 'good'
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-yellow-100 text-yellow-700'
                }`}>
                  {metric.status}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Queries */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Top Executed Queries</h4>
            <div className="space-y-3">
              {topQueries.map((query, index) => (
                <div key={index} className="bg-white rounded-lg p-3 border border-gray-100">
                  <div className="text-xs font-mono text-gray-700 mb-2 truncate">{query.query}</div>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>Count: {query.count}</span>
                    <span>Avg: {query.avgTime}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* User Activity */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
            <h4 className="text-lg font-semibold text-gray-900 mb-4">User Activity</h4>
            <div className="space-y-3">
              {userActivity.map((user, index) => (
                <div key={index} className="flex items-center justify-between py-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <span className="text-xs font-medium text-green-700">{user.user.charAt(0).toUpperCase()}</span>
                    </div>
                    <span className="text-sm font-medium text-gray-900">{user.user}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-gray-600">{user.queries} queries</div>
                    <div className="text-xs text-gray-500">{user.approval_rate} approval</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {securityAlerts.length > 0 && (
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <h4 className="text-lg font-semibold text-red-900 mb-4">Security Alerts</h4>
            <div className="space-y-3">
              {securityAlerts.map((alert, index) => (
                <div key={index} className="flex items-start space-x-3">
                  <div className={`w-3 h-3 rounded-full mt-1 ${
                    alert.severity === 'high' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <div>
                    <div className="text-sm font-medium text-gray-900">{alert.type}</div>
                    <div className="text-xs text-gray-600">{alert.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- Logs ---
  if (data.type === 'logs') {
    const { title, logs, summary } = data.content;

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mb-6">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
            {/* icon */}
          </div>
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="text-sm text-purple-600">Total Logs</div>
            <div className="text-xl font-bold text-purple-900">{summary.totalLogs}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-sm text-green-600">Approved</div>
            <div className="text-xl font-bold text-green-900">{summary.approvedQueries}</div>
          </div>
          <div className="bg-red-50 rounded-lg p-3 border border-red-100">
            <div className="text-sm text-red-600">Rejected</div>
            <div className="text-xl font-bold text-red-900">{summary.rejectedQueries}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-sm text-blue-600">Integrity</div>
            <div className="text-xl font-bold text-blue-900">{summary.blockchainIntegrity}</div>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
          <div className="space-y-3">
            {logs.map((log) => (
              <div key={log.id} className="bg-white rounded-lg p-4 border border-gray-100">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Transaction ID</div>
                    <div className="text-sm font-mono text-gray-900">{log.id}</div>
                    <div className="text-xs text-gray-500 mt-2">{log.timestamp}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Query</div>
                    <div className="text-sm font-mono text-gray-700 truncate">{log.query}</div>
                    <div className="text-xs text-gray-500 mt-2">User: {log.user}</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                        log.status === 'approved' ? 'bg-green-100 text-green-700' :
                        log.status === 'auto-approved' ? 'bg-blue-100 text-blue-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {log.status}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      <div>Approver: {log.approver}</div>
                      <div>Gas: {log.gasUsed}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- Status ---
  if (data.type === 'status') {
    const { title, services, version, lastUpdate, totalUptime } = data.content;

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mb-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          <div className="text-right">
            <div className="text-sm text-gray-600">Version {version}</div>
            <div className="text-xs text-gray-500">Updated: {lastUpdate}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {services.map((service) => (
            <div key={service.name} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-900">{service.name}</span>
                <div className="flex items-center space-x-2">
                  <div className={`w-2 h-2 rounded-full ${service.status === 'operational' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                  <span className="text-xs text-green-600 font-medium">{service.status}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 text-xs text-gray-600">
                <div>Uptime: {service.uptime}</div>
                <div>Response: {service.response}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-green-50 rounded-xl p-4 border border-green-100 text-center">
          <div className="text-lg font-bold text-green-900">System Uptime: {totalUptime}</div>
          <div className="text-sm text-green-600">All services operational</div>
        </div>
      </div>
    );
  }

  // --- Help ---
  if (data.type === 'help') {
    const { title, commands, examples, safety } = data.content;

    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6 mb-6">
        <h3 className="text-xl font-bold text-gray-900 mb-6">{title}</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Available Commands</h4>
            <div className="space-y-2">
              {commands.map((cmd) => (
                <div key={cmd.cmd} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <code className="text-sm font-mono text-blue-600">{cmd.cmd}</code>
                  <div className="text-xs text-gray-600 mt-1">{cmd.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Query Examples</h4>
            <div className="space-y-2 mb-6">
              {examples.map((ex, idx) => (
                <div key={idx} className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                  <code className="text-sm font-mono text-blue-800">{ex}</code>
                </div>
              ))}
            </div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4">Safety Features</h4>
            <div className="space-y-2">
              {safety.map((feature, idx) => (
                <div key={idx} className="flex items-start space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                  <span className="text-sm text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }
  return null;
}
