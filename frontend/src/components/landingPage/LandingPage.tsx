import React from 'react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Navigation */}
      <nav className="px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            AI-SafeQuery
          </div>
          <div className="flex items-center space-x-4">
            <button className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors">
              Login
            </button>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
              Sign Up
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="px-6 py-20">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
            Secure Database Queries with{' '}
            <span className="text-blue-600 dark:text-blue-400">AI Governance</span>
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            AI-SafeQuery provides a governance and compliance layer between users and your database. 
            Execute natural language and SQL queries safely with role-based permissions, AI-powered safety checks, 
            and immutable blockchain logging.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors">
              Start Querying Safely
            </button>
            <button className="px-8 py-3 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg text-lg font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 transition-colors">
              View Demo
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-6 py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            Why Choose AI-SafeQuery?
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Role-Based Security
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                RBAC with reader, writer, admin, and super_admin roles. Granular permissions for every query.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                AI Safety Layer
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI-powered guardrails that block dangerous queries like DROP, ALTER, TRUNCATE operations.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Blockchain Logging
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Immutable audit trail on blockchain. Every query, result, and approval permanently recorded.
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-orange-600 dark:text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                Natural Language
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Chat interface for natural language queries. AI converts your questions to safe SQL automatically.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="px-6 py-16 bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center text-gray-900 dark:text-white mb-12">
            How It Works
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">1</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Submit Query
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Users submit natural language or SQL queries through the chat interface. 
                JWT authentication ensures only authorized users can access.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">2</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                AI Safety Check
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                AI agent validates query safety and user permissions. Dangerous operations 
                require admin approval through secure workflow.
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">3</div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Execute & Log
              </h3>
              <p className="text-gray-600 dark:text-gray-300">
                Safe queries execute immediately. All operations logged immutably on blockchain 
                with complete audit trail for compliance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Admin Dashboard Preview */}
      <section className="px-6 py-16 bg-white dark:bg-gray-800">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Powerful Admin Dashboard
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto">
            Comprehensive admin panel to approve users, assign roles, review pending queries, 
            and monitor all database activities with blockchain verification.
          </p>
          <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">User Management</h4>
              <p className="text-gray-600 dark:text-gray-300">Approve signups and assign roles (reader, writer, admin, super_admin)</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Query Approval</h4>
              <p className="text-gray-600 dark:text-gray-300">Review and approve high-risk queries with password confirmation</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Audit Logs</h4>
              <p className="text-gray-600 dark:text-gray-300">View complete blockchain logs with transaction IDs and approvers</p>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-2">Security Monitoring</h4>
              <p className="text-gray-600 dark:text-gray-300">Monitor failed queries and potential security threats in real-time</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Secure Your Database Queries?
          </h2>
          <p className="text-lg text-blue-100 mb-8">
            Join organizations using AI-SafeQuery for governance, compliance, and secure database access.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-3 bg-white text-blue-600 rounded-lg text-lg font-semibold hover:bg-gray-100 transition-colors">
              Start Free Trial
            </button>
            <button className="px-8 py-3 border-2 border-white text-white rounded-lg text-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              Request Demo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-8 bg-gray-900 dark:bg-black">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="text-white mb-4">
                <span className="text-xl font-bold">AI-SafeQuery</span>
              </div>
              <p className="text-gray-400">
                Secure database governance with AI-powered safety checks and blockchain logging.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Features</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Role-Based Access Control</li>
                <li>AI Safety Layer</li>
                <li>Blockchain Logging</li>
                <li>Admin Dashboard</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Security</h4>
              <ul className="space-y-2 text-gray-400">
                <li>JWT Authentication</li>
                <li>Query Validation</li>
                <li>Immutable Audit Trail</li>
                <li>Compliance Ready</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li>Documentation</li>
                <li>API Reference</li>
                <li>Community</li>
                <li>Enterprise Support</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 text-center">
            <p className="text-gray-400">
              © 2025 AI-SafeQuery. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}