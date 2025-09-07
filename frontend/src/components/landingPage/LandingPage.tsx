'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Brain, 
  Lock, 
  Zap, 
  Users, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Database,
  AlertTriangle,
  BarChart3,
  Globe
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleSignup = () => {
    router.push('/auth/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/70 dark:bg-gray-900/70 border-b border-gray-200/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-SafeQuery
              </span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Features</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Technology</a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors">Demo</a>
            </div>
            <div className="flex items-center space-x-3">
              <Button onClick={handleLogin} variant="ghost" size="sm">
                Login
              </Button>
              <Button onClick={handleSignup} size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Start Free Trial
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 py-24 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-indigo-600/10 dark:from-blue-600/20 dark:via-purple-600/10 dark:to-indigo-600/20"></div>
        <div className="relative max-w-7xl mx-auto">
          <div className="text-center mb-16">
              <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300">
              <Zap className="w-4 h-4 mr-2" />
              Building MVP - Chat Interface + Dashboard Creator
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight">
              Chat with Your Database &{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent">
                Build Dashboards
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
              <span className="font-semibold text-gray-900 dark:text-white">Currently building our MVP:</span> 
              A chat interface that lets you interact with your database, perform analysis, 
              and create interactive analytical dashboards - all through natural conversation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                <Zap className="w-5 h-5 mr-2" />
                Try MVP Demo
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2 hover:bg-gray-50 dark:hover:bg-gray-900">
                <Database className="w-5 h-5 mr-2" />
                View Source Code
              </Button>
            </div>
            <div className="flex flex-wrap justify-center items-center gap-8 text-gray-500 dark:text-gray-400">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>JWT Authentication</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Real-time Logging</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <span>Admin Dashboard</span>
              </div>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className="text-center border-0 shadow-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg">
              <CardContent className="pt-8">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2">48hrs</div>
                <div className="text-gray-600 dark:text-gray-300">Development Time</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg">
              <CardContent className="pt-8">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2">3 APIs</div>
                <div className="text-gray-600 dark:text-gray-300">Auth, Admin & Logging</div>
              </CardContent>
            </Card>
            <Card className="text-center border-0 shadow-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg">
              <CardContent className="pt-8">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">Redis</div>
                <div className="text-gray-600 dark:text-gray-300">Fast Logging Backend</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium">
              🚀 Key Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              What We're Building
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The future of database interaction - chat-driven analysis and dashboard creation
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Main Feature Cards */}
            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Chat Interface</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Natural language database interaction - ask questions, get insights, analyze data through conversation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Ask questions in plain English about your data</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">AI converts conversations to database queries</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Get instant insights and perform analysis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                  <Brain className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Interactive Dashboard Creator</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Create immersive analytical dashboards through conversation - no coding required
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Generate charts and visualizations from chat</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Build interactive analytics dashboards</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Real-time data updates and insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center mb-4">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Secure & Governed</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Role-based access control with audit trails and secure authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Role-based permissions and access control</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Complete audit trails for all operations</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Admin approval workflows for sensitive actions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-300 border-0 shadow-lg overflow-hidden">
              <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950">
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white">Data Analysis Tool</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300">
                  Powerful analytics engine that turns conversations into actionable insights
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3">
                    <BarChart3 className="w-5 h-5 text-blue-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Perform complex data analysis through chat</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Get statistical insights and trends</span>
                  </li>
                  <li className="flex items-center space-x-3">
                    <Users className="w-5 h-5 text-purple-500 flex-shrink-0" />
                    <span className="text-gray-700 dark:text-gray-300">Generate reports and summaries instantly</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>



      {/* Demo Showcase Section */}
      <section id="demo" className="px-6 py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium">
              🚀 Live Demo
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Try the Demo
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Experience the future of database interaction - chat, analyze, visualize
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="space-y-8">
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">💬 Chat with Database</h3>
                  <p className="text-gray-600 dark:text-gray-300">"Show me user growth trends" → Instant charts and insights</p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📊 Create Dashboards</h3>
                  <p className="text-gray-600 dark:text-gray-300">"Build a sales dashboard" → Interactive analytics in seconds</p>
                </div>
                
                <div className="text-center">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🔒 Secure & Governed</h3>
                  <p className="text-gray-600 dark:text-gray-300">Role-based access + audit trails + admin approval workflows</p>
                </div>
              </div>

              <div className="mt-10 text-center">
                <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 mr-4">
                  <Zap className="w-5 h-5 mr-2" />
                  Try Chat Interface
                </Button>
                <Button size="lg" variant="outline">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Create Dashboard
                </Button>
              </div>
            </div>

            <div>
              <Card className="border-0 shadow-2xl bg-gray-900 dark:bg-gray-800 overflow-hidden">
                <CardContent className="p-0">
                  <div className="bg-gray-800 dark:bg-gray-700 px-6 py-3 flex items-center space-x-3">
                    <div className="flex space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                      <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    </div>
                    <div className="text-gray-300 text-sm font-mono">Chat Interface Demo</div>
                  </div>
                  <div className="p-6 bg-gray-900 dark:bg-gray-800 text-green-400 font-mono text-sm">
                    <div className="space-y-3">
                      <div><span className="text-blue-400">You:</span> Show me sales data for last month</div>
                      <div className="text-gray-500">🤖 AI: Analyzing your request...</div>
                      <div className="text-green-400">📊 Generated interactive chart with $45K sales</div>
                      <div className="mt-3"><span className="text-blue-400">You:</span> Create a dashboard for this</div>
                      <div className="text-gray-500">🎨 Building dashboard layout...</div>
                      <div className="text-green-400">✅ Dashboard created with 3 visualizations</div>
                      <div className="text-purple-400">🔒 All actions logged & secured</div>
                      <div className="animate-pulse">_</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>


      {/* CTA Section */}
      <section className="px-6 py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
        <div className="relative max-w-5xl mx-auto text-center">
          <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium bg-white/10 border-white/20 text-white">
            🚀 Hackathon Project
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Ready to Chat with Your Database?
          </h2>
          <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
            Join the future of data interaction. No more complex queries - just conversations. 
            Built for HackOdisha 2025. Currently in MVP development.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Button onClick={handleSignup} size="lg" className="px-10 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100 shadow-xl">
              <Zap className="w-5 h-5 mr-2" />
              Try Live Demo
            </Button>
            <Button size="lg" variant="outline" className="px-10 py-4 text-lg border-2 border-white text-white hover:bg-white hover:text-blue-600">
              <ArrowRight className="w-5 h-5 mr-2" />
              View GitHub Repository
            </Button>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">💬 Chat</div>
              <div className="text-blue-100">Natural conversation with data</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">📊 Dashboards</div>
              <div className="text-blue-100">Create visualizations instantly</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20">
              <div className="text-3xl font-bold text-white mb-2">🔒 Secure</div>
              <div className="text-blue-100">Governed and compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-16 bg-gray-900 dark:bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  AI-SafeQuery
                </span>
              </div>
              <p className="text-gray-400 text-lg mb-6 max-w-md">
                The future of database interaction through natural conversation. Chat, analyze, visualize - all in one platform. 
                Currently building our MVP for HackOdisha 2025.
              </p>
              <div className="flex space-x-4">
                <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:text-white hover:border-gray-500">
                  <Globe className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
                <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:text-white hover:border-gray-500">
                  <Database className="w-4 h-4 mr-2" />
                  Documentation
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Key Features</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Chat Interface</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Dashboard Creator</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Data Analysis</span>
                </li>
                <li className="flex items-center space-x-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  <span>Secure & Governed</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Technology Stack</h4>
              <ul className="space-y-3 text-gray-400">
                <li>FastAPI + Python 3.12</li>
                <li>Next.js 15 + React 19</li>
                <li>PostgreSQL + SQLAlchemy</li>
                <li>Redis + WebSocket</li>
                <li>Docker Containers</li>
                <li>JWT + HMAC Security</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span>Built for HackOdisha 2025</span>
                <span>•</span>
                <span>Made with ❤️ by developers</span>
                <span>•</span>
                <span>Open Source</span>
              </div>
              <div className="text-gray-400 text-sm">
                © 2025 AI-SafeQuery Team. Hackathon Project.
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}