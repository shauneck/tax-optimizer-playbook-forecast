import React from 'react';
import { X, ExternalLink } from 'lucide-react';

const StrategyModal = ({ strategy, isOpen, onClose, strategyStatus, onStatusChange, formatCurrency }) => {
  if (!isOpen || !strategy) return null;

  const getCategoryIcon = () => {
    switch (strategy.category) {
      case 'Setup & Structure': return '🏗️';
      case 'Deduction Strategies': return '💸';
      case 'Exit Planning': return '🚀';
      default: return '📋';
    }
  };

  const getComplexityColor = () => {
    switch (strategy.complexity) {
      case 'Beginner': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'Advanced': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getCTAButton = () => {
    const ctaConfig = {
      'mso_structure': {
        label: "Outsmart the IRS — Talk MSO with Quantus",
        href: "https://calendly.com/the-quantus-group-v2/quantus-strategy-call-1?topic=mso",
        tooltip: "Shift profit to a 21% tax lane and leave the IRS scratching their head.",
        subtext: "Create a parallel C-Corp. Keep your partners. Save six figures."
      },
      'f_reorg_c_corp': {
        label: "Plan Your $15M Tax-Free Exit with Quantus",
        href: "https://calendly.com/the-quantus-group-v2/quantus-strategy-call-1?topic=freorg", 
        tooltip: "Start the 5-year countdown to a tax-free business exit — we'll show you how.",
        subtext: "Get ahead of the exit — and keep more when you sell."
      }
    };

    const config = ctaConfig[strategy.strategyId];
    if (config) {
      return (
        <div className="mb-4">
          <a
            href={config.href}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center group"
            title={config.tooltip}
          >
            {config.label}
            <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <p className="text-xs text-gray-500 mt-2 text-center italic">{config.subtext}</p>
        </div>
      );
    }

    // Default CTA for other strategies
    if (strategy.cta) {
      return (
        <div className="mb-4">
          <a
            href="https://calendly.com/the-quantus-group-v2/quantus-strategy-call-1"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors flex items-center justify-center group"
          >
            {strategy.cta.action}
            <ExternalLink className="w-4 h-4 ml-2 group-hover:translate-x-0.5 transition-transform" />
          </a>
          <p className="text-xs text-gray-500 mt-2 text-center">{strategy.cta.text}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 p-6 rounded-t-2xl">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-2">{getCategoryIcon()}</span>
                <span className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                  {strategy.category}
                </span>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3 leading-tight">
                {strategy.title}
              </h2>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${getComplexityColor()}`}>
                  {strategy.complexity}
                </span>
                {strategy.moduleReference && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-600">
                    {strategy.moduleReference.module}
                  </span>
                )}
              </div>
            </div>
            <button
              onClick={onClose}
              className="ml-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Overview</h3>
            <p className="text-gray-600 leading-relaxed">{strategy.summary}</p>
          </div>

          {/* Quantified Example Highlight */}
          {strategy.quantifiedExample && strategy.quantifiedExample.annualSavings && (
            <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 border border-emerald-200 rounded-xl p-4">
              <div className="text-center">
                <div className="text-sm font-semibold text-emerald-700 uppercase tracking-wide mb-1">
                  Potential Annual Savings
                </div>
                <div className="text-3xl font-bold text-emerald-800">
                  {typeof strategy.quantifiedExample.annualSavings === 'number' 
                    ? formatCurrency(strategy.quantifiedExample.annualSavings) 
                    : strategy.quantifiedExample.annualSavings}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">How It Works</h3>
            <p className="text-gray-600 leading-relaxed mb-4">{strategy.description}</p>
            
            {/* Implementation Steps */}
            {strategy.howItWorks && strategy.howItWorks.length > 0 && (
              <div>
                <h4 className="font-semibold text-gray-800 mb-3">Implementation Steps</h4>
                <ol className="space-y-3">
                  {strategy.howItWorks.map((step, index) => (
                    <li key={index} className="flex items-start">
                      <div className="bg-emerald-500 text-white rounded-full w-7 h-7 flex items-center justify-center text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                        {index + 1}
                      </div>
                      <span className="text-gray-700 leading-relaxed">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </div>

          {/* Financial Impact Detail */}
          {strategy.quantifiedExample && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Financial Impact</h3>
              <div className="bg-white border border-gray-200 rounded-xl p-4">
                <div className="grid gap-3">
                  {Object.entries(strategy.quantifiedExample).map(([key, value]) => {
                    if (key === 'annualSavings') return null; // Already shown above
                    return (
                      <div key={key} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-b-0">
                        <span className="text-gray-600 font-medium capitalize">
                          {key.replace(/([A-Z])/g, ' $1').toLowerCase()}:
                        </span>
                        <span className="font-semibold text-gray-900 text-right">{value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Strategy Note */}
          {strategy.note && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <h4 className="font-semibold text-blue-800 mb-2">Important Note</h4>
              <p className="text-sm text-blue-700 leading-relaxed">{strategy.note}</p>
            </div>
          )}

          {/* Glossary Terms */}
          {strategy.glossaryTerms && strategy.glossaryTerms.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Terms</h3>
              <div className="flex flex-wrap gap-2">
                {strategy.glossaryTerms.map((term, index) => (
                  <span key={index} className="inline-flex items-center px-3 py-2 rounded-lg text-sm bg-blue-100 text-blue-800 hover:bg-blue-200 transition-colors cursor-pointer">
                    {term}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Module Reference */}
          {strategy.moduleReference && (
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
              <h4 className="font-semibold text-gray-800 mb-2">Course Reference</h4>
              <div className="text-sm text-gray-600">
                <div><strong>{strategy.moduleReference.course}</strong></div>
                <div>{strategy.moduleReference.module}: {strategy.moduleReference.title}</div>
              </div>
            </div>
          )}

          {/* Conditional CTA */}
          {strategy.conditionalCta && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-semibold text-amber-800 mb-2">Additional Opportunity</h4>
              <p className="text-sm text-amber-700 mb-3 leading-relaxed">{strategy.conditionalCta.text}</p>
              <button className="w-full bg-amber-500 hover:bg-amber-600 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors">
                {strategy.conditionalCta.action}
              </button>
            </div>
          )}

          {/* Implementation Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Implementation Status</h3>
            <select
              value={strategyStatus}
              onChange={(e) => onStatusChange(strategy.id, e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Implemented">Implemented</option>
              <option value="Not Applicable">Not Applicable</option>
            </select>
          </div>
        </div>

        {/* Sticky CTA Footer */}
        <div className="sticky bottom-0 bg-white border-t border-gray-100 p-6 rounded-b-2xl">
          {getCTAButton()}
        </div>
      </div>
    </div>
  );
};

export default StrategyModal;