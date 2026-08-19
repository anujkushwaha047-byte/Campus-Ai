import React, { useState } from "react";
import {
  HelpCircle,
  PhoneCall,
  Mail,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileQuestion,
  Sparkles,
  Clock,
  AlertCircle
} from "lucide-react";

export const HelpSupportView: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: "How does the automated AI triage classification work?",
      a: "When you submit a complaint, CampusCare uses Gemini AI to evaluate keywords, emotional urgency, physical safety hazards, and department routing. The AI automatically assigns a priority level (Critical, High, Medium, Low) and alerts administrative duty officers immediately.",
    },
    {
      q: "What is considered a 'Critical' complaint?",
      a: "Complaints involving immediate health, electrical fire hazards, active flooding, security threats, or critical campus-wide network blackouts are classified as Critical and trigger direct mobile alerts to senior administrative officers.",
    },
    {
      q: "Can I track the real-time status of my complaint?",
      a: "Yes! Every complaint receives a unique tracking ID (e.g., #101). You can view the live step progression (Submitted → AI Analyzed → Under Review → In Progress → Resolved) and read official notes from assigned officers.",
    },
    {
      q: "How do I attach photos or supporting documents?",
      a: "During submission, click the attachment box to upload images (PNG, JPG) or PDF files up to 10MB to provide visual proof to the maintenance crew.",
    },
    {
      q: "What should I do if my complaint is not resolved within the SLA?",
      a: "If a complaint breaches its guaranteed resolution timeline, it automatically escalates to the Dean of Student Welfare with an urgent notification flag.",
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs">
        <h2 className="text-xl font-bold text-slate-900">
          CampusCare Student Redressal & Help Center
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Everything you need to know about logging grievances, tracking SLA timelines, and contacting campus authorities.
        </p>
      </div>

      {/* Emergency Helpline Banner */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-gradient-to-br from-rose-500 to-rose-700 text-white shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <PhoneCall className="w-6 h-6" />
            <h4 className="font-bold text-sm">24x7 Emergency Security</h4>
          </div>
          <p className="text-xs text-rose-100 mb-3">Hostel & Main Gate Control Room</p>
          <p className="text-lg font-mono font-extrabold">+91 1800 112 999</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 text-white shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <Mail className="w-6 h-6" />
            <h4 className="font-bold text-sm">Dean Student Welfare</h4>
          </div>
          <p className="text-xs text-blue-100 mb-3">Appeals & Escalated Grievances</p>
          <p className="text-sm font-semibold">dsw@campus.edu</p>
        </div>

        <div className="p-5 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-md">
          <div className="flex items-center gap-3 mb-2">
            <Clock className="w-6 h-6" />
            <h4 className="font-bold text-sm">Grievance Cell Hours</h4>
          </div>
          <p className="text-xs text-emerald-100 mb-3">Administrative Block, Room 102</p>
          <p className="text-sm font-semibold">Mon - Sat: 9:00 AM - 5:30 PM</p>
        </div>
      </div>

      {/* FAQs Section */}
      <div className="bg-white rounded-2xl p-6 border border-[#E5EAF1] shadow-xs">
        <h3 className="text-base font-bold text-slate-900 mb-4 flex items-center gap-2">
          <FileQuestion className="w-5 h-5 text-[#146EF5]" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="divide-y divide-slate-100">
          {faqs.map((faq, idx) => (
            <div key={idx} className="py-4">
              <button
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="w-full flex items-center justify-between text-left font-bold text-xs sm:text-sm text-slate-900 hover:text-[#146EF5] transition-colors"
              >
                <span>{faq.q}</span>
                {openFaq === idx ? (
                  <ChevronUp className="w-4 h-4 text-slate-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                )}
              </button>

              {openFaq === idx && (
                <p className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
