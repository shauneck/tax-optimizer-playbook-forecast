import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
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

        {/* Single Tool Option */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Build Your Escape Plan</h2>
            <p className="text-gray-600">Complete tax optimization analysis in one comprehensive tool</p>
          </div>
          
          <div className="flex justify-center">
            {/* Unified Tax Optimizer */}
            <div className="bg-white rounded-lg shadow-lg p-8 relative overflow-hidden border-2 border-emerald-200 max-w-md w-full">
              <div className="absolute top-4 right-4 bg-emerald-100 text-emerald-600 px-3 py-1 rounded-full text-sm font-bold">
                ⭐ Complete Solution
              </div>
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">Build Your Escape Plan</h3>
                <p className="text-gray-600 mb-6">
                  Complete analysis in one tool. Get personalized strategies and lifetime forecasting with enhanced inputs for maximum accuracy.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Process Flow */}
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-8">How It Works</h2>
          <div className="flex items-center justify-between">
            <div className="text-center flex-1">
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 font-bold">1</span>
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
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 font-bold">2</span>
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
              <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-emerald-600 font-bold">3</span>
              </div>
              <h3 className="font-semibold mb-2">Lifetime Forecast</h3>
              <p className="text-sm text-gray-600">See compound wealth creation over decades with visual comparisons and projections</p>
            </div>
          </div>
          
          {/* CTA Button */}
          <div className="text-center mt-8 pt-6 border-t">
            <Link 
              to="/optimizer"
              className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-lg font-bold hover:bg-emerald-700 transition-colors text-lg"
            >
              Plan Your Escape
            </Link>
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
              <div className="text-2xl font-bold text-emerald-600 mb-2">5-7 Minutes</div>
              <p className="text-sm text-gray-600">Complete comprehensive analysis</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600 mb-2">15-45%</div>
              <p className="text-sm text-gray-600">Typical tax savings identified</p>
            </div>
            <div>
              <div className="text-2xl font-bold text-emerald-600 mb-2">$1M+</div>
              <p className="text-sm text-gray-600">Lifetime value creation potential</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;