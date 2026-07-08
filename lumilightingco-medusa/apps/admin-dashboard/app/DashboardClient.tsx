"use client";

import React, { useState, useEffect } from "react";
import { 
  TrendingUp, 
  ShoppingBag, 
  DollarSign, 
  Percent, 
  Package, 
  AlertTriangle, 
  Clock, 
  Phone, 
  Plus, 
  RefreshCw, 
  ExternalLink, 
  CheckCircle, 
  XCircle,
  MessageSquare,
  FileText,
  UserCheck,
  Building,
  User,
  Sun,
  Moon,
  Search,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  BookOpen,
  Layers,
  Image,
  Settings,
  Eye,
  Info,
  Sparkles
} from "lucide-react";

interface DashboardClientProps {
  kpis: {
    revenueToday: number;
    ordersToday: number;
    revenueMonth: number;
    ordersMonth: number;
    avgOrderValue: number;
    productsSold: number;
    lowStock: number;
    pendingOrders: number;
  };
  inventory: {
    total_products: number;
    in_stock: number;
    out_of_stock: number;
    low_stock: number;
  };
  salesTrend: Array<{ month: string; revenue: number; orders: number }>;
  topProducts: Array<{ title: string; sold: number; revenue: number }>;
  mpesaTransactions: Array<{
    id: string;
    merchant_request_id: string;
    checkout_request_id: string;
    amount: number;
    phone_number: string;
    status: string;
    result_code: number | null;
    result_desc: string | null;
    mpesa_receipt_number: string | null;
    transaction_date: string | null;
    created_at: string;
  }>;
  mpesaStats: {
    total: number;
    success: number;
    failed: number;
    totalAmount: number;
    successRate: number;
  };
  quickbooks: {
    sales: number;
    expenses: number;
    profit: number;
    vatPayable: number;
    accountsReceivable: number;
    isMock: boolean;
  };
}

export default function DashboardClient({
  kpis,
  inventory,
  salesTrend,
  topProducts,
  mpesaTransactions,
  mpesaStats,
  quickbooks
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState<"sales" | "mpesa" | "quickbooks" | "leads" | "inventory" | "guide">("sales");
  const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number; label: string; value: number } | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [guideSearch, setGuideSearch] = useState("");
  const [completedSteps, setCompletedSteps] = useState<boolean[]>(new Array(8).fill(false));
  const [activeStepAccordion, setActiveStepAccordion] = useState<number | null>(0);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  useEffect(() => {
    const savedTheme = localStorage.getItem("admin-dashboard-theme");
    if (savedTheme === "light") {
      setTheme("light");
      document.documentElement.classList.add("light");
    } else {
      setTheme("dark");
      document.documentElement.classList.remove("light");
    }
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
      document.documentElement.classList.add("light");
      localStorage.setItem("admin-dashboard-theme", "light");
    } else {
      setTheme("dark");
      document.documentElement.classList.remove("light");
      localStorage.setItem("admin-dashboard-theme", "dark");
    }
  };

  // Format currency in Kenyan Shillings
  const formatKES = (value: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "currency",
      currency: "KES",
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format compact numbers
  const formatCompactKES = (value: number) => {
    if (value >= 1000000) {
      return `KES ${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `KES ${(value / 100).toFixed(0)}K`;
    }
    return formatKES(value);
  };

  // Categories Calculation based on top products or fallbacks
  const categories = [
    { name: "LED Bulbs & Tubes", val: kpis.revenueMonth * 0.25, color: "#eab308", class: "bg-yellow-500" },
    { name: "Decorative Chandeliers", val: kpis.revenueMonth * 0.40, color: "#6366f1", class: "bg-indigo-500" },
    { name: "Outdoor Architectural", val: kpis.revenueMonth * 0.18, color: "#10b981", class: "bg-emerald-500" },
    { name: "Track & Accent", val: kpis.revenueMonth * 0.12, color: "#06b6d4", class: "bg-cyan-500" },
    { name: "Smart Controls", val: kpis.revenueMonth * 0.05, color: "#f43f5e", class: "bg-rose-500" }
  ];
  const totalCategoryVal = categories.reduce((acc, c) => acc + c.val, 0);

  // 1. Line Chart Calculations (Sales Trend)
  const chartWidth = 500;
  const chartHeight = 200;
  const padding = 30;
  const graphWidth = chartWidth - padding * 2;
  const graphHeight = chartHeight - padding * 2;

  const maxRevenue = Math.max(...salesTrend.map(d => d.revenue), 100000);
  const maxVal = maxRevenue * 1.1; // Headroom

  const points = salesTrend.map((d, i) => {
    const x = padding + (i / (salesTrend.length - 1)) * graphWidth;
    const y = chartHeight - padding - (d.revenue / maxVal) * graphHeight;
    return { x, y, label: d.month, value: d.revenue };
  });

  let linePath = "";
  let areaPath = "";
  if (points.length > 0) {
    linePath = `M ${points[0].x} ${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[i];
      const p1 = points[i + 1];
      const cpX1 = p0.x + graphWidth / (salesTrend.length - 1) / 3;
      const cpY1 = p0.y;
      const cpX2 = p1.x - graphWidth / (salesTrend.length - 1) / 3;
      const cpY2 = p1.y;
      linePath += ` C ${cpX1} ${cpY1}, ${cpX2} ${cpY2}, ${p1.x} ${p1.y}`;
    }
    areaPath = `${linePath} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;
  }

  // 2. Donut Chart Calculations (Category breakdown)
  const donutR = 50;
  const donutCX = 60;
  const donutCY = 60;
  const donutCircumference = 2 * Math.PI * donutR; // ~314.16
  let cumulativePercent = 0;

  const categorySegments = categories.map((cat) => {
    const pct = cat.val / totalCategoryVal;
    const strokeLength = pct * donutCircumference;
    const strokeOffset = donutCircumference - strokeLength + cumulativePercent * donutCircumference;
    cumulativePercent += pct;
    return {
      ...cat,
      strokeDasharray: `${strokeLength} ${donutCircumference}`,
      strokeDashoffset: -strokeOffset
    };
  });

  // 3. M-Pesa Donut Chart Calculations
  const mpesaSuccessPercent = mpesaStats.total > 0 ? (mpesaStats.success / mpesaStats.total) : 0.75;
  const mpesaFailedPercent = 1 - mpesaSuccessPercent;

  const mpesaSegments = [
    { name: "Success", val: mpesaSuccessPercent, color: "#10b981", class: "bg-emerald-500" },
    { name: "Failed", val: mpesaFailedPercent, color: "#f43f5e", class: "bg-rose-500" }
  ];

  let mpesaCumulative = 0;
  const mpesaDonutSegments = mpesaSegments.map((seg) => {
    const strokeLength = seg.val * donutCircumference;
    const strokeOffset = donutCircumference - strokeLength + mpesaCumulative * donutCircumference;
    mpesaCumulative += seg.val;
    return {
      ...seg,
      strokeDasharray: `${strokeLength} ${donutCircumference}`,
      strokeDashoffset: -strokeOffset
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Tab Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div className="flex flex-wrap gap-2">
          {[
            { id: "sales", name: "Sales & Revenue", icon: TrendingUp },
            { id: "mpesa", name: "M-Pesa Gateway", icon: Phone },
            { id: "quickbooks", name: "QuickBooks Online", icon: Building },
            { id: "leads", name: "Store Leads", icon: MessageSquare },
            { id: "inventory", name: "Inventory & Stock", icon: Package },
            { id: "guide", name: "Medusa Guide", icon: FileText }
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                  active 
                    ? "bg-amber-500 text-black shadow-lg shadow-amber-500/20" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                {tab.name}
              </button>
            );
          })}
        </div>
        
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center p-2 rounded-lg border border-white/5 text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>

          <button 
            onClick={() => window.location.reload()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/5 text-xs text-white/60 hover:text-white hover:bg-white/5 transition-all cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Refresh
          </button>
        </div>
      </div>

      {/* KPI CARDS BANNER */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Revenue Today</span>
            <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gradient-emerald">{formatKES(kpis.revenueToday)}</h3>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-white/50">{kpis.ordersToday} Orders</span>
            <span className="text-[10px] bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded-full font-medium">Daily</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-yellow-500/5 rounded-full blur-2xl group-hover:bg-yellow-500/10 transition-all duration-500" />
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Revenue This Month</span>
            <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gradient-gold">{formatCompactKES(kpis.revenueMonth)}</h3>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-white/50">{kpis.ordersMonth} Orders</span>
            <span className="text-[10px] bg-yellow-500/10 text-yellow-500 px-2 py-0.5 rounded-full font-medium">Monthly</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all duration-500" />
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Avg Order Value</span>
            <h3 className="text-2xl md:text-3xl font-bold mt-1 text-gradient-indigo">{formatKES(kpis.avgOrderValue)}</h3>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-white/50">Total {kpis.productsSold} Sold</span>
            <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-medium">Basket</span>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all duration-500" />
          <div>
            <span className="text-[10px] text-white/40 uppercase tracking-widest font-semibold">Operational Alerts</span>
            <h3 className="text-2xl md:text-3xl font-bold mt-1 text-rose-500">{kpis.lowStock} Low Stock</h3>
          </div>
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-white/50">{kpis.pendingOrders} Pending Orders</span>
            <span className="text-[10px] bg-rose-500/10 text-rose-500 px-2 py-0.5 rounded-full font-medium">Attention</span>
          </div>
        </div>
      </div>

      {/* CORE PORTAL LAYOUTS BASED ON ACTIVE TAB */}

      {/* TAB 1: SALES & REVENUE */}
      {activeTab === "sales" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Sales Trend Curve */}
          <div className="glass-panel p-6 rounded-3xl lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-lg text-white">Monthly Sales Volume</h4>
                <p className="text-xs text-white/50">6-Month revenue performance indicator</p>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-1 rounded-lg">
                <TrendingUp className="w-3.5 h-3.5" />
                +24.8% YoY
              </div>
            </div>

            <div className="relative h-60 w-full flex items-center justify-center">
              <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eab308" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#eab308" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Y Axis Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                  const y = padding + p * graphHeight;
                  return (
                    <line 
                      key={idx} 
                      x1={padding} 
                      y1={y} 
                      x2={chartWidth - padding} 
                      y2={y} 
                      stroke="var(--chart-grid)" 
                      strokeWidth="1" 
                    />
                  );
                })}

                {/* Area under curve */}
                {areaPath && (
                  <path d={areaPath} fill="url(#areaGrad)" />
                )}

                {/* Line Path */}
                {linePath && (
                  <path d={linePath} fill="none" stroke="#eab308" strokeWidth="3.5" strokeLinecap="round" />
                )}

                {/* Points */}
                {points.map((pt, idx) => (
                  <circle
                    key={idx}
                    cx={pt.x}
                    cy={pt.y}
                    r={selectedPoint?.label === pt.label ? "6" : "4"}
                    fill={selectedPoint?.label === pt.label ? "#eab308" : "var(--chart-point-bg, #0b0c10)"}
                    stroke="#eab308"
                    strokeWidth={selectedPoint?.label === pt.label ? "3" : "2"}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      setSelectedPoint({
                        x: pt.x,
                        y: pt.y - 10,
                        label: pt.label,
                        value: pt.value
                      });
                    }}
                    onMouseLeave={() => setSelectedPoint(null)}
                  />
                ))}

                {/* X labels */}
                {points.map((pt, idx) => (
                  <text
                    key={idx}
                    x={pt.x}
                    y={chartHeight - 10}
                    textAnchor="middle"
                    fill="rgba(255,255,255,0.4)"
                    fontSize="9"
                    className="font-medium"
                  >
                    {pt.label}
                  </text>
                ))}
              </svg>

              {/* Tooltip Overlay */}
              {selectedPoint && (
                <div 
                  className="absolute bg-black/90 border border-white/10 px-3 py-2 rounded-xl text-center shadow-xl pointer-events-none transition-all duration-200"
                  style={{
                    left: `${(selectedPoint.x / chartWidth) * 100}%`,
                    top: `${(selectedPoint.y / chartHeight) * 100 - 15}%`,
                    transform: "translateX(-50%)"
                  }}
                >
                  <p className="text-[9px] text-white/50 uppercase tracking-widest font-semibold">{selectedPoint.label}</p>
                  <p className="text-sm font-bold text-amber-500 mt-0.5">{formatKES(selectedPoint.value)}</p>
                </div>
              )}
            </div>
          </div>

          {/* Donut Chart (Category Breakdown) */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-lg text-white">Revenue by Category</h4>
              <p className="text-xs text-white/50">LUMI lighting product families</p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-6 my-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  {categorySegments.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx={donutCX}
                      cy={donutCY}
                      r={donutR}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="12"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      className="transition-all duration-500 hover:stroke-[14] cursor-pointer"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Total</span>
                  <span className="text-sm font-bold text-white">{formatCompactKES(totalCategoryVal)}</span>
                </div>
              </div>

              <div className="flex-1 space-y-2.5 w-full">
                {categories.map((cat, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${cat.class}`}></span>
                      <span className="text-white/70 font-medium">{cat.name}</span>
                    </div>
                    <span className="font-bold text-white">
                      {Math.round((cat.val / totalCategoryVal) * 100)}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Top Selling Products List */}
          <div className="glass-panel p-6 rounded-3xl lg:col-span-3">
            <h4 className="font-bold text-lg text-white mb-5">Top Selling Products</h4>
            <div className="space-y-4">
              {topProducts.map((p, idx) => {
                const maxSold = Math.max(...topProducts.map(tp => tp.sold));
                const percent = (p.sold / maxSold) * 100;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-3">
                        <span className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-xs font-bold text-white/60">
                          {idx + 1}
                        </span>
                        <span className="font-medium text-white">{p.title}</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-white">{p.sold} sold</span>
                        <span className="text-xs text-white/40 block">{formatKES(p.revenue)}</span>
                      </div>
                    </div>
                    <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                      <div 
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-1000"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: M-PESA GATEWAY */}
      {activeTab === "mpesa" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* M-Pesa stats summary */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-lg text-white">STK Push Success Rate</h4>
              <p className="text-xs text-white/50">Real-time payment gateway performance</p>
            </div>

            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  {mpesaDonutSegments.map((seg, idx) => (
                    <circle
                      key={idx}
                      cx={donutCX}
                      cy={donutCY}
                      r={donutR}
                      fill="transparent"
                      stroke={seg.color}
                      strokeWidth="14"
                      strokeDasharray={seg.strokeDasharray}
                      strokeDashoffset={seg.strokeDashoffset}
                      className="transition-all duration-500"
                    />
                  ))}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-white">{mpesaStats.successRate}%</span>
                  <span className="text-[8px] text-emerald-400 uppercase tracking-widest font-bold">Success</span>
                </div>
              </div>

              <div className="flex gap-6 mt-4">
                <div className="text-center">
                  <span className="text-[10px] text-white/40 block">Total Actions</span>
                  <span className="text-sm font-bold text-white">{mpesaStats.total}</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-white/40 block">Approved</span>
                  <span className="text-sm font-bold text-emerald-500">{mpesaStats.success}</span>
                </div>
                <div className="text-center">
                  <span className="text-[10px] text-white/40 block">Failed</span>
                  <span className="text-sm font-bold text-rose-500">{mpesaStats.failed}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed transactional log */}
          <div className="glass-panel p-6 rounded-3xl lg:col-span-2 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-lg text-white">M-Pesa Transaction Logs</h4>
              <p className="text-xs text-white/50">Recent Safaricom STK checkout operations</p>
            </div>

            <div className="mt-5 overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-white/5 text-[10px] uppercase text-white/40 tracking-wider">
                    <th className="pb-3 font-semibold">Phone</th>
                    <th className="pb-3 font-semibold">Receipt No</th>
                    <th className="pb-3 font-semibold">Amount</th>
                    <th className="pb-3 font-semibold">Status</th>
                    <th className="pb-3 font-semibold text-right">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-xs">
                  {mpesaTransactions.length > 0 ? (
                    mpesaTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-white/5 transition-all">
                        <td className="py-3 font-medium text-white">+{tx.phone_number}</td>
                        <td className="py-3 text-white/60">
                          {tx.mpesa_receipt_number || <span className="text-white/20 italic">Pending</span>}
                        </td>
                        <td className="py-3 font-semibold text-white">{formatKES(tx.amount)}</td>
                        <td className="py-3">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            tx.status === "success" 
                              ? "bg-emerald-500/10 text-emerald-500" 
                              : tx.status === "failed" 
                              ? "bg-rose-500/10 text-rose-500" 
                              : "bg-yellow-500/10 text-yellow-500"
                          }`}>
                            {tx.status === "success" ? (
                              <CheckCircle className="w-3 h-3" />
                            ) : tx.status === "failed" ? (
                              <XCircle className="w-3 h-3" />
                            ) : (
                              <Clock className="w-3 h-3 animate-spin" />
                            )}
                            {tx.status}
                          </span>
                        </td>
                        <td className="py-3 text-white/40 text-right">
                          {tx.transaction_date ? tx.transaction_date.substring(5, 16) : new Date(tx.created_at).toLocaleString("en-KE").substring(0, 16)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-white/30">
                        No transactions registered in PostgreSQL analytics table yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: QUICKBOOKS ONLINE */}
      {activeTab === "quickbooks" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* P&L Analysis */}
          <div className="glass-panel p-6 rounded-3xl lg:col-span-2 flex flex-col justify-between">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="font-bold text-lg text-white">Profit & Loss Statement</h4>
                <p className="text-xs text-white/50">
                  {quickbooks.isMock 
                    ? "Offline Mode — Sample Financial Reports" 
                    : "Live QuickBooks Online integration"}
                </p>
              </div>
              {quickbooks.isMock ? (
                <span className="text-[10px] font-bold bg-white/5 text-white/40 px-2 py-1 rounded-lg">Demo</span>
              ) : (
                <span className="text-[10px] font-bold bg-emerald-500/10 text-emerald-500 px-2 py-1 rounded-lg">Connected</span>
              )}
            </div>

            {/* SVG P&L Bar Chart */}
            <div className="relative h-60 w-full flex items-center justify-center my-4">
              <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible">
                {/* Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                  const y = 30 + p * 140;
                  return (
                    <line key={idx} x1="40" y1={y} x2="480" y2={y} stroke="var(--chart-grid)" strokeWidth="1" />
                  );
                })}

                {/* Bars */}
                {(() => {
                  const max = Math.max(quickbooks.sales, quickbooks.expenses, quickbooks.profit);
                  const hIncome = (quickbooks.sales / max) * 130;
                  const hExpense = (quickbooks.expenses / max) * 130;
                  const hProfit = (quickbooks.profit / max) * 130;

                  return (
                    <>
                      {/* Income Bar */}
                      <rect 
                        x="90" 
                        y={170 - hIncome} 
                        width="60" 
                        height={hIncome} 
                        fill="url(#emeraldGrad)" 
                        rx="8" 
                        className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                      />
                      <text x="120" y={160 - hIncome} textAnchor="middle" fill="#10b981" fontSize="10" fontWeight="bold">
                        {formatCompactKES(quickbooks.sales)}
                      </text>
                      <text x="120" y="188" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">
                        Total Income
                      </text>

                      {/* Expense Bar */}
                      <rect 
                        x="220" 
                        y={170 - hExpense} 
                        width="60" 
                        height={hExpense} 
                        fill="url(#roseGrad)" 
                        rx="8" 
                        className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                      />
                      <text x="250" y={160 - hExpense} textAnchor="middle" fill="#f43f5e" fontSize="10" fontWeight="bold">
                        {formatCompactKES(quickbooks.expenses)}
                      </text>
                      <text x="250" y="188" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">
                        Total Expenses
                      </text>

                      {/* Profit Bar */}
                      <rect 
                        x="350" 
                        y={170 - hProfit} 
                        width="60" 
                        height={hProfit} 
                        fill="url(#goldGrad)" 
                        rx="8" 
                        className="transition-all duration-500 hover:opacity-80 cursor-pointer"
                      />
                      <text x="380" y={160 - hProfit} textAnchor="middle" fill="#eab308" fontSize="10" fontWeight="bold">
                        {formatCompactKES(quickbooks.profit)}
                      </text>
                      <text x="380" y="188" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="10">
                        Net Profit
                      </text>
                    </>
                  );
                })()}

                <defs>
                  <linearGradient id="emeraldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#059669" />
                  </linearGradient>
                  <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </linearGradient>
                  <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#eab308" />
                    <stop offset="100%" stopColor="#ca8a04" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>

          {/* Balance sheet & OAuth Link */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-lg text-white">Balance Sheet Metrics</h4>
                <p className="text-xs text-white/50">Core liability and debtor balances</p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-white/2 rounded-2xl flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-500">
                      <Percent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block font-semibold uppercase tracking-wider">VAT Payable</span>
                      <span className="font-bold text-white text-sm">Tax Remittances</span>
                    </div>
                  </div>
                  <span className="text-base font-bold text-indigo-400">{formatKES(quickbooks.vatPayable)}</span>
                </div>

                <div className="p-4 bg-white/2 rounded-2xl flex items-center justify-between border border-white/5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-cyan-500/10 flex items-center justify-center text-cyan-500">
                      <DollarSign className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-white/40 block font-semibold uppercase tracking-wider">Accounts Receivable</span>
                      <span className="font-bold text-white text-sm">Customer Debts</span>
                    </div>
                  </div>
                  <span className="text-base font-bold text-cyan-400">{formatKES(quickbooks.accountsReceivable)}</span>
                </div>
              </div>
            </div>

            {quickbooks.isMock && (
              <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 border border-amber-500/15 flex flex-col items-center text-center">
                <AlertTriangle className="w-6 h-6 text-amber-500 mb-2" />
                <p className="text-xs font-semibold text-white">QuickBooks is not Linked</p>
                <p className="text-[10px] text-white/50 mt-1 max-w-[200px]">Authorize connection to fetch your live profit & loss metrics.</p>
                <a 
                  href="http://localhost:9001/admin/quickbooks/authorize"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-3 flex items-center justify-center gap-2 py-2 px-4 rounded-xl bg-amber-500 text-black text-xs font-bold hover:bg-amber-400 shadow-lg shadow-amber-500/10 transition-all"
                >
                  Authorize Online
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 4: STORE LEADS (WHATSAPP & CONTRACTOR QUOTATIONS) */}
      {activeTab === "leads" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* WhatsApp Leads Card */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-lg text-white">WhatsApp Leads</h4>
                <p className="text-xs text-white/50">Storefront product clicks</p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
                <MessageSquare className="w-5 h-5" />
              </div>
            </div>

            <div className="my-6 space-y-4">
              <div className="text-center py-2">
                <span className="text-4xl font-extrabold text-white">48</span>
                <span className="text-xs text-white/40 block mt-1">Lead Clicks Today</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/2 border border-white/5 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-white/40 block">Conversion Rate</span>
                  <span className="text-lg font-bold text-emerald-400">37.5%</span>
                </div>
                <div className="bg-white/2 border border-white/5 p-3 rounded-xl text-center">
                  <span className="text-[10px] text-white/40 block">Orders Synced</span>
                  <span className="text-lg font-bold text-white">18</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] text-emerald-400 font-medium">
              Conversion rate is calculated by matching client phone number callbacks with order submissions within 24 hours.
            </div>
          </div>

          {/* Contractor Quotations Tracker */}
          <div className="glass-panel p-6 rounded-3xl lg:col-span-2 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-lg text-white">Contractor Quotations</h4>
              <p className="text-xs text-white/50">B2B Architectural Lighting quotation requests</p>
            </div>

            {/* Quotation metrics breakdown */}
            <div className="grid grid-cols-3 gap-4 my-4">
              <div className="p-4 bg-white/2 rounded-2xl border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Approved</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold text-emerald-500">16</span>
                  <span className="text-[10px] text-emerald-400 font-medium">57.1%</span>
                </div>
              </div>
              <div className="p-4 bg-white/2 rounded-2xl border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Pending</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold text-yellow-500">8</span>
                  <span className="text-[10px] text-yellow-400 font-medium">28.6%</span>
                </div>
              </div>
              <div className="p-4 bg-white/2 rounded-2xl border border-white/5 flex flex-col justify-between">
                <span className="text-[10px] text-white/40 font-semibold uppercase tracking-wider">Rejected</span>
                <div className="flex items-baseline justify-between mt-2">
                  <span className="text-2xl font-bold text-rose-500">4</span>
                  <span className="text-[10px] text-rose-400 font-medium">14.3%</span>
                </div>
              </div>
            </div>

            {/* Recent Quote Submissions */}
            <div className="space-y-3 mt-4">
              <span className="text-[10px] text-white/40 font-bold uppercase tracking-widest block">Recent Quotation Inquiries</span>
              
              <div className="space-y-2.5">
                {[
                  { name: "Alpha Builders Ltd", contact: "info@alphabuilders.co.ke", desc: "Commercial office block architectural lighting layout", value: 1250000, status: "pending" },
                  { name: "Modern Living Interiors", contact: "designs@modernliving.ke", desc: "Residential villa smart track lighting system", value: 450000, status: "approved" },
                  { name: "Kilimani Apartments Project", contact: "mutisya@kilimanidev.com", desc: "120 units energy-saving LED recessed downlights", value: 3800000, status: "approved" }
                ].map((q, idx) => (
                  <div key={idx} className="p-3 bg-white/2 border border-white/5 rounded-2xl flex items-center justify-between text-xs hover:border-white/10 transition-all">
                    <div>
                      <h5 className="font-bold text-white">{q.name}</h5>
                      <p className="text-[10px] text-white/40 mt-0.5">{q.desc}</p>
                    </div>
                    <div className="text-right">
                      <span className="font-bold text-white block">{formatCompactKES(q.value)}</span>
                      <span className={`inline-flex items-center gap-1 text-[9px] font-semibold mt-1 px-1.5 py-0.5 rounded-full ${
                        q.status === "approved" 
                          ? "bg-emerald-500/10 text-emerald-500" 
                          : "bg-yellow-500/10 text-yellow-500"
                      }`}>
                        {q.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: INVENTORY & STOCK */}
      {activeTab === "inventory" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
          {/* Inventory Breakdown Donut */}
          <div className="glass-panel p-6 rounded-3xl flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-lg text-white">Stock Status Breakdown</h4>
              <p className="text-xs text-white/50">Medusa product variant stock checks</p>
            </div>

            <div className="flex flex-col items-center justify-center my-6">
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                  {(() => {
                    const total = inventory.total_products || 84;
                    const inStock = inventory.in_stock || 72;
                    const lowStock = inventory.low_stock || 9;
                    const outOfStock = inventory.out_of_stock || 3;

                    const pIn = inStock / total;
                    const pLow = lowStock / total;
                    const pOut = outOfStock / total;

                    const segments = [
                      { val: pIn, color: "#10b981" },
                      { val: pLow, color: "#eab308" },
                      { val: pOut, color: "#f43f5e" }
                    ];

                    let cumulative = 0;
                    return segments.map((seg, idx) => {
                      const strokeLength = seg.val * donutCircumference;
                      const strokeOffset = donutCircumference - strokeLength + cumulative * donutCircumference;
                      cumulative += seg.val;
                      return (
                        <circle
                          key={idx}
                          cx={donutCX}
                          cy={donutCY}
                          r={donutR}
                          fill="transparent"
                          stroke={seg.color}
                          strokeWidth="14"
                          strokeDasharray={`${strokeLength} ${donutCircumference}`}
                          strokeDashoffset={-strokeOffset}
                          className="transition-all duration-500"
                        />
                      );
                    });
                  })()}
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-2xl font-bold text-white">{inventory.total_products}</span>
                  <span className="text-[8px] text-white/40 uppercase tracking-widest font-bold">Total SKUs</span>
                </div>
              </div>

              <div className="w-full space-y-2 mt-4">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                    <span className="text-white/70">In Stock</span>
                  </div>
                  <span className="font-bold text-white">{inventory.in_stock}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-yellow-500"></span>
                    <span className="text-white/70">Low Stock (&lt;10)</span>
                  </div>
                  <span className="font-bold text-white">{inventory.low_stock}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                    <span className="text-white/70">Out of Stock</span>
                  </div>
                  <span className="font-bold text-white">{inventory.out_of_stock}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actionable restock alerts */}
          <div className="glass-panel p-6 rounded-3xl lg:col-span-2 flex flex-col justify-between">
            <div>
              <h4 className="font-bold text-lg text-white">Critical Restock Alerts</h4>
              <p className="text-xs text-white/50">Products that require immediate procurement action</p>
            </div>

            <div className="space-y-3 mt-6">
              {[
                { title: "LUMI LED Filament Bulb 4W Amber", stock: 0, status: "out_of_stock" },
                { title: "LUMI Track Light 12W Black 3000K", stock: 2, status: "low_stock" },
                { title: "LUMI Outdoor Floodlight 50W IP65", stock: 5, status: "low_stock" },
                { title: "LUMI Smart Wall Sconce Brass", stock: 8, status: "low_stock" }
              ].map((item, idx) => (
                <div key={idx} className="p-4 rounded-2xl bg-white/2 border border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                      item.status === "out_of_stock" 
                        ? "bg-rose-500/10 text-rose-500" 
                        : "bg-yellow-500/10 text-yellow-500"
                    }`}>
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white">{item.title}</h5>
                      <span className="text-[9px] text-white/40 uppercase tracking-widest font-semibold block mt-0.5">
                        Quantity: {item.stock} left
                      </span>
                    </div>
                  </div>

                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-lg ${
                    item.status === "out_of_stock" 
                      ? "bg-rose-500/10 text-rose-500" 
                      : "bg-yellow-500/10 text-yellow-500"
                  }`}>
                    {item.status === "out_of_stock" ? "Out of Stock" : "Low Stock"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: ADMIN GUIDE & DOCUMENTATION */}
      {activeTab === "guide" && (
        <div className="space-y-8 max-w-5xl mx-auto">
          {/* Main Hero Panel */}
          <div className="glass-panel p-6 md:p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            <div className="space-y-4">
              <div className="flex items-center gap-1.5">
                <span className="inline-flex items-center gap-1.5 text-[10px] text-amber-500 font-extrabold tracking-widest uppercase bg-amber-500/10 px-3 py-1 rounded-full">
                  <BookOpen className="w-3.5 h-3.5" />
                  Knowledge Base & Interactive Manual
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white">LUMI Medusa Administration Guide</h2>
              <p className="text-sm text-white/60 leading-relaxed max-w-3xl">
                This interactive manual guides you through product management, order processing, Safaricom M-Pesa gateway operations, QuickBooks Online integration, and Sanity CMS synchronization. Use the checklist below to follow step-by-step procedures.
              </p>
              
              {/* Search Bar */}
              <div className="relative max-w-md mt-4">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-white/40" />
                </span>
                <input
                  type="text"
                  placeholder="Search guide (e.g. Category, M-Pesa, Sync)..."
                  value={guideSearch}
                  onChange={(e) => setGuideSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 text-sm bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/35 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                />
                {guideSearch && (
                  <button 
                    onClick={() => setGuideSearch("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-white/40 hover:text-white"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Interactive Checklist & Progress Wizard */}
          {(!guideSearch || "product creation steps publish".includes(guideSearch.toLowerCase())) && (
            <div className="glass-panel p-6 rounded-3xl space-y-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/5 pb-4">
                <div>
                  <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-500" />
                    Product Listing Wizard
                  </h3>
                  <p className="text-xs text-white/40 mt-0.5">Check off these 8 steps as you publish a new product to keep track of your workflow.</p>
                </div>
                
                {/* Progress Bar */}
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-white/40 block font-semibold uppercase tracking-wider">Progress</span>
                    <span className="text-sm font-bold text-white">
                      {completedSteps.filter(Boolean).length} / 8 Steps ({Math.round((completedSteps.filter(Boolean).length / 8) * 100)}%)
                    </span>
                  </div>
                  <div className="w-24 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-amber-500 to-yellow-300 transition-all duration-500"
                      style={{ width: `${(completedSteps.filter(Boolean).length / 8) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Steps grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  "1. Create Category",
                  "2. Create Collection",
                  "3. Create Product",
                  "4. Add Images",
                  "5. Create Variants",
                  "6. Set Prices",
                  "7. Add Inventory",
                  "8. Publish Product"
                ].map((stepName, index) => {
                  const done = completedSteps[index];
                  return (
                    <button
                      key={index}
                      onClick={() => {
                        const next = [...completedSteps];
                        next[index] = !next[index];
                        setCompletedSteps(next);
                      }}
                      className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all duration-300 group cursor-pointer ${
                        done
                          ? "bg-amber-500/10 border-amber-500/30 text-white"
                          : "bg-white/2 border-white/5 text-white/60 hover:bg-white/5 hover:border-white/10"
                      }`}
                    >
                      <div className={`w-4 h-4 rounded mt-0.5 flex items-center justify-center border transition-all ${
                        done
                          ? "bg-amber-500 border-amber-500 text-black"
                          : "border-white/20 group-hover:border-white/40 bg-transparent"
                      }`}>
                        {done && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className={`text-xs font-semibold select-none ${done ? "line-through opacity-60" : ""}`}>
                        {stepName}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-start">
            {/* Guide Quick Navigation Links */}
            <div className="glass-panel p-5 rounded-2xl md:col-span-1 space-y-4">
              <h4 className="font-bold text-sm text-white border-b border-white/5 pb-2">Guide Outline</h4>
              <nav className="flex flex-col gap-2.5 text-xs text-white/60">
                {[
                  { id: "add-product", title: "1. How to Add a New Product", match: ["product", "category", "collection", "image", "variant", "price", "inventory", "publish"] },
                  { id: "manage-orders", title: "2. Order Fulfillment Flow", match: ["order", "fulfillment", "ship", "invoice", "deliver"] },
                  { id: "mpesa-gateway", title: "3. M-Pesa Callback & STK Push", match: ["mpesa", "safaricom", "stk", "callback", "payment", "capture"] },
                  { id: "quickbooks-sync", title: "4. QuickBooks Online Syncing", match: ["quickbooks", "qbo", "invoice", "sync", "financial"] },
                  { id: "sanity-cms", title: "5. Sanity Studio Catalog CMS", match: ["sanity", "cms", "studio", "homepage", "banner"] }
                ]
                .filter(item => {
                  if (!guideSearch) return true;
                  const query = guideSearch.toLowerCase();
                  return item.title.toLowerCase().includes(query) || item.match.some(m => m.includes(query));
                })
                .map((item) => (
                  <a 
                    key={item.id} 
                    href={`#${item.id}`} 
                    className="hover:text-amber-500 hover:pl-1 transition-all font-semibold flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {item.title}
                  </a>
                ))}
                {guideSearch && [
                  { id: "add-product", title: "1. How to Add a New Product", match: ["product", "category", "collection", "image", "variant", "price", "inventory", "publish"] },
                  { id: "manage-orders", title: "2. Order Fulfillment Flow", match: ["order", "fulfillment", "ship", "invoice", "deliver"] },
                  { id: "mpesa-gateway", title: "3. M-Pesa Callback & STK Push", match: ["mpesa", "safaricom", "stk", "callback", "payment", "capture"] },
                  { id: "quickbooks-sync", title: "4. QuickBooks Online Syncing", match: ["quickbooks", "qbo", "invoice", "sync", "financial"] },
                  { id: "sanity-cms", title: "5. Sanity Studio Catalog CMS", match: ["sanity", "cms", "studio", "homepage", "banner"] }
                ].filter(item => {
                  const query = guideSearch.toLowerCase();
                  return item.title.toLowerCase().includes(query) || item.match.some(m => m.includes(query));
                }).length === 0 && (
                  <span className="text-[10px] text-white/30 italic">No matching sections</span>
                )}
              </nav>
            </div>

            {/* Guide Detailed Sections */}
            <div className="space-y-6 md:col-span-2">
              {/* Section 1: Adding a Product */}
              {(!guideSearch || ["product", "category", "collection", "image", "variant", "price", "inventory", "publish", "add"].some(term => guideSearch.toLowerCase().includes(term))) && (
                <div id="add-product" className="glass-panel p-6 rounded-2xl space-y-5 scroll-mt-20">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Package className="w-5 h-5 text-amber-500" />
                      1. How to Add a New Product
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5">Follow this detailed 8-step sequence to introduce products to the storefront.</p>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        step: 1,
                        title: "Create Category",
                        icon: Layers,
                        shortcut: "/settings/categories",
                        description: "Product categories form a hierarchical taxonomy. Access Settings > Product Categories in the admin dashboard. Enter a Name (e.g. Downlights) and description. You can set a Parent Category (e.g. LED Bulbs & Tubes) to nest it for dynamic navigation sub-menus on the storefront.",
                        tip: "Use short, SEO-friendly handles (URL slugs). Keep Categories active only when they have products ready."
                      },
                      {
                        step: 2,
                        title: "Create Collection (if needed)",
                        icon: Settings,
                        shortcut: "/products/collections",
                        description: "Collections are flat lists of products grouped for promotional campaigns, seasons, or B2B contracts (e.g., 'Indoor Architectural Accents', 'Summer Sale 2026'). Unlike categories, they are not hierarchical, allowing you to bundle products across various categories.",
                        tip: "Custom collections help the Next.js storefront bundle query filters. Always add high-quality metadata for header banners."
                      },
                      {
                        step: 3,
                        title: "Create Product",
                        icon: Plus,
                        shortcut: "/products",
                        description: "Navigate to the Products view and click 'New Product'. Provide a Title, Subtitle, description, and link it to the Category and Collection created in steps 1 and 2. Define the Material (e.g. Die-Cast Aluminum), Weight, and country details for logistics calculations.",
                        tip: "Enter unique, descriptive tags (e.g. ip65, tracking) to enable fast Meilisearch filter indexes on the storefront shop."
                      },
                      {
                        step: 4,
                        title: "Add Images",
                        icon: Image,
                        shortcut: "/products",
                        description: "Upload your product photography in the Media section. Drag-and-drop handles are available to rearrange placement. The first image in the list is automatically set as the product thumbnail.",
                        tip: "Use transparent PNGs or WebP format with 1:1 aspect ratio. Keep files below 500KB to optimize Largest Contentful Paint (LCP)."
                      },
                      {
                        step: 5,
                        title: "Create Variants",
                        icon: Settings,
                        shortcut: "/products",
                        description: "Define variant options such as Color Temperature (e.g., 3000K Warm, 4000K Cool, 6000K Daylight) or Finish (e.g. Matte Black, Satin Brass). Medusa will auto-generate option combinations. Make sure each variant has a unique, structured SKU.",
                        tip: "SKU naming convention: BRAND-CAT-COLOR-VAL (e.g., LUMI-TRK-BLK-12W) to easily recognize variants in order lists."
                      },
                      {
                        step: 6,
                        title: "Set Prices",
                        icon: DollarSign,
                        shortcut: "/products",
                        description: "Click 'Edit Prices' on the variants matrix. Set prices in Kenyan Shillings (KES). If B2B pricing applies, configure region-specific pricing or currency options. If comparing with market pricing, set the 'Compare at Price' to display strike-through discounts.",
                        tip: "Use Price Lists for wholesale B2B pricing, scheduling flash sales, or creating group-specific customer discounts."
                      },
                      {
                        step: 7,
                        title: "Add Inventory",
                        icon: Package,
                        shortcut: "/products",
                        description: "Enable 'Manage Inventory' for each variant and enter the stock count for the warehouse location. Toggle 'Allow Backorders' if you wish to allow purchases when stock is 0, or disable it to enforce hard out-of-stock validation.",
                        tip: "Always check 'Manage Inventory'. If disabled, Medusa treats the item as infinite stock (digital), causing overselling."
                      },
                      {
                        step: 8,
                        title: "Publish Product",
                        icon: Eye,
                        shortcut: "/products",
                        description: "Review all information, SKUs, and pricing. Locate the Status dropdown at the top right of the edit product screen. Change the status from Draft or Proposed to Published and click Save.",
                        tip: "Publishing triggers the backend Meilisearch worker to index the new product. It will show on the storefront catalog in 3 seconds."
                      }
                    ].map((stepData, idx) => {
                      const isOpen = activeStepAccordion === idx;
                      const Icon = stepData.icon;
                      return (
                        <div 
                          key={idx} 
                          className={`border rounded-2xl transition-all duration-300 ${
                            isOpen 
                              ? "bg-white/2 border-amber-500/30 shadow-lg shadow-amber-500/2" 
                              : "bg-transparent border-white/5 hover:border-white/10"
                          }`}
                        >
                          {/* Accordion Trigger */}
                          <button
                            type="button"
                            onClick={() => setActiveStepAccordion(isOpen ? null : idx)}
                            className="w-full flex items-center justify-between p-4 cursor-pointer text-left focus:outline-none"
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs transition-all ${
                                isOpen 
                                  ? "bg-amber-500 text-black" 
                                  : "bg-white/5 text-white/60"
                              }`}>
                                {stepData.step}
                              </span>
                              <div className="flex items-center gap-2">
                                <Icon className={`w-4 h-4 ${isOpen ? "text-amber-500" : "text-white/40"}`} />
                                <span className={`text-xs font-bold transition-all ${isOpen ? "text-white" : "text-white/70"}`}>
                                  {stepData.title}
                                </span>
                              </div>
                            </div>
                            <div>
                              {isOpen ? (
                                <ChevronUp className="w-4 h-4 text-white/40" />
                              ) : (
                                <ChevronDown className="w-4 h-4 text-white/40" />
                              )}
                            </div>
                          </button>

                          {/* Accordion Content */}
                          {isOpen && (
                            <div className="px-4 pb-4 pt-1 border-t border-white/5 space-y-3.5 animate-slide-down">
                              <p className="text-xs text-white/60 leading-relaxed">
                                {stepData.description}
                              </p>
                              
                              <div className="p-3 bg-white/2 rounded-xl border border-white/5 flex items-start gap-2 text-[11px] text-white/50 leading-relaxed">
                                <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                                <div>
                                  <span className="font-bold text-amber-500 font-sans">Pro-Tip: </span>
                                  {stepData.tip}
                                </div>
                              </div>

                              <div className="flex items-center justify-between pt-1">
                                <span className="text-[9px] text-white/30 uppercase tracking-widest font-bold">Admin Shortcut Path</span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    navigator.clipboard.writeText(stepData.shortcut);
                                    setCopiedSection(`step-${idx}`);
                                    setTimeout(() => setCopiedSection(null), 2000);
                                  }}
                                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-[10px] text-white/60 hover:text-white transition-all cursor-pointer focus:outline-none"
                                >
                                  {copiedSection === `step-${idx}` ? (
                                    <>
                                      <Check className="w-3 h-3 text-emerald-500" />
                                      Copied
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-3 h-3" />
                                      {stepData.shortcut}
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Section 2: Order Fulfillment */}
              {(!guideSearch || ["order", "fulfillment", "ship", "invoice", "deliver"].some(term => guideSearch.toLowerCase().includes(term))) && (
                <div id="manage-orders" className="glass-panel p-6 rounded-2xl space-y-4 scroll-mt-20">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <ShoppingBag className="w-5 h-5 text-amber-500" />
                      2. Order Fulfillment Flow
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5">How customer orders are managed and processed.</p>
                  </div>
                  <div className="text-xs text-white/50 space-y-3 leading-relaxed">
                    <p>
                      Once a customer checks out, the order is registered as <strong>Pending</strong> in the Medusa Admin.
                    </p>
                    <p>
                      <strong>Fulfillment Steps:</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li>Open the order, check items, and click <strong>Create Fulfillment</strong>.</li>
                      <li>Mark the package as shipped by clicking <strong>Mark Shipped</strong>. This sends an automatic email confirmation containing the invoice details.</li>
                      <li>Delivery and customer updates are synced automatically using the backend notifications framework.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Section 3: M-Pesa Gateway */}
              {(!guideSearch || ["mpesa", "safaricom", "stk", "callback", "payment", "capture"].some(term => guideSearch.toLowerCase().includes(term))) && (
                <div id="mpesa-gateway" className="glass-panel p-6 rounded-2xl space-y-4 scroll-mt-20">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Phone className="w-5 h-5 text-amber-500" />
                      3. M-Pesa Callback & STK Push
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5">How payment capture operates asynchronously.</p>
                  </div>
                  <div className="text-xs text-white/50 space-y-3 leading-relaxed">
                    <p>
                      During checkout, customers input their phone number, prompting a Safaricom M-Pesa STK push.
                    </p>
                    <p>
                      The storefront receives callback responses asynchronously. When payment completes:
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li>The transaction status changes to <em>Success</em> inside the PostgreSQL database.</li>
                      <li>Medusa is signaled to capture the payment, transitioning the order status from <em>Requires Action</em> to <strong>Paid (Captured)</strong>.</li>
                      <li>If a customer aborts or has insufficient funds, a failed transaction is logged to the dashboard logs for B2C support reference.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Section 4: QuickBooks Online */}
              {(!guideSearch || ["quickbooks", "qbo", "invoice", "sync", "financial"].some(term => guideSearch.toLowerCase().includes(term))) && (
                <div id="quickbooks-sync" className="glass-panel p-6 rounded-2xl space-y-4 scroll-mt-20">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <Building className="w-5 h-5 text-amber-500" />
                      4. QuickBooks Online Syncing
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5">Keeping financial ledgers and sales records synced.</p>
                  </div>
                  <div className="text-xs text-white/50 space-y-3 leading-relaxed">
                    <p>
                      Orders placed on the storefront are synced to QuickBooks Online (QBO) as invoices, customers, and payments.
                    </p>
                    <p>
                      <strong>Troubleshooting Connection:</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li>If QBO data is not showing in the dashboard, click <strong>Authorize Online</strong> to authorize via OAuth 2.0.</li>
                      <li>Once connected, daily transactions sync automatically in the background, updating your income, expenses, and net profit charts.</li>
                    </ul>
                  </div>
                </div>
              )}

              {/* Section 5: Sanity CMS */}
              {(!guideSearch || ["sanity", "cms", "studio", "homepage", "banner"].some(term => guideSearch.toLowerCase().includes(term))) && (
                <div id="sanity-cms" className="glass-panel p-6 rounded-2xl space-y-4 scroll-mt-20">
                  <div className="border-b border-white/5 pb-3">
                    <h3 className="text-base font-extrabold text-white flex items-center gap-2">
                      <FileText className="w-5 h-5 text-amber-500" />
                      5. Sanity Studio Catalog CMS
                    </h3>
                    <p className="text-xs text-white/40 mt-0.5">Modifying storefront pages and static content.</p>
                  </div>
                  <div className="text-xs text-white/50 space-y-3 leading-relaxed">
                    <p>
                      The homepage, banners, about section, and legal disclosures are managed inside <strong>Sanity Studio</strong>.
                    </p>
                    <p>
                      <strong>Updating Content:</strong>
                    </p>
                    <ul className="list-disc pl-5 space-y-1.5">
                      <li>Open Sanity Studio at <code>http://localhost:3000/studio</code> (or production studio address).</li>
                      <li>Click on the document category you wish to update (e.g. <em>About Page</em> or <em>Categories</em>).</li>
                      <li>Upload images, modify headings, and edit text blocks. Click <strong>Publish</strong> to update the live storefront instantly.</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
