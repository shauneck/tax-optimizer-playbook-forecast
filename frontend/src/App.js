import React, { useState } from 'react';
import './App.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

// 2025 Federal Tax Brackets (simplified)
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

// Income bracket mappings
const INCOME_BRACKETS = {
  '200k-500k': { min: 200000, max: 500000, default: 350000 },
  '500k-1m': { min: 500000, max: 1000000, default: 750000 },
  '1m-5m': { min: 1000000, max: 5000000, default: 2500000 },
  '5m+': { min: 5000000, max: 10000000, default: 7500000 }
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

function App() {
  // Form state
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    incomeType: '',
    incomeBracket: '',
    customIncome: 0,
    estimatedTaxLiability: 0,
    reductionPercentage: 20,
    forecastYears: 15,
    reinvestSavings: true
  });

  // Results state
  const [results, setResults] = useState(null);

  const handleInputChange = (field, value) => {
    const newData = { ...formData, [field]: value };
    
    // Auto-calculate tax liability when income changes
    if (field === 'incomeBracket' || field === 'customIncome') {
      let income = newData.customIncome;
      if (field === 'incomeBracket' && INCOME_BRACKETS[value]) {
        income = INCOME_BRACKETS[value].default;
        newData.customIncome = income;
      }
      
      if (income > 0) {
        newData.estimatedTaxLiability = calculateFederalTax(income);
      }
    }
    
    setFormData(newData);
  };

  const calculateResults = () => {
    const { estimatedTaxLiability, reductionPercentage, forecastYears, reinvestSavings } = formData;
    
    const annualTaxSavings = estimatedTaxLiability * (reductionPercentage / 100);
    const totalTaxWithoutStrategy = estimatedTaxLiability * forecastYears;
    const totalTaxWithStrategy = (estimatedTaxLiability - annualTaxSavings) * forecastYears;
    const totalTaxSavings = totalTaxWithoutStrategy - totalTaxWithStrategy;
    
    // Calculate compound growth if reinvesting
    let compoundedSavings = 0;
    if (reinvestSavings) {
      const annualReturn = 0.06; // 6% annual return
      for (let year = 1; year <= forecastYears; year++) {
        compoundedSavings += annualTaxSavings * Math.pow(1 + annualReturn, forecastYears - year);
      }
    }
    
    const totalValue = reinvestSavings ? compoundedSavings : totalTaxSavings;
    
    // Create chart data
    const chartData = [];
    for (let year = 1; year <= Math.min(forecastYears, 20); year += Math.max(1, Math.floor(forecastYears / 10))) {
      const cumulativeTaxPaid = estimatedTaxLiability * year;
      const cumulativeTaxSaved = annualTaxSavings * year;
      
      let cumulativeValue = cumulativeTaxSaved;
      if (reinvestSavings) {
        cumulativeValue = 0;
        for (let y = 1; y <= year; y++) {
          cumulativeValue += annualTaxSavings * Math.pow(1.06, year - y);
        }
      }
      
      chartData.push({
        year: `Year ${year}`,
        doNothing: cumulativeTaxPaid,
        escapePlan: cumulativeValue
      });
    }
    
    setResults({
      annualTaxSavings,
      totalTaxWithoutStrategy,
      totalTaxWithStrategy,
      totalTaxSavings,
      compoundedSavings,
      totalValue,
      chartData
    });
  };

  const nextStep = () => {
    if (currentStep < 6) {
      setCurrentStep(currentStep + 1);
    } else {
      calculateResults();
      setCurrentStep(7);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const resetCalculator = () => {
    setCurrentStep(1);
    setResults(null);
    setFormData({
      incomeType: '',
      incomeBracket: '',
      customIncome: 0,
      estimatedTaxLiability: 0,
      reductionPercentage: 20,
      forecastYears: 15,
      reinvestSavings: true
    });
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return formData.incomeType !== '';
      case 2: return formData.incomeBracket !== '';
      case 3: return formData.estimatedTaxLiability > 0;
      case 4: return formData.reductionPercentage > 0;
      case 5: return formData.forecastYears > 0;
      case 6: return true;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Lifetime Tax Delta Forecaster
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover the true lifetime cost of overpaying the IRS — and the long-term upside of implementing your tax strategy.
          </p>
          <div className="mt-4 inline-block bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
            Free Preview — Full forecasting access inside IRS Escape Plan Pro
          </div>
        </div>

        {currentStep < 7 ? (
          /* Form Steps */
          <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between text-sm text-gray-500 mb-2">
                <span>Step {currentStep} of 6</span>
                <span>{Math.round((currentStep / 6) * 100)}% Complete</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(currentStep / 6) * 100}%` }}
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
                      { value: 'w2', label: 'W-2 Employee', desc: 'Traditional employee with W-2 income' },
                      { value: 'business', label: 'Business Owner', desc: 'Self-employed or business owner' },
                      { value: 'blended', label: 'Blended', desc: 'Mix of W-2 and business income' }
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
                      { value: '200k-500k', label: '$200K – $500K' },
                      { value: '500k-1m', label: '$500K – $1M' },
                      { value: '1m-5m', label: '$1M – $5M' },
                      { value: '5m+', label: '$5M+' }
                    ].map((option) => (
                      <button
                        key={option.value}
                        onClick={() => handleInputChange('incomeBracket', option.value)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          formData.incomeBracket === option.value
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
                  <h2 className="text-2xl font-semibold mb-6">What is your estimated annual tax liability?</h2>
                  <div className="mb-4">
                    <p className="text-gray-600 mb-4">
                      Based on your income of {formatCurrency(formData.customIncome)}, we estimate your federal tax liability at:
                    </p>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <input
                        type="number"
                        value={Math.round(formData.estimatedTaxLiability)}
                        onChange={(e) => handleInputChange('estimatedTaxLiability', parseFloat(e.target.value) || 0)}
                        className="w-full text-2xl font-bold bg-transparent border-none outline-none text-blue-700"
                        placeholder="Enter tax liability"
                      />
                      <p className="text-sm text-gray-600 mt-2">
                        You can adjust this number if you have a more accurate estimate
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 4 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">How much of your tax liability could be reduced through strategy?</h2>
                  <div className="mb-6">
                    <p className="text-gray-600 mb-4">
                      This can be estimated using your AI Playbook
                    </p>
                    <div className="space-y-4">
                      {[10, 20, 30, 40].map((percentage) => (
                        <button
                          key={percentage}
                          onClick={() => handleInputChange('reductionPercentage', percentage)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            formData.reductionPercentage === percentage
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">{percentage}% Reduction</span>
                            <span className="text-blue-600 font-bold">
                              {formatCurrency(formData.estimatedTaxLiability * (percentage / 100))} saved annually
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {currentStep === 5 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Over how many years should we forecast?</h2>
                  <div className="space-y-4">
                    {[5, 10, 15, 20].map((years) => (
                      <button
                        key={years}
                        onClick={() => handleInputChange('forecastYears', years)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          formData.forecastYears === years
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="font-medium">{years} Years</div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {currentStep === 6 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Would you reinvest the tax savings?</h2>
                  <div className="space-y-4">
                    <button
                      onClick={() => handleInputChange('reinvestSavings', true)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        formData.reinvestSavings
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">Yes, reinvest at 6% annually</div>
                      <div className="text-sm text-gray-500">Compound your tax savings for maximum growth</div>
                    </button>
                    <button
                      onClick={() => handleInputChange('reinvestSavings', false)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        !formData.reinvestSavings
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="font-medium">No, just save the tax reduction</div>
                      <div className="text-sm text-gray-500">Keep the savings without investment growth</div>
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
                <button
                  onClick={nextStep}
                  disabled={!isStepComplete()}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700"
                >
                  {currentStep === 6 ? 'Calculate Results' : 'Next'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Lifetime Tax Delta Forecast</h2>
              <p className="text-lg text-gray-600">
                Here's what your {formData.forecastYears}-year financial future looks like
              </p>
            </div>

            {/* Key Results */}
            <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
              <div className="text-center mb-8">
                <div className="text-4xl font-bold text-red-600 mb-2">
                  {formatLargeNumber(results.totalTaxWithoutStrategy - results.totalValue)}
                </div>
                <p className="text-lg text-gray-700">
                  Over {formData.forecastYears} years, doing nothing costs you{' '}
                  <span className="font-bold text-red-600">
                    {formatCurrency(results.totalTaxWithoutStrategy - results.totalValue)}
                  </span>{' '}
                  in excess tax.{' '}
                  {formData.reinvestSavings && (
                    <>
                      Implementing your strategy now could unlock{' '}
                      <span className="font-bold text-green-600">
                        {formatCurrency(results.totalValue)}
                      </span>{' '}
                      in long-term value.
                    </>
                  )}
                </p>
              </div>

              {/* Scenario Comparison */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                {/* Scenario A: Do Nothing */}
                <div className="bg-red-50 p-6 rounded-lg border-2 border-red-200">
                  <h3 className="text-xl font-bold text-red-800 mb-4">Scenario A: Do Nothing</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Annual Tax Liability:</span>
                      <span className="font-bold">{formatCurrency(formData.estimatedTaxLiability)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tax Over {formData.forecastYears} Years:</span>
                      <span className="font-bold text-red-600">
                        {formatCurrency(results.totalTaxWithoutStrategy)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Investment Growth:</span>
                      <span className="font-bold">$0</span>
                    </div>
                  </div>
                </div>

                {/* Scenario B: Escape Plan */}
                <div className="bg-green-50 p-6 rounded-lg border-2 border-green-200">
                  <h3 className="text-xl font-bold text-green-800 mb-4">Scenario B: Implement Escape Plan</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>Annual Tax Savings:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(results.annualTaxSavings)}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Total Tax Saved:</span>
                      <span className="font-bold text-green-600">
                        {formatCurrency(results.totalTaxSavings)}
                      </span>
                    </div>
                    {formData.reinvestSavings && (
                      <div className="flex justify-between">
                        <span>Investment Growth (6%):</span>
                        <span className="font-bold text-green-600">
                          {formatCurrency(results.compoundedSavings - results.totalTaxSavings)}
                        </span>
                      </div>
                    )}
                    <div className="border-t pt-3 flex justify-between text-lg font-bold">
                      <span>Total Value:</span>
                      <span className="text-green-600">
                        {formatCurrency(results.totalValue)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Chart */}
              <div className="mb-8">
                <h3 className="text-xl font-bold mb-4 text-center">Cumulative Impact Over Time</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={results.chartData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="year" />
                      <YAxis tickFormatter={formatLargeNumber} />
                      <Tooltip formatter={(value) => formatCurrency(value)} />
                      <Legend />
                      <Bar dataKey="doNothing" fill="#ef4444" name="Cumulative Tax Paid (Do Nothing)" />
                      <Bar dataKey="escapePlan" fill="#22c55e" name={formData.reinvestSavings ? "Value Created (Escape Plan)" : "Tax Savings (Escape Plan)"} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="text-center space-y-4">
                <button
                  onClick={resetCalculator}
                  className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 mr-4"
                >
                  Recalculate
                </button>
                <button className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold">
                  Start My Escape Plan
                </button>
                <div className="mt-4">
                  <a href="#" className="text-blue-600 hover:underline">
                    Generate AI Playbook for More Accurate Savings Estimate
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;