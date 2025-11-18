import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Advanced Monte Carlo Simulation Engine
function runMonteCarloSimulation(
  initialAmount: number,
  monthlyContribution: number,
  years: number,
  expectedReturn: number,
  volatility: number,
  iterations: number = 10000
) {
  const results: number[] = [];
  const monthlyReturn = expectedReturn / 12;
  const monthlyVolatility = volatility / Math.sqrt(12);
  const totalMonths = years * 12;

  for (let i = 0; i < iterations; i++) {
    let portfolioValue = initialAmount;
    
    for (let month = 0; month < totalMonths; month++) {
      // Generate random return using Box-Muller transform for normal distribution
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      
      const monthlyGrowth = monthlyReturn + (z * monthlyVolatility);
      portfolioValue = portfolioValue * (1 + monthlyGrowth) + monthlyContribution;
    }
    
    results.push(portfolioValue);
  }

  results.sort((a, b) => a - b);

  return {
    percentiles: {
      p10: results[Math.floor(iterations * 0.1)],
      p25: results[Math.floor(iterations * 0.25)],
      p50: results[Math.floor(iterations * 0.5)],
      p75: results[Math.floor(iterations * 0.75)],
      p90: results[Math.floor(iterations * 0.9)],
    },
    successRate: (results.filter(r => r >= initialAmount).length / iterations) * 100,
    mean: results.reduce((sum, val) => sum + val, 0) / iterations,
    standardDeviation: Math.sqrt(
      results.reduce((sum, val) => {
        const mean = results.reduce((s, v) => s + v, 0) / iterations;
        return sum + Math.pow(val - mean, 2);
      }, 0) / iterations
    ),
  };
}

// Stress Test Analysis
function runStressTest(
  portfolioValue: number,
  allocation: { stocks: number; bonds: number; alternatives: number }
) {
  const scenarios = [
    {
      name: "2008 Financial Crisis",
      stocks: -37,
      bonds: 5,
      alternatives: -15,
      duration: 18,
    },
    {
      name: "2020 COVID Crash",
      stocks: -34,
      bonds: 8,
      alternatives: -22,
      duration: 6,
    },
    {
      name: "2000 Dot-com Bubble",
      stocks: -49,
      bonds: 12,
      alternatives: -8,
      duration: 31,
    },
    {
      name: "Rising Interest Rates",
      stocks: -12,
      bonds: -18,
      alternatives: -5,
      duration: 12,
    },
    {
      name: "Inflation Surge",
      stocks: -8,
      bonds: -22,
      alternatives: 15,
      duration: 24,
    },
  ];

  return scenarios.map(scenario => {
    const impact = 
      (allocation.stocks / 100) * scenario.stocks +
      (allocation.bonds / 100) * scenario.bonds +
      (allocation.alternatives / 100) * scenario.alternatives;
    
    const projectedValue = portfolioValue * (1 + impact / 100);
    const recoveryMonths = Math.ceil(scenario.duration * (1 + Math.abs(impact) / 20));

    return {
      scenario: scenario.name,
      impact: impact.toFixed(2),
      projectedValue: Math.round(projectedValue),
      duration: `${scenario.duration} months`,
      recoveryEstimate: `${recoveryMonths} months`,
      severity: Math.abs(impact) > 25 ? "severe" : Math.abs(impact) > 15 ? "moderate" : "mild",
    };
  });
}

// Goal Achievement Probability
function calculateGoalProbability(
  currentAmount: number,
  targetAmount: number,
  years: number,
  monthlyContribution: number,
  expectedReturn: number,
  volatility: number
) {
  const iterations = 10000;
  const successfulScenarios = [];
  
  for (let i = 0; i < iterations; i++) {
    let value = currentAmount;
    const monthlyReturn = expectedReturn / 12;
    const monthlyVol = volatility / Math.sqrt(12);
    
    for (let month = 0; month < years * 12; month++) {
      const u1 = Math.random();
      const u2 = Math.random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      
      const growth = monthlyReturn + (z * monthlyVol);
      value = value * (1 + growth) + monthlyContribution;
    }
    
    if (value >= targetAmount) {
      successfulScenarios.push(value);
    }
  }

  return {
    probability: (successfulScenarios.length / iterations) * 100,
    averageOverage: successfulScenarios.length > 0 
      ? successfulScenarios.reduce((a, b) => a + b, 0) / successfulScenarios.length - targetAmount
      : 0,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      simulationType, 
      initialAmount, 
      monthlyContribution = 0,
      years = 30,
      expectedReturn = 0.07,
      volatility = 0.15,
      allocation = { stocks: 60, bonds: 30, alternatives: 10 },
      targetAmount,
    } = await req.json();

    let result;

    switch (simulationType) {
      case "monte-carlo":
        result = runMonteCarloSimulation(
          initialAmount,
          monthlyContribution,
          years,
          expectedReturn,
          volatility
        );
        break;
      
      case "stress-test":
        result = runStressTest(initialAmount, allocation);
        break;
      
      case "goal-probability":
        result = calculateGoalProbability(
          initialAmount,
          targetAmount,
          years,
          monthlyContribution,
          expectedReturn,
          volatility
        );
        break;
      
      default:
        throw new Error("Invalid simulation type");
    }

    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Simulation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
