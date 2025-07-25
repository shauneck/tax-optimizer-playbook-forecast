import strategyCardsData from '../data/strategyCards.json';

// Strategy matching engine to evaluate eligibility criteria against user inputs
export class StrategyMatcher {
  constructor() {
    this.strategies = strategyCardsData;
  }

  // Main method to generate matched strategies based on user input
  generateStrategyStack(formData, forecastingData) {
    const matchedStrategies = this.evaluateStrategies(formData, forecastingData);
    
    // Group strategies by category
    const setupStructure = matchedStrategies.filter(s => s.category === 'Setup & Structure');
    const deductionStrategies = matchedStrategies.filter(s => s.category === 'Deduction Strategies');
    const exitPlanning = matchedStrategies.filter(s => s.category === 'Exit Planning');
    
    return { setupStructure, deductionStrategies, exitPlanning };
  }

  // Evaluate all strategies and return those that match eligibility criteria
  evaluateStrategies(formData, forecastingData) {
    const matchedStrategies = [];

    for (const strategy of this.strategies) {
      const eligibilityResult = this.checkEligibility(strategy, formData, forecastingData);
      
      if (eligibilityResult.isEligible) {
        // Create strategy object with additional computed fields
        const strategyCard = {
          ...strategy,
          id: strategy.strategyId, // For backward compatibility with existing UI
          // Add any dynamic calculations here if needed
        };
        
        matchedStrategies.push(strategyCard);
      } else if (eligibilityResult.suppressionMessage) {
        // Handle suppression rule - create a card with override message
        const suppressedStrategy = {
          ...strategy,
          id: strategy.strategyId,
          issuppressed: true,
          suppressionMessage: eligibilityResult.suppressionMessage,
        };
        
        matchedStrategies.push(suppressedStrategy);
      }
    }

    return matchedStrategies;
  }

  // Check if a strategy meets eligibility criteria
  checkEligibility(strategy, formData, forecastingData) {
    const criteria = strategy.eligibilityCriteria;
    
    // First check suppression rules
    if (strategy.suppressionRule && this.checkSuppressionRule(strategy.suppressionRule, formData, forecastingData)) {
      return {
        isEligible: false,
        suppressionMessage: strategy.suppressionRule.message
      };
    }

    // Check each eligibility criterion
    for (const [key, value] of Object.entries(criteria)) {
      if (!this.evaluateCriterion(key, value, formData, forecastingData)) {
        return { isEligible: false };
      }
    }

    return { isEligible: true };
  }

  // Check if suppression rule applies
  checkSuppressionRule(suppressionRule, formData, forecastingData) {
    for (const [key, value] of Object.entries(suppressionRule)) {
      if (key === 'message') continue; // Skip the message field
      
      if (this.evaluateCriterion(key, value, formData, forecastingData)) {
        return true; // Suppression rule triggered
      }
    }
    return false;
  }

  // Evaluate individual eligibility criteria
  evaluateCriterion(key, value, formData, forecastingData) {
    switch (key) {
      case 'userType':
        return this.checkUserType(value, formData);
      
      case 'hasPartners':
        return formData.hasBusinessPartners === value;
      
      case 'businessProfitMin':
        return this.getBusinessProfit(formData, forecastingData) >= value;
      
      case 'businessProfitMax':
        return this.getBusinessProfit(formData, forecastingData) <= value;
      
      case 'hasCcorp':
        return formData.entityStructure === 'C-corp';
      
      case 'retainedEarningsMin':
        // This would need additional form data or could be estimated from business profit
        const businessProfit = this.getBusinessProfit(formData, forecastingData);
        return businessProfit >= value; // Simplified assumption
      
      case 'hasCapGains':
        // Infer from various sources - exit planning goal, high income, or stock compensation
        return formData.strategyGoals.includes('Exit planning') || 
               formData.receivesStockComp || 
               this.isHighIncomeWithAssets(formData, forecastingData);
      
      case 'isAccredited':
        // Accredited investor based on income thresholds
        return this.isAccreditedInvestor(formData);
      
      case 'hasRental':
        // This would need additional form data - for now, infer from goals or income
        return formData.strategyGoals.includes('Real estate investments') ||
               this.getBusinessProfit(formData, forecastingData) > 200000;
      
      case 'isQP':
        // Qualified Purchaser - $5M+ investable assets
        return this.isQualifiedPurchaser(formData, forecastingData);
      
      default:
        console.warn(`Unknown eligibility criterion: ${key}`);
        return false;
    }
  }

  // Helper methods for specific criteria evaluations
  checkUserType(requiredType, formData) {
    switch (requiredType) {
      case 'business_owner':
        return formData.incomeType === 'business-owner' || formData.incomeType === 'blended';
      case 'w2_employee':
        return formData.incomeType === 'w2-employee' || formData.incomeType === 'blended';
      default:
        return false;
    }
  }

  getBusinessProfit(formData, forecastingData) {
    // Get business profit from forecasting data or estimate from income range
    if (forecastingData.businessProfit) {
      return parseInt(forecastingData.businessProfit) || 0;
    }
    
    // Fallback to income range if business owner
    if (formData.incomeType === 'business-owner' || formData.incomeType === 'blended') {
      return this.getIncomeFromRange(formData.incomeRange);
    }
    
    return 0;
  }

  getIncomeFromRange(incomeRange) {
    const incomeMap = {
      '$150K–$350K': 250000,
      '$350K–$1M': 675000,
      '$1M–$5M': 2500000,
      '$5M+': 7500000
    };
    return incomeMap[incomeRange] || 0;
  }

  isAccreditedInvestor(formData) {
    const income = this.getIncomeFromRange(formData.incomeRange);
    return income >= 200000; // Simplified - actual accredited investor rules are more complex
  }

  isQualifiedPurchaser(formData, forecastingData) {
    const income = this.getIncomeFromRange(formData.incomeRange);
    const capitalAvailable = parseInt(forecastingData.capitalAvailable) || 0;
    
    // QP requires $5M+ investable assets - rough approximation
    return income >= 2000000 || capitalAvailable >= 5000000;
  }

  isHighIncomeWithAssets(formData, forecastingData) {
    const income = this.getIncomeFromRange(formData.incomeRange);
    const capitalAvailable = parseInt(forecastingData.capitalAvailable) || 0;
    
    return income >= 500000 || capitalAvailable >= 100000;
  }

  // Calculate total annual savings from all matched strategies
  calculateStrategySavings(matchedStrategies) {
    let totalSavings = 0;
    
    for (const strategy of matchedStrategies) {
      if (strategy.quantifiedExample && strategy.quantifiedExample.annualSavings) {
        totalSavings += strategy.quantifiedExample.annualSavings;
      }
    }
    
    return totalSavings;
  }

  // Get strategies that apply to user's profile for progress tracking
  getApplicableStrategies(formData, forecastingData) {
    const strategyStack = this.generateStrategyStack(formData, forecastingData);
    return [
      ...strategyStack.setupStructure,
      ...strategyStack.deductionStrategies, 
      ...strategyStack.exitPlanning
    ];
  }
}

// Export singleton instance
export const strategyMatcher = new StrategyMatcher();