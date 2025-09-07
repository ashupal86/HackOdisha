'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Shield, 
  Lock, 
  Zap, 
  Users, 
  CheckCircle, 
  Database,
  BarChart3,
  Globe,
  MessageCircle,
  Play,
  Code,
  TrendingUp,
  Eye
} from "lucide-react";
import { CSSProperties } from 'react';

// Type definition for SVG props
interface SVGComponentProps {
  className?: string;
  style?: CSSProperties;
}
interface Particle {
  id: number;
  x: number;
  y: number;
  delay: number;
  duration: number;
}


// Animated Database SVG Component  
const DatabaseSVG: React.FC<SVGComponentProps>  = ({ className, style }) => (
  <svg
    viewBox="0 0 200 200"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="db-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.1)" />
        <stop offset="100%" stopColor="rgba(147, 51, 234, 0.1)" />
      </linearGradient>
    </defs>
    <ellipse cx="100" cy="50" rx="80" ry="20" fill="url(#db-gradient)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" />
    <rect x="20" y="40" width="160" height="40" fill="url(#db-gradient)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" />
    <ellipse cx="100" cy="80" rx="80" ry="20" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" />
    <rect x="20" y="70" width="160" height="40" fill="url(#db-gradient)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" />
    <ellipse cx="100" cy="110" rx="80" ry="20" fill="none" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" />
    <rect x="20" y="100" width="160" height="40" fill="url(#db-gradient)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" />
    <ellipse cx="100" cy="140" rx="80" ry="20" fill="url(#db-gradient)" stroke="rgba(59, 130, 246, 0.3)" strokeWidth="2" />
    
    {/* Animated data lines */}
    <g className="animate-pulse">
      <line x1="40" y1="55" x2="75" y2="55" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="2" />
      <line x1="40" y1="85" x2="90" y2="85" stroke="rgba(147, 51, 234, 0.5)" strokeWidth="2" />
      <line x1="40" y1="115" x2="70" y2="115" stroke="rgba(59, 130, 246, 0.5)" strokeWidth="2" />
    </g>
  </svg>
);

// Animated Agent/AI SVG Component
const AgentSVG: React.FC<SVGComponentProps> = ({ className, style }) => (
  <svg
    viewBox="0 0 200 200"
    className={className}
    style={style}
    xmlns="http://www.w3.org/2000/svg"
  >
    <defs>
      <linearGradient id="agent-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="rgba(147, 51, 234, 0.1)" />
        <stop offset="100%" stopColor="rgba(79, 70, 229, 0.1)" />
      </linearGradient>
    </defs>
    
    {/* Robot head */}
    <rect x="60" y="50" width="80" height="80" rx="20" fill="url(#agent-gradient)" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="2" />
    
    {/* Eyes with animation */}
    <circle cx="80" cy="80" r="8" fill="rgba(147, 51, 234, 0.6)" className="animate-pulse" />
    <circle cx="120" cy="80" r="8" fill="rgba(147, 51, 234, 0.6)" className="animate-pulse" />
    
    {/* Mouth */}
    <rect x="85" y="100" width="30" height="4" rx="2" fill="rgba(147, 51, 234, 0.4)" />
    
    {/* Antenna */}
    <line x1="100" y1="50" x2="100" y2="30" stroke="rgba(147, 51, 234, 0.4)" strokeWidth="3" />
    <circle cx="100" cy="25" r="5" fill="rgba(147, 51, 234, 0.6)" className="animate-ping" />
    
    {/* Brain pattern */}
    <path d="M75 70 Q85 65 95 70 Q105 65 115 70" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="1.5" fill="none" />
    <path d="M75 75 Q85 70 95 75 Q105 70 115 75" stroke="rgba(147, 51, 234, 0.3)" strokeWidth="1.5" fill="none" />
    
    {/* Floating data points */}
    <circle cx="45" cy="60" r="3" fill="rgba(59, 130, 246, 0.5)" className="animate-bounce" />
    <circle cx="155" cy="70" r="2" fill="rgba(79, 70, 229, 0.5)" className="animate-bounce" style={{animationDelay: '0.5s'}} />
    <circle cx="50" cy="120" r="2.5" fill="rgba(147, 51, 234, 0.5)" className="animate-bounce" style={{animationDelay: '1s'}} />
    <circle cx="150" cy="110" r="3" fill="rgba(59, 130, 246, 0.5)" className="animate-bounce" style={{animationDelay: '1.5s'}} />
  </svg>
);

// Floating particles component
const FloatingParticles = () => {
const [particles, setParticles] = useState<Particle[]>([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      delay: Math.random() * 4,
      duration: 3 + Math.random() * 2,
    }));
    setParticles(newParticles);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((particle) => (
        <div
          key={particle.id}
          className="absolute w-1 h-1 bg-blue-400/20 rounded-full animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            animationDelay: `${particle.delay}s`,
            animationDuration: `${particle.duration}s`,
          }}
        />
      ))}
    </div>
  );
};

export default function LandingPage() {
  const router = useRouter();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(true);
  }, []);

  const handleLogin = () => {
    router.push('/auth/login');
  };

  const handleSignup = () => {
    router.push('/auth/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-950 dark:via-blue-950 dark:to-indigo-950 relative overflow-hidden">
      {/* Background SVGs */}
      <DatabaseSVG 
        className="absolute top-20 left-10 w-32 h-32 opacity-30 animate-float" 
        style={{ animationDelay: '0s' }}
      />
      <AgentSVG 
        className="absolute top-40 right-20 w-40 h-40 opacity-25 animate-float" 
        style={{ animationDelay: '1s' }}
      />
      <DatabaseSVG 
        className="absolute bottom-40 right-10 w-28 h-28 opacity-20 animate-float" 
        style={{ animationDelay: '2s' }}
      />
      <AgentSVG 
        className="absolute bottom-20 left-20 w-36 h-36 opacity-30 animate-float" 
        style={{ animationDelay: '3s' }}
      />
      
      {/* Additional decorative elements */}
      <div className="absolute top-1/4 left-1/2 w-96 h-96 bg-gradient-to-r from-blue-400/5 to-purple-400/5 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-gradient-to-r from-purple-400/5 to-indigo-400/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
      
      <FloatingParticles />

      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 border-b border-gray-200/50 dark:border-gray-800/50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className={`flex items-center space-x-2 transition-all duration-700 ${isLoaded ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                AI-SafeQuery
              </span>
            </div>
            <div className={`hidden md:flex items-center space-x-8 transition-all duration-700 ${isLoaded ? 'translate-y-0 opacity-100' : '-translate-y-5 opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              <a href="#features" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors hover:scale-105 transform">Features</a>
              <a href="#about" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors hover:scale-105 transform">Technology</a>
              <a href="#demo" className="text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors hover:scale-105 transform">Demo</a>
            </div>
            <div className={`flex items-center space-x-3 transition-all duration-700 ${isLoaded ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <Button onClick={handleLogin} variant="ghost" size="sm" className="hover:scale-105 transform transition-all">
                Login
              </Button>
              <Button onClick={handleSignup} size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all">
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
            <Badge variant="outline" className={`mb-6 px-4 py-2 text-sm font-medium bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 transition-all duration-700 hover:scale-105 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <Zap className="w-4 h-4 mr-2 animate-pulse" />
              Building MVP - Chat Interface + Dashboard Creator
            </Badge>
            <h1 className={`text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-8 leading-tight transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`} style={{ animationDelay: '0.2s' }}>
              Chat with Your Database &{' '}
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent animate-gradient">
                Build Dashboards
              </span>
            </h1>
            <p className={`text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`} style={{ animationDelay: '0.4s' }}>
              <span className="font-semibold text-gray-900 dark:text-white">Currently building our MVP:</span> 
              A chat interface that lets you interact with your database, perform analysis, 
              and create interactive analytical dashboards - all through natural conversation.
            </p>
            <div className={`flex flex-col sm:flex-row gap-4 justify-center items-center mb-12 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`} style={{ animationDelay: '0.6s' }}>
              <Button size="lg" className="px-8 py-4 text-lg bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 transform group">
                <Play className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                Try MVP Demo
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg border-2 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all hover:scale-105 transform group">
                <Code className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                View Source Code
              </Button>
            </div>
            <div className={`flex flex-wrap justify-center items-center gap-8 text-gray-500 dark:text-gray-400 transition-all duration-1000 ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`} style={{ animationDelay: '0.8s' }}>
              <div className="flex items-center space-x-2 hover:scale-105 transform transition-all">
                <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" />
                <span>JWT Authentication</span>
              </div>
              <div className="flex items-center space-x-2 hover:scale-105 transform transition-all">
                <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" style={{ animationDelay: '0.5s' }} />
                <span>Real-time Logging</span>
              </div>
              <div className="flex items-center space-x-2 hover:scale-105 transform transition-all">
                <CheckCircle className="w-5 h-5 text-green-500 animate-pulse" style={{ animationDelay: '1s' }} />
                <span>Admin Dashboard</span>
              </div>
            </div>
          </div>
          
          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            <Card className={`text-center border-0 shadow-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500 group ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`} style={{ animationDelay: '1s' }}>
              <CardContent className="pt-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 group-hover:from-blue-500/10 group-hover:to-purple-500/10 transition-all duration-500"></div>
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400 mb-2 relative z-10">48hrs</div>
                <div className="text-gray-600 dark:text-gray-300 relative z-10">Development Time</div>
              </CardContent>
            </Card>
            <Card className={`text-center border-0 shadow-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500 group ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`} style={{ animationDelay: '1.2s' }}>
              <CardContent className="pt-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-indigo-500/5 group-hover:from-purple-500/10 group-hover:to-indigo-500/10 transition-all duration-500"></div>
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400 mb-2 relative z-10">3 APIs</div>
                <div className="text-gray-600 dark:text-gray-300 relative z-10">Auth, Admin & Logging</div>
              </CardContent>
            </Card>
            <Card className={`text-center border-0 shadow-lg bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500 group ${isLoaded ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'}`} style={{ animationDelay: '1.4s' }}>
              <CardContent className="pt-8 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-blue-500/5 group-hover:from-indigo-500/10 group-hover:to-blue-500/10 transition-all duration-500"></div>
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400 mb-2 relative z-10">Redis</div>
                <div className="text-gray-600 dark:text-gray-300 relative z-10">Fast Logging Backend</div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="px-6 py-24 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm relative">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium hover:scale-105 transform transition-all">
              🚀 Key Features
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              What We&apos;re Building
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              The future of database interaction - chat-driven analysis and dashboard creation
            </p>
          </div>
          
          <div className="grid lg:grid-cols-2 gap-12 mb-20">
            {/* Main Feature Cards */}
            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden transform hover:scale-[1.02] bg-gradient-to-br from-white to-blue-50/50 dark:from-gray-900 dark:to-blue-950/50">
              <CardHeader className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400/5 to-indigo-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transform transition-all duration-300 relative z-10">
                  <MessageCircle className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white relative z-10">Chat Interface</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 relative z-10">
                  Natural language database interaction - ask questions, get insights, analyze data through conversation
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3 group/item">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 group-hover/item:scale-110 transform transition-all" />
                    <span className="text-gray-700 dark:text-gray-300">Ask questions in plain English about your data</span>
                  </li>
                  <li className="flex items-center space-x-3 group/item">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 group-hover/item:scale-110 transform transition-all" />
                    <span className="text-gray-700 dark:text-gray-300">AI converts conversations to database queries</span>
                  </li>
                  <li className="flex items-center space-x-3 group/item">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 group-hover/item:scale-110 transform transition-all" />
                    <span className="text-gray-700 dark:text-gray-300">Get instant insights and perform analysis</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden transform hover:scale-[1.02] bg-gradient-to-br from-white to-purple-50/50 dark:from-gray-900 dark:to-purple-950/50">
              <CardHeader className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-400/5 to-pink-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transform transition-all duration-300 relative z-10">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white relative z-10">Interactive Dashboard Creator</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 relative z-10">
                  Create immersive analytical dashboards through conversation - no coding required
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3 group/item">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 group-hover/item:scale-110 transform transition-all" />
                    <span className="text-gray-700 dark:text-gray-300">Generate charts and visualizations from chat</span>
                  </li>
                  <li className="flex items-center space-x-3 group/item">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 group-hover/item:scale-110 transform transition-all" />
                    <span className="text-gray-700 dark:text-gray-300">Build interactive analytics dashboards</span>
                  </li>
                  <li className="flex items-center space-x-3 group/item">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 group-hover/item:scale-110 transform transition-all" />
                    <span className="text-gray-700 dark:text-gray-300">Real-time data updates and insights</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden transform hover:scale-[1.02] bg-gradient-to-br from-white to-emerald-50/50 dark:from-gray-900 dark:to-emerald-950/50">
              <CardHeader className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/5 to-teal-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transform transition-all duration-300 relative z-10">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white relative z-10">Secure & Governed</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 relative z-10">
                  Role-based access control with audit trails and secure authentication
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3 group/item">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 group-hover/item:scale-110 transform transition-all" />
                    <span className="text-gray-700 dark:text-gray-300">Role-based permissions and access control</span>
                  </li>
                  <li className="flex items-center space-x-3 group/item">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 group-hover/item:scale-110 transform transition-all" />
                    <span className="text-gray-700 dark:text-gray-300">Complete audit trails for all operations</span>
                  </li>
                  <li className="flex items-center space-x-3 group/item">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 group-hover/item:scale-110 transform transition-all" />
                    <span className="text-gray-700 dark:text-gray-300">Admin approval workflows for sensitive actions</span>
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="group hover:shadow-2xl transition-all duration-500 border-0 shadow-lg overflow-hidden transform hover:scale-[1.02] bg-gradient-to-br from-white to-amber-50/50 dark:from-gray-900 dark:to-amber-950/50">
              <CardHeader className="bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950 dark:to-orange-950 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-amber-400/5 to-orange-400/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-600 to-orange-600 rounded-lg flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transform transition-all duration-300 relative z-10">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <CardTitle className="text-2xl text-gray-900 dark:text-white relative z-10">Data Analysis Tool</CardTitle>
                <CardDescription className="text-gray-600 dark:text-gray-300 relative z-10">
                  Powerful analytics engine that turns conversations into actionable insights
                </CardDescription>
              </CardHeader>
              <CardContent className="relative">
                <ul className="space-y-3">
                  <li className="flex items-center space-x-3 group/item">
                    <BarChart3 className="w-5 h-5 text-blue-500 flex-shrink-0 group-hover/item:scale-110 transform transition-all" />
                    <span className="text-gray-700 dark:text-gray-300">Perform complex data analysis through chat</span>
                  </li>
                  <li className="flex items-center space-x-3 group/item">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 group-hover/item:scale-110 transform transition-all" />
                    <span className="text-gray-700 dark:text-gray-300">Get statistical insights and trends</span>
                  </li>
                  <li className="flex items-center space-x-3 group/item">
                    <Users className="w-5 h-5 text-purple-500 flex-shrink-0 group-hover/item:scale-110 transform transition-all" />
                    <span className="text-gray-700 dark:text-gray-300">Generate reports and summaries instantly</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Showcase Section */}
      <section id="demo" className="px-6 py-24 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-blue-950 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-10 left-10 w-20 h-20 bg-blue-400/10 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-10 right-10 w-32 h-32 bg-purple-400/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-20">
            <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium hover:scale-105 transform transition-all">
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
            <div className="space-y-8">
              <div className="text-center group hover:scale-105 transform transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                  <MessageCircle className="w-8 h-8 text-white group-hover:animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">💬 Chat with Database</h3>
                <p className="text-gray-600 dark:text-gray-300">&quot;Show me user growth trends&quot; → Instant charts and insights</p>
              </div>
              
              <div className="text-center group hover:scale-105 transform transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                  <BarChart3 className="w-8 h-8 text-white group-hover:animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">📊 Create Dashboards</h3>
                <p className="text-gray-600 dark:text-gray-300">&quot;Build a sales dashboard&quot; → Interactive analytics in seconds</p>
              </div>
              
              <div className="text-center group hover:scale-105 transform transition-all duration-300">
                <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all">
                  <Lock className="w-8 h-8 text-white group-hover:animate-pulse" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">🔒 Secure & Governed</h3>
                <p className="text-gray-600 dark:text-gray-300">Role-based access + audit trails + admin approval workflows</p>
              </div>

              <div className="mt-10 text-center space-y-4">
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all group">
                    <Play className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                    Try Chat Interface
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 hover:scale-105 transform transition-all group">
                    <BarChart3 className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform" />
                    Create Dashboard
                  </Button>
                </div>
              </div>
            </div>

            <div className="relative">
              {/* Floating code preview */}
              <Card className="border-0 shadow-2xl bg-gray-900 dark:bg-gray-800 overflow-hidden transform hover:scale-[1.02] transition-all duration-500 relative">
                {/* Glow effect */}
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                
                <div className="relative">
                  <CardContent className="p-0">
                    <div className="bg-gray-800 dark:bg-gray-700 px-6 py-3 flex items-center space-x-3">
                      <div className="flex space-x-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                        <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" style={{ animationDelay: '0.5s' }}></div>
                        <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
                      </div>
                      <div className="text-gray-300 text-sm font-mono flex items-center">
                        <Eye className="w-4 h-4 mr-2" />
                        Chat Interface Demo
                      </div>
                    </div>
                    <div className="p-6 bg-gray-900 dark:bg-gray-800 text-green-400 font-mono text-sm relative overflow-hidden">
                      {/* Background grid pattern */}
                      <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
                      
                      <div className="space-y-3 relative z-10">
                        <div className="flex items-start space-x-2">
                          <span className="text-blue-400 flex-shrink-0">You:</span> 
                          <span className="typing-animation">Show me sales data for last month</span>
                        </div>
                        <div className="text-gray-500 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-blue-400 rounded-full animate-ping"></div>
                          <span>🤖 AI: Analyzing your request...</span>
                        </div>
                        <div className="text-green-400 flex items-center space-x-2">
                          <BarChart3 className="w-4 h-4 animate-pulse" />
                          <span>📊 Generated interactive chart with $45K sales</span>
                        </div>
                        <div className="mt-3 flex items-start space-x-2">
                          <span className="text-blue-400 flex-shrink-0">You:</span> 
                          <span>Create a dashboard for this</span>
                        </div>
                        <div className="text-gray-500 flex items-center space-x-2">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping"></div>
                          <span>🎨 Building dashboard layout...</span>
                        </div>
                        <div className="text-green-400 flex items-center space-x-2">
                          <CheckCircle className="w-4 h-4 animate-pulse" />
                          <span>✅ Dashboard created with 3 visualizations</span>
                        </div>
                        <div className="text-purple-400 flex items-center space-x-2">
                          <Lock className="w-4 h-4 animate-pulse" />
                          <span>🔒 All actions logged & secured</span>
                        </div>
                        <div className="animate-pulse flex items-center space-x-1">
                          <div className="w-2 h-4 bg-green-400 animate-pulse"></div>
                          <span>_</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </div>
              </Card>

              {/* Floating elements around the demo */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/20 rounded-full animate-bounce"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-500/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-6 py-24 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/90 via-purple-600/90 to-indigo-600/90"></div>
        
        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-xl animate-float"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full blur-3xl animate-pulse"></div>
        
        <div className="relative max-w-5xl mx-auto text-center z-10">
          <Badge variant="outline" className="mb-6 px-4 py-2 text-sm font-medium bg-white/10 border-white/20 text-white hover:scale-105 transform transition-all">
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
            <Button onClick={handleSignup} size="lg" className="px-10 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all group">
              <Play className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              Try Live Demo
            </Button>
            <Button onClick={handleSignup} size="lg" className="px-10 py-4 text-lg bg-white text-blue-600 hover:bg-gray-100 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all group">
              <Code className="w-5 h-5 mr-2 group-hover:animate-pulse" />
              View GitHub Repository
            </Button>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transform hover:scale-105 transition-all duration-300 group">
              <div className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transform transition-all">💬 Chat</div>
              <div className="text-blue-100">Natural conversation with data</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transform hover:scale-105 transition-all duration-300 group">
              <div className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transform transition-all">📊 Dashboards</div>
              <div className="text-blue-100">Create visualizations instantly</div>
            </div>
            <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 border border-white/20 hover:bg-white/15 transform hover:scale-105 transition-all duration-300 group">
              <div className="text-3xl font-bold text-white mb-2 group-hover:scale-110 transform transition-all">🔒 Secure</div>
              <div className="text-blue-100">Governed and compliant</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-6 py-16 bg-gray-900 dark:bg-black relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div className="md:col-span-2">
              <div className="flex items-center space-x-2 mb-6 group">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transform transition-all">
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
                <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transform hover:scale-105 transition-all group">
                  <Globe className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform" />
                  GitHub
                </Button>
                <Button variant="outline" size="sm" className="border-gray-700 text-gray-400 hover:text-white hover:border-gray-500 transform hover:scale-105 transition-all group">
                  <Database className="w-4 h-4 mr-2 group-hover:animate-pulse" />
                  Documentation
                </Button>
              </div>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Key Features</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="flex items-center space-x-2 hover:text-white transition-colors group">
                  <CheckCircle className="w-4 h-4 text-green-500 group-hover:scale-110 transform transition-all" />
                  <span>Chat Interface</span>
                </li>
                <li className="flex items-center space-x-2 hover:text-white transition-colors group">
                  <CheckCircle className="w-4 h-4 text-green-500 group-hover:scale-110 transform transition-all" />
                  <span>Dashboard Creator</span>
                </li>
                <li className="flex items-center space-x-2 hover:text-white transition-colors group">
                  <CheckCircle className="w-4 h-4 text-green-500 group-hover:scale-110 transform transition-all" />
                  <span>Data Analysis</span>
                </li>
                <li className="flex items-center space-x-2 hover:text-white transition-colors group">
                  <CheckCircle className="w-4 h-4 text-green-500 group-hover:scale-110 transform transition-all" />
                  <span>Secure & Governed</span>
                </li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-white font-semibold mb-6 text-lg">Technology Stack</h4>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-white transition-colors">FastAPI + Python 3.12</li>
                <li className="hover:text-white transition-colors">Next.js 15 + React 19</li>
                <li className="hover:text-white transition-colors">PostgreSQL + SQLAlchemy</li>
                <li className="hover:text-white transition-colors">Redis + WebSocket</li>
                <li className="hover:text-white transition-colors">Docker Containers</li>
                <li className="hover:text-white transition-colors">JWT + HMAC Security</li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex items-center space-x-6 text-sm text-gray-400">
                <span className="hover:text-white transition-colors cursor-default">Built for HackOdisha 2025</span>
                <span>•</span>
                <span className="hover:text-white transition-colors cursor-default">Made with ❤️ by developers</span>
                <span>•</span>
                <span className="hover:text-white transition-colors cursor-default">Open Source</span>
              </div>
              <div className="text-gray-400 text-sm hover:text-white transition-colors">
                © 2025 AI-SafeQuery Team. Hackathon Project.
              </div>
            </div>
          </div>
        </div>
      </footer>

      <style jsx>{`
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .typing-animation {
          overflow: hidden;
          border-right: 2px solid #3b82f6;
          white-space: nowrap;
          animation: typing 3s steps(40, end), blink-caret 0.75s step-end infinite;
        }

        .bg-grid-pattern {
          background-image: 
            linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px);
          background-size: 20px 20px;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes gradient {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes typing {
          from {
            width: 0;
          }
          to {
            width: 100%;
          }
        }

        @keyframes blink-caret {
          from, to {
            border-color: transparent;
          }
          50% {
            border-color: #3b82f6;
          }
        }
      `}</style>
    </div>
  );
}