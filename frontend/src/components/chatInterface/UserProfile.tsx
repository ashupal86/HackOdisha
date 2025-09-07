import { type UserData } from '@/utils/auth';

interface UserProfileProps {
  currentUser: UserData;
  onLogout: () => void;
}

export function UserProfile({ currentUser, onLogout }: UserProfileProps) {
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Recently';
    }
  };
  // Mock data - in real app, this would come from your API
  const recentQueries = [
    { id: 1, query: "SELECT * FROM users WHERE status = 'active'", status: "approved", timestamp: "2 hours ago" },
    { id: 2, query: "UPDATE products SET price = 99.99 WHERE id = 123", status: "pending", timestamp: "5 hours ago" },
    { id: 3, query: "SELECT COUNT(*) FROM orders WHERE date > '2024-01-01'", status: "approved", timestamp: "1 day ago" },
  ];
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-green-600';
      case 'pending_approval':
        return 'text-yellow-600';
      case 'blocked':
        return 'text-red-600';
      case 'inactive':
        return 'text-gray-600';
      default:
        return 'text-blue-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Active';
      case 'pending_approval':
        return 'Pending Approval';
      case 'blocked':
        return 'Blocked';
      case 'inactive':
        return 'Inactive';
      default:
        return status;
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* User Profile Section */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center space-x-4 mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-xl">
            {currentUser.username.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{currentUser.username}</h2>
            <p className="text-sm text-gray-600">Database User</p>
            <p className="text-xs text-gray-500">{currentUser.email}</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Joined:</span>
            <p className="font-medium text-gray-900">{formatDate(currentUser.created_at)}</p>
          </div>
          <div>
            <span className="text-gray-500">Status:</span>
            <p className={`font-medium ${getStatusColor(currentUser.account_status)}`}>
              {getStatusLabel(currentUser.account_status)}
            </p>
          </div>
        </div>
        
        {/* Account Status Indicator */}
        {currentUser.account_status === 'pending_approval' && (
          <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-xs text-yellow-800">
              ⏳ Account pending admin approval
            </p>
          </div>
        )}
        
        {currentUser.is_blocked && (
          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-xs text-red-800">
              🚫 Account access restricted
            </p>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        {/* Safety Status */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Safety Status</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">AI Guardrails</span>
              <span className="text-green-600 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Blockchain Logging</span>
              <span className="text-green-600 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">RBAC Enforcement</span>
              <span className="text-green-600 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Active
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Admin Oversight</span>
              <span className="text-green-600 font-medium flex items-center">
                <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Active
              </span>
            </div>
          </div>
        </div>

        {/* User Permissions */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">Permissions</h3>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Database Access</span>
              <span className={`font-medium ${currentUser.is_accessible ? 'text-green-600' : 'text-red-600'}`}>
                {currentUser.is_accessible ? 'Granted' : 'Restricted'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Account Status</span>
              <span className={`font-medium ${currentUser.is_active ? 'text-green-600' : 'text-red-600'}`}>
                {currentUser.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600">Admin Approved</span>
              <span className={`font-medium ${currentUser.is_approved ? 'text-green-600' : 'text-yellow-600'}`}>
                {currentUser.is_approved ? 'Yes' : 'Pending'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6">

          {/* Recent Queries */}
          <div>
            <h3 className="text-sm font-semibold text-gray-900 mb-3">Recent Queries</h3>
            <div className="space-y-3">
              {recentQueries.map((query) => (
                <div key={query.id} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                  <div className="text-xs font-mono text-gray-700 mb-2 line-clamp-2">
                    {query.query}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      query.status === 'approved' ? 'bg-green-100 text-green-800' :
                      query.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {query.status}
                    </span>
                    <span className="text-xs text-gray-500">{query.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      {/* Logout Button */}
      <div className="p-6 border-t border-gray-100">
        <button 
          onClick={onLogout}
          className="w-full bg-red-50 hover:bg-red-100 text-red-700 font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}