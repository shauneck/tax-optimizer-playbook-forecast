import React from 'react';
import { Link } from 'react-router-dom';

function ToolsDashboard() {
  const tools = [
    {
      id: 'escape-plan',
      title: 'Build Your Escape Plan',
      description: 'Create your personalized tax plan with optimized strategy recommendations and lifetime savings projections',
      category: 'Premium Tools',
      complexity: 'Comprehensive',
      time: '8-10 minutes',
      route: '/tools/escape-plan',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
      ),
      features: [
        'Multi-step questionnaire',
        'Strategy recommendations',
        'Implementation tracker',
        'Lifetime forecasting',
        'Wealth multiplier loop'
      ],
      isNew: true,
      isPremium: true
    },
    {
      id: 'tax-forecaster',
      title: 'Lifetime Impact Forecaster',
      description: 'See the long-term financial impact of your personalized tax strategy over 5-20 years',
      category: 'Analysis Tools',
      complexity: 'Intermediate',
      time: '3-5 minutes',
      route: '/forecaster',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      features: [
        'Lifetime projections',
        'Compound growth modeling',
        'Scenario comparisons',
        'Visual charts',
        'ROI calculations'
      ],
      isNew: false,
      isPremium: false
    }
  ];

  const categories = [...new Set(tools.map(tool => tool.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Header */}
      <div className="bg-gray-900">
        <div className="bg-gradient-to-r from-emerald-600 to-emerald-500">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link to="/" className="text-white hover:text-emerald-100 font-medium transition-colors">
                ← Back to Platform
              </Link>
              <h1 className="text-3xl font-semibold text-white">
                Tax Optimization Tools
              </h1>
              <div className="w-32"></div> {/* Spacer for centering */}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Platform Overview */}
        <div className="text-center mb-12">
          <h2 className="text-3xl font-semibold text-gray-900 mb-4">
            Complete Tax Optimization Suite
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Advanced tools to analyze, plan, and optimize your tax strategy for maximum wealth creation and financial escape.
          </p>
        </div>

        {/* Tools by Category */}
        {categories.map(category => (
          <div key={category} className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{category}</h3>
              <div className="h-px bg-gray-300 flex-1 ml-6"></div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {tools.filter(tool => tool.category === category).map(tool => (
                <div key={tool.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                  <div className="p-8">
                    {/* Tool Header */}
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex items-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600 mr-4">
                          {tool.icon}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-xl font-semibold text-gray-900">{tool.title}</h4>
                            {tool.isNew && (
                              <span className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2 py-1 rounded-full">
                                NEW
                              </span>
                            )}
                            {tool.isPremium && (
                              <span className="bg-purple-100 text-purple-700 text-xs font-medium px-2 py-1 rounded-full">
                                PREMIUM
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {tool.time}
                            </span>
                            <span className="flex items-center">
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {tool.complexity}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-gray-600 mb-6 leading-relaxed">
                      {tool.description}
                    </p>

                    {/* Features */}
                    <div className="mb-6">
                      <h5 className="text-sm font-semibold text-gray-900 mb-3">Key Features:</h5>
                      <div className="grid grid-cols-1 gap-2">
                        {tool.features.map((feature, index) => (
                          <div key={index} className="flex items-center text-sm text-gray-600">
                            <svg className="w-4 h-4 text-emerald-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            {feature}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* CTA Button */}
                    <Link
                      to={tool.route}
                      className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white text-center px-6 py-3 rounded-lg font-semibold transition-colors"
                    >
                      Launch {tool.title}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Platform Benefits */}
        <div className="bg-white rounded-2xl shadow-sm p-8 mt-12">
          <div className="text-center mb-8">
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">
              Why Use IRS Escape Plan Tools?
            </h3>
            <p className="text-gray-600 max-w-3xl mx-auto">
              Our comprehensive suite provides everything you need to optimize your tax strategy and build long-term wealth.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">AI-Powered Analysis</h4>
              <p className="text-sm text-gray-600">Advanced algorithms analyze your specific situation for personalized recommendations</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Lifetime Projections</h4>
              <p className="text-sm text-gray-600">See the compound impact of your strategy over 5-20 years with detailed modeling</p>
            </div>
            
            <div className="text-center">
              <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Implementation Tracking</h4>
              <p className="text-sm text-gray-600">Monitor your progress and track implementation of each recommended strategy</p>
            </div>
          </div>
        </div>

        {/* Getting Started */}
        <div className="text-center mt-12">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            Ready to Build Your Financial Escape Plan?
          </h3>
          <p className="text-gray-600 mb-6">
            Start with our comprehensive Build Your Escape Plan tool for a complete analysis.
          </p>
          <Link
            to="/tools/escape-plan"
            className="inline-block bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold transition-colors text-lg"
          >
            Build Your Escape Plan
          </Link>
        </div>
      </div>
    </div>
  );
}

export default ToolsDashboard;