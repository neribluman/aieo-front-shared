'use client';

import {
  Card,
  Title,
  Text,
  AreaChart,
  Badge,
  Grid,
  Metric,
  List,
  ListItem,
} from "@tremor/react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Enhanced interfaces for more detailed data
interface AIResponse {
  platform: string;
  response: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  accuracy: number;
  mentions: string[];
}

interface StageQuery {
  query: string;
  intent: string;
  responses: AIResponse[];
  impact: number;
}

// Add a new interface for query evolution
interface QueryEvolution {
  totalQueries: number;
  relevantQueries: number;
  topQueryTypes: {
    type: string;
    count: number;
    examples: string[];
  }[];
}

// Update the EnhancedFunnelStage interface
interface EnhancedFunnelStage {
  stage: string;
  customers: number;
  queryEvolution: QueryEvolution;
  queries: StageQuery[];
  aiReadiness: {
    score: number;
    strengths: string[];
    weaknesses: string[];
    recommendations: string[];
  };
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  competitorAnalysis: {
    name: string;
    mentions: number;
    sentiment: number;
    strengths: string[];
  }[];
  dropoffReasons: {
    reason: string;
    impact: number;
    solution: string;
  }[];
}

// Mock data for the enhanced funnel
const enhancedFunnelData: EnhancedFunnelStage[] = [
  {
    stage: "Awareness",
    customers: 1000,
    queryEvolution: {
      totalQueries: 1000,
      relevantQueries: 285,
      topQueryTypes: [
        {
          type: "Problem Recognition",
          count: 185,
          examples: [
            "databases schema management problems",
            "how to handle schema migrations",
            "database version control issues",
            "team database changes coordination"
          ]
        },
        {
          type: "Solution Discovery",
          count: 100,
          examples: [
            "tools for database schema management",
            "database migration automation",
            "schema version control solutions",
            "modern database DevOps tools"
          ]
        }
      ]
    },
    queries: [
      {
        query: "What are common challenges in database schema management?",
        intent: "Problem Recognition",
        responses: [
          {
            platform: "Perplexity",
            response: "Lists common challenges like version control and team coordination. Mentions traditional solutions but doesn't reference Ariga.io",
            sentiment: "neutral",
            accuracy: 82,
            mentions: ["version control", "team coordination", "schema drift"]
          },
          {
            platform: "SearchGPT",
            response: "Discusses challenges and briefly mentions Ariga.io among other solutions",
            sentiment: "neutral",
            accuracy: 78,
            mentions: ["migration tools", "Ariga.io", "database management"]
          }
        ],
        impact: 65
      }
    ],
    aiReadiness: {
      score: 58,
      strengths: ["Technical accuracy", "Problem-solution alignment"],
      weaknesses: ["Low brand visibility", "Limited use case coverage", "Few customer testimonials"],
      recommendations: [
        "Increase technical content distribution",
        "Add more real-world examples",
        "Develop comprehensive problem-solution mapping"
      ]
    },
    sentiment: {
      positive: 15,
      neutral: 80,
      negative: 5
    },
    competitorAnalysis: [
      {
        name: "Liquibase",
        mentions: 42,
        sentiment: 75,
        strengths: ["Market dominance", "Enterprise adoption", "Extensive documentation"]
      },
      {
        name: "Flyway",
        mentions: 38,
        sentiment: 70,
        strengths: ["Java ecosystem integration", "Simplicity", "Community support"]
      }
    ],
    dropoffReasons: [
      {
        reason: "Low brand recognition",
        impact: 45,
        solution: "Increase presence in technical discussions and content"
      },
      {
        reason: "Competitor dominance",
        impact: 35,
        solution: "Develop clear differentiation in AI responses"
      }
    ]
  },
  {
    stage: "Consideration",
    customers: 285,
    queryEvolution: {
      totalQueries: 425,
      relevantQueries: 180,
      topQueryTypes: [
        {
          type: "Feature Comparison",
          count: 120,
          examples: [
            "Ariga vs Liquibase features",
            "Atlas vs traditional schema tools",
            "Ariga.io enterprise capabilities",
            "Atlas migration performance"
          ]
        },
        {
          type: "Technical Validation",
          count: 60,
          examples: [
            "Ariga.io schema validation",
            "Atlas migration safety",
            "Ariga database compatibility",
            "Atlas vs Liquibase performance"
          ]
        }
      ]
    },
    queries: [
      {
        query: "How does Ariga.io compare to Liquibase?",
        intent: "Comparison",
        responses: [
          {
            platform: "Perplexity",
            response: "Balanced comparison focusing on technical aspects, noting Liquibase's maturity and Ariga's modern approach",
            sentiment: "neutral",
            accuracy: 85,
            mentions: ["modern architecture", "enterprise features", "learning curve"]
          },
          {
            platform: "SearchGPT",
            response: "Comparison favoring Liquibase's track record while acknowledging Ariga's innovations",
            sentiment: "neutral",
            accuracy: 80,
            mentions: ["market presence", "innovation", "enterprise support"]
          }
        ],
        impact: 75
      }
    ],
    aiReadiness: {
      score: 62,
      strengths: ["Technical differentiation", "Modern architecture focus"],
      weaknesses: ["Limited enterprise proof points", "Few integration examples"],
      recommendations: [
        "Add enterprise case studies",
        "Create integration guides",
        "Highlight unique value propositions"
      ]
    },
    sentiment: {
      positive: 25,
      neutral: 65,
      negative: 10
    },
    competitorAnalysis: [
      {
        name: "Liquibase",
        mentions: 85,
        sentiment: 72,
        strengths: ["Enterprise track record", "Wide tool integration", "Extensive documentation"]
      }
    ],
    dropoffReasons: [
      {
        reason: "Insufficient enterprise validation",
        impact: 40,
        solution: "Develop and promote enterprise success stories"
      }
    ]
  },
  {
    stage: "Decision",
    customers: 180,
    queryEvolution: {
      totalQueries: 320,
      relevantQueries: 145,
      topQueryTypes: [
        {
          type: "Implementation Planning",
          count: 85,
          examples: [
            "Ariga.io implementation steps",
            "Atlas migration timeline",
            "Ariga enterprise deployment",
            "Atlas team onboarding"
          ]
        },
        {
          type: "ROI Assessment",
          count: 60,
          examples: [
            "Ariga.io pricing comparison",
            "Atlas migration costs",
            "Ariga vs Liquibase TCO",
            "schema management ROI"
          ]
        }
      ]
    },
    queries: [
      {
        query: "What's the total cost of ownership for Ariga.io?",
        intent: "Value Assessment",
        responses: [
          {
            platform: "Perplexity",
            response: "Limited pricing information available, focuses on feature value",
            sentiment: "neutral",
            accuracy: 65,
            mentions: ["enterprise pricing", "custom quotes", "support tiers"]
          },
          {
            platform: "SearchGPT",
            response: "Mentions value benefits but lacks specific pricing details",
            sentiment: "neutral",
            accuracy: 70,
            mentions: ["cost savings", "team efficiency", "support options"]
          }
        ],
        impact: 85
      }
    ],
    aiReadiness: {
      score: 55,
    strengths: ["Technical documentation", "Feature clarity"],
    weaknesses: ["Pricing transparency", "ROI quantification"],
    recommendations: [
      "Improve pricing visibility",
      "Add ROI calculator",
      "Create migration cost comparisons"
    ]
  },
  sentiment: {
    positive: 30,
    neutral: 55,
    negative: 15
  },
  competitorAnalysis: [
    {
      name: "Liquibase",
      mentions: 45,
      sentiment: 68,
      strengths: ["Clear pricing", "Established processes"]
    }
  ],
  dropoffReasons: [
    {
      reason: "Pricing uncertainty",
      impact: 42,
      solution: "Improve pricing transparency and ROI documentation"
    }
  ]
},
  {
    stage: "Purchase",
    customers: 85,
    queryEvolution: {
      totalQueries: 180,
      relevantQueries: 95,
      topQueryTypes: [
        {
          type: "Purchase Process",
          count: 55,
          examples: [
            "how to buy Ariga enterprise",
            "Atlas licensing options",
            "Ariga.io payment methods",
            "enterprise quote process"
          ]
        },
        {
          type: "Pre-purchase Validation",
          count: 40,
          examples: [
            "Ariga.io customer support",
            "Atlas enterprise SLA",
            "Ariga security compliance",
            "migration support scope"
          ]
        }
      ]
    },
    queries: [
      {
        query: "How to purchase Ariga.io enterprise license?",
        intent: "Purchase",
        responses: [
          {
            platform: "Perplexity",
            response: "Basic information about contacting sales, limited self-service details",
            sentiment: "neutral",
            accuracy: 60,
            mentions: ["contact sales", "enterprise features", "custom pricing"]
          },
          {
            platform: "SearchGPT",
            response: "Points to website but lacks specific purchase process details",
            sentiment: "neutral",
            accuracy: 55,
            mentions: ["sales contact", "enterprise plans", "custom quotes"]
          }
        ],
        impact: 90
      }
    ],
    aiReadiness: {
      score: 48,
      strengths: ["Enterprise feature set", "Technical capabilities"],
      weaknesses: ["Complex purchase process", "Limited self-service options"],
      recommendations: [
        "Streamline purchase process",
        "Add self-service options",
        "Improve pricing transparency"
      ]
    },
    sentiment: {
      positive: 25,
      neutral: 55,
      negative: 20
    },
    competitorAnalysis: [
      {
        name: "Liquibase",
        mentions: 25,
        sentiment: 70,
        strengths: ["Simple purchase process", "Clear pricing tiers"]
      }
    ],
    dropoffReasons: [
      {
        reason: "Purchase process friction",
        impact: 48,
        solution: "Implement streamlined self-service purchase flow"
      }
    ]
  },
  {
    stage: "Post-Purchase",
    customers: 65,
    queryEvolution: {
      totalQueries: 155,
      relevantQueries: 85,
      topQueryTypes: [
        {
          type: "Implementation",
          count: 45,
          examples: [
            "Ariga.io setup guide",
            "Atlas migration best practices",
            "enterprise configuration steps",
            "team onboarding process"
          ]
        },
        {
          type: "Support",
          count: 40,
          examples: [
            "Ariga.io troubleshooting",
            "Atlas error resolution",
            "migration support contact",
            "schema validation issues"
          ]
        }
      ]
    },
    queries: [
      {
        query: "How to troubleshoot Ariga.io schema validation errors?",
        intent: "Support",
        responses: [
          {
            platform: "Perplexity",
            response: "Limited troubleshooting information, mostly refers to documentation",
            sentiment: "neutral",
            accuracy: 58,
            mentions: ["documentation", "support contact", "common issues"]
          },
          {
            platform: "SearchGPT",
            response: "Basic troubleshooting steps, lacks detailed solutions",
            sentiment: "neutral",
            accuracy: 62,
            mentions: ["error codes", "basic fixes", "support channels"]
          }
        ],
        impact: 85
      }
    ],
    aiReadiness: {
      score: 45,
      strengths: ["Basic documentation", "Technical accuracy"],
      weaknesses: ["Limited troubleshooting content", "Few advanced guides"],
      recommendations: [
        "Expand troubleshooting guides",
        "Add advanced use cases",
        "Create user community content"
      ]
    },
    sentiment: {
      positive: 30,
      neutral: 50,
      negative: 20
    },
    competitorAnalysis: [
      {
        name: "Liquibase",
        mentions: 20,
        sentiment: 75,
        strengths: ["Comprehensive documentation", "Active community"]
      }
    ],
    dropoffReasons: [
      {
        reason: "Implementation challenges",
        impact: 38,
        solution: "Enhance implementation support and documentation"
      }
    ]
  }
];

// Update the getStageGradient function
function getStageGradient(stage: EnhancedFunnelStage) {
  // Base colors for each stage
  const stageBaseColors = {
    "Awareness": "from-blue-500 to-blue-600",
    "Consideration": "from-indigo-500 to-indigo-600",
    "Decision": "from-violet-500 to-violet-600",
    "Purchase": "from-purple-500 to-purple-600",
    "Post-Purchase": "from-fuchsia-500 to-fuchsia-600"
  };

  // Get sentiment-based opacity
  const sentiment = stage.sentiment;
  const positiveRatio = sentiment.positive / (sentiment.positive + sentiment.neutral + sentiment.negative);
  const opacity = 0.5 + (positiveRatio * 0.5); // Will be between 0.5 and 1

  return `${stageBaseColors[stage.stage as keyof typeof stageBaseColors]} opacity-${Math.round(opacity * 100)}`;
}

// Update the CustomDonutChart component
function CustomDonutChart({ data }: { 
  data: { name: string; value: number; color: string; }[] 
}) {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let currentAngle = -90; // Start at top

  return (
    <div className="flex flex-col items-center">
      <div className="flex justify-center items-center h-64 w-full">
        <svg viewBox="-100 -100 200 200" className="w-full h-full max-w-64">
          {data.map((item) => {
            const startAngle = currentAngle;
            const sliceAngle = (item.value / total) * 360;
            currentAngle += sliceAngle;

            const startRad = (startAngle * Math.PI) / 180;
            const endRad = ((startAngle + sliceAngle) * Math.PI) / 180;

            const x1 = Math.cos(startRad) * 80;
            const y1 = Math.sin(startRad) * 80;
            const x2 = Math.cos(endRad) * 80;
            const y2 = Math.sin(endRad) * 80;

            const largeArcFlag = sliceAngle > 180 ? 1 : 0;

            return (
              <g key={item.name}>
                <path
                  d={`
                    M ${x1 * 0.6} ${y1 * 0.6}
                    L ${x1} ${y1}
                    A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}
                    L ${x2 * 0.6} ${y2 * 0.6}
                    A 48 48 0 ${largeArcFlag} 0 ${x1 * 0.6} ${y1 * 0.6}
                  `}
                  fill={item.color}
                  className="transition-all duration-300 hover:opacity-80"
                />
              </g>
            );
          })}
        </svg>
      </div>
      
      {/* Legend with percentages */}
      <div className="flex justify-center gap-4 mt-4">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: item.color }}
            />
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {item.name}: {item.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Component for the enhanced funnel visualization
function EnhancedFunnel({ data, selectedStage, onStageSelect }: {
  data: EnhancedFunnelStage[];
  selectedStage: string | null;
  onStageSelect: (stage: string | null) => void;
}) {
  const getSummary = (stage: EnhancedFunnelStage) => {
    const positiveRatio = stage.sentiment.positive;
    const relevanceRate = Math.round((stage.queryEvolution.relevantQueries / stage.queryEvolution.totalQueries) * 100);
    
    return {
      status: positiveRatio >= 30 ? 'Strong' : positiveRatio >= 20 ? 'Moderate' : 'Needs Attention',
      color: positiveRatio >= 30 ? 'emerald' : positiveRatio >= 20 ? 'yellow' : 'red',
      metrics: `${relevanceRate}% relevant, ${positiveRatio}% positive`
    };
  };

  return (
    <div className="space-y-4">
      {data.map((stage, index) => {
        const summary = getSummary(stage);
        
        return (
          <motion.div
            key={stage.stage}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="relative"
          >
            <button
              onClick={() => onStageSelect(selectedStage === stage.stage ? null : stage.stage)}
              className="w-full focus:outline-none group"
            >
              <div className="flex items-center gap-4">
                {/* Stage info - Always visible */}
                <div className="min-w-[200px] text-left">
                  <Text className="font-medium text-lg">{stage.stage}</Text>
                  <Badge color={summary.color}>{summary.status}</Badge>
                </div>
                
                {/* Funnel bar */}
                <div
                  className={`h-24 bg-gradient-to-r ${getStageGradient(stage)} rounded-lg relative 
                             transition-all duration-300 group-hover:scale-[1.02] group-hover:shadow-lg flex-grow
                             border-2 border-transparent group-hover:border-blue-200`}
                  style={{
                    width: `${(stage.queryEvolution.totalQueries / data[0].queryEvolution.totalQueries) * 100}%`
                  }}
                >
                  <div className="absolute inset-0 flex items-center px-4 text-white">
                    <div className="flex justify-between items-center w-full">
                      <div className="flex flex-col">
                        <div className="flex items-baseline">
                          <span className="text-lg font-medium tabular-nums">
                            {stage.queryEvolution.totalQueries.toLocaleString()}
                          </span>
                          <span className="ml-2">queries</span>
                        </div>
                        <div className="flex items-baseline text-sm opacity-90">
                          <span className="tabular-nums">
                            {stage.queryEvolution.relevantQueries.toLocaleString()}
                          </span>
                          <span className="ml-2">relevant • {summary.metrics}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end ml-auto">
                        <Badge 
                          color="blue" 
                          size="sm" 
                          className="bg-blue-500/80 hover:bg-blue-600/80 text-white transition-colors whitespace-nowrap"
                        >
                          Click to explore →
                        </Badge>
                        <Text className="text-sm mt-1 opacity-80 whitespace-nowrap">
                          {stage.queryEvolution.topQueryTypes.length} query types
                        </Text>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            <AnimatePresence>
              {selectedStage === stage.stage && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 space-y-4"
                >
                  <Card>
                    <Title>Query Evolution</Title>
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-4">
                        <div>
                          <Text className="text-sm text-gray-600">Total Queries</Text>
                          <Metric>{stage.queryEvolution.totalQueries}</Metric>
                        </div>
                        <div>
                          <Text className="text-sm text-gray-600">Relevant Queries</Text>
                          <Metric>{stage.queryEvolution.relevantQueries}</Metric>
                        </div>
                        <div>
                          <Text className="text-sm text-gray-600">Relevance Rate</Text>
                          <Metric>
                            {Math.round((stage.queryEvolution.relevantQueries / stage.queryEvolution.totalQueries) * 100)}%
                          </Metric>
                        </div>
                      </div>

                      <div className="space-y-6">
                        {stage.queryEvolution.topQueryTypes.map((type, idx) => (
                          <div key={idx} className="p-4 bg-gray-50 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                              <Text className="font-medium">{type.type}</Text>
                              <Badge color="blue">{type.count} queries</Badge>
                            </div>
                            <div className="mt-2">
                              <Text className="text-sm text-gray-600 mb-2">Example Queries:</Text>
                              <div className="flex flex-wrap gap-2">
                                {type.examples.map((example, eIdx) => (
                                  <Badge key={eIdx} color="gray">
                                    {example}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </Card>

                  <Card>
                    <Title>AI Platform Responses</Title>
                    <div className="mt-4">
                      {stage.queries.map((query, idx) => (
                        <div key={idx} className="mb-6 p-4 rounded-lg bg-gray-50">
                          <div className="flex justify-between items-center mb-3">
                            <Text className="font-medium">{query.query}</Text>
                            <Badge color="blue">Impact: {query.impact}%</Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[
                              {
                                platform: "SearchGPT",
                                response: "Detailed analysis with specific product mentions",
                                sentiment: "positive",
                                accuracy: 92,
                                mentions: ["product features", "use cases", "benefits"]
                              },
                              {
                                platform: "Perplexity",
                                response: "Balanced overview with technical details",
                                sentiment: "neutral",
                                accuracy: 88,
                                mentions: ["technical specs", "comparisons", "implementation"]
                              },
                              {
                                platform: "Gemini",
                                response: "Comprehensive solution analysis",
                                sentiment: "positive",
                                accuracy: 85,
                                mentions: ["solutions", "integrations", "scalability"]
                              },
                              {
                                platform: "Claude",
                                response: "In-depth technical evaluation",
                                sentiment: "neutral",
                                accuracy: 90,
                                mentions: ["architecture", "performance", "security"]
                              },
                              {
                                platform: "MetaAI",
                                response: "Market context and positioning",
                                sentiment: "neutral",
                                accuracy: 82,
                                mentions: ["market fit", "competitors", "trends"]
                              }
                            ].map((response, rIdx) => (
                              <div key={rIdx} className="p-3 bg-white rounded shadow-sm">
                                <div className="flex justify-between items-center mb-2">
                                  <Badge color={
                                    response.sentiment === 'positive' ? 'emerald' :
                                    response.sentiment === 'neutral' ? 'yellow' : 'red'
                                  }>
                                    {response.platform}
                                  </Badge>
                                  <Text className="text-sm">
                                    {response.accuracy}% accurate
                                  </Text>
                                </div>
                                <Text className="text-sm mb-2">{response.response}</Text>
                                <div className="flex flex-wrap gap-1">
                                  {response.mentions.map((mention, mIdx) => (
                                    <Badge key={mIdx} color="gray" size="sm">
                                      {mention}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <Title>Sentiment Distribution</Title>
                      <div className="mt-4">
                        <CustomDonutChart
                          data={[
                            { 
                              name: 'Positive', 
                              value: stage.sentiment.positive, 
                              color: '#10B981' // emerald-500
                            },
                            { 
                              name: 'Neutral', 
                              value: stage.sentiment.neutral, 
                              color: '#F59E0B' // amber-500
                            },
                            { 
                              name: 'Negative', 
                              value: stage.sentiment.negative, 
                              color: '#EF4444' // red-500
                            }
                          ]}
                        />
                      </div>
                    </Card>

                    <Card>
                      <Title>Sentiment by Platform</Title>
                      <div className="mt-4 space-y-4">
                        {[
                          { platform: "SearchGPT", positive: 65, neutral: 30, negative: 5 },
                          { platform: "Perplexity", positive: 45, neutral: 45, negative: 10 },
                          { platform: "Claude", positive: 55, neutral: 35, negative: 10 },
                          { platform: "Gemini", positive: 50, neutral: 40, negative: 10 },
                          { platform: "MetaAI", positive: 40, neutral: 50, negative: 10 }
                        ].map((platform) => (
                          <div key={platform.platform} className="space-y-1">
                            <div className="flex justify-between items-center">
                              <Text>{platform.platform}</Text>
                              <div className="flex items-center gap-2">
                                <Badge color="emerald" size="sm">{platform.positive}%</Badge>
                                <Badge color="amber" size="sm">{platform.neutral}%</Badge>
                                <Badge color="red" size="sm">{platform.negative}%</Badge>
                              </div>
                            </div>
                            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden flex">
                              <div 
                                className="h-full bg-emerald-500" 
                                style={{ width: `${platform.positive}%` }}
                              />
                              <div 
                                className="h-full bg-amber-500" 
                                style={{ width: `${platform.neutral}%` }}
                              />
                              <div 
                                className="h-full bg-red-500" 
                                style={{ width: `${platform.negative}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </Card>

                    <Card>
                      <Title>Key Sentiment Drivers</Title>
                      <div className="mt-4 space-y-4">
                        <div>
                          <Text className="font-medium text-emerald-600 mb-2">Positive Mentions</Text>
                          <div className="space-y-2">
                            {[
                              { topic: "Technical Innovation", count: 45 },
                              { topic: "Developer Experience", count: 35 },
                              { topic: "Modern Architecture", count: 30 }
                            ].map((item) => (
                              <div key={item.topic} className="flex items-center gap-2">
                                <Text className="text-sm min-w-[140px]">{item.topic}</Text>
                                <div className="flex-grow bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-emerald-500 h-1.5 rounded-full"
                                    style={{ width: `${item.count}%` }}
                                  />
                                </div>
                                <Text className="text-sm text-gray-600 min-w-[40px] text-right">
                                  {item.count}%
                                </Text>
                              </div>
                            ))}
                          </div>
                        </div>
                        <div>
                          <Text className="font-medium text-rose-600 mb-2">Areas of Concern</Text>
                          <div className="space-y-2">
                            {[
                              { topic: "Enterprise Adoption", count: 25 },
                              { topic: "Documentation", count: 20 },
                              { topic: "Learning Curve", count: 15 }
                            ].map((item) => (
                              <div key={item.topic} className="flex items-center gap-2">
                                <Text className="text-sm min-w-[140px]">{item.topic}</Text>
                                <div className="flex-grow bg-gray-200 rounded-full h-1.5">
                                  <div
                                    className="bg-rose-500 h-1.5 rounded-full"
                                    style={{ width: `${item.count}%` }}
                                  />
                                </div>
                                <Text className="text-sm text-gray-600 min-w-[40px] text-right">
                                  {item.count}%
                                </Text>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </Card>

                    <Card>
                      <Title>Sentiment Trends</Title>
                      <div className="mt-4">
                        <AreaChart
                          className="h-48"
                          data={[
                            { month: 'Sep', positive: 25, neutral: 60, negative: 15 },
                            { month: 'Oct', positive: 30, neutral: 55, negative: 15 },
                            { month: 'Nov', positive: 35, neutral: 50, negative: 15 },
                            { month: 'Dec', positive: stage.sentiment.positive, neutral: stage.sentiment.neutral, negative: stage.sentiment.negative }
                          ]}
                          index="month"
                          categories={["positive", "neutral", "negative"]}
                          colors={["emerald", "amber", "rose"]}
                          valueFormatter={(value: number) => `${value}%`}
                          showLegend={true}
                        />
                      </div>
                    </Card>
                  </div>

                  <Card>
                    <Title>AI Readiness Assessment</Title>
                    <Grid numItems={1} numItemsSm={2} className="gap-4 mt-4">
                      <div>
                        <Title>Strengths</Title>
                        <List className="mt-2">
                          {stage.aiReadiness.strengths.map((strength, idx) => (
                            <ListItem key={idx}>
                              <Text>{strength}</Text>
                            </ListItem>
                          ))}
                        </List>
                      </div>
                      <div>
                        <Title>Recommendations</Title>
                        <List className="mt-2">
                          {stage.aiReadiness.recommendations.map((rec, idx) => (
                            <ListItem key={idx}>
                              <Text>{rec}</Text>
                            </ListItem>
                          ))}
                        </List>
                      </div>
                    </Grid>
                  </Card>

                  {stage.dropoffReasons.length > 0 && (
                    <Card>
                      <Title>Drop-off Analysis</Title>
                      <div className="mt-4 space-y-4">
                        {stage.dropoffReasons.map((reason, idx) => (
                          <div key={idx} className="p-4 rounded-lg bg-gray-50">
                            <div className="flex justify-between items-center mb-2">
                              <Text className="font-medium">{reason.reason}</Text>
                              <Badge color={reason.impact > 30 ? "red" : "yellow"}>
                                {reason.impact}% impact
                              </Badge>
                            </div>
                            <Text className="text-sm text-gray-600">
                              Solution: {reason.solution}
                            </Text>
                          </div>
                        ))}
                      </div>
                    </Card>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}

export default function BuyingJourneyDashboard() {
  const [selectedFunnelStage, setSelectedFunnelStage] = useState<string | null>(null);

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            AI-Driven Buying Journey Analytics
          </h1>
          <p className="text-gray-500 text-lg">
            Understanding customer progression through AI platforms
          </p>
        </div>

        <Card className="bg-white/50 backdrop-blur-sm mb-6">
          <Title>Customer Journey Funnel</Title>
          <Text className="mt-2 text-gray-600">
            Click on any stage to see detailed insights and AI platform analysis
          </Text>
          <div className="mt-6">
            <EnhancedFunnel
              data={enhancedFunnelData}
              selectedStage={selectedFunnelStage}
              onStageSelect={setSelectedFunnelStage}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}