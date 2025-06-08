import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

// Income bracket mappings for calculation
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

function TaxForecaster() {
  const navigate = useNavigate();
  
  // Check for playbook data on component mount
  const [playbookData, setPlaybookData] = useState(null);
  const [showPlaybookPrompt, setShowPlaybookPrompt] = useState(false);
  
  useEffect(() => {
    const storedPlaybook = localStorage.getItem('irs_escape_plan_playbook');
    if (storedPlaybook) {
      try {
        const parsed = JSON.parse(storedPlaybook);
        setPlaybookData(parsed);
      } catch (error) {
        console.error('Error parsing playbook data:', error);
      }
    } else {
      setShowPlaybookPrompt(true);
    }
  }, []);

  // Form state - simplified since we get most data from playbook
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Auto-populated from playbook
    customIncome: 0,
    estimatedTaxLiability: 0,
    reductionPercentage: 20,
    isPlaybookGenerated: false,
    allowReductionEdit: false,
    // User inputs for forecaster
    forecastYears: 15,
    reinvestSavings: true
  });

  // Results state
  const [results, setResults] = useState(null);

  // Update form data when playbook data is loaded
  useEffect(() => {
    if (playbookData) {
      const income = INCOME_BRACKETS[playbookData.incomeRange]?.default || 350000;
      const taxLiability = calculateFederalTax(income);
      
      setFormData(prev => ({
        ...prev,
        customIncome: income,
        estimatedTaxLiability: taxLiability,
        reductionPercentage: playbookData.estimated_savings_percent,
        isPlaybookGenerated: true,
        allowReductionEdit: false
      }));
    }
  }, [playbookData]);

  const handleInputChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
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
    setCurrentStep(3); // Go to results
  };

  const resetCalculator = () => {
    setCurrentStep(1);
    setResults(null);
    // Keep playbook data but reset forecaster inputs
    setFormData(prev => ({
      ...prev,
      forecastYears: 15,
      reinvestSavings: true,
      allowReductionEdit: false
    }));
  };

  // Show playbook prompt if no playbook data
  if (showPlaybookPrompt) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-lg w-full mx-4 text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Strategy Required</h2>
          <p className="text-gray-600 mb-6">
            Generate your personalized AI strategy first to get accurate tax savings estimates for your lifetime forecast.
          </p>
          <div className="space-y-4">
            <Link
              to="/playbook"
              className="block w-full bg-blue-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
            >
              Generate My AI Strategy First
            </Link>
            <button
              onClick={() => setShowPlaybookPrompt(false)}
              className="block w-full border border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Continue Without Strategy (Less Accurate)
            </button>
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
            Lifetime Tax Delta Forecaster
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See the long-term financial impact of your personalized tax strategy over 5-20 years.
          </p>
          {playbookData && (
            <div className="mt-4 space-y-2">
              <div className="inline-block bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                ✓ Using {playbookData.estimated_savings_percent}% savings from your AI Strategy
              </div>
              <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full text-sm font-medium ml-2">
                Step 2 of 2: Forecast Your Results
              </div>
            </div>
          )}
        </div>

        {currentStep < 3 ? (
          /* Forecaster Input Steps */
          <div className="max-w-2xl mx-auto">
            {/* Show playbook summary */}
            {playbookData && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Your AI Strategy Summary</h3>
                <div className="grid md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Income Type:</span>
                    <span className="font-medium ml-2">{playbookData.incomeType.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Income Range:</span>
                    <span className="font-medium ml-2">{playbookData.incomeRange}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Entity Structure:</span>
                    <span className="font-medium ml-2">{playbookData.entityStructure}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Estimated Tax Savings:</span>
                    <span className="font-bold text-green-600 ml-2">{playbookData.estimated_savings_percent}%</span>
                  </div>
                </div>
                {playbookData.strategy_recommendations && (
                  <div className="mt-4">
                    <span className="text-gray-600 text-sm">Key Strategies:</span>
                    <div className="flex flex-wrap gap-2 mt-2">
                      {playbookData.strategy_recommendations.map((strategy, index) => (
                        <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs">
                          {strategy}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Simplified Forecaster Form */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              {currentStep === 1 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Over how many years should we forecast?</h2>
                  <p className="text-gray-600 mb-6">
                    See the compound effect of your {playbookData?.estimated_savings_percent || 20}% tax savings over time
                  </p>
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
                        <div className="flex justify-between items-center">
                          <div>
                            <div className="font-medium">{years} Years</div>
                            <div className="text-sm text-gray-500">
                              Total projected savings: {formatCurrency((formData.estimatedTaxLiability * (formData.reductionPercentage / 100)) * years)}
                            </div>
                          </div>
                          {formData.forecastYears === years && (
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

              {currentStep === 2 && (
                <div>
                  <h2 className="text-2xl font-semibold mb-6">Would you reinvest the tax savings?</h2>
                  <p className="text-gray-600 mb-6">
                    Reinvesting your annual {formatCurrency(formData.estimatedTaxLiability * (formData.reductionPercentage / 100))} in tax savings can significantly amplify your results.
                  </p>
                  <div className="space-y-4">
                    <button
                      onClick={() => handleInputChange('reinvestSavings', true)}
                      className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
                        formData.reinvestSavings
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-lg">Yes, reinvest at 6% annually</div>
                          <div className="text-sm text-gray-500 mt-1">Compound your tax savings for maximum wealth growth</div>
                          <div className="text-sm font-medium text-green-600 mt-2">
                            Projected {formData.forecastYears}-year value: {formatCurrency(
                              (() => {
                                const annualSavings = formData.estimatedTaxLiability * (formData.reductionPercentage / 100);
                                let compound = 0;
                                for (let year = 1; year <= formData.forecastYears; year++) {
                                  compound += annualSavings * Math.pow(1.06, formData.forecastYears - year);
                                }
                                return compound;
                              })()
                            )}
                          </div>
                        </div>
                        {formData.reinvestSavings && (
                          <div className="text-green-500">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                    
                    <button
                      onClick={() => handleInputChange('reinvestSavings', false)}
                      className={`w-full text-left p-6 rounded-lg border-2 transition-all ${
                        !formData.reinvestSavings
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-medium text-lg">No, just save the tax reduction</div>
                          <div className="text-sm text-gray-500 mt-1">Keep the savings without investment growth</div>
                          <div className="text-sm font-medium text-blue-600 mt-2">
                            Total {formData.forecastYears}-year savings: {formatCurrency(
                              (formData.estimatedTaxLiability * (formData.reductionPercentage / 100)) * formData.forecastYears
                            )}
                          </div>
                        </div>
                        {!formData.reinvestSavings && (
                          <div className="text-blue-500">
                            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                      </div>
                    </button>
                  </div>
                </div>
              )}

              {/* Navigation */}
              <div className="flex justify-between mt-8">
                <button
                  onClick={() => setCurrentStep(currentStep - 1)}
                  disabled={currentStep === 1}
                  className="px-6 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {currentStep < 2 ? (
                  <button
                    onClick={() => setCurrentStep(currentStep + 1)}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={calculateResults}
                    className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
                  >
                    Calculate My Lifetime Results
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Results */
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Your Lifetime Tax Delta Forecast</h2>
              <p className="text-lg text-gray-600">
                Here's what your {formData.forecastYears}-year financial future looks like with your personalized strategy
              </p>
              {playbookData && (
                <p className="text-sm text-green-600 mt-2">
                  ✓ Based on your {playbookData.estimated_savings_percent}% savings estimate from AI Strategy
                </p>
              )}
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
                  in opportunity cost.{' '}
                  {formData.reinvestSavings && (
                    <>
                      Implementing your strategy now could create{' '}
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
                  <h3 className="text-xl font-bold text-green-800 mb-4">Scenario B: Implement Your Strategy</h3>
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
                      <span>Total Value Created:</span>
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
                      <Bar dataKey="escapePlan" fill="#22c55e" name={formData.reinvestSavings ? "Value Created (Your Strategy)" : "Tax Savings (Your Strategy)"} />
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
                  {playbookData ? (
                    <Link to="/playbook" className="text-blue-600 hover:underline">
                      Update My AI Strategy
                    </Link>
                  ) : (
                    <Link to="/playbook" className="text-blue-600 hover:underline">
                      Generate AI Strategy for More Accurate Results
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TaxForecaster;