import React, { useState } from 'react';
import { Link } from 'react-router-dom';
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

function UnifiedTaxOptimizer() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Step 1: Core Profile Data (Existing Playbook Generator Logic)
  const [profileData, setProfileData] = useState({
    incomeType: '',
    incomeRange: '',
    entityStructure: '',
    strategyGoals: [],
    receivesStockComp: false
  });

  // Step 2: Extended Forecasting Inputs
  const [forecastingData, setForecastingData] = useState({
    rsuIncomePercent: 0,
    businessProfit: 0,
    capitalAvailable: 0,
    restructurePercent: 0,
    forecastYears: 15,
    reinvestSavings: true
  });

  // Generated Results
  const [results, setResults] = useState({
    strategyRecommendations: [],
    estimatedSavingsPercent: 0,
    estimatedSavingsRange: { min: 0, max: 0 },
    taxLiability: 0,
    forecastData: null
  });

  const handleProfileChange = (field, value) => {
    setProfileData({ ...profileData, [field]: value });
  };

  const handleMultiSelect = (field, value) => {
    const current = profileData[field];
    const updated = current.includes(value) 
      ? current.filter(item => item !== value)
      : [...current, value];
    setProfileData({ ...profileData, [field]: updated });
  };

  const handleForecastingChange = (field, value) => {
    setForecastingData({ ...forecastingData, [field]: value });
  };

  const generateStrategyRecommendations = (data) => {
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

    if (data.strategyGoals.includes('Build long-term passive income')) {
      recommendations.push('Real Estate Investment Strategies');
    }

    if (data.incomeType === 'w2-employee' && data.receivesStockComp) {
      recommendations.push('W-2 Optimization Strategies');
    }
    
    return recommendations;
  };

  const calculateSavingsEstimate = () => {
    let baseSavings = 15; // Base savings percentage
    let minSavings = 12;
    let maxSavings = 18;
    
    // Adjust based on income type
    if (profileData.incomeType === 'business-owner') {
      baseSavings += 8;
      minSavings += 6;
      maxSavings += 12;
    } else if (profileData.incomeType === '1099-contractor') {
      baseSavings += 6;
      minSavings += 4;
      maxSavings += 8;
    } else if (profileData.incomeType === 'blended') {
      baseSavings += 10;
      minSavings += 8;
      maxSavings += 14;
    }
    
    // Adjust based on income range
    if (profileData.incomeRange === '$500K–$1M') {
      baseSavings += 4;
      minSavings += 2;
      maxSavings += 6;
    } else if (profileData.incomeRange === '$1M–$5M') {
      baseSavings += 7;
      minSavings += 5;
      maxSavings += 10;
    } else if (profileData.incomeRange === '$5M+') {
      baseSavings += 10;
      minSavings += 8;
      maxSavings += 15;
    }
    
    // Adjust based on entity structure
    if (profileData.entityStructure === 'None' || profileData.entityStructure === 'Not sure') {
      baseSavings += 5;
      minSavings += 3;
      maxSavings += 8;
    }
    
    // Adjust for forecasting inputs
    if (forecastingData.rsuIncomePercent > 30) {
      baseSavings += 3;
      maxSavings += 5;
    }
    
    if (forecastingData.businessProfit > 500000) {
      baseSavings += 4;
      maxSavings += 6;
    }
    
    if (forecastingData.capitalAvailable > 100000) {
      baseSavings += 3;
      maxSavings += 4;
    }
    
    if (forecastingData.restructurePercent > 50) {
      baseSavings += 5;
      maxSavings += 8;
    }
    
    // Cap at reasonable maximums
    baseSavings = Math.min(baseSavings, 40);
    minSavings = Math.min(minSavings, baseSavings - 3);
    maxSavings = Math.min(maxSavings, 45);
    
    return {
      estimated: baseSavings,
      range: { min: minSavings, max: maxSavings }
    };
  };

  const generateResults = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    const strategyRecommendations = generateStrategyRecommendations(profileData);
    const savingsEstimate = calculateSavingsEstimate();
    const income = INCOME_BRACKETS[profileData.incomeRange]?.default || 350000;
    const taxLiability = calculateFederalTax(income);
    
    // Calculate forecast data
    const annualTaxSavings = taxLiability * (savingsEstimate.estimated / 100);
    const totalTaxWithoutStrategy = taxLiability * forecastingData.forecastYears;
    const totalTaxWithStrategy = (taxLiability - annualTaxSavings) * forecastingData.forecastYears;
    const totalTaxSavings = totalTaxWithoutStrategy - totalTaxWithStrategy;
    
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

    const newResults = {
      strategyRecommendations,
      estimatedSavingsPercent: savingsEstimate.estimated,
      estimatedSavingsRange: savingsEstimate.range,
      taxLiability,
      forecastData: {
        annualTaxSavings,
        totalTaxWithoutStrategy,
        totalTaxSavings,
        compoundedSavings,
        totalValue,
        chartData
      }
    };
    
    setResults(newResults);
    setIsGenerating(false);
    setCurrentStep(8); // Jump to results
  };

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1);
    } else if (currentStep === 7) {
      generateResults();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetTool = () => {
    setCurrentStep(1);
    setProfileData({
      incomeType: '',
      incomeRange: '',
      entityStructure: '',
      strategyGoals: [],
      receivesStockComp: false
    });
    setForecastingData({
      rsuIncomePercent: 0,
      businessProfit: 0,
      capitalAvailable: 0,
      restructurePercent: 0,
      forecastYears: 15,
      reinvestSavings: true
    });
    setResults({
      strategyRecommendations: [],
      estimatedSavingsPercent: 0,
      estimatedSavingsRange: { min: 0, max: 0 },
      taxLiability: 0,
      forecastData: null
    });
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return profileData.incomeType !== '';
      case 2: return profileData.incomeRange !== '';
      case 3: return profileData.entityStructure !== '';
      case 4: return profileData.strategyGoals.length > 0;
      case 5: return true; // Stock comp is optional
      case 6: 
        if (profileData.incomeType === 'business-owner' || profileData.incomeType === 'blended') {
          return forecastingData.businessProfit > 0;
        }
        return true;
      case 7: return forecastingData.forecastYears > 0;
      default: return false;
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="mb-6">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating Your Optimization Strategy</h2>
            <p className="text-gray-600">
              Analyzing your profile and calculating personalized tax optimization opportunities...
            </p>
          </div>
          <div className="space-y-2 text-left text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Processing income structure and entity analysis
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Calculating optimization strategies and savings potential
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
              Generating lifetime forecast and compound projections
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
            Unified Tax Optimization Tool
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized tax strategies and see your lifetime financial impact in one comprehensive analysis.
          </p>
          <div className="mt-4 inline-block bg-purple-100 text-purple-800 px-4 py-2 rounded-full text-sm font-medium">
            Beta • Unified Strategy & Forecasting
          </div>
        </div>

        {currentStep < 8 ? (
          /* Input Steps */
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Step {currentStep} of 7</span>
                <span>{Math.round((currentStep / 7) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-blue-600 to-green-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 7) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Section Headers */}
            {currentStep <= 5 && (
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-blue-600">Profile Analysis</h2>
                <p className="text-gray-600">Help us understand your current situation</p>
              </div>
            )}
            {currentStep > 5 && (
              <div className="text-center mb-6">
                <h2 className="text-lg font-semibold text-green-600">Forecasting Inputs</h2>
                <p className="text-gray-600">Additional details for accurate projections</p>
              </div>
            )}

            {/* Form Card */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              {/* STEP 1: Income Type (Existing Playbook Logic) */}
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
                        onClick={() => handleProfileChange('incomeType', option.value)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          profileData.incomeType === option.value
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

              {/* STEP 2: Income Range */}
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
                        onClick={() => handleProfileChange('incomeRange', option.value)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          profileData.incomeRange === option.value
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

              {/* STEP 3: Entity Structure */}
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
                        onClick={() => handleProfileChange('entityStructure', option.value)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          profileData.entityStructure === option.value
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

              {/* STEP 4: Strategic Goals */}
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
                          profileData.strategyGoals.includes(option.value)
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">{option.label}</div>
                            <div className="text-sm text-gray-500">{option.desc}</div>
                          </div>
                          {profileData.strategyGoals.includes(option.value) && (
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

              {/* STEP 5: Stock Compensation */}
              {currentStep === 5 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Do you receive stock-based compensation?</h2>
                  <p className="text-gray-600 mb-6">
                    This includes stock options, RSUs, ESPP, or other equity compensation
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={() => handleProfileChange('receivesStockComp', true)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        profileData.receivesStockComp === true
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">Yes</div>
                      <div className="text-sm text-gray-500">I receive stock options, RSUs, or other equity compensation</div>
                    </button>
                    <button
                      onClick={() => handleProfileChange('receivesStockComp', false)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        profileData.receivesStockComp === false
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

              {/* STEP 6: Extended Forecasting Inputs */}
              {currentStep === 6 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Additional Details for Accurate Forecasting</h2>
                  <div className="space-y-6">
                    
                    {/* RSU Income Percentage (if stock comp) */}
                    {profileData.receivesStockComp && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          What percentage of your income comes from RSUs/Stock compensation?
                        </label>
                        <div className="grid grid-cols-4 gap-3">
                          {[10, 20, 30, 50].map((percent) => (
                            <button
                              key={percent}
                              onClick={() => handleForecastingChange('rsuIncomePercent', percent)}
                              className={`p-3 text-center rounded-lg border-2 transition-all ${
                                forecastingData.rsuIncomePercent === percent
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-bold">{percent}%</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Business Profit (if business owner or blended) */}
                    {(profileData.incomeType === 'business-owner' || profileData.incomeType === 'blended') && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          What is your annual operating business profit?
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { value: 100000, label: '$100K' },
                            { value: 250000, label: '$250K' },
                            { value: 500000, label: '$500K' },
                            { value: 1000000, label: '$1M+' }
                          ].map((option) => (
                            <button
                              key={option.value}
                              onClick={() => handleForecastingChange('businessProfit', option.value)}
                              className={`p-3 text-center rounded-lg border-2 transition-all ${
                                forecastingData.businessProfit === option.value
                                  ? 'border-green-500 bg-green-50'
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="font-bold">{option.label}</div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Capital Available */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Capital available for tax-advantaged investments (real estate, energy, retirement)?
                      </label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: 50000, label: '$50K' },
                          { value: 100000, label: '$100K' },
                          { value: 250000, label: '$250K' },
                          { value: 500000, label: '$500K+' }
                        ].map((option) => (
                          <button
                            key={option.value}
                            onClick={() => handleForecastingChange('capitalAvailable', option.value)}
                            className={`p-3 text-center rounded-lg border-2 transition-all ${
                              forecastingData.capitalAvailable === option.value
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-bold">{option.label}</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Restructure Percentage */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        What percentage of your income could potentially be restructured or offset?
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[20, 40, 60, 80].map((percent) => (
                          <button
                            key={percent}
                            onClick={() => handleForecastingChange('restructurePercent', percent)}
                            className={`p-3 text-center rounded-lg border-2 transition-all ${
                              forecastingData.restructurePercent === percent
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-bold">{percent}%</div>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 7: Forecast Parameters */}
              {currentStep === 7 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Forecast Parameters</h2>
                  
                  <div className="space-y-6">
                    {/* Forecast Horizon */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Over how many years should we forecast your optimization impact?
                      </label>
                      <div className="grid grid-cols-4 gap-3">
                        {[5, 10, 15, 20].map((years) => (
                          <button
                            key={years}
                            onClick={() => handleForecastingChange('forecastYears', years)}
                            className={`p-4 text-center rounded-lg border-2 transition-all ${
                              forecastingData.forecastYears === years
                                ? 'border-green-500 bg-green-50'
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="font-bold text-lg">{years}</div>
                            <div className="text-sm text-gray-500">Years</div>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Reinvestment Toggle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Would you reinvest the tax savings for compound growth?
                      </label>
                      <div className="space-y-3">
                        <button
                          onClick={() => handleForecastingChange('reinvestSavings', true)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            forecastingData.reinvestSavings
                              ? 'border-green-500 bg-green-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">Yes, reinvest at 6% annually</div>
                          <div className="text-sm text-gray-500">Compound your tax savings for maximum wealth growth</div>
                        </button>
                        <button
                          onClick={() => handleForecastingChange('reinvestSavings', false)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            !forecastingData.reinvestSavings
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="font-medium">No, just save the tax reduction</div>
                          <div className="text-sm text-gray-500">Keep the savings without investment growth</div>
                        </button>
                      </div>
                    </div>
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
                <button
                  onClick={nextStep}
                  disabled={!isStepComplete()}
                  className={`px-8 py-2 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed font-bold ${
                    currentStep === 7
                      ? 'bg-green-600 hover:bg-green-700'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {currentStep === 7 ? 'Generate Results & Forecast' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Results Display */
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Personalized Tax Optimization Results</h2>
              <p className="text-lg text-gray-600">
                Complete strategy stack and {forecastingData.forecastYears}-year financial impact analysis
              </p>
            </div>

            {/* Strategy Stack */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Recommended Strategy Stack</h3>
              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Your Profile</h4>
                  <div className="space-y-2 text-sm">
                    <div><span className="text-gray-600">Income Type:</span> <span className="font-medium">{profileData.incomeType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span></div>
                    <div><span className="text-gray-600">Income Range:</span> <span className="font-medium">{profileData.incomeRange}</span></div>
                    <div><span className="text-gray-600">Entity Structure:</span> <span className="font-medium">{profileData.entityStructure}</span></div>
                    <div><span className="text-gray-600">Stock Compensation:</span> <span className="font-medium">{profileData.receivesStockComp ? 'Yes' : 'No'}</span></div>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-700 mb-3">Optimization Strategies</h4>
                  <div className="space-y-2">
                    {results.strategyRecommendations.map((strategy, index) => (
                      <div key={index} className="bg-blue-50 text-blue-700 px-3 py-2 rounded-lg text-sm">
                        {strategy}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Savings Estimate */}
              <div className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg text-center">
                <h4 className="text-lg font-bold text-gray-900 mb-2">Estimated Annual Tax Savings</h4>
                <div className="text-4xl font-bold text-green-600 mb-2">
                  {results.estimatedSavingsRange.min}% - {results.estimatedSavingsRange.max}%
                </div>
                <div className="text-xl font-bold text-gray-700">
                  {formatCurrency(results.taxLiability * (results.estimatedSavingsRange.min / 100))} - {formatCurrency(results.taxLiability * (results.estimatedSavingsRange.max / 100))} annually
                </div>
              </div>
            </div>

            {/* Delta Forecasting */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                {forecastingData.forecastYears}-Year Impact Analysis
              </h3>
              
              {/* Key Impact Statement */}
              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {formatLargeNumber(results.forecastData.totalTaxWithoutStrategy - results.forecastData.totalValue)}
                </div>
                <p className="text-lg text-gray-700">
                  Over {forecastingData.forecastYears} years, doing nothing could cost you{' '}
                  <span className="font-bold text-red-600">
                    {formatCurrency(results.forecastData.totalTaxWithoutStrategy - results.forecastData.totalValue)}
                  </span>{' '}
                  in opportunity cost. Implementing your strategy could create{' '}
                  <span className="font-bold text-green-600">
                    {formatCurrency(results.forecastData.totalValue)}
                  </span>{' '}
                  in long-term value.
                </p>
              </div>

              {/* Scenario Comparison */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Scenario A: Do Nothing */}
                <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                  <h4 className="text-xl font-bold text-red-800 mb-4">Scenario A: Do Nothing</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Annual Tax Liability:</span>
                      <span className="font-bold">{formatCurrency(results.taxLiability)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tax Over {forecastingData.forecastYears} Years:</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(results.forecastData.totalTaxWithoutStrategy)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investment Growth:</span>
                      <span className="font-bold">$0</span>
                    </div>
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total Value:</span>
                      <span className="text-red-600">$0</span>
                    </div>
                  </div>
                </div>

                {/* Scenario B: Implement Strategy */}
                <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
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
                        <span>Investment Growth (6%):</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(results.forecastData.compoundedSavings - results.forecastData.totalTaxSavings)}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total Value Created:</span>
                      <span className="text-green-600">
                        {formatCurrency(results.forecastData.totalValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="mb-8">
                <h4 className="text-xl font-bold mb-4 text-center">Cumulative Impact Over Time</h4>
                <div className="h-80">
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

              {/* Net Delta Summary */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-6 rounded-lg text-center">
                <h4 className="text-xl font-bold text-gray-900 mb-2">Net Financial Delta</h4>
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {formatCurrency(results.forecastData.totalValue)}
                </div>
                <p className="text-gray-700">
                  Total wealth creation potential over {forecastingData.forecastYears} years
                </p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="text-center space-y-4">
              <button
                onClick={resetTool}
                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 mr-4"
              >
                Run New Analysis
              </button>
              <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold text-lg">
                Start My Escape Plan
              </button>
              <div className="mt-4 text-sm text-gray-600">
                Ready to implement your personalized tax optimization strategy?
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default UnifiedTaxOptimizer;