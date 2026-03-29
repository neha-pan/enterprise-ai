import React, { useState } from 'react';
import { SalesChat } from './sales-helpline/SalesChat';
import { SegmentedControl } from './SegmentedControl';
import { 
  User, 
  MapPin, 
  Clock, 
  FileText 
} from 'lucide-react';

export function SalesHelpline() {
  const [selectedTab, setSelectedTab] = useState('Sales Helpline');

  return (
    <div className="relative flex h-screen bg-[#1a1a1f] text-gray-100 overflow-hidden font-sans">
      
      {/* Global Background Grid - Applied to Canvas */}
      <div 
        className="absolute inset-0 pointer-events-none z-0"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px',
          maskImage: 'radial-gradient(circle at center, black 40%, transparent 100%)' // Vignette effect
        }}
      />

      {/* Left Sidebar (Desktop only) */}
      <div className="hidden lg:flex flex-col w-80 border-r border-white/5 bg-[#1a1a1f]/95 backdrop-blur-md relative z-20 shadow-xl">
        <div className="p-6 border-b border-white/5">
           <SegmentedControl
              options={['Sales Helpline', 'Active Cases', 'History']}
              selected={selectedTab}
              onChange={setSelectedTab}
            />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="px-2 text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Recent Conversations</div>
          
          {[
            { id: 1, title: 'Dealer #4928 Payment', time: 'Just now', active: true },
            { id: 2, title: 'Pricing Inquiry #229', time: '2h ago', active: false },
            { id: 3, title: 'System Access Issue', time: 'Yesterday', active: false },
          ].map((item) => (
            <div 
              key={item.id}
              className={`p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                item.active 
                  ? 'bg-[#242429] border-blue-500/20 shadow-md translate-x-1' 
                  : 'bg-transparent border-transparent hover:bg-[#242429] hover:border-white/5'
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className={`text-sm font-medium ${item.active ? 'text-white' : 'text-gray-400'}`}>
                  {item.title}
                </span>
                <span className="text-xs text-gray-600">{item.time}</span>
              </div>
              <div className={`text-xs ${item.active ? 'text-blue-400' : 'text-gray-600'} line-clamp-1`}>
                {item.active ? 'Processing request...' : 'Resolved successfully'}
              </div>
            </div>
          ))}
        </div>
        
        <div className="p-4 border-t border-white/5 bg-[#1a1a1f]">
          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#242429] transition-colors cursor-pointer">
             <div className="w-9 h-9 rounded-full bg-[#0a84ff] flex items-center justify-center text-sm font-bold text-white shadow-[0_0_12px_rgba(10,132,255,0.3)]">RV</div>
             <div>
               <div className="text-sm font-medium text-white">Rahul Ved</div>
               <div className="text-xs text-gray-500">Sales Manager</div>
             </div>
          </div>
        </div>
      </div>

      {/* Center Chat Area */}
      <div className="flex-1 flex flex-col relative min-w-0 z-10">
        {/* Mobile Header (only visible on mobile) */}
        <div className="lg:hidden p-4 border-b border-white/5 flex items-center justify-between bg-[#1a1a1f]/90 backdrop-blur-md sticky top-0 z-50">
          <span className="font-semibold text-lg tracking-tight">Sales Helpline</span>
          <div className="w-8 h-8 rounded-full bg-[#0a84ff] flex items-center justify-center text-xs font-bold text-white shadow-[0_0_8px_rgba(10,132,255,0.4)]">RV</div>
        </div>

        <div className="flex-1 h-full relative">
          <SalesChat />
        </div>
      </div>

      {/* Right Context Drawer (Desktop only) */}
      <div className="hidden xl:flex flex-col w-80 border-l border-white/5 bg-[#1a1a1f]/95 backdrop-blur-md p-6 space-y-8 relative z-20 shadow-xl overflow-y-auto">
        
        {/* Context Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Context</h3>
          
          <div className="space-y-4">
            <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-[#242429] transition-colors border border-transparent hover:border-white/5">
              <div className="p-2 bg-[#242429] rounded-lg group-hover:bg-[#1a1a1f] transition-colors">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Rahul Ved</div>
                <div className="text-xs text-gray-500 mt-0.5">Sales Manager, North Region</div>
              </div>
            </div>

            <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-[#242429] transition-colors border border-transparent hover:border-white/5">
              <div className="p-2 bg-[#242429] rounded-lg group-hover:bg-[#1a1a1f] transition-colors">
                <MapPin className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">New Delhi, IN</div>
                <div className="text-xs text-gray-500 mt-0.5">GMT +5:30</div>
              </div>
            </div>

            <div className="group flex items-start gap-4 p-3 rounded-xl hover:bg-[#242429] transition-colors border border-transparent hover:border-white/5">
              <div className="p-2 bg-[#242429] rounded-lg group-hover:bg-[#1a1a1f] transition-colors">
                <Clock className="w-4 h-4 text-gray-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Active Hours</div>
                <div className="text-xs text-gray-500 mt-0.5">09:00 AM - 06:00 PM</div>
              </div>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/5 w-full" />

        {/* SLA Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Active SLA</h3>
          <div className="bg-[#242429] rounded-xl p-4 border border-white/5 shadow-sm hover:border-[#0a84ff]/20 transition-colors group">
            <div className="flex justify-between items-center mb-3">
              <span className="text-xs font-medium text-gray-300">Response Time</span>
              <span className="text-xs font-medium text-green-400 bg-green-500/10 px-2 py-0.5 rounded-full border border-green-500/20">On Track</span>
            </div>
            <div className="w-full bg-gray-800 h-2 rounded-full overflow-hidden mb-2">
              <div className="bg-gradient-to-r from-green-500 to-green-400 h-full w-[85%] rounded-full group-hover:shadow-[0_0_8px_rgba(74,222,128,0.4)] transition-shadow" />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500">Target: 90%</span>
              <span className="text-white font-medium">85%</span>
            </div>
          </div>
        </div>

        <div className="h-px bg-white/5 w-full" />
        
        {/* Dealer Summary Section */}
        <div>
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-4 px-1">Dealer Summary</h3>
           <div className="bg-[#242429] rounded-xl p-4 border border-white/5 shadow-sm hover:border-[#0a84ff]/20 transition-colors">
              <div className="flex items-center gap-3 mb-4 pb-3 border-b border-white/5">
                <div className="p-2 bg-[#0a84ff]/10 rounded-lg">
                  <FileText className="w-4 h-4 text-[#0a84ff]" />
                </div>
                <div>
                  <div className="text-sm font-medium text-white">Dealer #4928</div>
                  <div className="text-[10px] text-gray-500 uppercase tracking-wide">Automotive Corp</div>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Account Status</span>
                    <span className="text-green-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_4px_rgba(74,222,128,0.5)]"></span>
                      Active
                    </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Daily Limit</span>
                    <span className="text-gray-300 font-medium font-mono">₹5,00,000</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                    <span className="text-gray-500">Utilized</span>
                    <span className="text-red-400 font-medium font-mono">₹4,95,000</span>
                </div>
                <div className="w-full bg-gray-800 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-red-500 h-full w-[99%]" />
                </div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
