import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

function PlaybookGenerator() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    businessType: '',
    currentStructure: '',
    annualIncome: '',
    currentDeductions: '',
    taxConcerns: []
  });
  const [isGenerating, setIsGenerating] = useState(false);

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
    
    // Calculate estimated savings based on income and business type
    let estimatedSavingsPercentage = 15; // Base savings
    
    // Adjust based on business type
    if (formData.businessType === 'business-owner') {
      estimatedSavingsPercentage += 10;
    }
    if (formData.businessType === 'real-estate') {
      estimatedSavingsPercentage += 15;
    }
    
    // Adjust based on income
    if (formData.annualIncome === '500k-1m') {
      estimatedSavingsPercentage += 5;
    } else if (formData.annualIncome === '1m+') {
      estimatedSavingsPercentage += 10;
    }
    
    // Adjust based on current structure
    if (formData.currentStructure === 'no-structure') {
      estimatedSavingsPercentage += 5;
    }
    
    // Cap at reasonable maximum
    estimatedSavingsPercentage = Math.min(estimatedSavingsPercentage, 40);
    
    // Store the result in localStorage
    const playbookData = {
      estimated_annual_tax_savings: estimatedSavingsPercentage,
      completion_date: new Date().toISOString(),
      user_profile: formData
    };
    
    localStorage.setItem('irs_escape_plan_playbook', JSON.stringify(playbookData));
    
    setIsGenerating(false);
    
    // Redirect to forecaster
    navigate('/forecaster');
  };

  const isStepComplete = () => {
    switch (currentStep) {
      case 1: return formData.businessType !== '';
      case 2: return formData.currentStructure !== '';
      case 3: return formData.annualIncome !== '';
      case 4: return formData.currentDeductions !== '';
      case 5: return formData.taxConcerns.length > 0;
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
              Our AI is analyzing your tax situation and creating a personalized strategy...
            </p>
          </div>
          <div className="space-y-2 text-left text-sm text-gray-500">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Analyzing business structure opportunities
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
              Calculating deduction optimization potential  
            </div>
            <div className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3 animate-pulse"></div>
              Generating personalized tax savings estimate
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
            Answer a few questions and get a personalized tax strategy with AI-generated savings estimates.
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-500 mb-2">
              <span>Step {currentStep} of 5</span>
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
                <h2 className="text-2xl font-semibold mb-6">What best describes your current situation?</h2>
                <div className="space-y-4">
                  {[
                    { value: 'w2-employee', label: 'W-2 Employee', desc: 'Traditional employee with W-2 income' },
                    { value: 'business-owner', label: 'Business Owner / Self-Employed', desc: 'Own a business or work as a contractor' },
                    { value: 'real-estate', label: 'Real Estate Investor', desc: 'Active in real estate investments' },
                    { value: 'high-earner', label: 'High-Earning Professional', desc: 'Doctor, lawyer, consultant, etc.' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('businessType', option.value)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        formData.businessType === option.value
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
                <h2 className="text-2xl font-semibold mb-6">What's your current tax structure?</h2>
                <div className="space-y-4">
                  {[
                    { value: 'no-structure', label: 'No formal structure', desc: 'Filing as individual or simple business' },
                    { value: 'llc', label: 'LLC', desc: 'Limited Liability Company structure' },
                    { value: 's-corp', label: 'S-Corporation', desc: 'S-Corp election for tax savings' },
                    { value: 'c-corp', label: 'C-Corporation', desc: 'Traditional corporate structure' },
                    { value: 'partnership', label: 'Partnership', desc: 'Partnership or multi-member LLC' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('currentStructure', option.value)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        formData.currentStructure === option.value
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

            {currentStep === 3 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">What's your approximate annual income?</h2>
                <div className="space-y-4">
                  {[
                    { value: '100k-250k', label: '$100K - $250K' },
                    { value: '250k-500k', label: '$250K - $500K' },
                    { value: '500k-1m', label: '$500K - $1M' },
                    { value: '1m+', label: '$1M+' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('annualIncome', option.value)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        formData.annualIncome === option.value
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

            {currentStep === 4 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">How would you describe your current deductions?</h2>
                <div className="space-y-4">
                  {[
                    { value: 'standard', label: 'Standard deductions only', desc: 'Taking the standard deduction' },
                    { value: 'basic-itemized', label: 'Basic itemized deductions', desc: 'Mortgage, state taxes, some business expenses' },
                    { value: 'advanced', label: 'Advanced tax strategies', desc: 'Multiple deductions, business write-offs, investments' },
                    { value: 'optimized', label: 'Highly optimized', desc: 'Working with tax professionals, complex strategies' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleInputChange('currentDeductions', option.value)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        formData.currentDeductions === option.value
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

            {currentStep === 5 && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">What are your biggest tax concerns? (Select all that apply)</h2>
                <div className="space-y-4">
                  {[
                    { value: 'high-liability', label: 'High tax liability', desc: 'Paying too much in taxes overall' },
                    { value: 'quarterly-payments', label: 'Quarterly estimated payments', desc: 'Managing cash flow for quarterly taxes' },
                    { value: 'business-deductions', label: 'Missing business deductions', desc: 'Not maximizing business write-offs' },
                    { value: 'audit-risk', label: 'Audit risk', desc: 'Worried about triggering an audit' },
                    { value: 'retirement-planning', label: 'Retirement tax planning', desc: 'Optimizing for future tax efficiency' },
                    { value: 'state-taxes', label: 'State tax optimization', desc: 'High state income taxes' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      onClick={() => handleMultiSelect('taxConcerns', option.value)}
                      className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                        formData.taxConcerns.includes(option.value)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{option.label}</div>
                          <div className="text-sm text-gray-500">{option.desc}</div>
                        </div>
                        {formData.taxConcerns.includes(option.value) && (
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
                  Next
                </button>
              ) : (
                <button
                  onClick={generatePlaybook}
                  disabled={!isStepComplete()}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-green-700 font-bold"
                >
                  Generate My AI Playbook
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