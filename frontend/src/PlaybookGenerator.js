import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import html2pdf from 'html2pdf.js';

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

// Educational content mapping
const EDUCATIONAL_CONTENT = {
  'Business Entity Formation': {
    module: 'Module 2: Entity Optimization',
    glossary: ['LLC', 'S-Corp', 'Tax Election'],
    caseStudy: 'Small Business Structure Case Study'
  },
  'S-Corp Election Strategy': {
    module: 'Module 2: Entity Optimization',
    glossary: ['S-Corp', 'Payroll Tax', 'Distributions'],
    caseStudy: '$500K Business Owner S-Corp Election'
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
  },
  'Conservation Easement': {
    module: 'Module 4: Advanced Planning',
    glossary: ['Conservation Easement', 'Charitable Deduction'],
    caseStudy: 'Land Conservation Tax Benefits'
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

function PlaybookGenerator() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    incomeType: '',
    incomeRange: '',
    entityStructure: '',
    strategyGoals: [],
    receivesStockComp: false,
    rsuIncomePercent: ''
  });

  // Enhanced forecasting inputs
  const [forecastingData, setForecastingData] = useState({
    businessProfit: '',
    capitalAvailable: '',
    restructurePercent: '',
    forecastYears: 15,
    reinvestSavings: true,
    enableWealthLoop: true
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
  const [dashboardMode, setDashboardMode] = useState('input'); // 'input', 'dashboard'
  const [isGenerating, setIsGenerating] = useState(false);
  const [showQuarterlyReview, setShowQuarterlyReview] = useState(false);
  const [hasExistingData, setHasExistingData] = useState(false);

  // Load saved data from localStorage on component mount
  useEffect(() => {
    const savedData = localStorage.getItem('taxOptimizationData');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      if (parsed.results && parsed.results.strategyStack && parsed.results.strategyStack.setupStructure.length > 0) {
        setFormData(parsed.formData || formData);
        setForecastingData(parsed.forecastingData || forecastingData);
        setResults(parsed.results || results);
        setStrategyStatuses(parsed.strategyStatuses || {});
        setHasExistingData(true);
        setDashboardMode('dashboard');
      }
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    const dataToSave = {
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
    setForecastingData({ ...forecastingData, [field]: value });
  };

  const generateStrategyStack = (data, forecastData) => {
    const setupStructure = [];
    const deductionStrategies = [];
    const exitPlanning = [];
    
    // Setup & Structure Strategies
    if (data.entityStructure === 'None' || data.entityStructure === 'Not sure') {
      setupStructure.push({
        id: 'entity-formation',
        title: 'Business Entity Formation',
        complexity: 'Medium',
        module: 'Module 2: Entity Optimization',
        description: 'Establish optimal business structure for tax efficiency'
      });
    }
    
    if (data.incomeType === 'business-owner' || data.incomeType === 'blended') {
      setupStructure.push({
        id: 's-corp-election',
        title: 'S-Corp Election Strategy',
        complexity: 'Medium',
        module: 'Module 2: Entity Optimization',
        description: 'Optimize payroll vs distribution split for tax savings'
      });
    }

    if (data.strategyGoals.includes('Asset protection')) {
      setupStructure.push({
        id: 'asset-protection-trust',
        title: 'Asset Protection Trust',
        complexity: 'High',
        module: 'Module 4: Advanced Planning',
        description: 'Protect wealth from legal and financial risks'
      });
    }
    
    // Deduction Strategies
    if (data.incomeType === 'business-owner' || data.incomeType === 'blended') {
      deductionStrategies.push({
        id: 'business-expense-max',
        title: 'Business Expense Maximization',
        complexity: 'Low',
        module: 'Module 1: Foundation',
        description: 'Optimize all legitimate business deductions'
      });
      
      deductionStrategies.push({
        id: 'defined-benefit-plan',
        title: 'Defined Benefit Pension Plan',
        complexity: 'High',
        module: 'Module 3: Retirement Planning',
        description: 'High-contribution retirement strategy for business owners'
      });
    }
    
    if (data.receivesStockComp) {
      deductionStrategies.push({
        id: 'stock-comp-optimization',
        title: 'Stock Compensation Optimization',
        complexity: 'Medium',
        module: 'Module 3: Investment Strategies',
        description: 'Timing strategies for RSUs, options, and ESPP'
      });

      // Add QOF and Income Deferral for high RSU income
      const rsuPercent = parseInt(data.rsuIncomePercent) || 0;
      if (rsuPercent >= 30) {
        deductionStrategies.push({
          id: 'qof-strategy',
          title: 'Qualified Opportunity Fund (QOF)',
          complexity: 'High',
          module: 'Module 3: Investment Strategies',
          description: 'Defer and potentially eliminate capital gains from stock sales'
        });
      }

      if (rsuPercent >= 50) {
        deductionStrategies.push({
          id: 'income-deferral',
          title: 'Income Deferral Strategies',
          complexity: 'Medium',
          module: 'Module 3: Investment Strategies',
          description: 'Defer compensation to optimize tax brackets'
        });
      }
    }

    const capitalAvailable = parseInt(forecastData.capitalAvailable) || 0;
    if (capitalAvailable > 50000) {
      deductionStrategies.push({
        id: 'real-estate-strategies',
        title: 'Real Estate Investment Strategies',
        complexity: 'Medium',
        module: 'Module 3: Investment Strategies',
        description: 'Cost segregation and bonus depreciation benefits'
      });
    }

    if (capitalAvailable > 100000) {
      deductionStrategies.push({
        id: 'energy-tax-credits',
        title: 'Energy Tax Credit Investments',
        complexity: 'High',
        module: 'Module 3: Investment Strategies',
        description: 'Solar, oil & gas, and renewable energy credits'
      });
    }
    
    // Exit Planning
    if (data.strategyGoals.includes('Exit planning')) {
      exitPlanning.push({
        id: 'qsbs-strategy',
        title: 'Qualified Small Business Stock (QSBS)',
        complexity: 'High',
        module: 'Module 4: Advanced Planning',
        description: 'Up to $10M in tax-free business sale proceeds'
      });
      
      exitPlanning.push({
        id: 'installment-sale',
        title: 'Installment Sale Strategy',
        complexity: 'Medium',
        module: 'Module 4: Advanced Planning',
        description: 'Defer capital gains through structured payments'
      });
    }

    if (data.strategyGoals.includes('Build long-term passive income')) {
      exitPlanning.push({
        id: 'conservation-easement',
        title: 'Conservation Easement',
        complexity: 'High',
        module: 'Module 4: Advanced Planning',
        description: 'Land conservation for significant tax deductions'
      });
    }
    
    return { setupStructure, deductionStrategies, exitPlanning };
  };

  const calculateEstimatedSavings = () => {
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
    
    const savingsMinDollar = taxLiability * (baseSavingsMin / 100);
    const savingsMaxDollar = taxLiability * (baseSavingsMax / 100);
    
    return {
      percent: { min: baseSavingsMin, max: baseSavingsMax },
      dollar: { min: savingsMinDollar, max: savingsMaxDollar }
    };
  };

  const calculateForecastData = () => {
    const income = INCOME_BRACKETS[formData.incomeRange]?.default || 350000;
    const taxLiability = calculateFederalTax(income);
    const savings = calculateEstimatedSavings();
    const avgSavingsPercent = (savings.percent.min + savings.percent.max) / 2;
    
    const annualTaxSavings = taxLiability * (avgSavingsPercent / 100);
    const totalTaxWithoutStrategy = taxLiability * forecastingData.forecastYears;
    const totalTaxSavings = annualTaxSavings * forecastingData.forecastYears;
    
    let compoundedSavings = 0;
    let passiveIncomeProjections = [];
    
    if (forecastingData.reinvestSavings && forecastingData.enableWealthLoop) {
      const annualReturn = 0.06;
      let cumulativeInvestment = 0;
      
      for (let year = 1; year <= forecastingData.forecastYears; year++) {
        cumulativeInvestment += annualTaxSavings;
        const yearEndValue = cumulativeInvestment * Math.pow(1 + annualReturn, year);
        compoundedSavings = yearEndValue;
        
        // Calculate passive income (6% of accumulated wealth)
        const passiveIncome = yearEndValue * 0.06;
        
        if (year === 10 || year === 15 || year === 20) {
          passiveIncomeProjections.push({
            year,
            passiveIncome,
            totalWealth: yearEndValue
          });
        }
      }
    } else if (forecastingData.reinvestSavings) {
      const annualReturn = 0.06;
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
        for (let y = 1; y <= year; y++) {
          cumulativeValue += annualTaxSavings * Math.pow(1.06, year - y);
        }
        
        // Calculate cumulative passive income generated
        if (forecastingData.enableWealthLoop) {
          cumulativePassiveIncome = cumulativeValue * 0.06;
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
    // Skip stock compensation step for business owners
    if (currentStep === 4 && formData.incomeType === 'business-owner') {
      setCurrentStep(7); // Skip steps 5 and 6
    } else if (currentStep === 5 && !formData.receivesStockComp) {
      setCurrentStep(7); // Skip RSU percentage step if no stock comp
    } else if (currentStep < 8) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 8) {
      generatePlaybook();
    }
  };

  const prevStep = () => {
    // Handle reverse navigation with conditional steps
    if (currentStep === 7) {
      if (formData.incomeType === 'business-owner') {
        setCurrentStep(4); // Skip stock comp steps
      } else if (!formData.receivesStockComp) {
        setCurrentStep(5); // Go back to stock comp question
      } else {
        setCurrentStep(6); // Go back to RSU percentage
      }
    } else if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return formData.incomeType !== '';
      case 2: return formData.incomeRange !== '';
      case 3: return formData.entityStructure !== '';
      case 4: return formData.strategyGoals.length > 0;
      case 5: 
        return formData.receivesStockComp !== null;
      case 6:
        return formData.rsuIncomePercent !== '';
      case 7: 
        return forecastingData.businessProfit !== '' && 
               forecastingData.capitalAvailable !== '' && 
               forecastingData.restructurePercent !== '';
      case 8: return forecastingData.forecastYears > 0;
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
      receivesStockComp: false,
      rsuIncomePercent: ''
    });
    setForecastingData({
      businessProfit: '',
      capitalAvailable: '',
      restructurePercent: '',
      forecastYears: 15,
      reinvestSavings: true,
      enableWealthLoop: true
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

  const getStrategyProgress = () => {
    const allStrategies = [...results.strategyStack.setupStructure, ...results.strategyStack.deductionStrategies, ...results.strategyStack.exitPlanning];
    const implementedCount = allStrategies.filter(strategy => strategyStatuses[strategy.id] === STRATEGY_STATUS.IMPLEMENTED).length;
    return {
      implemented: implementedCount,
      total: allStrategies.length,
      percentage: allStrategies.length > 0 ? Math.round((implementedCount / allStrategies.length) * 100) : 0
    };
  };

  const getIncomeFieldConfig = () => {
    switch (formData.incomeType) {
      case 'w2-employee':
        return {
          label: 'What is your annual W-2 income before taxes?',
          placeholder: 'e.g., 275000'
        };
      case 'business-owner':
        return {
          label: 'What is your annual business profit before taxes?',
          placeholder: 'e.g., 500000'
        };
      case 'blended':
        return {
          label: 'What is your combined income (W-2 + business profit) before taxes?',
          placeholder: 'e.g., 800000'
        };
      default:
        return {
          label: 'What is your annual income before taxes?',
          placeholder: 'e.g., 350000'
        };
    }
  };
    const progress = getStrategyProgress();
    const allStrategies = [...results.strategyStack.setupStructure, ...results.strategyStack.deductionStrategies, ...results.strategyStack.exitPlanning];
    const notStartedStrategies = allStrategies.filter(strategy => strategyStatuses[strategy.id] === STRATEGY_STATUS.NOT_STARTED);
    
    // Calculate potential missed savings from unimplemented strategies
    const estimatedAnnualSavings = results.estimatedSavingsDollar.min + (results.estimatedSavingsDollar.max - results.estimatedSavingsDollar.min) / 2;
    const missedSavingsPerStrategy = estimatedAnnualSavings / allStrategies.length;
    
    return {
      progress,
      notStartedStrategies: notStartedStrategies.slice(0, 3),
      estimatedMissedSavings: missedSavingsPerStrategy * notStartedStrategies.length,
      recommendations: [
        "Consider implementing entity restructure for immediate tax savings",
        "Review business expense deductions for Q4 optimization",
        "Schedule consultation for high-impact strategies"
      ]
    };
  };

  const exportToPDF = () => {
    const element = document.getElementById('dashboard-content');
    const opt = {
      margin: 1,
      filename: 'tax-optimization-playbook.pdf',
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const renderStrategyCard = (strategy) => {
    const status = strategyStatuses[strategy.id] || STRATEGY_STATUS.NOT_STARTED;
    const content = EDUCATIONAL_CONTENT[strategy.title] || {};
    
    const getStatusIcon = () => {
      switch (status) {
        case STRATEGY_STATUS.IMPLEMENTED: return '✅';
        case STRATEGY_STATUS.IN_PROGRESS: return '⏳';
        case STRATEGY_STATUS.NOT_APPLICABLE: return '🚫';
        default: return '❌';
      }
    };
    
    const getStatusColor = () => {
      switch (status) {
        case STRATEGY_STATUS.IMPLEMENTED: return 'border-green-500 bg-green-50';
        case STRATEGY_STATUS.IN_PROGRESS: return 'border-yellow-500 bg-yellow-50';
        case STRATEGY_STATUS.NOT_APPLICABLE: return 'border-gray-400 bg-gray-50';
        default: return 'border-gray-300 bg-white';
      }
    };
    
    return (
      <div key={strategy.id} className={`border-2 rounded-xl p-6 transition-all hover:shadow-md ${getStatusColor()}`}>
        <div className="flex justify-between items-start mb-4">
          <h4 className="text-lg font-bold text-gray-900 leading-tight">{strategy.title}</h4>
          <div className="flex items-center gap-2">
            <span className="text-lg">{getStatusIcon()}</span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium ${
              strategy.complexity === 'Low' ? 'bg-green-100 text-green-800' :
              strategy.complexity === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
              'bg-red-100 text-red-800'
            }`}>
              {strategy.complexity}
            </span>
          </div>
        </div>
        
        <p className="text-gray-600 mb-4 leading-relaxed">{strategy.description}</p>
        
        {/* Educational Content */}
        <div className="flex flex-wrap gap-2 mb-4">
          {content.module && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-blue-100 text-blue-800 font-medium">
              📚 {content.module}
            </span>
          )}
          {content.glossary && content.glossary.length > 0 && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-purple-100 text-purple-800 font-medium">
              📖 Glossary
            </span>
          )}
          {content.caseStudy && (
            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-green-100 text-green-800 font-medium">
              💼 Case Study
            </span>
          )}
        </div>
        
        {/* Implementation Status */}
        <div className="pt-4 border-t border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-2">Implementation Status</label>
          <select
            value={status}
            onChange={(e) => updateStrategyStatus(strategy.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value={STRATEGY_STATUS.NOT_STARTED}>❌ Not Started</option>
            <option value={STRATEGY_STATUS.IN_PROGRESS}>⏳ In Progress</option>
            <option value={STRATEGY_STATUS.IMPLEMENTED}>✅ Implemented</option>
            <option value={STRATEGY_STATUS.NOT_APPLICABLE}>🚫 Not Applicable</option>
          </select>
        </div>
      </div>
    );
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Tax Plan</h2>
            <p className="text-gray-600">
              Creating personalized strategies and calculating your lifetime savings...
            </p>
          </div>
          <div className="space-y-2 text-left text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Analyzing your financial profile
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Matching optimal tax strategies
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
              Calculating lifetime value projections
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block font-medium">
            ← Back to Platform
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Tax Planning Dashboard
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
            Your comprehensive tax optimization center. Build strategies, track progress, and forecast your financial future.
          </p>
        </div>

        {dashboardMode === 'input' ? (
          /* Input Mode */
          <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8 bg-white rounded-xl p-6 shadow-sm">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span className="font-medium">Step {currentStep} of 8</span>
                <span className="font-medium">{Math.round((currentStep / 8) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${(currentStep / 8) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Form Card */}
            <div className="bg-white rounded-xl shadow-lg p-8">
              {/* STEP 1: Income Type */}
              {currentStep === 1 && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">What type of income do you currently earn?</h2>
                  <div className="grid md:grid-cols-2 gap-6">
                    {[
                      { value: 'w2-employee', label: 'W-2 Employee', desc: 'Traditional employee with W-2 income' },
                      { value: '1099-contractor', label: '1099 Contractor', desc: 'Independent contractor or freelancer' },
                      { value: 'business-owner', label: 'Business Owner', desc: 'Own a business or multiple revenue streams' },
                      { value: 'blended', label: 'Blended', desc: 'Mix of W-2, 1099, and/or business income' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleInputChange('incomeType', option.value)}
                        className={`text-left p-8 rounded-xl border-2 transition-all hover:scale-105 ${
                          formData.incomeType === option.value
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="text-xl font-bold text-gray-900">{option.label}</div>
                        <div className="text-gray-600 mt-2">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 2: Income Range */}
              {currentStep === 2 && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">What is your approximate annual income?</h2>
                  <div className="grid md:grid-cols-2 gap-6">
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
                        className={`text-left p-8 rounded-xl border-2 transition-all hover:scale-105 ${
                          formData.incomeRange === option.value
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="text-xl font-bold text-gray-900">{option.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 3: Entity Structure */}
              {currentStep === 3 && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">What is your current entity structure?</h2>
                  <div className="grid md:grid-cols-2 gap-6">
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
                        className={`text-left p-8 rounded-xl border-2 transition-all hover:scale-105 ${
                          formData.entityStructure === option.value
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="text-xl font-bold text-gray-900">{option.label}</div>
                        <div className="text-gray-600 mt-2">{option.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 4: Strategic Goals */}
              {currentStep === 4 && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">What are your strategic goals? (Select all that apply)</h2>
                  <div className="space-y-4">
                    {[
                      { value: 'Reduce tax liability', label: 'Reduce tax liability', desc: 'Lower current tax burden' },
                      { value: 'Build long-term passive income', label: 'Build long-term passive income', desc: 'Create sustainable income streams' },
                      { value: 'Asset protection', label: 'Asset protection', desc: 'Protect wealth from legal and financial risks' },
                      { value: 'Exit planning', label: 'Exit planning', desc: 'Prepare for business sale or succession' },
                      { value: 'All of the above', label: 'All of the above', desc: 'Comprehensive wealth optimization strategy' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleMultiSelect('strategyGoals', option.value)}
                        className={`w-full text-left p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                          formData.strategyGoals.includes(option.value)
                            ? 'border-blue-500 bg-blue-50 shadow-md'
                            : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-lg font-bold text-gray-900">{option.label}</div>
                            <div className="text-gray-600 mt-1">{option.desc}</div>
                          </div>
                          {formData.strategyGoals.includes(option.value) && (
                            <div className="text-blue-500">
                              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* STEP 5: Stock Compensation (conditional) */}
              {currentStep === 5 && (formData.incomeType === 'w2-employee' || formData.incomeType === 'blended') && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Do you receive stock-based compensation?</h2>
                  <p className="text-lg text-gray-600 mb-8">
                    This includes stock options, RSUs, ESPP, or other equity compensation
                  </p>
                  <div className="grid md:grid-cols-2 gap-8">
                    <button
                      onClick={() => handleInputChange('receivesStockComp', true)}
                      className={`text-left p-8 rounded-xl border-2 transition-all hover:scale-105 ${
                        formData.receivesStockComp === true
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="text-2xl font-bold text-gray-900">Yes</div>
                      <div className="text-gray-600 mt-2">I receive stock options, RSUs, or other equity compensation</div>
                    </button>
                    <button
                      onClick={() => handleInputChange('receivesStockComp', false)}
                      className={`text-left p-8 rounded-xl border-2 transition-all hover:scale-105 ${
                        formData.receivesStockComp === false
                          ? 'border-blue-500 bg-blue-50 shadow-md'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                    >
                      <div className="text-2xl font-bold text-gray-900">No</div>
                      <div className="text-gray-600 mt-2">I do not receive stock-based compensation</div>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 6: RSU Percentage (conditional) */}
              {currentStep === 6 && formData.receivesStockComp && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">What percentage of your income comes from RSUs or other stock-based compensation?</h2>
                  <p className="text-lg text-gray-600 mb-8">
                    This helps us recommend the right strategies for stock compensation optimization and tax deferral opportunities.
                  </p>
                  <div className="max-w-md mx-auto">
                    <div className="relative">
                      <input
                        type="number"
                        value={formData.rsuIncomePercent}
                        onChange={(e) => handleInputChange('rsuIncomePercent', e.target.value)}
                        placeholder="e.g. 35"
                        min="0"
                        max="100"
                        className="w-full p-6 text-2xl font-bold border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12 text-center"
                      />
                      <span className="absolute right-6 top-1/2 transform -translate-y-1/2 text-2xl text-gray-500 font-bold">%</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-3 text-center">Enter a value between 0-100</p>
                  </div>
                </div>
              )}

              {/* STEP 7: Forecasting Details */}
              {currentStep === 7 && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Financial Details for Accurate Forecasting</h2>
                  <div className="space-y-8">
                    <div>
                      <label className="block text-lg font-bold text-gray-900 mb-3">
                        Annual operating business profit ($)
                      </label>
                      <input
                        type="number"
                        value={forecastingData.businessProfit}
                        onChange={(e) => handleForecastingChange('businessProfit', e.target.value)}
                        placeholder="e.g., 500000"
                        min="0"
                        className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-gray-500 mt-2">Enter your annual business profit before taxes</p>
                    </div>
                    
                    <div>
                      <label className="block text-lg font-bold text-gray-900 mb-3">
                        Capital available for tax-advantaged investments ($)
                      </label>
                      <input
                        type="number"
                        value={forecastingData.capitalAvailable}
                        onChange={(e) => handleForecastingChange('capitalAvailable', e.target.value)}
                        placeholder="e.g., 250000"
                        min="0"
                        className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      <p className="text-gray-500 mt-2">Capital you could invest in real estate, energy credits, etc.</p>
                    </div>
                    
                    <div>
                      <label className="block text-lg font-bold text-gray-900 mb-3">
                        What percentage of income could be restructured or offset?
                      </label>
                      <div className="relative max-w-md">
                        <input
                          type="number"
                          value={forecastingData.restructurePercent}
                          onChange={(e) => handleForecastingChange('restructurePercent', e.target.value)}
                          placeholder="e.g., 30"
                          min="0"
                          max="100"
                          className="w-full p-4 text-lg border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-12"
                        />
                        <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-lg text-gray-500 font-bold">%</span>
                      </div>
                      <p className="text-gray-500 mt-2">Percentage of income that could be optimized through strategies</p>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 8: Forecast Parameters */}
              {currentStep === 8 && (
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-8">Forecast Parameters</h2>
                  
                  <div className="space-y-8">
                    {/* Forecast Horizon */}
                    <div>
                      <label className="block text-lg font-bold text-gray-900 mb-4">
                        Time horizon for analysis
                      </label>
                      <div className="grid grid-cols-4 gap-4">
                        {[5, 10, 15, 20].map((years) => (
                          <button
                            key={years}
                            onClick={() => handleForecastingChange('forecastYears', years)}
                            className={`p-6 text-center rounded-xl border-2 transition-all hover:scale-105 ${
                              forecastingData.forecastYears === years
                                ? 'border-blue-500 bg-blue-50 shadow-md'
                                : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                            }`}
                          >
                            <div className="text-2xl font-bold text-gray-900">{years}</div>
                            <div className="text-gray-600">Years</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reinvestment Toggle */}
                    <div>
                      <label className="block text-lg font-bold text-gray-900 mb-4">
                        Reinvest tax savings at 6% annually?
                      </label>
                      <div className="grid md:grid-cols-2 gap-6">
                        <button
                          onClick={() => handleForecastingChange('reinvestSavings', true)}
                          className={`text-left p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                            forecastingData.reinvestSavings
                              ? 'border-green-500 bg-green-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="text-xl font-bold text-gray-900">Yes, reinvest for compound growth</div>
                          <div className="text-gray-600 mt-2">Maximize long-term wealth creation</div>
                        </button>
                        <button
                          onClick={() => handleForecastingChange('reinvestSavings', false)}
                          className={`text-left p-6 rounded-xl border-2 transition-all hover:scale-105 ${
                            !forecastingData.reinvestSavings
                              ? 'border-blue-500 bg-blue-50 shadow-md'
                              : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                          }`}
                        >
                          <div className="text-xl font-bold text-gray-900">No, just save the tax reduction</div>
                          <div className="text-gray-600 mt-2">Keep savings without investment growth</div>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-12">
                <button
                  onClick={prevStep}
                  disabled={currentStep === 1}
                  className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-all font-medium"
                >
                  Previous
                </button>
                <button
                  onClick={nextStep}
                  disabled={!isStepComplete()}
                  className={`px-12 py-3 text-white rounded-xl disabled:opacity-50 disabled:cursor-not-allowed font-bold text-lg transition-all ${
                    currentStep === 8
                      ? 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                      : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                  }`}
                >
                  {currentStep === 8 ? 'Generate My Tax Plan' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Dashboard Mode */
          <div className="max-w-7xl mx-auto" id="dashboard-content">
            {/* Entry Point Section */}
            <div className="mb-12">
              {!hasExistingData ? (
                <div className="bg-white rounded-xl shadow-lg p-8 text-center">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Let's Build Your Personalized Tax Plan</h2>
                  <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
                    Start from scratch and uncover the strategies that could save you 20–40% in taxes.
                  </p>
                  <button
                    onClick={startNewAnalysis}
                    className="px-12 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-xl font-bold rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    Start Analysis
                  </button>
                </div>
              ) : (
                <div className="grid md:grid-cols-3 gap-6">
                  <button
                    onClick={startNewAnalysis}
                    className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-6 rounded-xl text-center hover:from-blue-700 hover:to-purple-700 transition-all shadow-lg"
                  >
                    <div className="text-2xl font-bold mb-2">🆕 New Analysis</div>
                    <div className="text-sm opacity-90">Start fresh analysis</div>
                  </button>
                  <button
                    onClick={recalculatePlaybook}
                    className="bg-white border-2 border-blue-200 text-blue-700 p-6 rounded-xl text-center hover:bg-blue-50 transition-all"
                  >
                    <div className="text-2xl font-bold mb-2">🔄 Recalculate</div>
                    <div className="text-sm">Update existing plan</div>
                  </button>
                  <button
                    onClick={() => setShowQuarterlyReview(!showQuarterlyReview)}
                    className="bg-white border-2 border-green-200 text-green-700 p-6 rounded-xl text-center hover:bg-green-50 transition-all"
                  >
                    <div className="text-2xl font-bold mb-2">📋 Quarterly Review</div>
                    <div className="text-sm">Progress check-in</div>
                  </button>
                </div>
              )}
            </div>

            {hasExistingData && (
              <>
                {/* Profile Summary */}
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">👤 Profile Summary</h2>
                  <div className="grid md:grid-cols-4 gap-6">
                    <div>
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Income Type</div>
                      <div className="text-lg font-bold text-gray-900">{formData.incomeType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Income Range</div>
                      <div className="text-lg font-bold text-gray-900">{formData.incomeRange}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Entity Structure</div>
                      <div className="text-lg font-bold text-gray-900">{formData.entityStructure}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-500 uppercase tracking-wide">Stock Compensation</div>
                      <div className="text-lg font-bold text-gray-900">
                        {formData.receivesStockComp ? `Yes (${formData.rsuIncomePercent}%)` : 'No'}
                      </div>
                    </div>
                  </div>
                  {results.lastUpdated && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                      <p className="text-sm text-gray-500">
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
                    <div className="bg-gradient-to-r from-orange-50 to-red-50 border-l-4 border-orange-500 rounded-xl p-8 mb-8">
                      <h3 className="text-2xl font-bold text-orange-900 mb-6">🔍 Quarterly Tax Strategy Check-In</h3>
                      
                      <div className="grid lg:grid-cols-2 gap-8">
                        <div>
                          <h4 className="text-lg font-bold text-orange-800 mb-4">Priority Action Items</h4>
                          <ul className="space-y-3">
                            {review.notStartedStrategies.map(strategy => (
                              <li key={strategy.id} className="text-orange-700 flex items-start">
                                <span className="mr-2">•</span>
                                <div>
                                  <div className="font-medium">{strategy.title}</div>
                                  <div className="text-sm opacity-80">{strategy.complexity} complexity</div>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                        
                        <div>
                          <h4 className="text-lg font-bold text-orange-800 mb-4">Potential Impact</h4>
                          <p className="text-orange-700 mb-4">
                            Unimplemented strategies could be costing you approximately{' '}
                            <span className="font-bold text-xl">{formatCurrency(review.estimatedMissedSavings)}</span> per year in missed tax savings.
                          </p>
                          
                          <h4 className="text-lg font-bold text-orange-800 mb-2">Recommended Next Steps</h4>
                          <ul className="text-sm text-orange-700 space-y-1">
                            {review.recommendations.map((rec, index) => (
                              <li key={index}>• {rec}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Estimated Tax Savings */}
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl p-8 mb-8 text-center">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">💰 Estimated Tax Savings</h2>
                  <div className="text-5xl font-bold text-green-600 mb-4">
                    {results.estimatedSavingsPercent.min}% – {results.estimatedSavingsPercent.max}%
                  </div>
                  <div className="text-2xl font-bold text-gray-700">
                    {formatCurrency(results.estimatedSavingsDollar.min)} – {formatCurrency(results.estimatedSavingsDollar.max)} annually
                  </div>
                </div>

                {/* Strategy Stack */}
                <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-8">🎯 Your Strategy Stack</h2>
                  
                  {/* Progress Overview */}
                  {(() => {
                    const progress = getStrategyProgress();
                    return (
                      <div className="bg-gray-50 rounded-xl p-6 mb-8">
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="text-lg font-bold text-gray-900">Implementation Progress</h3>
                          <span className="text-2xl font-bold text-blue-600">{progress.percentage}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                          <div 
                            className="bg-gradient-to-r from-blue-600 to-green-600 h-4 rounded-full transition-all duration-500"
                            style={{ width: `${progress.percentage}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-600">{progress.implemented} of {progress.total} strategies implemented</p>
                      </div>
                    );
                  })()}
                  
                  {/* Setup & Structure */}
                  {results.strategyStack.setupStructure.length > 0 && (
                    <div className="mb-10">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Setup & Structure</h3>
                      <div className="grid lg:grid-cols-2 gap-6">
                        {results.strategyStack.setupStructure.map(renderStrategyCard)}
                      </div>
                    </div>
                  )}

                  {/* Deduction Strategies */}
                  {results.strategyStack.deductionStrategies.length > 0 && (
                    <div className="mb-10">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Deduction Strategies</h3>
                      <div className="grid lg:grid-cols-2 gap-6">
                        {results.strategyStack.deductionStrategies.map(renderStrategyCard)}
                      </div>
                    </div>
                  )}

                  {/* Exit Planning */}
                  {results.strategyStack.exitPlanning.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-bold text-gray-800 mb-6">Exit Planning</h3>
                      <div className="grid lg:grid-cols-2 gap-6">
                        {results.strategyStack.exitPlanning.map(renderStrategyCard)}
                      </div>
                    </div>
                  )}
                </div>

                {/* Lifetime Forecast */}
                {results.forecastData && (
                  <div className="bg-white rounded-xl shadow-sm p-8 mb-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-8">📈 Lifetime Impact Forecast</h2>
                    
                    {/* Forecast Controls */}
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Time Horizon</h3>
                        <div className="grid grid-cols-4 gap-2">
                          {[5, 10, 15, 20].map((years) => (
                            <button
                              key={years}
                              onClick={() => {
                                handleForecastingChange('forecastYears', years);
                                // Recalculate with new time horizon
                                const newForecastData = calculateForecastData();
                                setResults(prev => ({ ...prev, forecastData: newForecastData }));
                              }}
                              className={`p-3 text-center rounded-lg border-2 transition-all ${
                                forecastingData.forecastYears === years
                                  ? 'border-blue-500 bg-blue-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-bold">{years}</div>
                              <div className="text-xs text-gray-500">Years</div>
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Reinvestment Strategy</h3>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="reinvest"
                              checked={forecastingData.reinvestSavings}
                              onChange={() => {
                                handleForecastingChange('reinvestSavings', true);
                                const newForecastData = calculateForecastData();
                                setResults(prev => ({ ...prev, forecastData: newForecastData }));
                              }}
                              className="mr-3"
                            />
                            <span>Reinvest at 6% annually</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="reinvest"
                              checked={!forecastingData.reinvestSavings}
                              onChange={() => {
                                handleForecastingChange('reinvestSavings', false);
                                const newForecastData = calculateForecastData();
                                setResults(prev => ({ ...prev, forecastData: newForecastData }));
                              }}
                              className="mr-3"
                            />
                            <span>Just save the tax reduction</span>
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Scenario Comparison */}
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      {/* Scenario A */}
                      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                        <h4 className="text-xl font-bold text-red-800 mb-4">Scenario A: Do Nothing</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Annual Tax Liability:</span>
                            <span className="font-bold">{formatCurrency(results.forecastData.taxLiability)}</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Tax Over {forecastingData.forecastYears} Years:</span>
                            <span className="font-bold text-red-600">
                              {formatCurrency(results.forecastData.totalTaxWithoutStrategy)}
                            </span>
                          </div>
                          <div className="flex justify-between border-t pt-3">
                            <span className="font-bold">Total Value:</span>
                            <span className="font-bold text-red-600">$0</span>
                          </div>
                        </div>
                      </div>

                      {/* Scenario B */}
                      <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
                        <h4 className="text-xl font-bold text-green-800 mb-4">Scenario B: Implement Strategy</h4>
                        <div className="space-y-3">
                          <div className="flex justify-between">
                            <span>Annual Tax Savings:</span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(results.forecastData.annualTaxSavings)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>Total Tax Saved:</span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(results.forecastData.totalTaxSavings)}
                            </span>
                          </div>
                          {forecastingData.reinvestSavings && (
                            <div className="flex justify-between">
                              <span>Investment Growth:</span>
                              <span className="font-bold text-green-600">
                                {formatCurrency(results.forecastData.compoundedSavings - results.forecastData.totalTaxSavings)}
                              </span>
                            </div>
                          )}
                          <div className="flex justify-between border-t pt-3">
                            <span className="font-bold">Total Value Created:</span>
                            <span className="font-bold text-green-600">
                              {formatCurrency(results.forecastData.totalValue)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Chart */}
                    <div className="mb-8">
                      <h4 className="text-xl font-bold mb-6 text-center">Cumulative Impact Over Time</h4>
                      <div className="h-96">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={results.forecastData.chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="year" />
                            <YAxis tickFormatter={formatLargeNumber} />
                            <Tooltip formatter={(value) => formatCurrency(value)} />
                            <Legend />
                            <Bar dataKey="doNothing" fill="#ef4444" name="Cumulative Tax Paid (Do Nothing)" />
                            <Bar dataKey="implementStrategy" fill="#22c55e" name="Value Created (Implement Strategy)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* Export & Engagement */}
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-lg p-8 text-center text-white">
                  <h2 className="text-3xl font-bold mb-4">🚀 Ready to Implement Your Strategy?</h2>
                  <p className="text-lg mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
                    You now have a personalized roadmap to optimize your taxes and create 
                    <span className="font-bold"> {formatCurrency(results.forecastData?.totalValue || 0)}</span> 
                    in lifetime value. Let's make it happen.
                  </p>
                  
                  <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
                    <button
                      onClick={exportToPDF}
                      className="px-8 py-3 bg-white text-purple-600 rounded-xl hover:bg-gray-100 font-bold text-lg transition-all shadow-lg"
                    >
                      📄 Download My Tax Strategy Report
                    </button>
                    <button className="px-12 py-3 bg-green-600 text-white rounded-xl hover:bg-green-700 font-bold text-lg transition-all shadow-lg">
                      Start My Escape Plan
                    </button>
                  </div>
                  
                  <p className="text-sm opacity-75">
                    Ready to implement your personalized tax optimization strategy?
                  </p>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PlaybookGenerator;