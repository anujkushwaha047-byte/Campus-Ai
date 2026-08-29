import { useState } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import FeatureCard from '@/components/FeatureCard';
import { useOTP } from '@/hooks/useOTP';
import { verifyOTP } from '@/api/auth';

const LandingPage = () => {
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpResult, setOtpResult] = useState<string | null>(null);

  const handleVerify = async () => {
    const result = await verifyOTP(otp);
    setOtpResult(result.message);
    if (result.success) {
      setShowOTPModal(false);
      // Optionally redirect or update UI
    }
  };

  return (
    <div className="min-h-screen bg-[#F0F4FF] text-gray-800">
      {/* Header */}
      <Header />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-[#146EF5] to-[#06B6D4] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20 gradient-overlay" />
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col-reverse md:flex-row items-center justify-center">
          <div className="max-w-2xl text-center md:max-w-4xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent from-[#FFFFFF] via-[#FFFFFF] to-[#FFFFFF] animate-pulse">
              Welcome to CampusAI
            </h1>
            <p className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Empowering students with AI-driven insights and seamless complaint management.
            </p>
            <button
              onClick={() => setShowOTPModal(true)}
              className="inline-block bg-[#F59E0B] hover:bg-[#E58A0B] text-white font-medium py-2 px-6 rounded-full shadow-lg transform transition-colors"
            >
              Sign In
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Why Choose CampusAI</h2>
          <div className="grid gap-8 md:grid-cols-3">
            <FeatureCard
              title="AI-Powered Insights"
              description="Get intelligent analytics and recommendations tailored to student life."
              icon="⚡"
            />
            <FeatureCard
              title="Seamless Authentication"
              description="Secure OTP verification integrated with your campus credentials."
              icon="🔐"
            />
            <FeatureCard
              title="Real-Time Collaboration"
              description='Collaborate with peers and faculty through intelligent workflows.'
              icon="🤝"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="bg-[#F7F9FC] py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Trusted by Thousands</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#E5E7EB]">
              <p className="text-gray-700 italic">"CampusAI transformed how we handle student feedback."</p>
              <p className="mt-2 font-medium text-[#146EF5]">— Student Council President</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#E5E7EB]">
              <p className="text-gray-700 italic">"The OTP verification is fast and reliable."</p>
              <p className="mt-2 font-medium text-[#146EF5]">— IT Administrator</p>
            </div>
            <div className="bg-white p-6 rounded-lg shadow-sm border border-[#E5E7EB]">
              <p className="text-gray-700 italic">"Insights are spot-on and actionable."</p>
              <p className="mt-2 font-medium text-[#146EF5]">— Faculty Advisor</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to elevate your campus experience?</h2>
          <button
            onClick={() => setShowOTPModal(true)}
            className="inline-block bg-[#EC4899] hover:bg-[#C5308C] text-white font-medium py-2 px-6 rounded-full shadow-lg transform transition-colors"
          >
            Get Started
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#111827] py-12 text-gray-400">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-[#146EF5] font-semibold mb-2">CampusAI</h3>
              <p className="text-sm">Empowering students with AI-driven insights.</p>
            </div>
            <div>
              <h4 className="font-medium">Product</h4>
              <ul className="text-sm">
                <li><a href="#" className="hover:text-[#146EF5] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[#146EF5] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[#146EF5] transition-colors">Roadmap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Company</h4>
              <ul className="text-sm">
                <li><a href="#" className="hover:text-[#146EF5] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[#146EF5] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[#146EF5] transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium">Support</h4>
              <ul className="text-sm">
                <li><a href="#" className="hover:text-[#146EF5] transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-[#146EF5] transition-colors">API Documentation</a></li>
                <li><a href="#" className="hover:text-[#146EF5] transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="mt-8 border-t pt-4 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} CampusAI. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;