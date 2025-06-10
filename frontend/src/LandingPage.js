import React from 'react';
import { Link } from 'react-router-dom';

function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-100">
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
            to="/optimizer"
            className="inline-block bg-emerald-600 text-white px-8 py-4 rounded-lg font-bold hover:bg-emerald-700 transition-colors text-lg shadow-lg"
          >
            Plan Your Escape
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