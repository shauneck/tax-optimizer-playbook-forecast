import strategyCardsData from '../data/strategyCards.json';

// Strategy matching engine to evaluate eligibility criteria against user inputs
export class StrategyMatcher {
  constructor() {
    this.strategies = strategyCardsData;
  }

  // Main method to generate matched strategies based on user input
  generateStrategyStack(formData, forecastingData) {
    // Use the new matchStrategies method that handles hiding and conditional messages
    let matchedStrategies = this.matchStrategies(formData, forecastingData);
    
    // Defensive programming - ensure we have an array to work with
    if (!Array.isArray(matchedStrategies)) {
      console.error("matchStrategies did not return an array:", typeof matchedStrategies);
      return { setupStructure: [], deductionStrategies: [], exitPlanning: [], retirementPlanning: [] };
    }
    
    // Fix 3: Remove exit strategies unless user enabled exit planning
    // Check if exit planning is enabled based on strategy goals
    const exitPlanningEnabled = formData.strategyGoals && formData.strategyGoals.includes('Exit & liquidity planning');
    if (!exitPlanningEnabled) {
      matchedStrategies = matchedStrategies.filter(strategy => strategy.category !== 'Exit Planning');
    }
    
    // Group strategies by category
    const setupStructure = matchedStrategies.filter(s => s.category === 'Setup & Structure');
    const deductionStrategies = matchedStrategies.filter(s => s.category === 'Deduction Strategies');
    const exitPlanning = matchedStrategies.filter(s => s.category === 'Exit Planning');
    const retirementPlanning = matchedStrategies.filter(s => s.category === 'Retirement Planning');
    
    return { setupStructure, deductionStrategies, exitPlanning, retirementPlanning };
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
    if (strategy.suppressionRule && this.checkSuppressionRule(strategy.suppressionRule, formData, forecastingData, context)) {
      return {
        isEligible: false,
        suppressionMessage: strategy.suppressionRule.message
      };
    }

    // Handle complex eligibility logic
    return this.evaluateComplexCriteria(criteria, formData, forecastingData, context);
  }

  // Evaluate complex eligibility criteria (handles OR, AND, excludeCondition)
  evaluateComplexCriteria(criteria, formData, forecastingData, context = {}) {
    // Handle OR conditions
    if (criteria.or) {
      const orResult = criteria.or.some(orCriterion => 
        this.evaluateComplexCriteria(orCriterion, formData, forecastingData, context).isEligible
      );
      if (!orResult) {
        return { isEligible: false };
      }
    }

    // Handle AND conditions (implicit for regular criteria)
    for (const [key, value] of Object.entries(criteria)) {
      if (key === 'or' || key === 'excludeCondition') continue; // Skip special keys
      
      if (!this.evaluateCriterion(key, value, formData, forecastingData, context)) {
        return { isEligible: false };
      }
    }

    // Handle exclude conditions
    if (criteria.excludeCondition) {
      if (this.evaluateComplexCriteria(criteria.excludeCondition, formData, forecastingData, context).isEligible) {
        return { isEligible: false }; // Excluded
      }
    }

    return { isEligible: true };
  }

  // Check if suppression rule applies
  checkSuppressionRule(suppressionRule, formData, forecastingData, context = {}) {
    // Handle condition-based suppression rules
    if (suppressionRule.condition) {
      return this.evaluateComplexCriteria(suppressionRule.condition, formData, forecastingData, context).isEligible;
    }

    // Handle simple suppression rules (legacy format)
    for (const [key, value] of Object.entries(suppressionRule)) {
      if (key === 'message') continue; // Skip the message field
      
      if (this.evaluateCriterion(key, value, formData, forecastingData, context)) {
        return true; // Suppression rule triggered
      }
    }
    return false;
  }

  // Evaluate individual eligibility criteria
  evaluateCriterion(key, value, formData, forecastingData, context = {}) {
    switch (key) {
      case 'userType':
        return this.checkUserType(value, formData);
      
      case 'hasPartners':
        return formData.hasBusinessPartners === value;
      
      case 'businessProfitMin':
        return this.getBusinessProfit(formData, forecastingData) >= value;
      
      case 'businessProfitMax':
        return this.getBusinessProfit(formData, forecastingData) <= value;
      
      case 'entityStructure':
        return formData.entityStructure === value;
      
      case 'requiresCcorpStatus':
        // Check if entity has C-corp tax status (existing C-corp or LLC with C-corp election)
        return formData.entityStructure === 'C-corp' || this.hasElectedCcorpStatus(formData);
      
      case 'taxStatus':
        // For advanced strategies that require specific tax elections
        if (value === 'c_corp') {
          return formData.entityStructure === 'C-corp' || this.hasElectedCcorpStatus(formData);
        }
        return true;
      
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
      
      case 'qsbsClockStarted':
        // QSBS eligibility - requires F-Reorg to be available (converts operating business to C-Corp)
        return context.qsbsClockStarted === true;
      
      case 'capitalAvailableMin':
        // Check if user has minimum capital available for investment
        const capitalAvailable = parseInt(forecastingData.capitalAvailable) || 0;
        return capitalAvailable >= value;
      
      case 'restructurePercentMin':
        // Check if user wants to restructure minimum percentage of income
        const restructurePercent = parseInt(forecastingData.restructurePercent) || 0;
        return restructurePercent >= value;
      
      case 'entityStructure':
        // Check specific entity structure
        return formData.entityStructure === value;
      
      case 'and':
        // Handle AND logic within criteria
        return value.every(criterion => 
          this.evaluateComplexCriteria(criterion, formData, forecastingData, context).isEligible
        );
      
      default:
        console.warn(`Unknown eligibility criterion: ${key}`);
        return false;
    }
  }

  // Central eligibility checker that supports both old and new strategy formats
  isStrategyEligible(strategy, formData, forecastingData) {
    // Handle new displayCondition format (for LLC strategies)
    if (strategy.displayCondition) {
      return this.checkDisplayCondition(strategy.displayCondition, formData, forecastingData);
    }
    
    // Handle existing eligibilityCriteria format (for existing strategies)
    if (strategy.eligibilityCriteria) {
      const eligibilityResult = this.checkEligibility(strategy, formData, forecastingData);
      return eligibilityResult.isEligible;
    }
    
    return true; // Default to eligible if no criteria specified
  }

  // Check new displayCondition format for LLC strategies
  checkDisplayCondition(displayCondition, formData, forecastingData) {
    // Match entity type
    if (displayCondition.entityType) {
      const userEntityType = this.mapEntityStructureToType(formData.entityStructure);
      if (displayCondition.entityType !== userEntityType) return false;
    }
    
    // Match tax status
    if (displayCondition.taxStatus) {
      const userTaxStatus = this.getUserTaxStatus(formData);
      if (displayCondition.taxStatus !== userTaxStatus) return false;
    }

    // Match profit range
    if (displayCondition.profitRange) {
      const userProfit = this.getBusinessProfit(formData, forecastingData);
      const min = displayCondition.profitRange.min || 0;
      const max = displayCondition.profitRange.max || Infinity;
      if (userProfit < min || userProfit > max) return false;
    }

    return true;
  }

  // Helper: Map entity structure to display condition entity type
  mapEntityStructureToType(entityStructure) {
    switch (entityStructure) {
      case 'LLC': return 'LLC';
      case 'S-corp': return 'S-Corp';
      case 'C-corp': return 'C-Corp';
      case 'None': return 'Individual';
      default: return entityStructure;
    }
  }

  // Helper: Get user's current tax status
  getUserTaxStatus(formData) {
    // For now, default tax status unless C-corp elected
    if (formData.entityStructure === 'C-corp') return 'c_corp';
    if (this.hasElectedCcorpStatus(formData)) return 'c_corp';
    return 'default';
  }

  // Fix 1: Handle dynamic user profile updates based on strategy selections
  applyStrategyEffects(selectedStrategyId, formData, forecastingData) {
    // Create a copy of formData to avoid mutations
    const updatedFormData = { ...formData };
    
    // Update tax status when LLC C-Corp election is selected
    if (selectedStrategyId === 'llc_c_corp_election') {
      // Mark that the user has elected C-corp status
      updatedFormData.taxStatus = 'c_corp';
      updatedFormData.hasElectedCcorpStatus = true;
      
      // Re-match strategies with updated profile to unlock new strategies
      return this.generateStrategyStack(updatedFormData, forecastingData);
    }
    
    return null; // No profile changes needed
  }

  // Update tax status determination to consider dynamic elections
  getUserTaxStatus(formData) {
    // Check for explicit tax status changes
    if (formData.taxStatus === 'c_corp') return 'c_corp';
    if (formData.hasElectedCcorpStatus) return 'c_corp';
    
    // Default tax status based on entity structure
    if (formData.entityStructure === 'C-corp') return 'c_corp';
    if (this.hasElectedCcorpStatus(formData)) return 'c_corp';
    return 'default';
  }

  // Enhanced check for C-corp status including dynamic elections
  hasElectedCcorpStatus(formData) {
    // Check for dynamic election flag
    if (formData.hasElectedCcorpStatus) return true;
    if (formData.taxStatus === 'c_corp') return true;
    
    // For now, we'll assume no election unless explicitly set
    // In future versions, this could track user's election status
    return false;
  }

  // Helper method: Check if user can create a C-Corp (via F-Reorg or MSO)
  canCreateCcorp(formData, forecastingData) {
    const businessProfit = this.getBusinessProfit(formData, forecastingData);
    const isBusinessOwner = this.checkUserType('business_owner', formData);
    
    if (!isBusinessOwner || businessProfit < 500000) {
      return false; // Must be business owner with sufficient profit
    }
    
    // For blended income types, require higher business income percentage for MSO eligibility
    if (formData.incomeType === 'blended') {
      const businessPercent = parseInt(formData.businessIncomePercent || '0');
      // Require at least 60% business income for MSO strategies
      if (businessPercent < 60) {
        return false;
      }
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
        if (formData.incomeType === 'business-owner') return true;
        if (formData.incomeType === 'blended') {
          // For blended income, check if business income percentage is significant (>= 25%)
          const businessPercent = parseInt(formData.businessIncomePercent || '0');
          return businessPercent >= 25;
        }
        return false;
      case 'w2_employee':
        if (formData.incomeType === 'w2-employee') return true;
        if (formData.incomeType === 'blended') {
          // For blended income, check if W-2 income percentage is significant (>= 25%)
          const w2Percent = parseInt(formData.w2IncomePercent || '0');
          return w2Percent >= 25;
        }
        return false;
      default:
        return false;
    }
  }

  getBusinessProfit(formData, forecastingData) {
    // Get business profit from forecasting data or estimate from income range
    if (forecastingData.businessProfit) {
      return parseInt(forecastingData.businessProfit) || 0;
    }
    
    // Calculate weighted business profit for different income types
    const totalIncome = this.getIncomeFromRange(formData.incomeRange);
    
    if (formData.incomeType === 'business-owner') {
      return totalIncome;
    } else if (formData.incomeType === 'blended') {
      // For blended income, calculate based on business income percentage
      const businessPercent = parseInt(formData.businessIncomePercent || '0') / 100;
      return Math.round(totalIncome * businessPercent);
    }
    
    return 0;
  }

  getW2Income(formData, forecastingData) {
    // Calculate W-2 income for blended profiles and W-2 employees
    const totalIncome = this.getIncomeFromRange(formData.incomeRange);
    
    if (formData.incomeType === 'w2-employee') {
      return totalIncome;
    } else if (formData.incomeType === 'blended') {
      // For blended income, calculate based on W-2 income percentage
      const w2Percent = parseInt(formData.w2IncomePercent || '0') / 100;
      return Math.round(totalIncome * w2Percent);
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
    const totalIncome = this.getIncomeFromRange(formData.incomeRange);
    
    // For blended income, use weighted calculation based on higher accreditation requirements
    if (formData.incomeType === 'blended') {
      const w2Income = this.getW2Income(formData, {});
      const businessIncome = this.getBusinessProfit(formData, {});
      
      // Either W-2 income alone >= $200K or business income alone >= $200K qualifies
      // Or combined income >= $300K with significant portion from qualifying sources
      return totalIncome >= 200000 && (w2Income >= 150000 || businessIncome >= 150000 || totalIncome >= 300000);
    }
    
    // Standard accredited investor threshold
    return totalIncome >= 200000;
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
      if (strategy.quantifiedExample) {
        // Handle regular strategies
        if (strategy.quantifiedExample.annualSavings) {
          totalSavings += strategy.quantifiedExample.annualSavings;
        }
        // Handle Roth Overhaul Protocol with QP/Accredited investor paths
        else if (strategy.strategyId === 'roth_overhaul_protocol') {
          // For now, use QP savings as default - could be enhanced to check user status
          const rothSavings = strategy.quantifiedExample.qualifiedPurchaser?.annualSavings || 
                            strategy.quantifiedExample.accreditedInvestor?.annualSavings || 
                            0;
          totalSavings += rothSavings;
        }
      }
    }
    
    return totalSavings;
  }

  // Get strategies that apply to user's profile for progress tracking
  getApplicableStrategies(formData, forecastingData) {
    const strategyStack = this.generateStrategyStack(formData, forecastingData);
    
    // Defensive programming - ensure all arrays exist
    const setupStructure = Array.isArray(strategyStack.setupStructure) ? strategyStack.setupStructure : [];
    const deductionStrategies = Array.isArray(strategyStack.deductionStrategies) ? strategyStack.deductionStrategies : [];
    const exitPlanning = Array.isArray(strategyStack.exitPlanning) ? strategyStack.exitPlanning : [];
    const retirementPlanning = Array.isArray(strategyStack.retirementPlanning) ? strategyStack.retirementPlanning : [];
    
    return [
      ...setupStructure,
      ...deductionStrategies, 
      ...exitPlanning,
      ...retirementPlanning
    ];
  }

  matchStrategies(formData, forecastingData) {
    let matchedStrategies = [];
    
    // Defensive programming - ensure we have strategies to work with
    if (!Array.isArray(this.strategies)) {
      console.error("Expected array of strategies, received:", typeof this.strategies);
      return [];
    }
    
    for (const strategy of this.strategies) {
      // Check if strategy should be hidden based on entity type
      if (this.shouldHideStrategy(strategy, formData)) {
        continue; // Skip this strategy
      }
      
      if (this.isStrategyEligible(strategy, formData, forecastingData)) {
        const enhancedStrategy = {
          ...strategy,
          id: strategy.strategyId, // For backward compatibility with existing UI
          projectedSavings: this.calculateSavings(strategy, formData, forecastingData),
          matchingCriteria: this.getMatchingCriteria(strategy, formData, forecastingData)
        };
        matchedStrategies.push(enhancedStrategy);
      } else {
        // Check if strategy should show conditional UI message
        const conditionalMessage = this.getConditionalMessage(strategy, formData, forecastingData);
        if (conditionalMessage) {
          const enhancedStrategy = {
            ...strategy,
            id: strategy.strategyId, // For backward compatibility with existing UI
            conditionalMessage,
            projectedSavings: this.calculateSavings(strategy, formData, forecastingData),
            matchingCriteria: this.getMatchingCriteria(strategy, formData, forecastingData)
          };
          matchedStrategies.push(enhancedStrategy);
        }
      }
    }
    
    // Return the array directly, not the calculated savings
    // The calculateStrategySavings method should be called elsewhere if needed
    return matchedStrategies;
  }

  // Check if strategy should be hidden based on hiding rules
  shouldHideStrategy(strategy, formData) {
    // Hide F-Reorg S-Corp to C-Corp strategy for LLC owners
    if (strategy.strategyId === 'f_reorg_c_corp' && formData.entityStructure === 'LLC') {
      return true;
    }
    
    return false;
  }

  // Get conditional UI message for strategies that don't fully qualify
  getConditionalMessage(strategy, formData, forecastingData) {
    // Show message for Split-Dollar if LLC needs C-corp election
    if (strategy.strategyId === 'loan_based_split_dollar' && 
        strategy.uiMessageIfHidden && 
        formData.entityStructure === 'LLC' && 
        !this.hasElectedCcorpStatus(formData)) {
      return strategy.uiMessageIfHidden;
    }
    
    // Handle new displayCondition format with uiMessageIfHidden
    if (strategy.displayCondition && strategy.uiMessageIfHidden) {
      if (!this.checkDisplayCondition(strategy.displayCondition, formData, forecastingData)) {
        return strategy.uiMessageIfHidden;
      }
    }
    
    return null;
  }

  // Calculate projected savings for a strategy
  calculateSavings(strategy, formData, forecastingData) {
    // Use quantifiedExample if available
    if (strategy.quantifiedExample && strategy.quantifiedExample.annualSavings) {
      return {
        annualSavings: strategy.quantifiedExample.annualSavings,
        description: strategy.quantifiedExample.description || '',
        result: strategy.quantifiedExample.result || ''
      };
    }
    
    // Fallback to basic calculation for strategies without quantified examples
    const businessProfit = this.getBusinessProfit(formData, forecastingData);
    const estimatedSavings = Math.min(businessProfit * 0.15, 100000); // 15% up to $100K
    
    return {
      annualSavings: estimatedSavings,
      description: `Estimated savings based on ${formData.entityStructure} structure`,
      result: 'Calculated estimate pending detailed analysis'
    };
  }

  // Get matching criteria for display purposes
  getMatchingCriteria(strategy, formData, forecastingData) {
    const criteria = [];
    
    // Check displayCondition criteria
    if (strategy.displayCondition) {
      if (strategy.displayCondition.entityType) {
        criteria.push(`Entity: ${strategy.displayCondition.entityType}`);
      }
      if (strategy.displayCondition.profitRange) {
        const min = strategy.displayCondition.profitRange.min;
        const max = strategy.displayCondition.profitRange.max;
        if (min && max) {
          criteria.push(`Income: $${min.toLocaleString()} - $${max.toLocaleString()}`);
        } else if (min) {
          criteria.push(`Income: $${min.toLocaleString()}+`);
        }
      }
    }
    
    // Check eligibilityCriteria for existing strategies
    if (strategy.eligibilityCriteria) {
      if (strategy.eligibilityCriteria.userType) {
        criteria.push(`Type: ${strategy.eligibilityCriteria.userType.replace('_', ' ')}`);
      }
      if (strategy.eligibilityCriteria.businessProfitMin) {
        criteria.push(`Min Profit: $${strategy.eligibilityCriteria.businessProfitMin.toLocaleString()}`);
      }
    }
    
    return criteria;
  }

  // Match and rank all strategies based on user's profile
  _originalMatchStrategies(formData, forecastingData) {
  }
}

// Export singleton instance
export const strategyMatcher = new StrategyMatcher();