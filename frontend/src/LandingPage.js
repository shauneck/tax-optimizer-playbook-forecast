import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            IRS Escape Plan Platform
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get personalized tax strategy recommendations and see the lifetime financial impact with our AI-powered tools.
          </p>
        </div>

        {/* Two-Step Process */}
        <div className="max-w-5xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your Path to Tax Optimization</h2>
            <p className="text-gray-600">Complete our 2-step process to unlock your personalized tax strategy and lifetime savings forecast.</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* Step 1: AI Playbook Generator */}
            <div className="bg-white rounded-lg shadow-lg p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-bold">
                Step 1
              </div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">AI Strategy Generator</h3>
                <p className="text-gray-600 mb-6">
                  Answer 5 quick questions about your income, structure, and goals. Our AI analyzes your profile and generates personalized tax strategy recommendations with savings estimates.
                </p>
                <Link 
                  to="/playbook"
                  className="inline-block bg-blue-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-blue-700 transition-colors"
                >
                  Start Your Strategy
                </Link>
              </div>
              <div className="text-xs text-gray-500 text-center mt-4">
                ⏱️ Takes 2-3 minutes • Generates personalized savings %
              </div>
            </div>

            {/* Step 2: Lifetime Tax Delta Forecaster */}
            <div className="bg-white rounded-lg shadow-lg p-8 relative overflow-hidden">
              <div className="absolute top-4 right-4 bg-green-100 text-green-600 px-3 py-1 rounded-full text-sm font-bold">
                Step 2
              </div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Lifetime Impact Forecaster</h3>
                <p className="text-gray-600 mb-6">
                  See the long-term financial impact of your personalized strategy. Compare "do nothing" vs. implementation over 5-20 years with compound growth projections.
                </p>
                <Link 
                  to="/forecaster"
                  className="inline-block bg-green-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-green-700 transition-colors"
                >
                  See Your Forecast
                </Link>
              </div>
              <div className="text-xs text-gray-500 text-center mt-4">
                ⚡ Uses your AI strategy data • Shows compound wealth growth
              </div>
            </div>
          </div>
        </div>

        {/* Process Flow */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">How It Works</h2>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-blue-600 font-bold">1</span>
              </div>
              <h3 className="font-semibold mb-2">Profile Analysis</h3>
              <p className="text-sm text-gray-600">AI analyzes your income type, structure, and goals to identify optimization opportunities</p>
            </div>
            <div className="px-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="text-center flex-1">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-green-600 font-bold">2</span>
              </div>
              <h3 className="font-semibold mb-2">Strategy Generation</h3>
              <p className="text-sm text-gray-600">Personalized recommendations with estimated savings percentage based on your profile</p>
            </div>
            <div className="px-4">
              <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </div>
            <div className="text-center flex-1">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-purple-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Lifetime Forecast</h3>
              <p className="text-sm text-gray-600">See compound wealth creation over decades with visual comparisons and projections</p>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Discover Your True Tax Optimization Potential</h2>
          <p className="text-lg text-gray-600 mb-8">
            Most high earners overpay taxes by 15-40% annually. Our AI-powered platform shows you exactly how much you could save and what that means for your lifetime wealth.
          </p>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-blue-600 mb-2">5 Minutes</div>
              <p className="text-sm text-gray-600">Complete profile analysis</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-green-600 mb-2">15-40%</div>
              <p className="text-sm text-gray-600">Typical tax savings identified</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600 mb-2">$1M+</div>
              <p className="text-sm text-gray-600">Lifetime value creation potential</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;