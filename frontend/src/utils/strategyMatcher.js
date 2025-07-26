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
    
    // First pass: determine if QSBS clock has started (F-Reorg eligible)
    const qsbsClockStarted = this.checkQsbsClockStarted(formData, forecastingData);

    for (const strategy of this.strategies) {
      // Add qsbsClockStarted to the evaluation context
      const eligibilityResult = this.checkEligibility(strategy, formData, forecastingData, { qsbsClockStarted });
      
      if (eligibilityResult.isEligible) {
        // Create strategy object with additional computed fields
        const strategyCard = {
          ...strategy,
          id: strategy.strategyId, // For backward compatibility with existing UI
          // Add conditional CTA for MSO users who could benefit from F-Reorg
          conditionalCta: this.getConditionalCta(strategy, formData, forecastingData, qsbsClockStarted),
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

  // Check if QSBS clock has started (F-Reorg is available)
  checkQsbsClockStarted(formData, forecastingData) {
    const isBusinessOwner = this.checkUserType('business_owner', formData);
    const hasNoPartners = formData.hasBusinessPartners === false;
    const hasMinProfit = this.getBusinessProfit(formData, forecastingData) >= 500000;
    
    return isBusinessOwner && hasNoPartners && hasMinProfit; // F-Reorg eligible = QSBS clock can start
  }

  // Get conditional CTA for MSO users who could benefit from F-Reorg
  getConditionalCta(strategy, formData, forecastingData, qsbsClockStarted) {
    // Only show for MSO strategy when user has partners but no QSBS access
    if (strategy.strategyId === 'mso_structure' && !qsbsClockStarted && formData.hasBusinessPartners === true) {
      return {
        text: "Your MSO creates C-Corp efficiency for income shifting. To unlock QSBS and a tax-free exit, your core operating business must be converted to a C-Corp.",
        action: "Explore F-Reorg Options"
      };
    }
    return null;
  }

  // Check if a strategy meets eligibility criteria
  checkEligibility(strategy, formData, forecastingData, context = {}) {
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
        // For split-dollar eligibility, check if user has C-Corp OR can create one
        const businessProfit = this.getBusinessProfit(formData, forecastingData);
        const hasExistingCcorp = formData.entityStructure === 'C-corp';
        const canCreateCcorp = this.canCreateCcorp(formData, forecastingData);
        
        if (hasExistingCcorp || canCreateCcorp) {
          return businessProfit >= value; // Has the retained earnings capacity
        }
        return false;
      
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

  // Helper method: Check if user can create a C-Corp (via F-Reorg or MSO)
  canCreateCcorp(formData, forecastingData) {
    const businessProfit = this.getBusinessProfit(formData, forecastingData);
    const isBusinessOwner = this.checkUserType('business_owner', formData);
    
    if (!isBusinessOwner || businessProfit < 500000) {
      return false; // Must be business owner with sufficient profit
    }
    
    // Can create C-Corp via F-Reorg (no partners) or MSO (with partners)
    const canDoFReorg = formData.hasBusinessPartners === false;
    const canDoMSO = formData.hasBusinessPartners === true;
    
    return canDoFReorg || canDoMSO;
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