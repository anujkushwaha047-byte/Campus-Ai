import React, { useState, useEffect, useRef } from "react";
import {
  ShieldCheck,
  Mail,
  KeyRound,
  Phone,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  X,
  Menu,
  ChevronDown,
  GraduationCap,
  Bot,
  FileText,
  Users,
  BarChart3,
  FolderTree,
  AlertOctagon,
  Clock,
  FileSpreadsheet,
  Settings,
  LogOut,
  PlusCircle,
  CheckCircle,
  HelpCircle,
  User,
  ChevronRight,
  Target,
  Zap,
  Globe,
  Building2,
  Heart,
  Brain,
  Layers,
  Star,
  Github,
  Linkedin,
  Twitter,
  ExternalLink,
  Moon,
  Sun,
  Loader2,
  Eye,
  EyeOff,
  Shield,
  Award,
  Rocket,
  TrendingUp,
  Users as UsersIcon,
  MessageSquare,
  Check,
  ArrowUpRight,
} from "lucide-react";
import { StudentProfile } from "../types";
import { StudentAuthModal } from "./StudentAuthModal";

interface LandingPageProps {
  onLoginSuccess: (student: StudentProfile) => void;
  isAuthenticated: boolean;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onLoginSuccess,
  isAuthenticated,
}) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("hero");
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = sectionRefs.current[sectionId];
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
      setActiveSection(sectionId);
      setMobileMenuOpen(false);
    }
  };

  // Track scroll position for active section highlighting
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY + 100;
      setScrolled(scrollY > 20);

      // Find which section is currently in view
      const sections = ["hero", "what-is", "how-it-works", "why-campus-ai", "about", "contact", "credits"];
      for (const section of sections) {
        const element = sectionRefs.current[section];
        if (element) {
          const rect = element.getBoundingClientRect();
          if (rect.top <= 100 && rect.bottom >= 100) {
            setActiveSection(section);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Navigation items
  const navItems = [
    { id: "hero", label: "Home" },
    { id: "what-is", label: "Features" },
    { id: "about", label: "About Us" },
    { id: "contact", label: "Contact" },
    { id: "credits", label: "Credits" },
  ];

  // Feature cards data
  const features = [
    {
      icon: ShieldCheck,
      title: "Smart Complaint Management",
      description: "Students can submit complaints and track their status in real-time with AI-powered priority assignment.",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50 border-blue-100",
    },
    {
      icon: Bot,
      title: "AI Campus Assistant",
      description: "Get instant answers about college services, departments, courses, and campus information 24/7.",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50 border-purple-100",
    },
    {
      icon: LayoutDashboard,
      title: "Student Dashboard",
      description: "View all relevant campus information, complaints, notifications, and updates from one centralized place.",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50 border-emerald-100",
    },
    {
      icon: FileText,
      title: "Complaint Tracking",
      description: "Track submitted complaints through every stage - from submission to resolution with detailed timelines.",
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50 border-amber-100",
    },
    {
      icon: Users,
      title: "Admin & Warden Management",
      description: "Authorized staff can manage, assign, and respond to campus complaints with role-based access control.",
      color: "from-red-500 to-red-600",
      bgColor: "bg-red-50 border-red-100",
    },
    {
      icon: Building2,
      title: "Campus Information",
      description: "Find departments, courses, contacts, facilities, and important campus information instantly.",
      color: "from-cyan-500 to-cyan-600",
      bgColor: "bg-cyan-50 border-cyan-100",
    },
  ];

  // How it works steps
  const steps = [
    {
      number: "01",
      title: "Login",
      description: "Sign in using your authorized college account with roll number, email, and phone verification.",
      icon: ShieldCheck,
    },
    {
      number: "02",
      title: "Use Campus Services",
      description: "Access complaints, AI assistance, campus information, and other services from your dashboard.",
      icon: Bot,
    },
    {
      number: "03",
      title: "Stay Updated",
      description: "Track complaints, receive notifications, and stay informed about important campus updates.",
      icon: Bell,
    },
  ];

  // Why Campus-Ai highlights
  const highlights = [
    { icon: Check, label: "Simple", description: "Intuitive interface designed for students" },
    { icon: Zap, label: "Fast", description: "Quick access to all campus services" },
    { icon: Shield, label: "Secure", description: "College-verified authentication system" },
    { icon: UsersIcon, label: "Student-focused", description: "Built specifically for campus needs" },
    { icon: Brain, label: "AI-powered", description: "Smart assistance and priority assignment" },
    { icon: Layers, label: "Centralized", description: "All campus services in one platform" },
  ];

  // Credits data
  const techStack = [
    { name: "React", icon: "⚛️" },
    { name: "TypeScript", icon: "📘" },
    { name: "Vite", icon: "⚡" },
    { name: "Express", icon: "🚀" },
    { name: "PostgreSQL", icon: "🐘" },
    { name: "Google Gemini AI", icon: "🤖" },
    { name: "Tailwind CSS", icon: "🎨" },
    { name: "Recharts", icon: "📊" },
  ];

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      {/* Navbar */}
      <nav
        ref={(el) => (sectionRefs.current.navbar = el)}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled
            ? "bg-white/95 backdrop-blur-sm shadow-sm border-b border-[#E5EAF1]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#146EF5] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/20">
                <ShieldCheck className="w-5 h-5 text-white stroke-[2.2]" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Campus-Ai</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-8">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`relative px-3 py-2 text-sm font-medium transition-colors ${
                    activeSection === item.id
                      ? "text-[#146EF5]"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  {item.label}
                  {activeSection === item.id && (
                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-[#146EF5]" />
                  )}
                </button>
              ))}
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center gap-3">
              {/* Desktop Nav Links (condensed) */}
              <div className="hidden md:flex items-center gap-6">
                {navItems.slice(1, 4).map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`text-sm font-medium transition-colors ${
                      activeSection === item.id
                        ? "text-[#146EF5]"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Login Button */}
              <button
                onClick={() => setShowAuthModal(true)}
                className="hidden sm:flex items-center gap-2 px-5 py-2.5 bg-[#146EF5] text-white text-sm font-semibold rounded-xl hover:bg-[#0F5CCB] transition-colors shadow-lg shadow-blue-500/25"
              >
                <Lock className="w-4 h-4" />
                Login
              </button>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="lg:hidden py-4 border-t border-[#E5EAF1] animate-in slide-in-from-top-2">
              <div className="flex flex-col gap-2">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className={`px-4 py-3 text-left rounded-xl text-base font-medium transition-colors ${
                      activeSection === item.id
                        ? "bg-[#146EF5]/10 text-[#146EF5]"
                        : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="mt-2 mx-4 px-4 py-3 bg-[#146EF5] text-white text-base font-semibold rounded-xl hover:bg-[#0F5CCB] transition-colors flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  Login to Campus-Ai
                </button>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero / Login Section */}
      <section
        ref={(el) => (sectionRefs.current.hero = el)}
        id="hero"
        className="relative min-h-screen flex items-center justify-center pt-16 lg:pt-20 px-4 sm:px-6 lg:px-8 overflow-hidden"
      >
        {/* Background decorative elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#146EF5]/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[#146EF5]/5 to-transparent rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto w-full">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            {/* Left Side - Marketing Content */}
            <div className="animate-in fade-in slide-in-from-left-4 duration-700">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#146EF5]/10 border border-[#146EF5]/20 rounded-full text-sm font-semibold text-[#146EF5] mb-6">
                <Sparkles className="w-4 h-4" />
                AI-Powered Campus Management Platform
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-tight tracking-tight mb-6">
                Your Smarter Campus
                <br />
                <span className="bg-gradient-to-r from-[#146EF5] to-[#3B82F6] bg-clip-text text-transparent">
                  Starts Here.
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-600 leading-relaxed mb-8 max-w-xl">
                Campus-Ai brings students, faculty, and campus services together in one intelligent platform.
              </p>

              {/* Feature highlights */}
              <div className="space-y-4 mb-10">
                {[
                  { icon: FileText, text: "Submit and track complaints with AI-powered priority assignment" },
                  { icon: Bot, text: "Get instant answers from AI Campus Assistant 24/7" },
                  { icon: GraduationCap, text: "Access academic information, schedules, and campus resources" },
                  { icon: MessageSquare, text: "Interact with AI-powered assistance for any campus query" },
                  { icon: Bell, text: "Stay connected with important campus services and notifications" },
                ].map((item, index) => (
                  <div
                    key={index}
                    className="flex items-start gap-3 p-4 bg-white/80 backdrop-blur-sm border border-[#E5EAF1] rounded-2xl hover:border-[#146EF5]/30 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#146EF5] to-[#3B82F6] flex items-center justify-center flex-shrink-0">
                      <item.icon className="w-5 h-5 text-white stroke-[2]" />
                    </div>
                    <span className="text-slate-700 font-medium leading-relaxed pt-1">{item.text}</span>
                  </div>
                ))}
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap items-center gap-6 text-sm text-slate-500">
                <div className="flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-500" />
                  <span>College Verified</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <UsersIcon className="w-4 h-4 text-blue-500" />
                  <span>10,000+ Students</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-amber-500" />
                  <span>ITS Engineering College</span>
                </div>
              </div>
            </div>

            {/* Right Side - Login Card */}
            <div className="animate-in fade-in slide-in-from-right-4 duration-700 delay-100">
              <div className="bg-white rounded-3xl border border-[#E5EAF1] shadow-2xl p-6 sm:p-8 w-full max-w-md mx-auto lg:mx-0">
                {/* Brand Header */}
                <div className="text-center mb-8">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#146EF5] to-[#3B82F6] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
                    <ShieldCheck className="w-8 h-8 text-white stroke-[2.2]" />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Welcome to Campus-Ai</h2>
                  <p className="text-slate-600 mt-2">Sign in to continue to your campus dashboard</p>
                </div>

                {/* Login Button - Opens Modal */}
                <button
                  onClick={() => setShowAuthModal(true)}
                  className="w-full py-3.5 px-6 bg-[#146EF5] text-white text-base font-semibold rounded-xl hover:bg-[#0F5CCB] transition-all duration-200 shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2"
                >
                  <Lock className="w-5 h-5" />
                  Sign In with College Account
                </button>

                {/* Demo Notice */}
                <div className="mt-6 p-4 bg-[#F7F9FC] border border-[#E5EAF1] rounded-xl">
                  <p className="text-xs text-slate-500 text-center">
                    <strong className="text-slate-700">Demo Accounts:</strong> Use roll numbers like{" "}
                    <code className="bg-white px-1.5 py-0.5 rounded text-[#146EF5] font-mono">23AIML001</code>{" "}
                    or{" "}
                    <code className="bg-white px-1.5 py-0.5 rounded text-[#146EF5] font-mono">2022CSB1044</code>
                    with college email ending in <code className="bg-white px-1.5 py-0.5 rounded text-[#146EF5] font-mono">.edu.in</code>
                  </p>
                </div>

                {/* Help Link */}
                <div className="mt-6 text-center">
                  <button
                    onClick={() => scrollToSection("contact")}
                    className="text-sm text-[#146EF5] font-medium hover:underline flex items-center justify-center gap-1 mx-auto"
                  >
                    <HelpCircle className="w-4 h-4" />
                    Need Help? Contact Support
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
          <ChevronDown className="w-6 h-6 text-slate-400" />
        </div>
      </section>

      {/* What is Campus-Ai Section */}
      <section
        ref={(el) => (sectionRefs.current["what-is"] = el)}
        id="what-is"
        className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#146EF5]/10 border border-[#146EF5]/20 rounded-full text-sm font-semibold text-[#146EF5] mb-4">
              <Sparkles className="w-4 h-4" />
              Platform Overview
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
              Everything You Need for Your Campus
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Campus-Ai is a centralized digital platform designed to make everyday campus services simpler, faster, and more accessible.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`group relative p-6 rounded-2xl border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${feature.bgColor}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${feature.color}`}>
                  <feature.icon className="w-6 h-6 text-white stroke-[2]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How Campus-Ai Works Section */}
      <section
        ref={(el) => (sectionRefs.current["how-it-works"] = el)}
        id="how-it-works"
        className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[#F7F9FC]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#146EF5]/10 border border-[#146EF5]/20 rounded-full text-sm font-semibold text-[#146EF5] mb-4">
              <Target className="w-4 h-4" />
              How It Works
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
              Get Started in Three Simple Steps
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              From login to resolution, Campus-Ai streamlines your campus experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative text-center p-8 bg-white rounded-2xl border border-[#E5EAF1] hover:shadow-lg transition-shadow"
              >
                {/* Step number */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <span className="bg-[#146EF5] text-white text-2xl font-bold px-5 py-1 rounded-full shadow-lg shadow-blue-500/25">
                    {step.number}
                  </span>
                </div>

                {/* Connecting line */}
                {index < steps.length - 1 && (
                  <div className="absolute top-0 right-0 w-1/2 h-0.5 bg-gradient-to-r from-[#E5EAF1] to-transparent hidden md:block" />
                )}

                <div className="pt-8">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#146EF5] to-[#3B82F6] flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-500/20">
                    <step.icon className="w-7 h-7 text-white stroke-[2]" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-600 leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Campus-Ai Section */}
      <section
        ref={(el) => (sectionRefs.current["why-campus-ai"] = el)}
        id="why-campus-ai"
        className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#146EF5]/10 border border-[#146EF5]/20 rounded-full text-sm font-semibold text-[#146EF5] mb-4">
              <Star className="w-4 h-4" />
              Why Choose Us
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
              Built for a Better Campus Experience
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Every feature is designed with students and administrators in mind.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {highlights.map((highlight, index) => (
              <div
                key={index}
                className="group flex items-start gap-4 p-5 bg-[#F7F9FC] border border-[#E5EAF1] rounded-2xl hover:border-[#146EF5]/30 hover:bg-white transition-all duration-300"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#146EF5] to-[#3B82F6] flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                  <highlight.icon className="w-5 h-5 text-white stroke-[2]" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900">{highlight.label}</h4>
                  <p className="text-sm text-slate-600 mt-0.5">{highlight.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section
        ref={(el) => (sectionRefs.current.about = el)}
        id="about"
        className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[#F7F9FC]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#146EF5]/10 border border-[#146EF5]/20 rounded-full text-sm font-semibold text-[#146EF5] mb-4">
                <Heart className="w-4 h-4" />
                About Campus-Ai
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-6">
                Simplifying Campus Life Through Technology
              </h2>
              <div className="space-y-6 text-slate-600 leading-relaxed">
                <p>
                  Campus-Ai is a student-focused digital campus platform created to simplify communication between students and campus administration. 
                  We believe that accessing campus services shouldn't be complicated.
                </p>
                <p>
                  Our platform centralizes complaint management, campus information, and AI-powered assistance into one intuitive interface, 
                  reducing response times and improving the overall campus experience for everyone.
                </p>
              </div>

              <div className="mt-10 grid sm:grid-cols-2 gap-6">
                <div className="p-5 bg-white rounded-2xl border border-[#E5EAF1]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#146EF5] to-[#3B82F6] flex items-center justify-center mb-3">
                    <Target className="w-5 h-5 text-white stroke-[2]" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">Our Mission</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Make campus services easier to access and easier to manage.
                  </p>
                </div>
                <div className="p-5 bg-white rounded-2xl border border-[#E5EAF1]">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mb-3">
                    <Rocket className="w-5 h-5 text-white stroke-[2]" />
                  </div>
                  <h3 className="font-bold text-slate-900 mb-2">Our Vision</h3>
                  <p className="text-slate-600 text-sm leading-relaxed">
                    Build a smarter, more connected digital campus experience.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="aspect-[4/3] rounded-3xl bg-gradient-to-br from-[#146EF5] via-[#3B82F6] to-purple-600 p-1">
                <div className="w-full h-full bg-white rounded-2xl p-8 flex flex-col justify-center items-center text-center">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#146EF5] to-[#3B82F6] flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/20">
                    <Brain className="w-10 h-10 text-white stroke-[2]" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-3">AI-Powered Intelligence</h3>
                  <p className="text-slate-600 leading-relaxed max-w-md">
                    Our platform leverages Google Gemini AI to provide intelligent complaint analysis, priority assignment, 
                    and 24/7 campus assistance — making every interaction smarter.
                  </p>
                  <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm">
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <TrendingUp className="w-5 h-5 text-[#146EF5]" />
                      <span>Faster Resolution</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      <span>AI Verified</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-700 font-semibold">
                      <Shield className="w-5 h-5 text-blue-500" />
                      <span>Secure</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section
        ref={(el) => (sectionRefs.current.contact = el)}
        id="contact"
        className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-white"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#146EF5]/10 border border-[#146EF5]/20 rounded-full text-sm font-semibold text-[#146EF5] mb-4">
              <MessageSquare className="w-4 h-4" />
              Contact Us
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
              Get in Touch
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Have questions? We're here to help. Reach out to our support team or visit the college directly.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Info */}
            <div className="space-y-6">
              <div className="p-6 bg-[#F7F9FC] rounded-2xl border border-[#E5EAF1]">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <Building2 className="w-5 h-5 text-[#146EF5]" />
                  College Information
                </h3>
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#146EF5]/10 flex items-center justify-center flex-shrink-0">
                      <Building2 className="w-4 h-4 text-[#146EF5]" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">ITS Engineering College</p>
                      <p className="text-sm">Greater Noida, Uttar Pradesh, India</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#146EF5]/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="w-4 h-4 text-[#146EF5]" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Official Website</p>
                      <a href="https://its.edu.in" target="_blank" rel="noopener noreferrer" className="text-sm text-[#146EF5] hover:underline flex items-center gap-1">
                        its.edu.in
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#146EF5]/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-[#146EF5]" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Contact Email</p>
                      <a href="mailto:info@its.edu.in" className="text-sm text-[#146EF5] hover:underline">info@its.edu.in</a>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-[#F7F9FC] rounded-2xl border border-[#E5EAF1]">
                <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <HelpCircle className="w-5 h-5 text-[#146EF5]" />
                  Campus-Ai Support
                </h3>
                <div className="space-y-3 text-slate-600">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#146EF5]/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-[#146EF5]" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Technical Support</p>
                      <p className="text-sm">For platform issues, login problems, or feature requests</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-xl bg-[#146EF5]/10 flex items-center justify-center flex-shrink-0">
                      <Mail className="w-4 h-4 text-[#146EF5]" />
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">Support Email</p>
                      <a href="mailto:support@campus-ai.in" className="text-sm text-[#146EF5] hover:underline">support@campus-ai.in</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Form / CTA */}
            <div className="bg-gradient-to-br from-[#061B3A] to-[#09254A] rounded-3xl p-8 lg:p-12 text-white">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-slate-300 mb-8 max-w-md">
                Join thousands of students already using Campus-Ai to simplify their campus life. 
                Sign in with your college credentials to access your personalized dashboard.
              </p>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full sm:w-auto px-8 py-4 bg-white text-[#146EF5] text-base font-semibold rounded-xl hover:bg-slate-100 transition-colors shadow-lg flex items-center justify-center gap-2"
              >
                <ArrowRight className="w-5 h-5" />
                Sign In to Campus-Ai
              </button>
              <p className="mt-6 text-center text-slate-400 text-sm">
                By signing in, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Credits Section */}
      <section
        ref={(el) => (sectionRefs.current.credits = el)}
        id="credits"
        className="py-20 lg:py-32 px-4 sm:px-6 lg:px-8 bg-[#F7F9FC]"
      >
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#146EF5]/10 border border-[#146EF5]/20 rounded-full text-sm font-semibold text-[#146EF5] mb-4">
              <Award className="w-4 h-4" />
              Credits
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
              Built with Modern Technology
            </h2>
            <p className="text-lg text-slate-600 leading-relaxed">
              Campus-Ai is powered by a robust, modern tech stack designed for scalability and performance.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
            {techStack.map((tech, index) => (
              <div
                key={index}
                className="group p-5 bg-white rounded-2xl border border-[#E5EAF1] hover:border-[#146EF5]/30 hover:shadow-lg transition-all duration-300 text-center"
              >
                <span className="text-4xl mb-3 block">{tech.icon}</span>
                <h4 className="font-bold text-slate-900 group-hover:text-[#146EF5] transition-colors">{tech.name}</h4>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div className="p-6 bg-white rounded-2xl border border-[#E5EAF1]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#146EF5] to-[#3B82F6] flex items-center justify-center mx-auto mb-4">
                <ShieldCheck className="w-6 h-6 text-white stroke-[2]" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Campus-Ai</h3>
              <p className="text-slate-600 text-sm">AI-powered campus management platform for ITS Engineering College</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-[#E5EAF1]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4">
                <UsersIcon className="w-6 h-6 text-white stroke-[2]" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Development</h3>
              <p className="text-slate-600 text-sm">Campus-Ai Development Team</p>
            </div>
            <div className="p-6 bg-white rounded-2xl border border-[#E5EAF1]">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-white stroke-[2]" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">AI Integration</h3>
              <p className="text-slate-600 text-sm">Google Gemini AI for intelligent complaint analysis & campus assistance</p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#061B3A] text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#146EF5] to-[#3B82F6] flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5 text-white stroke-[2.2]" />
                </div>
                <span className="text-xl font-bold">Campus-Ai</span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Making campus life smarter, simpler, and more connected.
              </p>
              <div className="flex gap-4">
                <a href="https://its.edu.in" target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Globe className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Twitter className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Linkedin className="w-4 h-4" />
                </a>
                <a href="#" className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors">
                  <Github className="w-4 h-4" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Quick Links</h4>
              <nav className="space-y-3">
                {navItems.map((item) => (
                  <a
                    key={item.id}
                    href={`#${item.id}`}
                    className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                    {item.label}
                  </a>
                ))}
              </nav>
            </div>

            {/* Platform */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Platform</h4>
              <nav className="space-y-3">
                <a href="#what-is" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  Features
                </a>
                <a href="#how-it-works" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <Target className="w-3.5 h-3.5" />
                  How It Works
                </a>
                <a href="#why-campus-ai" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <Star className="w-3.5 h-3.5" />
                  Why Campus-Ai
                </a>
                <a href="#about" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5" />
                  About Us
                </a>
              </nav>
            </div>

            {/* Support */}
            <div>
              <h4 className="font-semibold text-sm uppercase tracking-wider text-slate-300 mb-4">Support</h4>
              <nav className="space-y-3">
                <a href="#contact" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <MessageSquare className="w-3.5 h-3.5" />
                  Contact Support
                </a>
                <a href="mailto:support@campus-ai.in" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5" />
                  Email Support
                </a>
                <a href="https://its.edu.in" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5" />
                  College Website
                </a>
                <a href="#credits" className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-2">
                  <Award className="w-3.5 h-3.5" />
                  Credits
                </a>
              </nav>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-slate-400 text-sm">
              © 2026 Campus-Ai. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-sm text-slate-400">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
              <a href="https://its.edu.in" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors flex items-center gap-1">
                ITS Engineering College
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal */}
      <StudentAuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLoginSuccess={onLoginSuccess}
      />
    </div>
  );
};