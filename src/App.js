import React, { useState, useMemo, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Shield, AlertTriangle, DollarSign, Users, Building, Lock, Mail, Eye, CheckCircle, Calculator, Info } from 'lucide-react';

// Constants for better maintainability
const SECURITY_WEIGHTS = {
  BACKUPS: 0.15,
  MFA: 0.2,
  PHISHING_TRAINING: 0.15,
  VENDOR_REVIEWS: 0.25,
  IR_TABLETOP: 0.1,
  BASE_SECURITY: 0.15
};

const CHART_COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316', '#a855f7', '#06b6d4', '#84cc16'];

const COST_CATEGORIES = [
  { name: 'Emergency IT/Forensics', baseCost: 85000, icon: '🔧' },
  { name: 'Legal/Compliance', baseCost: 120000, icon: '⚖️' },
  { name: 'PR/Client Communications', baseCost: 45000, icon: '📢' },
  { name: 'Revenue Loss', baseCost: 180000, icon: '📉' },
  { name: 'Temporary Systems', baseCost: 60000, icon: '💻' },
  { name: 'Staff Overtime', baseCost: 40000, icon: '⏰' },
  { name: 'Client Churn', baseCost: 390000, icon: '👥' },
  { name: 'Insurance Premium Increase', baseCost: 25000, icon: '🛡️' },
  { name: 'Security Overhaul', baseCost: 150000, icon: '🔒' },
  { name: 'Regulatory Fines', baseCost: 75000, icon: '📋' },
  { name: 'Audit Costs', baseCost: 30000, icon: '🔍' }
];

const THREAT_SCENARIOS = [
  {
    name: 'Phishing',
    baseCost: 300000,
    frequency: 0.3,
    severity: 0.7,
    color: CHART_COLORS[0]
  },
  {
    name: 'Ransomware',
    baseCost: 800000,
    frequency: 0.15,
    severity: 0.9,
    color: CHART_COLORS[1]
  },
  {
    name: 'Vendor Breach',
    baseCost: 450000,
    frequency: 0.2,
    severity: 0.6,
    color: CHART_COLORS[2]
  }
];

const INPUT_LIMITS = {
  employees: { min: 1, max: 1000000 },
  revenue: { min: 0, max: 100000000000 },
  insurance: { min: 0, max: 50000000 }
};

// Improved percentile calculation for more realistic cyber risk distributions
const generateRealisticPercentiles = (baseCost, organizationFactors) => {
  // Cyber losses typically follow log-normal distribution with long tail
  const { sizeFactor, revenueFactor, riskReduction } = organizationFactors;
  
  const adjustedBase = baseCost * sizeFactor * revenueFactor * (1 - riskReduction);
  
  // Log-normal distribution parameters for cyber incidents
  const baseVariance = adjustedBase * 0.6;
  const longTailFactor = 1.8; // Cyber events have significant long tail risk
  
  return {
    '5th': Math.round(Math.max(adjustedBase * 0.15, adjustedBase - baseVariance * 1.5)),
    '25th': Math.round(adjustedBase * 0.55),
    'Median': Math.round(adjustedBase),
    '75th': Math.round(adjustedBase * 1.65),
    '95th': Math.round(adjustedBase * longTailFactor * 2.2) // Significant long tail for worst-case scenarios
  };
};

const FairRiskCalculator = () => {
  const [inputs, setInputs] = useState({
    employees: 250,
    revenue: 50000000,
    insurance: 1000000,
    backupsIsolated: true,
    mfaEnabled: true,
    phishingTraining: true,
    vendorReviews: true,
    irTabletop: true
  });

  const [activeTab, setActiveTab] = useState('instructions');
  const [inputErrors, setInputErrors] = useState({});

  // Validation function
  const validateInput = useCallback((field, value) => {
    const limits = INPUT_LIMITS[field];
    if (!limits) return true;
    
    if (value < limits.min || value > limits.max) {
      setInputErrors(prev => ({
        ...prev,
        [field]: `Value must be between ${limits.min.toLocaleString()} and ${limits.max.toLocaleString()}`
      }));
      return false;
    }
    
    setInputErrors(prev => {
      const newErrors = { ...prev };
      delete newErrors[field];
      return newErrors;
    });
    return true;
  }, []);

  // Improved input handler with validation
  const handleInputChange = useCallback((field, value) => {
    if (typeof value === 'number' && !validateInput(field, value)) {
      return;
    }
    setInputs(prev => ({ ...prev, [field]: value }));
  }, [validateInput]);

  // Enhanced risk calculation with improved methodology
  const results = useMemo(() => {
    try {
      // Security score calculation
      const securityScore = (
        (inputs.backupsIsolated ? SECURITY_WEIGHTS.BACKUPS : 0) +
        (inputs.mfaEnabled ? SECURITY_WEIGHTS.MFA : 0) +
        (inputs.phishingTraining ? SECURITY_WEIGHTS.PHISHING_TRAINING : 0) +
        (inputs.vendorReviews ? SECURITY_WEIGHTS.VENDOR_REVIEWS : 0) +
        (inputs.irTabletop ? SECURITY_WEIGHTS.IR_TABLETOP : 0) +
        SECURITY_WEIGHTS.BASE_SECURITY
      );

      // Company size and revenue factors with improved scaling
      const sizeFactor = Math.max(1, Math.log10(Math.max(inputs.employees, 10) / 100) * 0.2 + 1);
      const revenueFactor = Math.max(1, Math.log10(Math.max(inputs.revenue, 1000000) / 10000000) * 0.15 + 1);

      // Risk reduction from security controls with more realistic caps
      const riskReduction = Math.min(securityScore * 0.65, 0.75); // Cap at 75% reduction (more realistic)

      const organizationFactors = { sizeFactor, revenueFactor, riskReduction };

      // Enhanced scenario modeling with realistic distributions
      const scenarios = THREAT_SCENARIOS.map(scenario => {
        const percentiles = generateRealisticPercentiles(scenario.baseCost, organizationFactors);
        
        return {
          ...scenario,
          percentiles
        };
      });

      // Calculate cost breakdown with enhanced control effectiveness
      const adjustedCosts = COST_CATEGORIES.map((category, index) => {
        let reductionFactor = 0;
        
        // Apply specific reductions based on controls with more realistic factors
        if (category.name === 'Emergency IT/Forensics' && inputs.backupsIsolated) reductionFactor += 0.35;
        if (category.name === 'Revenue Loss' && inputs.mfaEnabled) reductionFactor += 0.25;
        if (category.name === 'Client Churn' && inputs.phishingTraining) reductionFactor += 0.30;
        if (category.name === 'Regulatory Fines' && inputs.vendorReviews) reductionFactor += 0.45;
        if (category.name === 'Staff Overtime' && inputs.irTabletop) reductionFactor += 0.40;
        
        // Cross-control synergies (controls work better together)
        const enabledControls = [
          inputs.backupsIsolated, inputs.mfaEnabled, inputs.phishingTraining, 
          inputs.vendorReviews, inputs.irTabletop
        ].filter(Boolean).length;
        
        const synergyBonus = enabledControls >= 4 ? 0.15 : enabledControls >= 3 ? 0.10 : 0;
        reductionFactor = Math.min(reductionFactor + synergyBonus, 0.70); // Cap individual reductions
        
        const adjustedCost = category.baseCost * (1 - reductionFactor) * sizeFactor;
        
        return {
          ...category,
          reductionFactor,
          adjustedCost: Math.round(adjustedCost),
          color: CHART_COLORS[index % CHART_COLORS.length]
        };
      });

      const totalCost = adjustedCosts.reduce((sum, cat) => sum + cat.adjustedCost, 0);

      return {
        scenarios,
        costBreakdown: adjustedCosts,
        totalCost,
        securityScore: Math.round(securityScore * 100),
        riskReduction: Math.round(riskReduction * 100)
      };
    } catch (error) {
      console.error('Risk calculation error:', error);
      return null;
    }
  }, [inputs]);

  const formatCurrency = useCallback((amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }, []);

  // Memoized chart data
  const chartData = useMemo(() => {
    if (!results) return [];
    return results.scenarios.flatMap(scenario => 
      Object.entries(scenario.percentiles).map(([percentile, value]) => ({
        scenario: scenario.name,
        percentile,
        value: Math.round(value),
        color: scenario.color
      }))
    );
  }, [results]);

  const pieData = useMemo(() => {
    if (!results) return [];
    return results.costBreakdown.slice(0, 6).map(cat => ({
      name: cat.name.split('/')[0],
      value: cat.adjustedCost,
      color: cat.color
    }));
  }, [results]);

  // Custom Toggle Component
  const Toggle = ({ checked, onChange, label, id }) => (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
      <label htmlFor={id} className="flex items-center gap-3 text-sm font-medium text-gray-700 cursor-pointer">
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
          aria-describedby={`${id}-description`}
        />
        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600 cursor-pointer"></div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-1">
              <img 
                src="/inp2-logo.png" 
                alt="INP2 Logo" 
                className="w-10 h-10 object-contain"
                onLoad={() => console.log('Logo loaded successfully')}
                onError={(e) => {
                  console.log('Logo failed to load from:', e.target.src);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
              <div className="bg-blue-600 p-2 rounded-lg items-center justify-center" style={{display: 'none'}}>
                <Shield className="w-6 h-6 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cybersecurity Risk Calculator</h1>
              <p className="text-gray-600">Executive Risk Assessment Tool • FAIR-Inspired Methodology</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Navigation Tabs */}
        <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-8">
          {[
            { id: 'instructions', label: 'How to Use', icon: Eye },
            { id: 'inputs', label: 'Inputs', icon: Calculator },
            { id: 'results', label: 'Risk Analysis', icon: AlertTriangle },
            { id: 'breakdown', label: 'Cost Breakdown', icon: DollarSign },
            { id: 'summary', label: 'Executive Summary', icon: Shield }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
              aria-pressed={activeTab === tab.id}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        {/* Instructions Tab */}
        {activeTab === 'instructions' && (
          <div className="space-y-8">
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white rounded-xl p-8">
              <div className="max-w-4xl">
                <h2 className="text-3xl font-bold mb-4">Welcome to the Cybersecurity Risk Calculator</h2>
                <p className="text-blue-100 text-lg leading-relaxed">
                  This executive-focused tool helps business leaders understand and quantify their organization's cybersecurity risks using a 
                  simplified methodology inspired by industry-standard FAIR (Factor Analysis of Information Risk) practices. Get data-driven insights to make informed 
                  security investment decisions in minutes, not months.
                </p>
              </div>
            </div>

            {/* Methodology Note */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                <Info className="w-5 h-5" />
                About Our Methodology
              </h3>
              <div className="text-blue-700 space-y-3">
                <p>
                  This tool uses a simplified risk quantification approach inspired by the Factor Analysis of Information Risk (FAIR) methodology, 
                  combined with statistical modeling techniques. Our approach is designed specifically for executive decision-making, prioritizing clarity and actionability over academic complexity.
                </p>
                <p>
                  <strong>Key Features:</strong> Financial impact estimation, security control effectiveness modeling, industry-benchmarked cost categories, and statistical distribution analysis for realistic risk ranges.
                </p>
                <p>
                  <strong>Best Use:</strong> Strategic planning, budget justification, board presentations, insurance coverage decisions, and security investment prioritization.
                </p>
              </div>
            </div>

            {/* What This Tool Does */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <Shield className="w-6 h-6 text-blue-600" />
                What This Tool Does
              </h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-100 p-2 rounded-lg mt-1">
                      <DollarSign className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Quantifies Financial Impact</h4>
                      <p className="text-gray-600">Estimates the potential cost of cyber incidents based on your organization's specific characteristics, security posture, and industry data.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-2 rounded-lg mt-1">
                      <Shield className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Measures Security Effectiveness</h4>
                      <p className="text-gray-600">Shows how your current security controls reduce risk and provides a security score with concrete ROI calculations.</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-100 p-2 rounded-lg mt-1">
                      <AlertTriangle className="w-5 h-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Models Risk Scenarios</h4>
                      <p className="text-gray-600">Analyzes common threat scenarios like ransomware, phishing, and vendor breaches with realistic probability distributions.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="bg-orange-100 p-2 rounded-lg mt-1">
                      <Eye className="w-5 h-5 text-orange-600" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Supports Executive Decisions</h4>
                      <p className="text-gray-600">Provides board-ready insights to justify security investments, insurance decisions, and strategic risk management.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* How to Use This Tool */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <Calculator className="w-6 h-6 text-green-600" />
                How to Use This Tool
              </h3>

              <div className="space-y-6">
                <div className="border-l-4 border-blue-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Step 1: Enter Organization Information</h4>
                  <p className="text-gray-700 mb-3">Click the "Inputs" tab and provide basic information about your organization:</p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <strong>Number of Employees:</strong> Your total workforce (affects scale of potential impact)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <strong>Annual Revenue:</strong> Your organization's yearly revenue (influences risk calculations)
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <strong>Cyber Insurance Coverage:</strong> Your current cyber insurance policy limit
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-green-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Step 2: Assess Security Controls</h4>
                  <p className="text-gray-700 mb-3">Toggle each security control based on what your organization currently has in place:</p>
                  <ul className="space-y-2 text-gray-600">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <strong>Backups Isolated from Network:</strong> Do you have offline or air-gapped backups?
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <strong>Multi-Factor Authentication:</strong> Is MFA required for accessing systems?
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <strong>Phishing Training:</strong> Do employees receive regular security awareness training?
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <strong>Vendor Security Reviews:</strong> Do you evaluate vendors' security practices?
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <strong>Incident Response Exercises:</strong> Do you practice incident response scenarios?
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-purple-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Step 3: Review Risk Analysis</h4>
                  <p className="text-gray-700">Click the "Risk Analysis" tab to see:</p>
                  <ul className="space-y-2 text-gray-600 mt-3">
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Your total risk exposure with statistical confidence ranges
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      How much risk your security controls are reducing
                    </li>
                    <li className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      Risk scenarios for different types of cyber attacks
                    </li>
                  </ul>
                </div>

                <div className="border-l-4 border-orange-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Step 4: Examine Cost Breakdown</h4>
                  <p className="text-gray-700">The "Cost Breakdown" tab shows where costs come from during a cyber incident, helping you understand which areas are most expensive and how controls reduce specific cost categories.</p>
                </div>

                <div className="border-l-4 border-red-500 pl-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-2">Step 5: Use Executive Summary</h4>
                  <p className="text-gray-700">The "Executive Summary" tab provides a high-level overview perfect for board presentations, strategic discussions, and stakeholder communications.</p>
                </div>
              </div>
            </div>

            {/* Understanding Your Results */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                <Eye className="w-6 h-6 text-purple-600" />
                Understanding Your Results
              </h3>

              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Key Metrics to Focus On</h4>
                  <div className="space-y-4">
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                      <h5 className="font-semibold text-red-800">Total Risk Exposure</h5>
                      <p className="text-red-700 text-sm">The estimated median cost of a cyber incident. Use the percentile ranges to understand best-case and worst-case scenarios for planning.</p>
                    </div>
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <h5 className="font-semibold text-green-800">Risk Reduction Percentage</h5>
                      <p className="text-green-700 text-sm">Shows how effective your current security measures are. Higher percentages indicate better ROI on security investments.</p>
                    </div>
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <h5 className="font-semibold text-blue-800">Security Score</h5>
                      <p className="text-blue-700 text-sm">A percentage indicating your overall security posture. Use this to track improvements over time and benchmark against targets.</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Taking Action on Results</h4>
                  <div className="space-y-3">
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">If your insurance coverage is less than 75th percentile risk:</p>
                        <p className="text-gray-600 text-sm">Consider increasing your cyber insurance limits or improving security controls to reduce exposure.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">If your security score is below 75%:</p>
                        <p className="text-gray-600 text-sm">Prioritize implementing missing security controls. The tool shows specific reductions for each control.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                      <div>
                        <p className="font-medium text-gray-900">Use cost breakdown data:</p>
                        <p className="text-gray-600 text-sm">Focus security investments on areas with highest potential costs and greatest reduction opportunities.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Important Notes */}
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-amber-800 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" />
                Important Notes
              </h3>
              <div className="space-y-3 text-amber-700">
                <p>• This tool provides strategic estimates based on industry data and statistical models. Actual incident costs can vary significantly based on specific circumstances.</p>
                <p>• Results should be used as one factor in security decision-making, alongside other risk assessments, compliance requirements, and expert advice.</p>
                <p>• Regular updates to your inputs (annually or after major changes) will provide the most accurate risk picture for ongoing planning.</p>
                <p>• Consider consulting with cybersecurity professionals for detailed security implementation and incident response planning.</p>
                <p>• This tool is designed for strategic planning and should complement, not replace, detailed technical risk assessments.</p>
              </div>
            </div>

            {/* Ready to Start */}
            <div className="bg-gradient-to-r from-green-600 to-green-800 text-white rounded-xl p-8 text-center">
              <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
              <p className="text-green-100 text-lg mb-6">
                Click the "Inputs" tab above to begin your cybersecurity risk assessment. 
                The entire process takes just 5-10 minutes and provides immediate strategic insights.
              </p>
              <button
                onClick={() => setActiveTab('inputs')}
                className="bg-white text-green-800 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Start Your Risk Assessment
              </button>
            </div>
          </div>
        )}

        {/* Inputs Tab */}
        {activeTab === 'inputs' && (
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Organization Info */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Building className="w-5 h-5 text-blue-600" />
                Organization Information
              </h3>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="employees" className="block text-sm font-medium text-gray-700 mb-2">
                    <Users className="w-4 h-4 inline mr-2" />
                    Number of Employees
                  </label>
                  <input
                    id="employees"
                    type="number"
                    value={inputs.employees}
                    onChange={(e) => handleInputChange('employees', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      inputErrors.employees ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="250"
                    min={INPUT_LIMITS.employees.min}
                    max={INPUT_LIMITS.employees.max}
                    aria-describedby={inputErrors.employees ? 'employees-error' : undefined}
                  />
                  {inputErrors.employees && (
                    <p id="employees-error" className="text-red-500 text-sm mt-1">{inputErrors.employees}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="revenue" className="block text-sm font-medium text-gray-700 mb-2">
                    <DollarSign className="w-4 h-4 inline mr-2" />
                    Annual Revenue ($)
                  </label>
                  <input
                    id="revenue"
                    type="number"
                    value={inputs.revenue}
                    onChange={(e) => handleInputChange('revenue', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      inputErrors.revenue ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="50000000"
                    min={INPUT_LIMITS.revenue.min}
                    max={INPUT_LIMITS.revenue.max}
                    aria-describedby={inputErrors.revenue ? 'revenue-error' : undefined}
                  />
                  {inputErrors.revenue && (
                    <p id="revenue-error" className="text-red-500 text-sm mt-1">{inputErrors.revenue}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="insurance" className="block text-sm font-medium text-gray-700 mb-2">
                    <Shield className="w-4 h-4 inline mr-2" />
                    Cyber Insurance Coverage ($)
                  </label>
                  <input
                    id="insurance"
                    type="number"
                    value={inputs.insurance}
                    onChange={(e) => handleInputChange('insurance', parseInt(e.target.value) || 0)}
                    className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                      inputErrors.insurance ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="1000000"
                    min={INPUT_LIMITS.insurance.min}
                    max={INPUT_LIMITS.insurance.max}
                    aria-describedby={inputErrors.insurance ? 'insurance-error' : undefined}
                  />
                  {inputErrors.insurance && (
                    <p id="insurance-error" className="text-red-500 text-sm mt-1">{inputErrors.insurance}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Security Controls */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Lock className="w-5 h-5 text-green-600" />
                Security Controls Assessment
              </h3>
              
              <div className="space-y-4">
                <Toggle
                  id="backups"
                  checked={inputs.backupsIsolated}
                  onChange={(e) => handleInputChange('backupsIsolated', e.target.checked)}
                  label={
                    <>
                      <Shield className="w-4 h-4 text-blue-600" />
                      Backups Isolated from Network
                    </>
                  }
                />
                
                <Toggle
                  id="mfa"
                  checked={inputs.mfaEnabled}
                  onChange={(e) => handleInputChange('mfaEnabled', e.target.checked)}
                  label={
                    <>
                      <Lock className="w-4 h-4 text-blue-600" />
                      Multi-Factor Authentication Enabled
                    </>
                  }
                />
                
                <Toggle
                  id="phishing"
                  checked={inputs.phishingTraining}
                  onChange={(e) => handleInputChange('phishingTraining', e.target.checked)}
                  label={
                    <>
                      <Mail className="w-4 h-4 text-blue-600" />
                      Regular Phishing Training
                    </>
                  }
                />
                
                <Toggle
                  id="vendor"
                  checked={inputs.vendorReviews}
                  onChange={(e) => handleInputChange('vendorReviews', e.target.checked)}
                  label={
                    <>
                      <Eye className="w-4 h-4 text-blue-600" />
                      Vendor Security Reviews Conducted
                    </>
                  }
                />
                
                <Toggle
                  id="ir"
                  checked={inputs.irTabletop}
                  onChange={(e) => handleInputChange('irTabletop', e.target.checked)}
                  label={
                    <>
                      <CheckCircle className="w-4 h-4 text-blue-600" />
                      Incident Response Tabletop Exercises
                    </>
                  }
                />
              </div>

              {results && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-800">Security Score</span>
                    <span className="text-2xl font-bold text-blue-600">{results.securityScore}%</span>
                  </div>
                  <div className="mt-2 w-full bg-blue-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${results.securityScore}%` }}
                      role="progressbar"
                      aria-valuenow={results.securityScore}
                      aria-valuemin={0}
                      aria-valuemax={100}
                      aria-label={`Security score: ${results.securityScore}%`}
                    ></div>
                  </div>
                  <p className="text-xs text-blue-700 mt-2">
                    This score reflects the effectiveness of your current security controls in reducing cyber risk.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Results Tab */}
        {activeTab === 'results' && results && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Median Risk Exposure</p>
                    <p className="text-3xl font-bold text-red-600">{formatCurrency(results.totalCost)}</p>
                    <p className="text-xs text-gray-500 mt-1">Expected incident cost</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Risk Reduction</p>
                    <p className="text-3xl font-bold text-green-600">{results.riskReduction}%</p>
                    <p className="text-xs text-gray-500 mt-1">From security controls</p>
                  </div>
                  <Shield className="w-8 h-8 text-green-500" />
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Insurance Coverage</p>
                    <p className="text-3xl font-bold text-blue-600">{formatCurrency(inputs.insurance)}</p>
                    <p className="text-xs text-gray-500 mt-1">Current policy limit</p>
                  </div>
                  <DollarSign className="w-8 h-8 text-blue-500" />
                </div>
              </div>
            </div>

            {/* Risk Scenarios Chart */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Risk Scenario Analysis - Statistical Distribution</h3>
              <p className="text-gray-600 text-sm mb-4">
                This chart shows the range of potential costs for different cyber threat scenarios based on statistical modeling of incident data.
              </p>
              
              <div className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="percentile" />
                    <YAxis tickFormatter={(value) => `$${(value / 1000).toFixed(0)}K`} />
                    <Tooltip formatter={(value) => [formatCurrency(value), 'Cost']} />
                    <Bar dataKey="value" fill="#3b82f6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Detailed Scenarios */}
            <div className="grid md:grid-cols-3 gap-6">
              {results.scenarios.map((scenario, index) => (
                <div key={scenario.name} className="bg-white rounded-xl shadow-lg p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">{scenario.name} Attack</h4>
                  <div className="space-y-3">
                    {Object.entries(scenario.percentiles).map(([percentile, value]) => (
                      <div key={percentile} className="flex justify-between">
                        <span className="text-sm text-gray-600">{percentile} Percentile</span>
                        <span className="font-medium">{formatCurrency(value)}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-3 border-t border-gray-200">
                    <p className="text-xs text-gray-500">
                      Range from best-case (5th) to worst-case (95th) outcomes
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost Breakdown Tab */}
        {activeTab === 'breakdown' && results && (
          <div className="space-y-8">
            {/* Cost Distribution Chart */}
            <div className="grid lg:grid-cols-2 gap-8">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Cost Distribution</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${formatCurrency(value)}`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Cost Categories Table */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-6">Cost Categories & Control Impact</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {results.costBreakdown.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <span className="text-lg">{category.icon}</span>
                        <div>
                          <p className="font-medium text-gray-900">{category.name}</p>
                          {category.reductionFactor > 0 && (
                            <p className="text-sm text-green-600">
                              -{Math.round(category.reductionFactor * 100)}% reduction from controls
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(category.adjustedCost)}</p>
                        {category.reductionFactor > 0 && (
                          <p className="text-sm text-gray-500 line-through">{formatCurrency(category.baseCost)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Total Estimated Impact</h3>
                  <p className="text-sm text-gray-600 mt-1">Median cost per cyber incident after applying security control reductions</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-bold text-red-600">{formatCurrency(results.totalCost)}</p>
                  <p className="text-sm text-gray-600">Per incident</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Executive Summary Tab */}
        {activeTab === 'summary' && results && (
          <div className="space-y-8">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <Eye className="w-6 h-6 text-blue-600" />
                Executive Summary
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-blue-900 mb-2">Current Risk Profile</h4>
                  <p className="text-blue-800">
                    Based on your organization's profile ({inputs.employees.toLocaleString()} employees, {formatCurrency(inputs.revenue)} revenue) 
                    and current security measures, the median cost of a cyber incident is estimated at <strong>{formatCurrency(results.totalCost)}</strong>. 
                    Worst-case scenarios could reach significantly higher amounts.
                  </p>
                </div>
                <div className="bg-gradient-to-r from-green-50 to-green-100 p-6 rounded-lg">
                  <h4 className="text-lg font-semibold text-green-900 mb-2">Security Control Effectiveness</h4>
                  <p className="text-green-800">
                    Your current security controls provide a <strong>{results.riskReduction}% reduction</strong> in potential 
                    incident costs. This represents significant ROI on security investments, with each control providing 
                    measurable risk reduction.
                  </p>
                </div>
              </div>

              {/* Risk Analysis */}
              <div className="bg-gray-50 p-6 rounded-lg mb-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Strategic Risk Assessment</h4>
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Key Risk Drivers</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li>• Organization size: {inputs.employees.toLocaleString()} employees</li>
                      <li>• Revenue exposure: {formatCurrency(inputs.revenue)}</li>
                      <li>• Security maturity: {results.securityScore}% score</li>
                      <li>• Control coverage: {[inputs.backupsIsolated, inputs.mfaEnabled, inputs.phishingTraining, inputs.vendorReviews, inputs.irTabletop].filter(Boolean).length}/5 implemented</li>
                    </ul>
                  </div>
                  <div>
                    <h5 className="font-medium text-gray-800 mb-2">Risk Scenarios</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {results.scenarios.map((scenario, index) => (
                        <li key={index}>• {scenario.name}: {formatCurrency(scenario.percentiles.Median)} median cost</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Insurance Gap Analysis */}
              {inputs.insurance < results.totalCost && (
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                  <h5 className="font-semibold text-amber-800 mb-2">⚠️ Insurance Coverage Gap Identified</h5>
                  <p className="text-amber-700">
                    Your current cyber insurance coverage of {formatCurrency(inputs.insurance)} may not fully cover 
                    the estimated median incident costs of {formatCurrency(results.totalCost)}. Gap: {formatCurrency(results.totalCost - inputs.insurance)}.
                    Consider reviewing your coverage limits or implementing additional security controls to reduce exposure.
                  </p>
                </div>
              )}

              {/* Recommendations */}
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h4 className="text-lg font-semibold text-gray-900 mb-4">Strategic Recommendations</h4>
                <div className="space-y-4">
                  {results.securityScore < 75 && (
                    <div className="flex items-start gap-3">
                      <div className="bg-red-100 p-1 rounded">
                        <AlertTriangle className="w-4 h-4 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Priority: Improve Security Controls</p>
                        <p className="text-gray-600 text-sm">Security score of {results.securityScore}% indicates opportunity for improvement. 
                        Focus on implementing missing controls to reduce risk exposure.</p>
                      </div>
                    </div>
                  )}
                  
                  {inputs.insurance < results.totalCost * 1.5 && (
                    <div className="flex items-start gap-3">
                      <div className="bg-blue-100 p-1 rounded">
                        <Shield className="w-4 h-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">Consider: Insurance Coverage Review</p>
                        <p className="text-gray-600 text-sm">Current coverage may be insufficient for worst-case scenarios. 
                        Evaluate increasing limits to at least 75th percentile risk levels.</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-start gap-3">
                    <div className="bg-green-100 p-1 rounded">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">Regular Assessment</p>
                      <p className="text-gray-600 text-sm">Update this assessment annually or after significant changes to 
                      maintain accurate risk visibility for strategic planning.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Footer Disclaimer */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        <div className="bg-gray-50 rounded-lg p-4 text-center">
          <p className="text-xs text-gray-600">
            <strong>Professional Disclaimer:</strong> This educational tool provides strategic risk estimates using simplified methodology 
            inspired by industry-standard FAIR practices. Actual incident costs vary significantly based on specific circumstances, industry, 
            geography, and regulatory requirements. Results should complement, not replace, comprehensive risk assessments and professional advice.
          </p>
           <p className="text-xs text-gray-600 mt-2">
      © 2025 INP² All rights reserved.
      <br /> This Cybersecurity Risk Calculator and its underlying methodologies are proprietary to INP². No part of this tool may be reproduced, distributed, or used for commercial purposes without explicit written permission.
    </p>
        </div>
      </div>
    </div>
  );
};

export default FairRiskCalculator;
