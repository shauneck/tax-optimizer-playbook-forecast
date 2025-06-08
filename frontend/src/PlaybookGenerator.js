import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

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
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    incomeType: '',
    incomeRange: '',
    entityStructure: '',
    strategyGoals: [],
    receivesStockComp: false
  });

  // Enhanced forecasting inputs
  const [forecastingData, setForecastingData] = useState({
    businessProfit: '',
    capitalAvailable: '',
    restructurePercent: '',
    forecastYears: 15,
    reinvestSavings: true
  });

  const [results, setResults] = useState({
    strategyStack: {
      setupStructure: [],
      deductionStrategies: [],
      exitPlanning: []
    },
    estimatedSavingsPercent: { min: 0, max: 0 },
    estimatedSavingsDollar: { min: 0, max: 0 },
    forecastData: null
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
        title: 'Business Entity Formation',
        complexity: 'Medium',
        module: 'Module 2: Entity Optimization',
        description: 'Establish optimal business structure for tax efficiency'
      });
    }
    
    if (data.incomeType === 'business-owner' || data.incomeType === 'blended') {
      setupStructure.push({
        title: 'S-Corp Election Strategy',
        complexity: 'Medium',
        module: 'Module 2: Entity Optimization',
        description: 'Optimize payroll vs distribution split for tax savings'
      });
    }

    if (data.strategyGoals.includes('Asset protection')) {
      setupStructure.push({
        title: 'Asset Protection Trust',
        complexity: 'High',
        module: 'Module 4: Advanced Planning',
        description: 'Protect wealth from legal and financial risks'
      });
    }
    
    // Deduction Strategies
    if (data.incomeType === 'business-owner' || data.incomeType === 'blended') {
      deductionStrategies.push({
        title: 'Business Expense Maximization',
        complexity: 'Low',
        module: 'Module 1: Foundation',
        description: 'Optimize all legitimate business deductions'
      });
      
      deductionStrategies.push({
        title: 'Defined Benefit Pension Plan',
        complexity: 'High',
        module: 'Module 3: Retirement Planning',
        description: 'High-contribution retirement strategy for business owners'
      });
    }
    
    if (data.receivesStockComp) {
      deductionStrategies.push({
        title: 'Stock Compensation Optimization',
        complexity: 'Medium',
        module: 'Module 3: Investment Strategies',
        description: 'Timing strategies for RSUs, options, and ESPP'
      });
    }

    if (parseInt(forecastData.capitalAvailable) > 50000) {
      deductionStrategies.push({
        title: 'Real Estate Investment Strategies',
        complexity: 'Medium',
        module: 'Module 3: Investment Strategies',
        description: 'Cost segregation and bonus depreciation benefits'
      });
    }

    if (parseInt(forecastData.capitalAvailable) > 100000) {
      deductionStrategies.push({
        title: 'Energy Tax Credit Investments',
        complexity: 'High',
        module: 'Module 3: Investment Strategies',
        description: 'Solar, oil & gas, and renewable energy credits'
      });
    }
    
    // Exit Planning
    if (data.strategyGoals.includes('Exit planning')) {
      exitPlanning.push({
        title: 'Qualified Small Business Stock (QSBS)',
        complexity: 'High',
        module: 'Module 4: Advanced Planning',
        description: 'Up to $10M in tax-free business sale proceeds'
      });
      
      exitPlanning.push({
        title: 'Installment Sale Strategy',
        complexity: 'Medium',
        module: 'Module 4: Advanced Planning',
        description: 'Defer capital gains through structured payments'
      });
    }

    if (data.strategyGoals.includes('Build long-term passive income')) {
      exitPlanning.push({
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
    if (forecastingData.reinvestSavings) {
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
      
      if (forecastingData.reinvestSavings) {
        cumulativeValue = 0;
        for (let y = 1; y <= year; y++) {
          cumulativeValue += annualTaxSavings * Math.pow(1.06, year - y);
        }
      }
      
      chartData.push({
        year: `Year ${year}`,
        doNothing: cumulativeTaxPaid,
        implementStrategy: cumulativeValue
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
      chartData
    };
  };

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const generatePlaybook = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // Calculate estimated savings based on user profile
    let estimatedSavingsPercent = 15; // Base savings
    
    // Adjust based on income type
    if (formData.incomeType === 'business-owner') {
      estimatedSavingsPercent += 10;
    } else if (formData.incomeType === '1099-contractor') {
      estimatedSavingsPercent += 8;
    } else if (formData.incomeType === 'blended') {
      estimatedSavingsPercent += 12;
    }
    
    // Adjust based on income range
    if (formData.incomeRange === '$500K–$1M') {
      estimatedSavingsPercent += 5;
    } else if (formData.incomeRange === '$1M–$5M') {
      estimatedSavingsPercent += 8;
    } else if (formData.incomeRange === '$5M+') {
      estimatedSavingsPercent += 12;
    }
    
    // Adjust based on entity structure
    if (formData.entityStructure === 'None' || formData.entityStructure === 'Not sure') {
      estimatedSavingsPercent += 5;
    }
    
    // Adjust based on strategy goals
    if (formData.strategyGoals.length >= 3) {
      estimatedSavingsPercent += 3;
    }
    
    // Adjust for stock compensation
    if (formData.receivesStockComp) {
      estimatedSavingsPercent += 4;
    }
    
    // Cap at reasonable maximum
    estimatedSavingsPercent = Math.min(estimatedSavingsPercent, 40);
    
    // Store the result in localStorage with new structure
    const playbookResult = {
      incomeType: formData.incomeType,
      incomeRange: formData.incomeRange,
      entityStructure: formData.entityStructure,
      strategyGoals: formData.strategyGoals,
      receivesStockComp: formData.receivesStockComp,
      estimated_savings_percent: estimatedSavingsPercent,
      completion_date: new Date().toISOString(),
      strategy_recommendations: generateStrategyRecommendations(formData, estimatedSavingsPercent)
    };
    
    localStorage.setItem('irs_escape_plan_playbook', JSON.stringify(playbookResult));
    
    setIsGenerating(false);
    
    // Redirect to forecaster
    navigate('/forecaster');
  };

  const generateStrategyRecommendations = (data, savingsPercent) => {
    const recommendations = [];
    
    if (data.entityStructure === 'None' || data.entityStructure === 'Not sure') {
      recommendations.push('Business Entity Optimization');
    }
    
    if (data.incomeType === 'business-owner' || data.incomeType === 'blended') {
      recommendations.push('Business Expense Maximization');
      recommendations.push('Retirement Plan Optimization');
    }
    
    if (data.receivesStockComp) {
      recommendations.push('Stock Compensation Strategy');
    }
    
    if (data.strategyGoals.includes('Asset protection')) {
      recommendations.push('Asset Protection Planning');
    }
    
    if (data.strategyGoals.includes('Exit planning')) {
      recommendations.push('Exit Strategy Tax Planning');
    }
    
    return recommendations;
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return formData.incomeType !== '';
      case 2: return formData.incomeRange !== '';
      case 3: return formData.entityStructure !== '';
      case 4: return formData.strategyGoals.length > 0;
      case 5: return true; // Stock comp question is optional
      default: return false;
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your AI Playbook</h2>
            <p className="text-gray-600">
              Our AI is analyzing your profile and creating personalized tax strategy recommendations...
            </p>
          </div>
          <div className="space-y-2 text-left text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Analyzing income structure and entity optimization
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Calculating deduction and credit opportunities  
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
              Generating personalized savings estimate: {Math.min(15 + Math.floor(Math.random() * 20), 40)}%
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <Link to="/" className="text-blue-600 hover:underline mb-4 inline-block">
            ← Back to Platform
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI Playbook Generator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Answer 5 quick questions to get personalized tax strategy recommendations and savings estimates.
          </p>
          <div className="mt-4 inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium">
            Step 1 of 2: Generate Your Strategy
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Question {currentStep} of 5</span>
              <span>{Math.round((currentStep / 5) * 100)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / 5) * 100}%` }}
              ></div>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-lg shadow-lg p-8">
            {currentStep === 1 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">What type of income do you currently earn?</h2>
                <div className="space-y-4">
                  {[
                    { value: 'w2-employee', label: 'W-2 Employee', desc: 'Traditional employee with W-2 income' },
                    { value: '1099-contractor', label: '1099 Contractor', desc: 'Independent contractor or freelancer' },
                    { value: 'business-owner', label: 'Business Owner', desc: 'Own a business or multiple revenue streams' },
                    { value: 'blended', label: 'Blended', desc: 'Mix of W-2, 1099, and/or business income' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('incomeType', option.value)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        formData.incomeType === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">What is your approximate annual income?</h2>
                <div className="space-y-4">
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
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        formData.incomeRange === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">What is your current entity structure?</h2>
                <div className="space-y-4">
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
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        formData.entityStructure === option.value
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-gray-500">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">What are your strategic goals? (Select all that apply)</h2>
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
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        formData.strategyGoals.includes(option.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.desc}</div>
                        </div>
                        {formData.strategyGoals.includes(option.value) && (
                          <div className="text-blue-500">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
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

            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Do you receive stock-based compensation?</h2>
                <p className="text-gray-600 mb-6">
                  This includes stock options, RSUs, ESPP, or other equity compensation
                </p>
                <div className="space-y-4">
                  <button
                    onClick={() => handleInputChange('receivesStockComp', true)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      formData.receivesStockComp === true
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">Yes</div>
                    <div className="text-sm text-gray-500">I receive stock options, RSUs, or other equity compensation</div>
                  </button>
                  <button
                    onClick={() => handleInputChange('receivesStockComp', false)}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                      formData.receivesStockComp === false
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="font-medium">No</div>
                    <div className="text-sm text-gray-500">I do not receive stock-based compensation</div>
                  </button>
                </div>
              </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between mt-8">
              <button
                onClick={prevStep}
                disabled={currentStep === 1}
                className="px-6 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                Previous
              </button>
              {currentStep < 5 ? (
                <button
                  onClick={nextStep}
                  disabled={!isStepComplete()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                >
                  Next Question
                </button>
              ) : (
                <button
                  onClick={generatePlaybook}
                  disabled={!isStepComplete()}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 font-bold"
                >
                  Generate My Strategy & Continue to Forecaster
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default PlaybookGenerator;