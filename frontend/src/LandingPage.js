import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
      {/* Navigation Header */}
      <div className="bg-gray-900">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="text-white text-xl font-semibold">
              IRS Escape Plan
            </div>
            <nav className="flex items-center space-x-6">
              <Link to="/tools" className="text-white hover:text-emerald-300 transition-colors">
                Tools
              </Link>
              <Link 
                to="/tools/escape-plan"
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Build Your Escape Plan
              </Link>
            </nav>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Consolidated Header + Main CTA */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Build Your Escape Plan
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
            Complete your personalized strategy in one AI-powered tool
          </p>
          
          {/* Primary CTA */}
          <Link 
            to="/tools/escape-plan"
            className="inline-block bg-emerald-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-emerald-700 transition-colors text-lg shadow-lg mr-4"
          >
            Plan Your Escape
          </Link>
          
          {/* Secondary CTA */}
          <Link 
            to="/tools"
            className="inline-block border-2 border-emerald-600 text-emerald-600 px-8 py-4 rounded-lg font-bold hover:bg-emerald-50 transition-colors text-lg"
          >
            View All Tools
          </Link>
        </div>

        {/* How It Works - Condensed */}
        <div className="max-w-5xl mx-auto bg-white rounded-lg shadow-sm p-6 mb-12">
          <h2 className="text-xl font-semibold text-center text-gray-900 mb-6">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 font-bold text-sm">1</span>
              </div>
              <h3 className="font-semibold mb-2 text-sm">Profile Analysis</h3>
              <p className="text-xs text-gray-600">AI analyzes your income type and structure to identify optimization opportunities</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 font-bold text-sm">2</span>
              </div>
              <h3 className="font-semibold mb-2 text-sm">Strategy Generation</h3>
              <p className="text-xs text-gray-600">Personalized recommendations with estimated savings percentage</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 font-bold text-sm">3</span>
              </div>
              <h3 className="font-semibold mb-2 text-sm">Lifetime Forecast</h3>
              <p className="text-xs text-gray-600">See compound wealth creation over decades with visual projections</p>
            </div>
          </div>
        </div>

        {/* Available Tools Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <h2 className="text-2xl font-semibold text-center text-gray-900 mb-8">
            Complete Tax Optimization Suite
          </h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Build Your Escape Plan */}
            <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-emerald-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Build Your Escape Plan</h3>
                  <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">PREMIUM</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                Complete multi-step analysis with strategy recommendations, implementation tracking, and lifetime projections.
              </p>
              <Link
                to="/tools/escape-plan"
                className="block w-full bg-emerald-500 hover:bg-emerald-600 text-white text-center px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Launch Tool
              </Link>
            </div>

            {/* Lifetime Impact Forecaster */}
            <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mr-4">
                  <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">Lifetime Impact Forecaster</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">ANALYSIS</span>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-4">
                See the long-term financial impact of your personalized tax strategy over 5-20 years.
              </p>
              <Link
                to="/forecaster"
                className="block w-full border border-gray-300 text-gray-600 text-center px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors"
              >
                Launch Tool
              </Link>
            </div>
          </div>
        </div>

        {/* Tax Optimization Potential - Callout Summary Bar */}
        <div className="max-w-4xl mx-auto bg-emerald-50 border border-emerald-200 rounded-lg p-6">
          <div className="text-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Your Tax Optimization Potential</h3>
            <p className="text-sm text-gray-600">
              Most high earners overpay taxes by 15-40% annually. See exactly what this means for your lifetime wealth.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-lg p-3">
              <div className="text-lg font-bold text-emerald-600 mb-1">5-7 Minutes</div>
              <p className="text-xs text-gray-600">Complete analysis</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-lg font-bold text-emerald-600 mb-1">15-45%</div>
              <p className="text-xs text-gray-600">Typical savings identified</p>
            </div>
            <div className="bg-white rounded-lg p-3">
              <div className="text-lg font-bold text-emerald-600 mb-1">$1M+</div>
              <p className="text-xs text-gray-600">Lifetime value potential</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;