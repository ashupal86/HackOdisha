interface UserProfileProps {
  userInfo: {
    name: string;
    role: string;
    status: string;
    permissions: string[];
  };
}

export function UserProfile({ userInfo }: UserProfileProps) {
  return (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">User Profile</h3>
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-3 border border-blue-100">
        <div className="flex items-center space-x-3 mb-2">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <span className="text-white text-sm font-medium">{userInfo.name.charAt(0)}</span>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{userInfo.name}</p>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                userInfo.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                userInfo.role === 'writer' ? 'bg-green-100 text-green-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {userInfo.role}
              </span>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                userInfo.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {userInfo.status}
              </span>
            </div>
          </div>
        </div>
        <div className="text-xs text-gray-600">
          <strong>Permissions:</strong> {userInfo.permissions.join(', ')}
        </div>
      </div>
    </div>
  );
}