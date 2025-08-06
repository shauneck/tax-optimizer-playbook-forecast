import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import html2pdf from 'html2pdf.js';
import { ChevronDown, ArrowLeft, Calendar, Download, ChevronUp, Info, BarChart3, Target, TrendingUp, RefreshCw, CheckCircle2, AlertCircle, Users, BookOpen, ExternalLink } from 'lucide-react';
import { strategyMatcher } from './utils/strategyMatcher';
import StrategyModal from './components/StrategyModal';

// Enhanced Tooltip component for assumptions - Fixed hover flicker
const AssumptionsTooltip = ({ children }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClickMode, setIsClickMode] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVisible && isClickMode && !event.target.closest('.assumptions-tooltip')) {
        setIsVisible(false);
        setIsClickMode(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isVisible, isClickMode]);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsClickMode(true);
    setIsVisible(!isVisible);
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isClickMode) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isClickMode) {
      setIsVisible(false);
    }
  };

  return (
    <div 
      className="relative inline-block assumptions-tooltip group"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        className="inline-flex items-center justify-center w-6 h-6 ml-2 text-xl text-emerald-500 hover:opacity-80 transition-opacity duration-150 rounded-full hover:bg-emerald-50"
        aria-label="Show assumptions"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isVisible && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={() => setIsVisible(false)} />
          )}
          
          {/* Tooltip */}
          <div className={`absolute z-50 w-80 max-w-sm p-4 bg-white border border-gray-200 rounded-md shadow-lg transition-opacity duration-200 ease-in-out ${
            isMobile 
              ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' 
              : '-top-2 -left-32'
          }`}>
            {/* Arrow indicator for desktop */}
            {!isMobile && (
              <div className="absolute top-4 right-4 transform rotate-45 w-2 h-2 bg-white border-l border-b border-gray-200"></div>
            )}
            
            {/* Close button for mobile or click mode */}
            {(isMobile || isClickMode) && (
              <button
                onClick={() => {
                  setIsVisible(false);
                  setIsClickMode(false);
                }}
                className="absolute top-2 right-2 w-6 h-6 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            <div className="text-sm font-semibold text-gray-900 mb-3">Wealth Multiplier Assumptions</div>
            <div className="text-sm text-gray-600 space-y-2">
              <div>• Tax savings remain consistent over time</div>
              <div>• 100% of savings are reinvested annually</div>
              <div>• Reinvested savings compound at your selected return rate</div>
              <div>• Real estate income is offset by depreciation to remain tax efficient</div>
              <div>• All recommended strategies are implemented starting in Year 1</div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// Simple tooltip component for lifetime wealth impact
const WealthImpactTooltip = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isClickMode, setIsClickMode] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVisible && isClickMode && !event.target.closest('.wealth-impact-tooltip')) {
        setIsVisible(false);
        setIsClickMode(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isVisible, isClickMode]);

  const handleClick = (e) => {
    e.stopPropagation();
    setIsClickMode(true);
    setIsVisible(!isVisible);
  };

  const handleMouseEnter = () => {
    if (!isMobile && !isClickMode) {
      setIsVisible(true);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile && !isClickMode) {
      setIsVisible(false);
    }
  };

  return (
    <div 
      className="relative inline-block wealth-impact-tooltip"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        onClick={handleClick}
        className="inline-flex items-center justify-center w-6 h-6 ml-2 text-emerald-500 hover:opacity-80 transition-opacity duration-150 rounded-full hover:bg-emerald-50"
        aria-label="What this number means"
      >
        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
        </svg>
      </button>
      
      {isVisible && (
        <>
          {/* Backdrop for mobile */}
          {isMobile && (
            <div className="fixed inset-0 bg-black bg-opacity-25 z-40" onClick={() => setIsVisible(false)} />
          )}
          
          {/* Tooltip */}
          <div className={`absolute z-50 w-80 max-w-sm p-4 bg-white border border-gray-200 rounded-md shadow-lg transition-opacity duration-200 ease-in-out ${
            isMobile 
              ? 'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2' 
              : '-top-2 -left-32'
          }`}>
            {/* Arrow indicator for desktop */}
            {!isMobile && (
              <div className="absolute top-4 right-4 transform rotate-45 w-2 h-2 bg-white border-l border-b border-gray-200"></div>
            )}
            
            {/* Close button for mobile or click mode */}
            {(isMobile || isClickMode) && (
              <button
                onClick={() => {
                  setIsVisible(false);
                  setIsClickMode(false);
                }}
                className="absolute top-2 right-2 w-6 h-6 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
            
            <div className="text-sm font-semibold text-gray-900 mb-3">What this number means:</div>
            <div className="text-sm text-gray-600">
              This value shows the projected benefit of implementing your tax strategy, including tax savings and potential compounding returns based on your selected assumptions.
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// 2025 Federal Tax Brackets for calculation
const TAX_BRACKETS = {
  single: [
    { min: 0, max: 11600, rate: 0.10 },
    { min: 11600, max: 47150, rate: 0.12 },
    { min: 47150, max: 100525, rate: 0.22 },
    { min: 100525, max: 191950, rate: 0.24 },
    { min: 191950, max: 243725, rate: 0.32 },
    { min: 243725, max: 609350, rate: 0.35 },
    { min: 609350, max: Infinity, rate: 0.37 }
  ]
};

// Income mappings for tax calculations
const INCOME_BRACKETS = {
  '<$200K': { default: 150000 },
  '$200K–$500K': { default: 350000 },
  '$500K–$1M': { default: 750000 },
  '$1M–$5M': { default: 2500000 },
  '$5M+': { default: 7500000 }
};

// Strategy implementation status options
const STRATEGY_STATUS = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  IMPLEMENTED: 'implemented',
  NOT_APPLICABLE: 'not_applicable'
};

// Version for cache invalidation
const STRATEGY_LOGIC_VERSION = '2.0'; // Updated to clear old Conservation Easement data

// Educational content mapping
const EDUCATIONAL_CONTENT = {
  'Business Entity Formation': {
    module: 'Module 2: Entity Optimization',
    glossary: ['LLC', 'S-Corp', 'Tax Election'],
    caseStudy: 'Small Business Structure Case Study'
  },
  'C-Corporation Election Strategy': {
    module: 'Module 2: Entity Optimization',
    glossary: ['C-Corp', 'Corporate Tax', 'Double Taxation', 'Qualified Small Business Stock'],
    caseStudy: 'High-Income Solo Business Owner C-Corp Election'
  },
  'S-Corp Election Strategy': {
    module: 'Module 2: Entity Optimization',
    glossary: ['S-Corp', 'Payroll Tax', 'Distributions'],
    caseStudy: '$500K Business Owner S-Corp Election'
  },
  'Split operations into an MSO + operating entity': {
    module: 'Business Module 3',
    glossary: ['MSO', 'Management Service Organization', 'Multi-Entity'],
    caseStudy: 'High-Income Business MSO Structure'
  },
  'Asset Protection Trust': {
    module: 'Module 4: Advanced Planning',
    glossary: ['Irrevocable Trust', 'Asset Protection', 'Estate Planning'],
    caseStudy: 'High Net Worth Asset Protection Plan'
  },
  'Business Expense Maximization': {
    module: 'Module 1: Foundation',
    glossary: ['Business Deductions', 'Ordinary & Necessary'],
    caseStudy: 'Entrepreneur Expense Optimization'
  },
  'Defined Benefit Pension Plan': {
    module: 'Module 3: Retirement Planning',
    glossary: ['DB Plan', 'Contribution Limits', 'Actuarial'],
    caseStudy: 'Professional Practice DB Plan'
  },
  'Stock Compensation Optimization': {
    module: 'Module 3: Investment Strategies',
    glossary: ['RSU', 'ISO', 'ESPP', '83(b) Election'],
    caseStudy: 'Tech Executive Stock Comp Strategy'
  },
  'Qualified Opportunity Fund (QOF)': {
    module: 'Module 3: Investment Strategies',
    glossary: ['QOF', 'Capital Gains Deferral', 'Opportunity Zones'],
    caseStudy: 'Tech Executive QOF Strategy'
  },
  'Income Deferral Strategies': {
    module: 'Module 3: Investment Strategies',
    glossary: ['Deferred Compensation', 'Non-Qualified Plans'],
    caseStudy: 'Executive Compensation Deferral'
  },
  'Real Estate Investment Strategies': {
    module: 'Module 3: Investment Strategies',
    glossary: ['Cost Segregation', 'Bonus Depreciation', 'Section 199A'],
    caseStudy: 'Real Estate Investor Tax Strategy'
  },
  'Energy Tax Credit Investments': {
    module: 'Module 3: Investment Strategies',
    glossary: ['ITC', 'PTC', 'Energy Credits', 'Syndications'],
    caseStudy: 'Solar Investment Tax Strategy'
  },
  'Qualified Small Business Stock (QSBS)': {
    module: 'Module 4: Advanced Planning',
    glossary: ['QSBS', 'Section 1202', 'Qualified Business'],
    caseStudy: 'Startup Exit Planning with QSBS'
  },
  'Installment Sale Strategy': {
    module: 'Module 4: Advanced Planning',
    glossary: ['Installment Sale', 'Capital Gains Deferral'],
    caseStudy: 'Business Sale Installment Strategy'
  }
};

function calculateFederalTax(income) {
  let tax = 0;
  let remainingIncome = income;
  
  for (const bracket of TAX_BRACKETS.single) {
    if (remainingIncome <= 0) break;
    
    const taxableInThisBracket = Math.min(remainingIncome, bracket.max - bracket.min);
    tax += taxableInThisBracket * bracket.rate;
    remainingIncome -= taxableInThisBracket;
  }
  
  return tax;
}

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatLargeNumber(amount) {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return formatCurrency(amount);
}

// Format number with commas as user types
function formatNumberInput(value) {
  if (!value) return '';
  // Remove any non-digit characters
  const digitsOnly = value.toString().replace(/\D/g, '');
  // Add commas
  return digitsOnly.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Parse formatted number back to plain number
function parseFormattedNumber(value) {
  if (!value) return '';
  return value.toString().replace(/,/g, '');
}

function PlaybookGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    incomeType: '',
    incomeRange: '',
    entityStructure: '',
    strategyGoals: [],
    hasBusinessPartners: null, // New field for business partners
    receivesStockComp: false,
    rsuIncomePercent: '',
    // New fields for blended income split
    w2IncomePercent: '',
    businessIncomePercent: ''
  });

  // Local draft state for income split to prevent typing interference
  const [w2Draft, setW2Draft] = useState('');
  const [businessDraft, setBusinessDraft] = useState('');

  // Helper function to update both draft and form data
  const updateIncomeSplit = (w2Value, businessValue) => {
    const w2Str = w2Value.toString();
    const businessStr = businessValue.toString();
    
    setW2Draft(w2Str);
    setBusinessDraft(businessStr);
    handleInputChange('w2IncomePercent', w2Str);
    handleInputChange('businessIncomePercent', businessStr);
  };

  // Enhanced forecasting inputs
  const [forecastingData, setForecastingData] = useState({
    businessProfit: '',
    capitalAvailable: '',
    restructurePercent: '',
    forecastYears: 15,
    reinvestSavings: true,
    enableWealthLoop: true,
    returnRate: 6 // New field for adjustable return rate
  });

  const [results, setResults] = useState({
    strategyStack: {
      setupStructure: [],
      deductionStrategies: [],
      exitPlanning: []
    },
    estimatedSavingsPercent: { min: 0, max: 0 },
    estimatedSavingsDollar: { min: 0, max: 0 },
    forecastData: null,
    lastUpdated: null
  });

  // Dashboard state
  const [strategyStatuses, setStrategyStatuses] = useState({});
  const [selectedStrategies, setSelectedStrategies] = useState(new Set()); // Track selected strategies for calculations
  const [dashboardMode, setDashboardMode] = useState('input'); // 'input', 'dashboard'
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuarterlyReview, setShowQuarterlyReview] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);
  const [selectedStrategy, setSelectedStrategy] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Update forecast data whenever forecasting parameters change
  useEffect(() => {
    if (hasExistingData && results.forecastData) {
      const newForecastData = calculateForecastData();
      setResults(prev => ({ ...prev, forecastData: newForecastData }));
    }
  }, [forecastingData.forecastYears, forecastingData.returnRate, forecastingData.enableWealthLoop, forecastingData.reinvestSavings, selectedStrategies]);

  // Recalculate savings when strategy selections change
  useEffect(() => {
    if (hasExistingData && results.strategyStack) {
      const calculatedSavings = getCalculatedSavings();
      setResults(prev => ({ 
        ...prev, 
        estimatedSavingsPercent: calculatedSavings.percent,
        estimatedSavingsDollar: calculatedSavings.dollar,
        forecastData: calculateForecastData()
      }));
    }
  }, [selectedStrategies]);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('taxOptimizationData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        // Check version and clear cache if outdated
        if (parsed.version !== STRATEGY_LOGIC_VERSION) {
          console.log('Cache version mismatch, clearing outdated data');
          localStorage.removeItem('taxOptimizationData');
          return;
        }
        
        if (parsed.results && parsed.results.strategyStack && parsed.results.strategyStack.setupStructure.length > 0) {
          setFormData(parsed.formData || formData);
          setForecastingData(parsed.forecastingData || forecastingData);
          setResults(parsed.results || results);
          setStrategyStatuses(parsed.strategyStatuses || {});
          setHasExistingData(true);
          setDashboardMode('dashboard');
        }
      } catch (error) {
        console.log('Error parsing saved data, clearing cache', error);
        localStorage.removeItem('taxOptimizationData');
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
      version: STRATEGY_LOGIC_VERSION,
      formData,
      forecastingData,
      results,
      strategyStatuses
    };
    localStorage.setItem('taxOptimizationData', JSON.stringify(dataToSave));
  }, [formData, forecastingData, results, strategyStatuses]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
  };

  const handleMultiSelect = (field, value) => {
    const current = formData[field];
    const updated = current.includes(value) 
      ? current.filter(item => item !== value)
      : [...current, value];
    setFormData({ ...formData, [field]: updated });
  };

  const handleForecastingChange = (field, value) => {
    // Handle formatted number inputs for specific fields
    if (field === 'businessProfit' || field === 'capitalAvailable') {
      const plainValue = parseFormattedNumber(value);
      setForecastingData(prevData => ({ ...prevData, [field]: plainValue }));
    } else {
      setForecastingData(prevData => ({ ...prevData, [field]: value }));
    }
  };

  const generateStrategyStack = (data, forecastData) => {
    // Use the new JSON-driven strategy matcher
    return strategyMatcher.generateStrategyStack(data, forecastData);
  };

  const calculateEstimatedSavings = (strategiesToUse = null) => {
    const income = INCOME_BRACKETS[formData.incomeRange]?.default || 350000;
    const taxLiability = calculateFederalTax(income);
    
    let baseSavingsMin = 12;
    let baseSavingsMax = 18;
    
    // Adjust based on income type
    if (formData.incomeType === 'business-owner') {
      baseSavingsMin += 8;
      baseSavingsMax += 15;
    } else if (formData.incomeType === 'blended') {
      baseSavingsMin += 6;
      baseSavingsMax += 12;
    }
    
    // Adjust based on entity structure
    if (formData.entityStructure === 'None' || formData.entityStructure === 'Not sure') {
      baseSavingsMin += 4;
      baseSavingsMax += 8;
    }
    
    // Adjust based on RSU income percentage
    const rsuPercent = parseInt(formData.rsuIncomePercent) || 0;
    if (rsuPercent >= 30) {
      baseSavingsMin += 3;
      baseSavingsMax += 6;
    }
    
    // Adjust based on forecasting inputs
    const businessProfit = parseInt(forecastingData.businessProfit) || 0;
    const capitalAvailable = parseInt(forecastingData.capitalAvailable) || 0;
    const restructurePercent = parseInt(forecastingData.restructurePercent) || 0;
    
    if (businessProfit > 500000) {
      baseSavingsMin += 3;
      baseSavingsMax += 6;
    }
    
    if (capitalAvailable > 100000) {
      baseSavingsMin += 2;
      baseSavingsMax += 5;
    }
    
    if (restructurePercent > 50) {
      baseSavingsMin += 3;
      baseSavingsMax += 7;
    }
    
    // Cap at reasonable maximums
    baseSavingsMin = Math.min(baseSavingsMin, 35);
    baseSavingsMax = Math.min(baseSavingsMax, 45);
    
    // Calculate base savings from percentage approach
    const baseSavingsMinDollar = taxLiability * (baseSavingsMin / 100);
    const baseSavingsMaxDollar = taxLiability * (baseSavingsMax / 100);
    
    // Get strategy-specific savings from JSON cards
    let applicableStrategies;
    if (strategiesToUse) {
      // Use only selected strategies for calculation
      applicableStrategies = strategiesToUse;
    } else {
      // Use all applicable strategies (default behavior)
      applicableStrategies = strategyMatcher.getApplicableStrategies(formData, forecastingData);
    }
    
    const strategySavings = strategyMatcher.calculateStrategySavings(applicableStrategies);
    
    // Combine base savings with strategy-specific savings
    // Use a weighted approach to avoid double counting
    const strategySavingsWeight = 0.3; // 30% weight to strategy-specific data
    const baseSavingsWeight = 0.7; // 70% weight to existing calculation logic
    
    const combinedMinSavings = (baseSavingsMinDollar * baseSavingsWeight) + (strategySavings * strategySavingsWeight);
    const combinedMaxSavings = (baseSavingsMaxDollar * baseSavingsWeight) + (strategySavings * 1.2 * strategySavingsWeight);
    
    // Convert back to percentages
    const combinedMinPercent = (combinedMinSavings / taxLiability) * 100;
    const combinedMaxPercent = (combinedMaxSavings / taxLiability) * 100;
    
    return {
      percent: { 
        min: Math.round(combinedMinPercent), 
        max: Math.round(combinedMaxPercent) 
      },
      dollar: { 
        min: Math.round(combinedMinSavings), 
        max: Math.round(combinedMaxSavings) 
      }
    };
  };

  const calculateForecastData = () => {
    const income = INCOME_BRACKETS[formData.incomeRange]?.default || 350000;
    const taxLiability = calculateFederalTax(income);
    const savings = getCalculatedSavings(); // Use selected strategies calculation
    const avgSavingsPercent = (savings.percent.min + savings.percent.max) / 2;
    
    const annualTaxSavings = taxLiability * (avgSavingsPercent / 100);
    const totalTaxWithoutStrategy = taxLiability * forecastingData.forecastYears;
    const totalTaxSavings = annualTaxSavings * forecastingData.forecastYears;
    
    let compoundedSavings = 0;
    let passiveIncomeProjections = [];
    
    if (forecastingData.reinvestSavings && forecastingData.enableWealthLoop) {
      const annualReturn = forecastingData.returnRate / 100; // Use adjustable return rate
      let cumulativeInvestment = 0;
      
      for (let year = 1; year <= forecastingData.forecastYears; year++) {
        cumulativeInvestment += annualTaxSavings;
        const yearEndValue = cumulativeInvestment * Math.pow(1 + annualReturn, year - 1);
        compoundedSavings = yearEndValue;
        
        // Calculate passive income (using the adjustable return rate)
        const passiveIncome = yearEndValue * annualReturn;
        
        if ([10, 15, 20].includes(year) && year <= forecastingData.forecastYears) {
          passiveIncomeProjections.push({
            year,
            passiveIncome,
            totalWealth: yearEndValue
          });
        }
      }
    } else if (forecastingData.reinvestSavings) {
      const annualReturn = forecastingData.returnRate / 100; // Use adjustable return rate
      for (let year = 1; year <= forecastingData.forecastYears; year++) {
        compoundedSavings += annualTaxSavings * Math.pow(1 + annualReturn, forecastingData.forecastYears - year);
      }
    }
    
    const totalValue = forecastingData.reinvestSavings ? compoundedSavings : totalTaxSavings;
    
    // Create chart data
    const chartData = [];
    for (let year = 1; year <= Math.min(forecastingData.forecastYears, 20); year += Math.max(1, Math.floor(forecastingData.forecastYears / 8))) {
      const cumulativeTaxPaid = taxLiability * year;
      let cumulativeValue = annualTaxSavings * year;
      let cumulativePassiveIncome = 0;
      
      if (forecastingData.reinvestSavings) {
        cumulativeValue = 0;
        const annualReturn = forecastingData.returnRate / 100; // Use adjustable return rate
        for (let y = 1; y <= year; y++) {
          cumulativeValue += annualTaxSavings * Math.pow(1 + annualReturn, year - y);
        }
        
        // Calculate cumulative passive income generated
        if (forecastingData.enableWealthLoop) {
          cumulativePassiveIncome = cumulativeValue * annualReturn;
        }
      }
      
      chartData.push({
        year: `Year ${year}`,
        doNothing: cumulativeTaxPaid,
        implementStrategy: cumulativeValue,
        passiveIncome: cumulativePassiveIncome
      });
    }
    
    return {
      income,
      taxLiability,
      annualTaxSavings,
      totalTaxWithoutStrategy,
      totalTaxSavings,
      compoundedSavings,
      totalValue,
      chartData,
      passiveIncomeProjections
    };
  };

  const generatePlaybook = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Generate comprehensive strategy stack
    const strategyStack = generateStrategyStack(formData, forecastingData);
    const estimatedSavings = calculateEstimatedSavings();
    const forecastData = calculateForecastData();
    
    const newResults = {
      strategyStack,
      estimatedSavingsPercent: estimatedSavings.percent,
      estimatedSavingsDollar: estimatedSavings.dollar,
      forecastData,
      lastUpdated: new Date().toISOString()
    };
    
    setResults(newResults);
    
    // Initialize strategy statuses
    const newStatuses = {};
    [...strategyStack.setupStructure, ...strategyStack.deductionStrategies, ...strategyStack.exitPlanning].forEach(strategy => {
      newStatuses[strategy.id] = STRATEGY_STATUS.NOT_STARTED;
    });
    setStrategyStatuses(newStatuses);
    
    setIsGenerating(false);
    setHasExistingData(true);
    setDashboardMode('dashboard');
  };

  const nextStep = () => {
    // Handle conditional step flow
    if (currentStep === 1) {
      // After income type selection
      if (formData.incomeType === 'blended') {
        setCurrentStep(2); // Go to income split step
      } else {
        setCurrentStep(3); // Skip income split, go to income range
      }
    } else if (currentStep === 2) {
      // Income split step (only for blended) - go to income range
      setCurrentStep(3);
    } else if (currentStep === 4) {
      // Entity structure - go to business partners if applicable
      setCurrentStep(5);
    } else if (currentStep === 5) {
      // Business partners question - skip for W-2 employees
      if (formData.incomeType === 'w2-employee') {
        setCurrentStep(6); // Go to strategy goals
      } else {
        setCurrentStep(6); // Business owners and blended continue to strategy goals
      }
    } else if (currentStep === 6) {
      // Strategy goals completed, go to stock compensation or skip
      if (formData.incomeType === 'business-owner') {
        setCurrentStep(9); // Skip stock compensation steps for business owners
      } else {
        setCurrentStep(7); // W-2 and blended go to stock compensation
      }
    } else if (currentStep === 7 && !formData.receivesStockComp) {
      setCurrentStep(9); // Skip RSU percentage if no stock comp
    } else if (currentStep < 9) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 9) {
      generatePlaybook();
    }
  };

  const prevStep = () => {
    // Handle reverse navigation with conditional steps
    if (currentStep === 9) {
      if (formData.incomeType === 'business-owner') {
        setCurrentStep(6); // Skip stock comp steps for business owners
      } else if (!formData.receivesStockComp) {
        setCurrentStep(7); // Go back to stock comp question
      } else {
        setCurrentStep(8); // Go back to RSU percentage
      }
    } else if (currentStep === 7) {
      if (formData.incomeType === 'w2-employee') {
        setCurrentStep(6); // Skip business partners for W-2
      } else {
        setCurrentStep(6); // Go back to strategy goals
      }
    } else if (currentStep === 6) {
      if (formData.incomeType === 'w2-employee') {
        setCurrentStep(5); // Skip business partners for W-2, go to entity structure  
      } else {
        setCurrentStep(5); // Go back to business partners
      }
    } else if (currentStep === 5) {
      setCurrentStep(4); // Go back to entity structure
    } else if (currentStep === 4) {
      setCurrentStep(3); // Go back to income range
    } else if (currentStep === 3) {
      if (formData.incomeType === 'blended') {
        setCurrentStep(2); // Go back to income split
      } else {
        setCurrentStep(1); // Skip income split, go back to income type
      }
    } else if (currentStep === 2) {
      setCurrentStep(1); // Go back to income type
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return formData.incomeType !== '';
      case 2: 
        // Income split only for blended income type
        if (formData.incomeType === 'blended') {
          const w2Percent = parseInt(formData.w2IncomePercent || '0');
          const businessPercent = parseInt(formData.businessIncomePercent || '0');
          // Ensure both fields have values and total exactly 100%
          return formData.w2IncomePercent !== '' && 
                 formData.businessIncomePercent !== '' && 
                 (w2Percent + businessPercent === 100) && 
                 w2Percent >= 0 && 
                 businessPercent >= 0;
        }
        return true; // Skip this step for non-blended income types
      case 3: return formData.incomeRange !== '';
      case 4: return formData.entityStructure !== '';
      case 5: 
        // Business partners question only required for business owners
        if (formData.incomeType === 'business-owner' || formData.incomeType === 'blended') {
          return formData.hasBusinessPartners !== null;
        }
        return true; // Skip this step for W-2 employees
      case 6: return formData.strategyGoals.length > 0;
      case 7: 
        // Stock compensation question only for W-2 and blended
        if (formData.incomeType === 'w2-employee' || formData.incomeType === 'blended') {
          return formData.receivesStockComp !== null;
        }
        return true; // Skip for business owners
      case 8:
        return formData.rsuIncomePercent !== '' && 
               parseInt(formData.rsuIncomePercent) >= 0 && 
               parseInt(formData.rsuIncomePercent) <= 100;
      case 9: 
        return forecastingData.businessProfit !== '' && 
               forecastingData.capitalAvailable !== '' && 
               forecastingData.restructurePercent !== '';
      default: return false;
    }
  };

  const startNewAnalysis = () => {
    // Clear all data
    localStorage.removeItem('taxOptimizationData');
    setCurrentStep(1);
    setFormData({
      incomeType: '',
      incomeRange: '',
      entityStructure: '',
      strategyGoals: [],
      hasBusinessPartners: null,
      receivesStockComp: false,
      rsuIncomePercent: ''
    });
    setForecastingData({
      businessProfit: '',
      capitalAvailable: '',
      restructurePercent: '',
      forecastYears: 15,
      reinvestSavings: true,
      enableWealthLoop: true,
      returnRate: 6
    });
    setResults({
      strategyStack: {
        setupStructure: [],
        deductionStrategies: [],
        exitPlanning: []
      },
      estimatedSavingsPercent: { min: 0, max: 0 },
      estimatedSavingsDollar: { min: 0, max: 0 },
      forecastData: null,
      lastUpdated: null
    });
    setStrategyStatuses({});
    setHasExistingData(false);
    setDashboardMode('input');
  };

  const recalculatePlaybook = () => {
    setCurrentStep(1);
    setDashboardMode('input');
  };

  const updateStrategyStatus = (strategyId, status) => {
    setStrategyStatuses(prev => ({
      ...prev,
      [strategyId]: status
    }));
  };

  // Strategy selection functions
  const toggleStrategySelection = (strategyId) => {
    setSelectedStrategies(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(strategyId)) {
        newSelection.delete(strategyId);
      } else {
        newSelection.add(strategyId);
      }
      return newSelection;
    });
  };

  const clearAllSelections = () => {
    setSelectedStrategies(new Set());
  };

  const selectAllStrategies = () => {
    if (results.strategyStack) {
      const allStrategies = [...results.strategyStack.setupStructure, ...results.strategyStack.deductionStrategies, ...results.strategyStack.exitPlanning];
      const allIds = allStrategies.map(strategy => strategy.id);
      setSelectedStrategies(new Set(allIds));
    }
  };

  // Modal management functions
  const openStrategyModal = (strategy) => {
    setSelectedStrategy(strategy);
    setIsModalOpen(true);
  };

  const closeStrategyModal = () => {
    setSelectedStrategy(null);
    setIsModalOpen(false);
  };

  const getStrategyProgress = () => {
    const allStrategies = [...results.strategyStack.setupStructure, ...results.strategyStack.deductionStrategies, ...results.strategyStack.exitPlanning];
    
    // If strategies are selected, calculate progress based only on selected strategies
    let strategiesForProgress = allStrategies;
    if (selectedStrategies.size > 0) {
      strategiesForProgress = allStrategies.filter(strategy => selectedStrategies.has(strategy.id));
    }
    
    const implementedCount = strategiesForProgress.filter(strategy => strategyStatuses[strategy.id] === STRATEGY_STATUS.IMPLEMENTED).length;
    return {
      implemented: implementedCount,
      total: strategiesForProgress.length,
      percentage: strategiesForProgress.length > 0 ? Math.round((implementedCount / strategiesForProgress.length) * 100) : 0
    };
  };

  // Get selected strategies for calculations
  const getSelectedStrategiesForCalculation = () => {
    if (selectedStrategies.size === 0) {
      return null; // Return null to use all strategies (default behavior)
    }
    
    const allStrategies = [...results.strategyStack.setupStructure, ...results.strategyStack.deductionStrategies, ...results.strategyStack.exitPlanning];
    return allStrategies.filter(strategy => selectedStrategies.has(strategy.id));
  };

  // Calculate savings based on selected strategies
  const getCalculatedSavings = () => {
    const selectedStrategiesForCalc = getSelectedStrategiesForCalculation();
    return calculateEstimatedSavings(selectedStrategiesForCalc);
  };

  const generateQuarterlyReview = () => {
    const allStrategies = [...results.strategyStack.setupStructure, ...results.strategyStack.deductionStrategies, ...results.strategyStack.exitPlanning];
    
    // Use selected strategies if any are selected, otherwise use all strategies
    const strategiesForReview = selectedStrategies.size > 0 ? 
      allStrategies.filter(strategy => selectedStrategies.has(strategy.id)) : 
      allStrategies;
    
    const notStartedStrategies = strategiesForReview.filter(strategy => strategyStatuses[strategy.id] === STRATEGY_STATUS.NOT_STARTED);
    const inProgressStrategies = strategiesForReview.filter(strategy => strategyStatuses[strategy.id] === STRATEGY_STATUS.IN_PROGRESS);
    
    const calculatedSavings = getCalculatedSavings();
    const estimatedMissedSavings = calculatedSavings.dollar.min * (notStartedStrategies.length / strategiesForReview.length);
    
    return {
      notStartedStrategies,
      inProgressStrategies,
      estimatedMissedSavings
    };
  };

  const exportToPDF = () => {
    const element = document.getElementById('dashboard-content');
    const opt = {
      margin: 1,
      filename: 'tax-strategy-report.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const getIncomeFieldConfig = () => {
    switch (formData.incomeType) {
      case 'w2-employee':
        return {
          label: 'What is your annual W-2 income before taxes?',
          placeholder: 'e.g., 275,000'
        };
      case 'business-owner':
        return {
          label: 'What is your annual business profit before taxes?',
          placeholder: 'e.g., 500,000'
        };
      case 'blended':
        return {
          label: 'What is your combined income (W-2 + business profit) before taxes?',
          placeholder: 'e.g., 800,000'
        };
      default:
        return {
          label: 'What is your annual income before taxes?',
          placeholder: 'e.g., 350,000'
        };
    }
  };

  // ✅ SEPARATE COMPONENT: Handles its own state safely
  const StrategyCard = ({ strategy }) => {
    const status = strategyStatuses[strategy.id] || STRATEGY_STATUS.NOT_STARTED;
    
    const getStatusIcon = () => {
      switch (status) {
        case STRATEGY_STATUS.IMPLEMENTED: return '✅';
        case STRATEGY_STATUS.IN_PROGRESS: return '⏳';
        case STRATEGY_STATUS.NOT_APPLICABLE: return '🚫';
        default: return '○';
      }
    };
    
    const getComplexityColor = () => {
      switch (strategy.complexity) {
        case 'Beginner': return 'bg-emerald-100 text-emerald-700';
        case 'Intermediate': return 'bg-yellow-100 text-yellow-700';
        case 'Advanced': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
      }
    };
    
    // Handle suppressed strategies
    if (strategy.issuppressed) {
      return (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-2 pr-2">{strategy.title}</h4>
            </div>
            <div className="text-lg ml-2 flex-shrink-0">⚠️</div>
          </div>
          
          <div className="bg-yellow-100 border border-yellow-200 rounded-lg p-3">
            <p className="text-sm text-yellow-800">{strategy.suppressionMessage}</p>
          </div>
        </div>
      );
    }
    
    return (
      <div className={`bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow ${selectedStrategies.has(strategy.id) ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200'}`}>
        {/* Selection Checkbox */}
        <div className="p-2 border-b border-gray-100">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={selectedStrategies.has(strategy.id)}
              onChange={() => toggleStrategySelection(strategy.id)}
              className="w-4 h-4 text-emerald-600 bg-gray-100 border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
            />
            <span className="ml-2 text-xs text-gray-600">
              Include in forecast calculation
            </span>
          </label>
        </div>
        
        {/* Card Header */}
        <div className="p-4">
          <div className="flex items-start justify-between mb-2">
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-gray-900 leading-tight mb-2 pr-2">{strategy.title}</h4>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getComplexityColor()}`}>
                  {strategy.complexity}
                </span>
                {strategy.moduleReference && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-600 truncate">
                    {strategy.moduleReference.module}
                  </span>
                )}
              </div>
            </div>
            <div className="text-lg ml-2 flex-shrink-0">{getStatusIcon()}</div>
          </div>
          
          {/* Summary */}
          <p className="text-sm text-gray-600 mb-3 leading-snug line-clamp-3">{strategy.summary}</p>
          
          {/* Quantified Example Preview */}
          {strategy.quantifiedExample && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2 mb-3">
              <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wide mb-1">Potential Savings</div>
              {strategy.strategyId === 'roth_overhaul_protocol' ? (
                <div className="space-y-1">
                  <div className="text-xs font-bold text-emerald-800">
                    QP: {formatCurrency(strategy.quantifiedExample.qualifiedPurchaser.annualSavings)} annually
                  </div>
                  <div className="text-xs font-bold text-emerald-800">
                    Accredited: {formatCurrency(strategy.quantifiedExample.accreditedInvestor.annualSavings)} annually
                  </div>
                </div>
              ) : strategy.quantifiedExample.annualSavings ? (
                <div className="text-sm font-bold text-emerald-800">
                  {typeof strategy.quantifiedExample.annualSavings === 'number' 
                    ? formatCurrency(strategy.quantifiedExample.annualSavings) 
                    : strategy.quantifiedExample.annualSavings} annually
                </div>
              ) : null}
            </div>
          )}
          
          {/* Show Details Button */}
          <button
            onClick={() => openStrategyModal(strategy)}
            className="w-full text-left text-xs text-emerald-600 hover:text-emerald-700 font-medium mb-3 flex items-center justify-center py-2 px-3 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
          >
            View Full Strategy Details
            <ExternalLink className="w-3 h-3 ml-2" />
          </button>
        </div>
        
        {/* Implementation Status Dropdown */}
        <div className="p-4 border-t border-gray-100">
          <select
            value={status}
            onChange={(e) => updateStrategyStatus(strategy.id, e.target.value)}
            className="w-full px-2 py-1 border rounded-md text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value={STRATEGY_STATUS.NOT_STARTED}>Not Started</option>
            <option value={STRATEGY_STATUS.IN_PROGRESS}>In Progress</option>
            <option value={STRATEGY_STATUS.IMPLEMENTED}>Implemented</option>
            <option value={STRATEGY_STATUS.NOT_APPLICABLE}>Not Applicable</option>
          </select>
        </div>
      </div>
    );
  };

  // ✅ SAFE RENDER FUNCTION: No hooks, just returns JSX
  const renderStrategyCard = (strategy) => (
    <StrategyCard key={strategy.id} strategy={strategy} />
  );

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-semibold tracking-tight text-gray-900 mb-2">Generating Your Tax Plan</h2>
            <p className="text-base text-muted-foreground">
              Creating personalized strategies and calculating your lifetime savings...
            </p>
          </div>
          <div className="space-y-2 text-left text-sm text-muted-foreground">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
              Analyzing your financial profile
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3"></div>
              Matching optimal tax strategies
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-3 animate-pulse"></div>
              Calculating lifetime value projections
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dark Nav Bar with Emerald Gradient Header */}
      <div className="bg-gray-900">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-white hover:text-emerald-100 font-medium transition-colors">
                ← Back to Platform
              </Link>
              <h1 className="text-3xl font-semibold text-white">
                Build Your Escape Plan
              </h1>
              <div className="w-32"></div> {/* Spacer for centering */}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        input[type="range"] {
          -webkit-appearance: none;
          appearance: none;
          background: transparent;
          cursor: pointer;
          height: 20px;
        }
        
        input[type="range"]::-webkit-slider-track {
          background: transparent;
          height: 6px;
          border-radius: 3px;
        }
        
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
          margin-top: -7px;
        }
        
        input[type="range"]::-webkit-slider-thumb:hover {
          box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
        }
        
        input[type="range"]::-moz-range-track {
          background: transparent;
          height: 6px;
          border-radius: 3px;
          border: none;
        }
        
        input[type="range"]::-moz-range-thumb {
          height: 20px;
          width: 20px;
          border-radius: 50%;
          background: #10b981;
          cursor: pointer;
          border: 3px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        input[type="range"]:hover {
          opacity: 0.8;
        }

        .slider-container {
          position: relative;
          height: 20px;
          display: flex;
          align-items: center;
        }
        
        .slider-track {
          position: absolute;
          top: 50%;
          left: 0;
          right: 0;
          height: 6px;
          transform: translateY(-50%);
          border-radius: 3px;
          z-index: 1;
        }
        
        .slider-input {
          position: relative;
          z-index: 2;
          width: 100%;
          margin: 0;
        }
      `}</style>
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {dashboardMode === 'input' ? (
          /* Input Mode */
          <div className="max-w-4xl mx-auto">
            {/* Tool Description */}
            <div className="text-center mb-8">
              <p className="text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
                Get personalized strategies, track implementation progress, and forecast your financial future.
              </p>
              
              {/* How It Works Section */}
              <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                <div className="text-sm uppercase text-muted-foreground tracking-wide mb-4 text-center">How It Works</div>
                <div className="grid md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-emerald-600 font-semibold text-sm">1</span>
                    </div>
                    <h3 className="font-semibold mb-2 text-sm">Profile Analysis</h3>
                    <p className="text-xs text-muted-foreground">AI analyzes your income type and structure</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-emerald-600 font-semibold text-sm">2</span>
                    </div>
                    <h3 className="font-semibold mb-2 text-sm">Strategy Generation</h3>
                    <p className="text-xs text-muted-foreground">Personalized recommendations and savings estimates</p>
                  </div>
                  <div className="text-center">
                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                      <span className="text-emerald-600 font-semibold text-sm">3</span>
                    </div>
                    <h3 className="font-semibold mb-2 text-sm">Lifetime Forecast</h3>
                    <p className="text-xs text-muted-foreground">See compound wealth creation over decades</p>
                  </div>
                </div>
              </div>
              
              {/* Primary CTA */}
              <button
                onClick={() => setCurrentStep(1)}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-md font-semibold transition-colors"
              >
                Plan Your Escape
              </button>
            </div>

            {/* Progress Indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span className="font-medium">Step {currentStep} of 9</span>
                <span className="font-medium">{Math.round((currentStep / 9) * 100)}% Complete</span>
              </div>
              <div className="flex space-x-2">
                {Array.from({ length: 9 }, (_, i) => (
                  <div
                    key={i}
                    className={`h-2 flex-1 rounded-full ${
                      i < currentStep ? 'bg-emerald-500' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-2xl shadow-sm p-8">
              {/* STEP 1: Income Type */}
              {currentStep === 1 && (
                <div>
                  <div className="text-sm uppercase text-muted-foreground tracking-wide mb-2">Step 1 of 9</div>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-2">Income Type</h2>
                  <p className="text-base text-muted-foreground mb-8">What type of income do you currently earn?</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { value: 'w2-employee', label: 'W-2 Employee', desc: 'Traditional employee with W-2 income' },
                      { value: '1099-contractor', label: '1099 Contractor', desc: 'Independent contractor or freelancer' },
                      { value: 'business-owner', label: 'Business Owner', desc: 'Own a business or multiple revenue streams' },
                      { value: 'blended', label: 'Blended', desc: 'Mix of W-2, 1099, and/or business income' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleInputChange('incomeType', option.value)}
                        className={`text-left p-6 rounded-2xl border transition-all ${
                          formData.incomeType === option.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-300 hover:border-emerald-300'
                        }`}
                      >
                        <div className="font-semibold text-lg mb-2">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Income Split (only for blended income type) */}
              {currentStep === 2 && formData.incomeType === 'blended' && (
                <div>
                  <div className="text-sm uppercase text-muted-foreground tracking-wide mb-2">Step 2 of 9</div>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-2">Income Split</h2>
                  <p className="text-base text-muted-foreground mb-8">What percentage of your income is W-2 vs Business?</p>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">W-2 Income %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.w2IncomePercent}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Allow empty input for better UX while typing
                          if (inputValue === '') {
                            handleInputChange('w2IncomePercent', '');
                            handleInputChange('businessIncomePercent', '');
                            return;
                          }
                          
                          // Parse and clamp the value
                          const numericValue = parseInt(inputValue);
                          if (isNaN(numericValue)) return;
                          
                          const clampedW2 = Math.min(100, Math.max(0, numericValue));
                          const businessPercent = 100 - clampedW2;
                          
                          // Update both fields
                          handleInputChange('w2IncomePercent', clampedW2.toString());
                          handleInputChange('businessIncomePercent', businessPercent.toString());
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., 60"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Business Income %</label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={formData.businessIncomePercent}
                        onChange={(e) => {
                          const inputValue = e.target.value;
                          // Allow empty input for better UX while typing
                          if (inputValue === '') {
                            handleInputChange('businessIncomePercent', '');
                            handleInputChange('w2IncomePercent', '');
                            return;
                          }
                          
                          // Parse and clamp the value
                          const numericValue = parseInt(inputValue);
                          if (isNaN(numericValue)) return;
                          
                          const clampedBusiness = Math.min(100, Math.max(0, numericValue));
                          const w2Percent = 100 - clampedBusiness;
                          
                          // Update both fields
                          handleInputChange('businessIncomePercent', clampedBusiness.toString());
                          handleInputChange('w2IncomePercent', w2Percent.toString());
                        }}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
                        placeholder="e.g., 40"
                      />
                    </div>
                    
                    <div className={`p-4 rounded-lg ${
                      (parseInt(formData.w2IncomePercent || '0') + parseInt(formData.businessIncomePercent || '0')) === 100
                        ? 'bg-emerald-50 border border-emerald-200'
                        : 'bg-gray-50'
                    }`}>
                      <p className="text-sm text-gray-600">
                        Total: {(parseInt(formData.w2IncomePercent || '0') + parseInt(formData.businessIncomePercent || '0'))}%
                        {(parseInt(formData.w2IncomePercent || '0') + parseInt(formData.businessIncomePercent || '0')) === 100 && 
                         formData.w2IncomePercent && formData.businessIncomePercent && (
                          <span className="text-emerald-600 ml-2 font-semibold">✓ Perfect!</span>
                        )}
                        {(parseInt(formData.w2IncomePercent || '0') + parseInt(formData.businessIncomePercent || '0')) !== 100 && 
                         formData.w2IncomePercent && formData.businessIncomePercent && (
                          <span className="text-red-600 ml-2">Must equal 100%</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: Income Range (formerly step 2) */}
              {currentStep === 3 && (
                <div>
                  <div className="text-sm uppercase text-muted-foreground tracking-wide mb-2">Step 3 of 9</div>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-2">Income Range</h2>
                  <p className="text-base text-muted-foreground mb-8">What is your approximate annual income?</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { value: '<$200K', label: 'Under $200K' },
                      { value: '$200K–$500K', label: '$200K – $500K' },
                      { value: '$500K–$1M', label: '$500K – $1M' },
                      { value: '$1M–$5M', label: '$1M – $5M' },
                      { value: '$5M+', label: '$5M+' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleInputChange('incomeRange', option.value)}
                        className={`text-left p-6 rounded-2xl border transition-all ${
                          formData.incomeRange === option.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-300 hover:border-emerald-300'
                        }`}
                      >
                        <div className="font-semibold text-lg">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Entity Structure (formerly step 3) */}
              {currentStep === 4 && (
                <div>
                  <div className="text-sm uppercase text-muted-foreground tracking-wide mb-2">Step 4 of 9</div>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-2">Entity Structure</h2>
                  <p className="text-base text-muted-foreground mb-8">What is your current entity structure?</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { value: 'None', label: 'None', desc: 'Filing as individual or sole proprietor' },
                      { value: 'LLC', label: 'LLC', desc: 'Limited Liability Company' },
                      { value: 'S-corp', label: 'S-Corporation', desc: 'S-Corp election for tax savings' },
                      { value: 'C-corp', label: 'C-Corporation', desc: 'Traditional corporate structure' },
                      { value: 'Trust', label: 'Trust', desc: 'Trust structure for asset protection' },
                      { value: 'Not sure', label: 'Not sure', desc: 'Need help determining optimal structure' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleInputChange('entityStructure', option.value)}
                        className={`text-left p-6 rounded-2xl border transition-all ${
                          formData.entityStructure === option.value
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-300 hover:border-emerald-300'
                        }`}
                      >
                        <div className="font-semibold text-lg mb-2">{option.label}</div>
                        <div className="text-sm text-muted-foreground">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: Business Partners (only for business owners) */}
              {currentStep === 5 && (formData.incomeType === 'business-owner' || formData.incomeType === 'blended') && (
                <div>
                  <div className="text-sm uppercase text-gray-600 tracking-wide mb-2">Step 5 of 9</div>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-2">Business Partnership</h2>
                  <p className="text-base text-gray-600 mb-8">Do you have any partners in your business?</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleInputChange('hasBusinessPartners', false)}
                      className={`text-left p-6 rounded-2xl border transition-all ${
                        formData.hasBusinessPartners === false
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-300 hover:border-emerald-300'
                      }`}
                    >
                      <div className="font-semibold text-lg mb-2">No</div>
                      <div className="text-sm text-gray-600">I am the sole owner of my business</div>
                    </button>
                    <button
                      onClick={() => handleInputChange('hasBusinessPartners', true)}
                      className={`text-left p-6 rounded-2xl border transition-all ${
                        formData.hasBusinessPartners === true
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-300 hover:border-emerald-300'
                      }`}
                    >
                      <div className="font-semibold text-lg mb-2">Yes</div>
                      <div className="text-sm text-gray-600">I have one or more business partners</div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: Strategy Goals */}
              {currentStep === 6 && (
                <div>
                  <div className="text-sm uppercase text-gray-600 tracking-wide mb-2">Step 6 of 9</div>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-2">Strategy Goals</h2>
                  <p className="text-base text-gray-600 mb-8">What are your main tax optimization goals? (Select all that apply)</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    {[
                      { value: 'Reduce current tax liability', label: 'Reduce current tax liability', desc: 'Lower taxes owed this year' },
                      { value: 'Asset protection', label: 'Asset protection', desc: 'Protect wealth from legal risks' },
                      { value: 'Estate planning', label: 'Estate planning', desc: 'Transfer wealth efficiently to heirs' },
                      { value: 'Business optimization', label: 'Business optimization', desc: 'Optimize business structure for tax efficiency' },
                      { value: 'Exit planning', label: 'Exit planning', desc: 'Plan for business sale or exit' },
                      { value: 'Build long-term passive income', label: 'Build long-term passive income', desc: 'Create streams of passive income' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleMultiSelect('strategyGoals', option.value)}
                        className={`text-left p-6 rounded-2xl border transition-all ${
                          formData.strategyGoals.includes(option.value)
                            ? 'border-emerald-500 bg-emerald-50'
                            : 'border-gray-300 hover:border-emerald-300'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`w-5 h-5 rounded border-2 mr-3 mt-0.5 flex items-center justify-center ${
                            formData.strategyGoals.includes(option.value)
                              ? 'border-emerald-500 bg-emerald-500'
                              : 'border-gray-300'
                          }`}>
                            {formData.strategyGoals.includes(option.value) && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <div className="font-semibold text-lg mb-1">{option.label}</div>
                            <div className="text-sm text-muted-foreground">{option.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 7: Stock Compensation (Only for W-2 and blended) */}
              {currentStep === 7 && (formData.incomeType === 'w2-employee' || formData.incomeType === 'blended') && (
                <div>
                  <div className="text-sm uppercase text-gray-600 tracking-wide mb-2">Step 7 of 9</div>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-2">Stock Compensation</h2>
                  <p className="text-base text-gray-600 mb-8">Do you receive stock compensation (RSUs, options, ESPP)?</p>
                  <div className="grid md:grid-cols-2 gap-4">
                    <button
                      onClick={() => handleInputChange('receivesStockComp', true)}
                      className={`text-left p-6 rounded-2xl border transition-all ${
                        formData.receivesStockComp === true
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-300 hover:border-emerald-300'
                      }`}
                    >
                      <div className="font-semibold text-lg mb-2">Yes</div>
                      <div className="text-sm text-muted-foreground">I receive RSUs, stock options, or ESPP benefits</div>
                    </button>
                    <button
                      onClick={() => handleInputChange('receivesStockComp', false)}
                      className={`text-left p-6 rounded-2xl border transition-all ${
                        formData.receivesStockComp === false
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-300 hover:border-emerald-300'
                      }`}
                    >
                      <div className="font-semibold text-lg mb-2">No</div>
                      <div className="text-sm text-muted-foreground">My compensation is cash only</div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 8: RSU Percentage (Only if receives stock comp) */}
              {currentStep === 8 && formData.receivesStockComp && (
                <div>
                  <div className="text-sm uppercase text-gray-600 tracking-wide mb-2">Step 8 of 9</div>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-2">Stock Compensation Details</h2>
                  <p className="text-base text-gray-600 mb-8">What percentage of your income is from RSUs/stock?</p>
                  
                  <div className="max-w-md mx-auto text-center">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Stock Compensation Percentage
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.rsuIncomePercent}
                        onChange={(e) => {
                          const value = e.target.value;
                          // Validate between 0 and 100
                          if (value === '' || (parseInt(value) >= 0 && parseInt(value) <= 100)) {
                            handleInputChange('rsuIncomePercent', value);
                          }
                        }}
                        placeholder="e.g., 30"
                        min="0"
                        max="100"
                        className="w-full px-4 py-3 border rounded-md text-lg text-center focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-8"
                      />
                      <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-lg text-gray-600">%</span>
                    </div>
                    <p className="text-sm text-gray-600 mt-2">Enter a value between 0 and 100</p>
                  </div>
                </div>
              )}

              {/* STEP 9: Enhanced Forecasting Inputs */}
              {currentStep === 9 && (
                <div>
                  <div className="text-sm uppercase text-gray-600 tracking-wide mb-2">Step 9 of 9</div>
                  <h2 className="text-3xl font-semibold text-gray-900 mb-2">Financial Details</h2>
                  <p className="text-base text-gray-600 mb-8">Help us calculate more precise forecasting for your situation</p>
                  <div className="max-w-lg mx-auto space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                        {getIncomeFieldConfig().label}
                      </label>
                      <input
                        type="text"
                        value={formatNumberInput(forecastingData.businessProfit)}
                        onChange={(e) => handleForecastingChange('businessProfit', e.target.value)}
                        placeholder={getIncomeFieldConfig().placeholder}
                        className="w-full max-w-[250px] mx-auto h-10 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                        Capital available for tax-advantaged investments
                      </label>
                      <input
                        type="text"
                        value={formatNumberInput(forecastingData.capitalAvailable)}
                        onChange={(e) => handleForecastingChange('capitalAvailable', e.target.value)}
                        placeholder="e.g., 250,000"
                        className="w-full max-w-[250px] mx-auto h-10 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-center"
                      />
                      <p className="text-xs text-gray-600 mt-1 text-center">Capital you could invest in real estate, energy credits, etc.</p>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 text-center">
                        Percentage of income that could be restructured or offset
                      </label>
                      <div className="relative max-w-[150px] mx-auto">
                        <input
                          type="number"
                          value={forecastingData.restructurePercent}
                          onChange={(e) => handleForecastingChange('restructurePercent', e.target.value)}
                          placeholder="30"
                          min="0"
                          max="100"
                          className="w-full h-10 px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 pr-8 text-center"
                        />
                        <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-gray-600">%</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-6 py-3 border border-gray-300 text-gray-600 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all"
                >
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  disabled={!isStepComplete()}
                  className={`px-6 py-3 text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed font-semibold transition-all ${
                    currentStep === 9
                      ? 'bg-emerald-500 hover:bg-emerald-600'
                      : 'bg-emerald-500 hover:bg-emerald-600'
                  }`}
                >
                  {currentStep === 9 ? 'Generate My Tax Plan' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard Mode */
          <div className="max-w-6xl mx-auto" id="dashboard-content">
            {/* Entry Point Section */}
            <div className="mb-12">
              {!hasExistingData ? (
                <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
                  <h2 className="text-3xl font-semibold tracking-tight text-gray-900 mb-4">Build Your Personalized Tax Plan</h2>
                  <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                    Start from scratch and uncover the strategies that could save you 20–40% in taxes.
                  </p>
                  <button
                    onClick={startNewAnalysis}
                    className="px-8 py-3 bg-emerald-500 text-white font-medium rounded-md hover:bg-emerald-600 transition-all"
                  >
                    Start Your Escape Plan
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-4">
                  <button
                    onClick={startNewAnalysis}
                    className="bg-emerald-500 text-white p-6 rounded-2xl text-center hover:bg-emerald-600 transition-all shadow-sm"
                  >
                    <div className="text-xl font-semibold mb-2">New Analysis</div>
                    <div className="text-sm opacity-90">Start fresh analysis</div>
                  </button>
                  <button
                    onClick={recalculatePlaybook}
                    className="bg-white border border-emerald-500 text-emerald-700 p-6 rounded-2xl text-center hover:bg-emerald-50 transition-all"
                  >
                    <div className="text-xl font-semibold mb-2">Recalculate</div>
                    <div className="text-sm">Update existing plan</div>
                  </button>
                  <button
                    onClick={() => setShowQuarterlyReview(!showQuarterlyReview)}
                    className="bg-white border border-gray-300 text-gray-600 p-6 rounded-2xl text-center hover:bg-gray-50 transition-all"
                  >
                    <div className="text-xl font-semibold mb-2">Quarterly Review</div>
                    <div className="text-sm">Progress check-in</div>
                  </button>
                </div>
              )}
            </div>

            {hasExistingData && (
              <>
                {/* Profile Summary */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                  <div className="text-sm uppercase text-gray-600 tracking-wide mb-4">Profile</div>
                  <div className="flex flex-wrap gap-x-6 gap-y-2">
                    <div className="flex items-center gap-x-2">
                      <span className="text-sm text-gray-600">Income Type:</span>
                      <span className="font-semibold text-gray-900">{formData.incomeType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                    </div>
                    {/* Show income split for blended income types */}
                    {formData.incomeType === 'blended' && formData.w2IncomePercent && formData.businessIncomePercent && (
                      <div className="flex items-center gap-x-2">
                        <span className="text-sm text-gray-600">Income Split:</span>
                        <span className="font-semibold text-gray-900">
                          {formData.w2IncomePercent}% W-2 / {formData.businessIncomePercent}% Business
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-x-2">
                      <span className="text-sm text-gray-600">Income Range:</span>
                      <span className="font-semibold text-gray-900">{formData.incomeRange}</span>
                    </div>
                    <div className="flex items-center gap-x-2">
                      <span className="text-sm text-gray-600">Entity Structure:</span>
                      <span className="font-semibold text-gray-900">{formData.entityStructure}</span>
                    </div>
                    {/* Only show stock compensation for W-2 and blended income types */}
                    {(formData.incomeType === 'w2-employee' || formData.incomeType === 'blended') && (
                      <div className="flex items-center gap-x-2">
                        <span className="text-sm text-gray-600">Stock Compensation:</span>
                        <span className="font-semibold text-gray-900">
                          {formData.receivesStockComp ? `Yes (${formData.rsuIncomePercent}%)` : 'No'}
                        </span>
                      </div>
                    )}
                    {/* Show business partners for business owners */}
                    {(formData.incomeType === 'business-owner' || formData.incomeType === 'blended') && (
                      <div className="flex items-center gap-x-2">
                        <span className="text-sm text-gray-600">Business Partners:</span>
                        <span className="font-semibold text-gray-900">
                          {formData.hasBusinessPartners === true ? 'Yes' : formData.hasBusinessPartners === false ? 'No' : 'Not specified'}
                        </span>
                      </div>
                    )}
                  </div>
                  {results.lastUpdated && (
                    <div className="mt-6 pt-6 border-t">
                      <p className="text-sm text-gray-600">
                        Last updated: {new Date(results.lastUpdated).toLocaleDateString('en-US', { 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}
                      </p>
                    </div>
                  )}
                </div>

                {/* Quarterly Review Panel */}
                {showQuarterlyReview && (() => {
                  const review = generateQuarterlyReview();
                  return (
                    <div className="bg-orange-50 border-l-4 border-orange-400 rounded-2xl p-6 mb-8">
                      <h3 className="text-xl font-semibold tracking-tight text-orange-900 mb-4">Quarterly Strategy Review</h3>
                      
                      <div className="grid lg:grid-cols-2 gap-6">
                        <div>
                          <h4 className="font-semibold text-orange-800 mb-3">Priority Actions</h4>
                          <ul className="space-y-2">
                            {review.notStartedStrategies.map(strategy => (
                              <li key={strategy.id} className="text-orange-700 text-sm">
                                • {strategy.title} ({strategy.complexity})
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold text-orange-800 mb-3">Potential Impact</h4>
                          <p className="text-orange-700 text-sm">
                            Unimplemented strategies may be costing you{' '}
                            <span className="font-bold">{formatCurrency(review.estimatedMissedSavings)}</span> annually.
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* 1. Strategy Recommendations */}
                <div className="mb-12">
                  <div className="text-center mb-8">
                    <h2 className="text-3xl font-semibold text-gray-900 mb-4">Your Strategy Recommendations</h2>
                  <div className="flex items-center justify-between mb-4">
                    <p className="text-base text-gray-600">
                      Based on your profile, here are the strategies we recommend for your situation.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={clearAllSelections}
                        className="text-xs px-3 py-1 text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                      >
                        Clear All
                      </button>
                      <button
                        onClick={selectAllStrategies}
                        className="text-xs px-3 py-1 text-emerald-600 hover:text-emerald-700 bg-emerald-100 hover:bg-emerald-200 rounded-md transition-colors"
                      >
                        Select All
                      </button>
                    </div>
                  </div>

                  {selectedStrategies.size > 0 && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4">
                      <div className="text-sm font-medium text-emerald-700 mb-1">
                        Selected Strategies ({selectedStrategies.size})
                      </div>
                      <div className="text-xs text-emerald-600">
                        Tax savings calculations are based only on your selected strategies.
                      </div>
                    </div>
                  )}
                  </div>

                  <div className="space-y-8">
                    {/* Setup & Structure */}
                    {results.strategyStack.setupStructure.length > 0 && (
                      <div>
                        <div className="text-sm uppercase text-gray-600 tracking-wide mb-3">Setup & Structure</div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {results.strategyStack.setupStructure.map(renderStrategyCard)}
                        </div>
                      </div>
                    )}

                    {/* Deduction Strategies */}
                    {results.strategyStack.deductionStrategies.length > 0 && (
                      <div>
                        <div className="text-sm uppercase text-gray-600 tracking-wide mb-3">Deduction Strategies</div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {results.strategyStack.deductionStrategies.map(renderStrategyCard)}
                        </div>
                      </div>
                    )}

                    {/* Exit Planning */}
                    {results.strategyStack.exitPlanning.length > 0 && (
                      <div>
                        <div className="text-sm uppercase text-gray-600 tracking-wide mb-3">Exit Planning</div>
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
                          {results.strategyStack.exitPlanning.map(renderStrategyCard)}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Implementation Status Tracker */}
                <div className="bg-white rounded-2xl shadow-sm p-6 mb-8">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h2 className="text-2xl font-semibold text-gray-900 mb-1">Implementation Progress</h2>
                      <p className="text-sm text-gray-600">Track your progress on each recommended strategy</p>
                    </div>
                    <div className="flex flex-col items-end text-right">
                      <div className="text-2xl font-bold text-emerald-600 mb-1">
                        {getStrategyProgress().implemented}/{getStrategyProgress().total}
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        Strategies Implemented
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${getStrategyProgress().percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Estimated Annual Tax Savings */}
                <div className="bg-white rounded-2xl shadow-sm p-8 mb-12">
                  <div className="text-center">
                    <div className="text-sm uppercase text-gray-600 tracking-wide mb-4">Estimated Annual Tax Savings</div>
                    <div className="mb-6">
                      <div className="text-5xl font-bold text-emerald-600 mb-3">
                        {getCalculatedSavings().percent.min}% – {getCalculatedSavings().percent.max}%
                      </div>
                      <div className="text-2xl font-semibold text-gray-800 mb-4">
                        {formatCurrency(getCalculatedSavings().dollar.min)} – {formatCurrency(getCalculatedSavings().dollar.max)} annually
                      </div>
                      <p className="text-base text-gray-600 max-w-2xl mx-auto">
                        These savings are the foundation for building long-term wealth through strategic reinvestment.
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. Lifetime Forecast + Wealth Multiplier Loop */}
                {results.forecastData && (
                  <div className="space-y-8 mb-12">
                    {/* Wealth Multiplier Loop Explanation */}
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-8 border border-purple-200">
                      <div className="flex items-center justify-center mb-4">
                        <h2 className="text-3xl font-semibold text-gray-900">The Wealth Multiplier Loop</h2>
                        <AssumptionsTooltip />
                      </div>
                      
                      <p className="text-base text-gray-600 mb-8 text-center max-w-3xl mx-auto">
                        Your tax strategy isn't just about savings — it's the fuel for wealth compounding and long-term financial escape.
                      </p>

                      <div className="grid md:grid-cols-4 gap-6">
                        <div className="text-center">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">1. Save Tax</h3>
                          <p className="text-sm text-gray-600">Through entity structure + strategic deductions</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">2. Reinvest</h3>
                          <p className="text-sm text-gray-600">Tax savings into tax-favored assets</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">3. Generate</h3>
                          <p className="text-sm text-gray-600">Passive income and appreciation</p>
                        </div>
                        
                        <div className="text-center">
                          <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-2">4. Repeat</h3>
                          <p className="text-sm text-gray-600">Compound exponentially year over year</p>
                        </div>
                      </div>
                    </div>

                    {/* Lifetime Forecast Section */}
                    <div className="bg-white rounded-2xl shadow-sm p-8">
                      <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                          <h3 className="text-3xl font-semibold text-gray-900">Your Lifetime Wealth Impact</h3>
                          <WealthImpactTooltip />
                        </div>
                        <div className="text-center mb-6">
                          <div className="text-5xl font-bold text-emerald-600 mb-3">
                            {formatCurrency(results.forecastData?.totalValue || 0)}
                          </div>
                          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            Total lifetime value created through your personalized tax optimization strategy.
                          </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                          <button
                            onClick={exportToPDF}
                            className="px-6 py-3 border border-emerald-500 text-emerald-700 rounded-md hover:bg-emerald-50 font-medium transition-all"
                          >
                            Download Strategy Report
                          </button>
                          <button className="px-6 py-3 bg-emerald-500 text-white rounded-md hover:bg-emerald-600 font-medium transition-all">
                            Start My Escape Plan
                          </button>
                        </div>
                      </div>

                      {/* Enhanced Forecast Controls */}
                      <div className="space-y-6 mb-8">
                        {/* Investment Strategy (Full Width) */}
                        <div className="bg-gray-50 rounded-2xl p-6">
                          <div className="text-sm uppercase text-gray-600 tracking-wide mb-3">Investment Strategy</div>
                          <div className="text-2xl font-bold text-gray-900 mb-3">
                            {forecastingData.reinvestSavings ? 'Reinvest Savings' : 'Save Only'}
                          </div>
                          <div className="text-xs text-gray-600">
                            {forecastingData.reinvestSavings ? `${forecastingData.returnRate}% annual return compound growth` : 'Cash savings without additional investment'}
                          </div>
                        </div>

                        {/* Control Cards Grid - Compact and Aligned */}
                        <div className="grid md:grid-cols-3 gap-4">
                          {/* Time Horizon with Green Slider */}
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-xs uppercase text-gray-600 tracking-wide mb-2 text-center">Time Horizon</div>
                            <div className="text-xl font-bold text-gray-900 mb-3 text-center">{forecastingData.forecastYears} years</div>
                            <div className="slider-container mb-2">
                              <div 
                                className="slider-track"
                                style={{
                                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${((forecastingData.forecastYears - 5) / 15) * 100}%, #e5e7eb ${((forecastingData.forecastYears - 5) / 15) * 100}%, #e5e7eb 100%)`
                                }}
                              ></div>
                              <input
                                type="range"
                                min="5"
                                max="20"
                                value={forecastingData.forecastYears}
                                onChange={(e) => {
                                  const newYears = parseInt(e.target.value);
                                  setForecastingData(prev => ({ ...prev, forecastYears: newYears }));
                                }}
                                className="slider-input"
                              />
                            </div>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>5</span>
                              <span>20</span>
                            </div>
                          </div>

                          {/* Return Rate Slider - Center Aligned */}
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-xs uppercase text-gray-600 tracking-wide mb-2 text-center">Return Rate</div>
                            <div className="text-xl font-bold text-gray-900 mb-3 text-center">{forecastingData.returnRate}%</div>
                            <div className="slider-container mb-2">
                              <div 
                                className="slider-track"
                                style={{
                                  background: `linear-gradient(to right, #10b981 0%, #10b981 ${((forecastingData.returnRate - 3) / 9) * 100}%, #e5e7eb ${((forecastingData.returnRate - 3) / 9) * 100}%, #e5e7eb 100%)`
                                }}
                              ></div>
                              <input
                                type="range"
                                min="3"
                                max="12"
                                value={forecastingData.returnRate}
                                onChange={(e) => {
                                  const newRate = parseInt(e.target.value);
                                  setForecastingData(prev => ({ ...prev, returnRate: newRate }));
                                }}
                                className="slider-input"
                              />
                            </div>
                            <div className="text-xs text-gray-600 mb-1 text-center">Compounding at: {forecastingData.returnRate}% annually</div>
                            <div className="flex justify-between text-xs text-gray-600">
                              <span>3%</span>
                              <span>12%</span>
                            </div>
                          </div>

                          {/* Wealth Multiplier Loop - Inline and Compact */}
                          <div className="bg-gray-50 rounded-xl p-4">
                            <div className="text-xs uppercase text-gray-600 tracking-wide mb-2 text-center">Wealth Loop</div>
                            <div className="text-center mb-3">
                              <label className="flex items-center justify-center">
                                <input
                                  type="checkbox"
                                  checked={forecastingData.enableWealthLoop}
                                  onChange={(e) => {
                                    setForecastingData(prev => ({ ...prev, enableWealthLoop: e.target.checked }));
                                  }}
                                  className="mr-2 text-emerald-500 focus:ring-emerald-500"
                                />
                                <span className="text-sm font-semibold text-gray-900">
                                  {forecastingData.enableWealthLoop ? 'Enabled' : 'Disabled'}
                                </span>
                              </label>
                            </div>
                            {forecastingData.enableWealthLoop && (
                              <div className="bg-purple-50 border border-purple-200 rounded-lg p-2">
                                <div className="text-xs text-purple-700 font-medium mb-1">Active Multiplier</div>
                                <div className="text-xs text-purple-600">Compounding passive income</div>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Investment Strategy Options - Center Aligned with Reduced Width */}
                        <div className="max-w-2xl mx-auto">
                          <div className="text-xs uppercase text-gray-600 tracking-wide mb-3 text-center">Investment Approach</div>
                          <div className="flex justify-center gap-3">
                            <label className="flex items-center p-3 rounded-xl border cursor-pointer hover:border-emerald-300 w-56">
                              <input
                                type="radio"
                                name="reinvest"
                                checked={forecastingData.reinvestSavings}
                                onChange={() => setForecastingData(prev => ({ ...prev, reinvestSavings: true }))}
                                className="mr-3 text-emerald-500 focus:ring-emerald-500"
                              />
                              <div className="text-center">
                                <div className="font-semibold text-gray-900 text-sm">Reinvest tax savings</div>
                                <div className="text-xs text-gray-600">{forecastingData.returnRate}% annual compound growth</div>
                              </div>
                            </label>
                            <label className="flex items-center p-3 rounded-xl border cursor-pointer hover:border-emerald-300 w-56">
                              <input
                                type="radio"
                                name="reinvest"
                                checked={!forecastingData.reinvestSavings}
                                onChange={() => setForecastingData(prev => ({ ...prev, reinvestSavings: false }))}
                                className="mr-3 text-emerald-500 focus:ring-emerald-500"
                              />
                              <div className="text-center">
                                <div className="font-semibold text-gray-900 text-sm">Save tax reduction only</div>
                                <div className="text-xs text-gray-600">Keep savings without investment</div>
                              </div>
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Chart */}
                      <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={results.forecastData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={formatLargeNumber} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="doNothing" fill="#ef4444" name="Do Nothing" />
                            <Bar dataKey="implementStrategy" fill="#22c55e" name="Your Strategy" />
                            {forecastingData.enableWealthLoop && (
                              <Bar dataKey="passiveIncome" fill="#a855f7" name="Passive Income" />
                            )}
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* Strategy Modal */}
      <StrategyModal
        strategy={selectedStrategy}
        isOpen={isModalOpen}
        onClose={closeStrategyModal}
        strategyStatus={strategyStatuses[selectedStrategy?.id] || STRATEGY_STATUS.NOT_STARTED}
        onStatusChange={updateStrategyStatus}
        formatCurrency={formatCurrency}
      />
    </div>
  );
}

export default PlaybookGenerator;