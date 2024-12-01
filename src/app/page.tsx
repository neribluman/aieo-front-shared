'use client';

import { Card, Title, LineChart, Text, Metric, Flex, TabGroup, TabList, Tab, TabPanels, TabPanel, Badge } from '@tremor/react';
import WorldMap from "react-svg-worldmap";
import { CountryContext } from "react-svg-worldmap";
import { useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/Tabs"
import { ChevronRightIcon, ChevronLeftIcon, GlobeAltIcon, BuildingOfficeIcon, UserIcon } from '@heroicons/react/24/outline';

// First, let's define a type for the position
type Position = number | '-';

interface RegionalData {
  region: string;
  score: number;
  color: string;
  topQueries: string[];
  growth: string;
  marketPenetration: string;
}

interface ICPData {
  profile: string;
  visibilityProbability: number;
  recommendationProbability: number;
  avgRanking: number;
  citationAppearances: number;
  overallScore: number;
  color: string;
}

interface MapData {
  country: string;
  value: number;
}

interface PlatformRanking {
  name: string;
  position: Position;
  cited: boolean;
}

// Update the buyingJourney type to be more specific
type BuyingJourneyStage = 
  | "Problem Exploration" 
  | "Solution Education" 
  | "Solution Comparison" 
  | "Solution Evaluation" 
  | "Final Research";

interface QueryPerformance {
  id: string;
  query: string;
  category: string;
  impact: "High" | "Medium" | "Low";
  userIntent: string;
  buyingJourney: BuyingJourneyStage;
  platforms: PlatformRanking[];
  averagePosition: number;
}

interface DetailedRanking {
  position: number;
  company: string;
}

// First, update the interface for citation data
interface CompetitorData {
  company: string;
  visibilityProbability: number;
  recommendationProbability: number;
  avgRanking: number;
  citationAppearances: number;
  overallScore: number;
  trend: 'up' | 'down' | 'same';  // Changed from string to specific types
  demographics: {
    topICPs: Array<{ name: string; score: number }>;
    topVerticals: Array<{ name: string; score: number }>;
    topRegions: Array<{ name: string; score: number }>;
  };
  topSources: Array<{
    name: string;
    url: string;
    platforms: string[];
    citationRate: number;
    sourceType: 'Documentation' | 'Blog' | 'Forum' | 'News';  // Make it required
    relevance: number;  // Make it required
  }>;
}

// Update the Citation interface to include more detailed metrics
interface Citation {
  id: string;
  title: string;
  url: string;
  source: {
    type: 'Documentation' | 'Blog' | 'GitHub' | 'Guide' | 'Tutorial';
    lastUpdated: string;
    section?: string; // e.g., "Schema Migration", "CLI Usage"
  };
  metrics: {
    totalQueryReferences: number; // out of 1000 queries
    queryBreakdown: {
      awareness: number;
      consideration: number;
      decision: number;
    };
    engineReferences: {
      platform: string;
      references: number; // how many times this engine referenced this article
      percentage: number; // % of total references
    }[];
  };
  sentiment: 'Positive' | 'Neutral' | 'Negative';
  competitorMentions: {
    company: string;
    coMentionCount: number; // how many times mentioned together
    context: 'Alternative' | 'Comparison' | 'Integration' | 'Migration';
    sentiment: 'Positive' | 'Neutral' | 'Negative';
  }[];
  attention: {
    type: 'Opportunity' | 'Risk' | 'Monitor';
    message: string;
  } | null;
  quote: string;
}

// First, update the interface (add this if it doesn't exist):
interface AIEngine {
  engine: string;
  visibility: number;
  percentageRanked: number;
  recommendationProbability: number;
  avgRankingPosition: number;
  citationAppearance: number;
  avgCitationPosition: number;
  color: string;
}

// Add this type definition for the time series data
interface AIEngineTimeSeriesData {
  date: string;
  engine: string;
  avgSentiment: number;
  avgPosition: number;
  visibilityRate: number;
  recommendationProb: number;
}

// Add new interfaces for the funnel data structure
interface FunnelMetric {
  label: 'Average Sentiment' | 'Average Position' | 'Company Mentioned' | 'Recommendation Probability';
  value: number;
  trend?: string;
  color?: string;
}

interface FunnelLevel {
  id: string;
  name: string;
  metrics: FunnelMetric[];
  children?: FunnelNode[];
}

// First, let's update the FunnelNode interface to include all possible properties
interface FunnelNode {
  id: string;
  name: string;
  icon?: JSX.Element;
  metrics: FunnelMetric[];
  details: {
    marketSize?: string;
    growthRate?: string;
    competitorCount?: number;
    topCompetitors?: Array<{ name: string; share: number }>;
    topMarkets?: string[];
    influence?: number;
  };
}

interface BreadcrumbItem {
  id: string;
  name: string;
  level: string;
}

// Update the TransitionWrapper component with better transitions
function TransitionWrapper({ children, isVisible }: { children: React.ReactNode; isVisible: boolean }) {
  return (
    <div
      className={`
        transition-all duration-500 ease-out
        ${isVisible ? 'page-transition-enter' : 'page-transition-exit'}
        ${isVisible ? 'opacity-100' : 'opacity-0 pointer-events-none'}
      `}
    >
      <div className="content-transition">
        {children}
      </div>
    </div>
  );
}

// Add this inside your VisibilityDashboard component
function BuyingJourneyFunnel() {
  const [activePath, setActivePath] = useState<BreadcrumbItem[]>([]);
  const [activeNode, setActiveNode] = useState<FunnelNode | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Define queries first
  const queries: QueryPerformance[] = [
    {
      id: "q1",
      query: "What challenges do teams face with manual database schema changes?",
      category: "Problem Recognition",
      impact: "High",
      userIntent: "Research",
      buyingJourney: "Problem Exploration",
      platforms: [
        { name: "Perplexity", position: 2, cited: true },
        { name: "Claude", position: 4, cited: true },
        { name: "Gemini", position: '-', cited: false }
      ],
      averagePosition: 3
    },
    {
      id: "q2",
      query: "Best practices for database schema versioning",
      category: "Problem Recognition",
      impact: "Medium",
      userIntent: "Research",
      buyingJourney: "Solution Education",
      platforms: [
        { name: "Perplexity", position: 1, cited: true },
        { name: "Claude", position: 3, cited: true },
        { name: "Gemini", position: 5, cited: false }
      ],
      averagePosition: 3.2
    },
    {
      id: "q3",
      query: "Database CI/CD pipeline automation tools",
      category: "Problem Recognition",
      impact: "High",
      userIntent: "Research",
      buyingJourney: "Solution Comparison",
      platforms: [
        { name: "Claude", position: 2, cited: true },
        { name: "Perplexity", position: 3, cited: true },
        { name: "Gemini", position: 4, cited: true }
      ],
      averagePosition: 3
    },
    {
      id: "q4",
      query: "How to prevent schema drift in production",
      category: "Problem Recognition",
      impact: "High",
      userIntent: "Research",
      buyingJourney: "Solution Evaluation",
      platforms: [
        { name: "Perplexity", position: 1, cited: true },
        { name: "Claude", position: 2, cited: true },
        { name: "Gemini", position: 4, cited: false }
      ],
      averagePosition: 2.3
    },
    
    // Database Architect Queries
    {
      id: "q5",
      query: "Database schema automation tools comparison",
      category: "Research",
      impact: "High",
      userIntent: "Evaluation",
      buyingJourney: "Solution Evaluation",
      platforms: [
        { name: "Claude", position: 1, cited: true },
        { name: "Perplexity", position: 3, cited: true },
        { name: "Gemini", position: 4, cited: false }
      ],
      averagePosition: 2.7
    },
    {
      id: "q6",
      query: "Schema migration strategies for large databases",
      category: "Research",
      impact: "High",
      userIntent: "Technical",
      buyingJourney: "Solution Education",
      platforms: [
        { name: "Perplexity", position: 2, cited: true },
        { name: "Claude", position: 3, cited: true },
        { name: "Gemini", position: 3, cited: true }
      ],
      averagePosition: 2.7
    },
    {
      id: "q7",
      query: "How to implement database version control",
      category: "Research",
      impact: "Medium",
      userIntent: "Technical",
      buyingJourney: "Solution Comparison",
      platforms: [
        { name: "Claude", position: 1, cited: true },
        { name: "Perplexity", position: 2, cited: true },
        { name: "Gemini", position: 4, cited: false }
      ],
      averagePosition: 2.3
    },
    {
      id: "q8",
      query: "Database schema testing best practices",
      category: "Research",
      impact: "Medium",
      userIntent: "Technical",
      buyingJourney: "Solution Evaluation",
      platforms: [
        { name: "Perplexity", position: 2, cited: true },
        { name: "Claude", position: 3, cited: true },
        { name: "Gemini", position: 5, cited: false }
      ],
      averagePosition: 3.3
    },
    
    // Tech Lead Queries
    {
      id: "q9",
      query: "ROI of database schema automation",
      category: "Vendor Analysis",
      impact: "High",
      userIntent: "Business",
      buyingJourney: "Solution Evaluation",
      platforms: [
        { name: "Claude", position: 2, cited: true },
        { name: "Perplexity", position: 3, cited: true },
        { name: "Gemini", position: 4, cited: true }
      ],
      averagePosition: 3
    },
    {
      id: "q10",
      query: "Database schema management tools enterprise features",
      category: "Vendor Analysis",
      impact: "High",
      userIntent: "Evaluation",
      buyingJourney: "Solution Evaluation",
      platforms: [
        { name: "Perplexity", position: 1, cited: true },
        { name: "Claude", position: 2, cited: true },
        { name: "Gemini", position: 3, cited: true }
      ],
      averagePosition: 2
    },
    {
      id: "q11",
      query: "Schema automation tool integration capabilities",
      category: "Vendor Analysis",
      impact: "Medium",
      userIntent: "Technical",
      buyingJourney: "Solution Comparison",
      platforms: [
        { name: "Claude", position: 2, cited: true },
        { name: "Perplexity", position: 3, cited: true },
        { name: "Gemini", position: 4, cited: false }
      ],
      averagePosition: 3
    },
    {
      id: "q12",
      query: "Database schema automation pricing comparison",
      category: "Vendor Analysis",
      impact: "High",
      userIntent: "Business",
      buyingJourney: "Solution Evaluation",
      platforms: [
        { name: "Perplexity", position: 1, cited: true },
        { name: "Claude", position: 3, cited: true },
        { name: "Gemini", position: 4, cited: false }
      ],
      averagePosition: 2.7
    }
  ];

  // Sample funnel data structure
  const geographicRegions: FunnelLevel = {
    id: 'regions',
    name: 'Geographic Regions',
    metrics: [
      { label: 'Average Sentiment', value: 42, trend: '+15%', color: 'blue' },
      { label: 'Average Position', value: 3.2, trend: '+0.8', color: 'emerald' },
      { label: 'Company Mentioned', value: 38, trend: '+12%', color: 'violet' },
      { label: 'Recommendation Probability', value: 45, trend: '+18%', color: 'amber' }
    ],
    children: [
      {
        id: 'americas',
        name: 'Americas',
        metrics: [
          { label: 'Average Sentiment' as const, value: 48, trend: '+18%' },
          { label: 'Average Position' as const, value: 2.8, trend: '+1.2' },
          { label: 'Company Mentioned' as const, value: 42, trend: '+15%' },
          { label: 'Recommendation Probability' as const, value: 52, trend: '+20%' }
        ],
        details: {
          topCompetitors: [
            { name: 'Redgate', share: 32 },
            { name: 'Liquibase', share: 28 },
            { name: 'Flyway', share: 24 }
          ]
        }
      },
      {
        id: 'emea',
        name: 'EMEA',
        metrics: [
          { label: 'Average Sentiment' as const, value: 45, trend: '+15%' },
          { label: 'Average Position' as const, value: 3.0, trend: '+0.9' },
          { label: 'Company Mentioned' as const, value: 38, trend: '+10%' },
          { label: 'Recommendation Probability' as const, value: 48, trend: '+16%' }
        ],
        details: {
          topMarkets: ['UK', 'Germany', 'France']
        }
      },
      // Add more regions...
    ]
  };

  // Define verticals data
  const verticals: FunnelNode[] = [
    {
      id: 'enterprise',
      name: 'Enterprise Software',
      icon: <BuildingOfficeIcon className="w-6 h-6 text-blue-500" />,
      metrics: [
        { label: 'Average Sentiment' as const, value: 45, trend: '+12%' },
        { label: 'Average Position' as const, value: 2.5, trend: '+1.5' },
        { label: 'Company Mentioned' as const, value: 42, trend: '+8%' },
        { label: 'Recommendation Probability' as const, value: 48, trend: '+15%' }
      ],
      details: {
        marketSize: '$12.5B',
        growthRate: '15.5% CAGR',
        competitorCount: 8,
        topCompetitors: [
          { name: 'Redgate', share: 28 },
          { name: 'Liquibase', share: 22 },
          { name: 'Flyway', share: 18 }
        ]
      }
    },
    {
      id: 'fintech',
      name: 'Financial Services',
      icon: <BuildingOfficeIcon className="w-6 h-6 text-emerald-500" />,
      metrics: [
        { label: 'Average Sentiment', value: 42, trend: '+10%' },
        { label: 'Average Position', value: 2.8, trend: '+1.2' },
        { label: 'Company Mentioned', value: 38, trend: '+5%' },
        { label: 'Recommendation Probability', value: 45, trend: '+12%' }
      ],
      details: {
        marketSize: '$8.5B',
        growthRate: '12.5% CAGR',
        competitorCount: 6,
        topCompetitors: [
          { name: 'Redgate', share: 25 },
          { name: 'Liquibase', share: 20 },
          { name: 'Flyway', share: 15 }
        ]
      }
    },
    {
      id: 'healthcare',
      name: 'Healthcare Tech',
      icon: <BuildingOfficeIcon className="w-6 h-6 text-violet-500" />,
      metrics: [
        { label: 'Average Sentiment', value: 35, trend: '+12%' },
        { label: 'Average Position', value: 3.0, trend: '+20%' },
        { label: 'Company Mentioned', value: 32, trend: '+15%' },
        { label: 'Recommendation Probability', value: 38, trend: '+8%' }
      ],
      details: {
        marketSize: '$6.2B',
        growthRate: '18.5% CAGR',
        competitorCount: 5,
        topCompetitors: [
          { name: 'Redgate', share: 22 },
          { name: 'Liquibase', share: 18 },
          { name: 'Flyway', share: 12 }
        ]
      }
    }
  ];

  // Define personas data
  const personas = [
    {
      id: 'devops-lead',
      title: 'DevOps Lead',
      icon: <BuildingOfficeIcon className="w-6 h-6 text-blue-500" />,
      metrics: [
        { label: 'Average Sentiment' as const, value: 48, trend: '+18%' },
        { label: 'Average Position' as const, value: 2.2, trend: '+1.8' },
        { label: 'Company Mentioned' as const, value: 45, trend: '+12%' },
        { label: 'Recommendation Probability' as const, value: 52, trend: '+25%' }
      ] as FunnelMetric[],
      details: {
        influence: 85
      }
    },
    {
      id: 'db-architect',
      title: 'Database Architect',
      icon: <BuildingOfficeIcon className="w-6 h-6 text-emerald-500" />,
      metrics: [
        { label: 'Average Sentiment' as const, value: 45, trend: '+15%' },
        { label: 'Average Position' as const, value: 2.5, trend: '+1.5' },
        { label: 'Company Mentioned' as const, value: 42, trend: '+10%' },
        { label: 'Recommendation Probability' as const, value: 48, trend: '+20%' }
      ] as FunnelMetric[],
      details: {
        influence: 75
      }
    },
    {
      id: 'tech-lead',
      title: 'Tech Lead',
      icon: <UserIcon className="w-6 h-6 text-violet-500" />,
      metrics: [
        { label: 'Average Sentiment' as const, value: 42, trend: '+12%' },
        { label: 'Average Position' as const, value: 2.8, trend: '+1.2' },
        { label: 'Company Mentioned' as const, value: 40, trend: '+8%' },
        { label: 'Recommendation Probability' as const, value: 45, trend: '+15%' }
      ] as FunnelMetric[],
      details: {
        influence: 70
      }
    }
  ];

  // Update the navigation functions
  const handleNavigation = (newNode: FunnelNode | null, newPath: BreadcrumbItem[]) => {
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveNode(null);
      setActivePath(newPath);
      setTimeout(() => {
        if (newPath.length === 0) {
          setActiveNode(null);
        } else {
          // Find the correct node based on the last path item
          const lastPath = newPath[newPath.length - 1];
          let targetNode: FunnelNode | null = null;

          switch (lastPath.level) {
            case 'region':
              targetNode = geographicRegions.children?.find(r => r.id === lastPath.id) || null;
              break;
            case 'vertical':
              // Assuming verticals are defined somewhere in your component
              targetNode = verticals.find(v => v.id === lastPath.id) || null;
              break;
            case 'persona':
              const persona = personas.find(p => p.id === lastPath.id);
              if (persona) {
                targetNode = {
                  id: persona.id,
                  name: persona.title, // Use title as name
                  metrics: persona.metrics,
                  details: {
                    influence: persona.details.influence,
                    // Add other required details
                  }
                };
              }
              break;
          }
          setActiveNode(targetNode);
        }
        setIsTransitioning(false);
      }, 100);
    }, 300);
  };

  // Update the card click handlers
  const handleCardClick = (node: FunnelNode | Persona, level: string) => {
    const nodeToUse = level === 'persona' ? {
      id: (node as Persona).id,
      name: (node as Persona).title,
      metrics: (node as Persona).metrics,
      details: (node as Persona).details
    } : node as FunnelNode;

    handleNavigation(
      nodeToUse,
      [...activePath, { id: nodeToUse.id, name: nodeToUse.name, level }]
    );
  };

  // Update the back navigation
  const handleBack = (index: number) => {
    const newPath = activePath.slice(0, index + 1);
    const previousNode = newPath[newPath.length - 1];
    handleNavigation(
      previousNode ? {
        id: previousNode.id,
        name: previousNode.name,
        metrics: [],
        details: {}
      } : null,
      newPath
    );
  };

  // Update the renderBreadcrumbs function
  const renderBreadcrumbs = () => (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
      {activePath.map((item, index) => (
        <div 
          key={item.id} 
          className="flex items-center animate-fadeIn"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          {index > 0 && (
            <ChevronRightIcon 
              className="w-4 h-4 mx-1 text-gray-400 animate-slideIn" 
              style={{ animationDelay: `${index * 100}ms` }} 
            />
          )}
          <button
            onClick={() => handleBreadcrumbClick(index)}
            className="hover:text-blue-600 transition-colors"
          >
            {item.name}
          </button>
        </div>
      ))}
    </div>
  );

  const renderMetrics = (metrics: FunnelMetric[]) => (
    <div className="space-y-2">
      {metrics.map((metric, index) => (
        <div key={index} className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${
              metric.value >= 75 ? 'bg-green-500' :
              metric.value >= 50 ? 'bg-yellow-500' :
              'bg-red-500'
            }`} />
            <Text className="text-sm text-gray-600">{metric.label}</Text>
          </div>
          <div className="flex items-center gap-2">
            <Text className="text-sm font-medium">
              {metric.label === 'Average Position' ? `#${metric.value}` : 
               metric.label === 'Average Sentiment' ? `${metric.value}%` :
               `${metric.value}%`}
            </Text>
            {metric.trend && (
              <Text className={`text-xs ${metric.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                {metric.trend}
              </Text>
            )}
          </div>
        </div>
      ))}
    </div>
  );

  // Add vertical selection handling
  const renderVerticals = () => {
    return (
      <div className="grid grid-cols-3 gap-4">
        {verticals.map((vertical) => (
          <Card
            key={vertical.id}
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => handleCardClick(vertical, 'vertical')}
          >
            <div className="flex items-center gap-3 mb-4">
              {vertical.icon}
              <Title>{vertical.name}</Title>
            </div>
            {renderMetrics(vertical.metrics)}
            <div className="flex justify-between items-center mt-4 pt-4 border-t">
              <Text className="text-sm text-gray-600">View Buyer Personas</Text>
              <ChevronRightIcon className="w-5 h-5 text-gray-400" />
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Update renderFunnelLevel to handle different levels
  const renderFunnelLevel = () => {
    const currentLevel = activePath[activePath.length - 1]?.level;

    if (!activeNode) {
      // Initial view - Regions
      return (
        <TransitionWrapper isVisible={true}>
          <div className="grid grid-cols-3 gap-6">
            {geographicRegions.children?.map((region) => (
              <Card
                key={region.id}
                className="cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 transform-gpu"
                onClick={() => handleCardClick(region, 'region')}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <GlobeAltIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <Title className="text-xl">{region.name}</Title>
                </div>
                {renderMetrics(region.metrics)}
                <div className="flex justify-between items-center mt-4 pt-3 border-t border-gray-100">
                  <Text className="text-sm text-gray-600">Click to explore verticals</Text>
                  <ChevronRightIcon className="w-5 h-5 text-gray-400" />
                </div>
              </Card>
            ))}
          </div>
        </TransitionWrapper>
      );
    }

    if (currentLevel === 'region') {
      return (
        <TransitionWrapper isVisible={true}>
          <div className="space-y-6">
            <Card className="bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <GlobeAltIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <Title className="text-xl">{activeNode.name}</Title>
                    <Text className="text-sm text-gray-500">Regional Overview</Text>
                  </div>
                </div>
                <button
                  onClick={() => handleBackClick('region')}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Back to Regions
                </button>
              </div>

              {/* Two-column layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Metrics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {renderMetrics(activeNode.metrics)}
                </div>

                {/* Top Competitors */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <Text className="font-medium mb-3">Top Competitors (ranked by % mentioned)</Text>
                  <div className="space-y-2">
                    {activeNode.details.topCompetitors
                      ?.slice(0, 3) // Ensure only top 3 are shown
                      .map((competitor, index) => (
                        <div key={competitor.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Text className="text-gray-500">#{index + 1}</Text>
                            <Text className="text-gray-600">{competitor.name}</Text>
                          </div>
                          <Text className="text-blue-600">{competitor.share}%</Text>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Industry Verticals section */}
            <div>
              <Title className="text-xl mb-4">Industry Verticals</Title>
              {renderVerticals()}
            </div>
          </div>
        </TransitionWrapper>
      );
    }

    if (currentLevel === 'vertical') {
      return (
        <TransitionWrapper isVisible={true}>
          <div className="space-y-6">
            <Card className="bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <BuildingOfficeIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <Title className="text-xl">Vertical Overview</Title>
                    <Text className="text-sm text-gray-500">{activeNode.name}</Text>
                  </div>
                </div>
                <button
                  onClick={() => handleBackClick('vertical')}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Back to Verticals
                </button>
              </div>

              {/* Side-by-side layout */}
              <div className="grid grid-cols-2 gap-6">
                {/* Metrics */}
                <div className="bg-gray-50 rounded-lg p-4">
                  {renderMetrics(activeNode.metrics)}
                </div>

                {/* Top Competitors */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <Text className="font-medium mb-3">Top Competitors (ranked by % mentioned)</Text>
                  <div className="space-y-2">
                    {activeNode.details.topCompetitors
                      ?.sort((a, b) => b.share - a.share)
                      .map((competitor, index) => (
                        <div key={competitor.name} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Text className="text-gray-500">#{index + 1}</Text>
                            <Text className="text-gray-600">{competitor.name}</Text>
                          </div>
                          <Text className="text-emerald-600">{competitor.share}%</Text>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* Buyer Personas section */}
            <div>
              <Title className="text-xl mb-4">Buyer Personas</Title>
              {renderPersonas()}
            </div>
          </div>
        </TransitionWrapper>
      );
    }

    if (currentLevel === 'persona') {
      // Add the platforms constant here
      const platforms = ['Perplexity', 'Claude', 'Gemini', 'SearchGPT', 'AIO'] as const;

      return (
        <TransitionWrapper isVisible={true}>
          <div className="space-y-6">
            <Card className="bg-white p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <UserIcon className="w-6 h-6 text-blue-500" />
                  </div>
                  <div>
                    <Title className="text-xl">Persona Queries</Title>
                    <Text className="text-sm text-gray-500">{activeNode.name}</Text>
                  </div>
                </div>
                <button
                  onClick={() => handleBackClick('persona')}
                  className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600"
                >
                  <ChevronLeftIcon className="w-4 h-4" />
                  Back to Personas
                </button>
              </div>

              {/* Add metrics section at the top */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                {activeNode.metrics.map((metric, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-3">
                    <Text className="text-sm text-gray-600">{metric.label}</Text>
                    <div className="flex items-center gap-2 mt-1">
                      <Text className="text-lg font-medium">
                        {metric.label === 'Average Position' ? `#${metric.value}` : `${metric.value}%`}
                      </Text>
                      <Text className={`text-sm ${metric.trend?.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                        {metric.trend}
                      </Text>
                    </div>
                  </div>
                ))}
              </div>

              {/* Query Analysis section */}
              <div>
                <Title className="text-lg mb-4">Query Performance Analysis</Title>
                <div className="flex justify-between items-center mb-4">
                  <div className="w-[60%]">
                    <Text className="text-sm text-gray-600">Query</Text>
                  </div>
                  <div className="flex w-[40%]">
                    {platforms.map(platform => (
                      <div key={platform} className="w-[20%] text-center">
                        <Text className="text-sm text-gray-600">{platform}</Text>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Condensed Query List */}
                <div className="space-y-1">
                  {queries
                    .filter(q => {
                      switch (activeNode.name) {
                        case 'DevOps Lead':
                          return q.category === 'Problem Recognition';
                        case 'Database Architect':
                          return q.category === 'Research';
                        case 'Tech Lead':
                          return q.category === 'Vendor Analysis';
                        default:
                          return true;
                      }
                    })
                    .map((query) => (
                      <div 
                        key={query.id} 
                        className="group rounded-lg transition-colors"
                      >
                        <div 
                          className="hover:bg-blue-50 p-2 cursor-pointer"
                          onClick={() => toggleQueryExpansion(query.id)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 w-[60%]">
                              <ChevronRightIcon 
                                className={`w-4 h-4 text-gray-400 transform transition-transform ${
                                  expandedQueries.has(query.id) ? 'rotate-90' : ''
                                }`} 
                              />
                              <div className="flex items-center gap-2">
                                <Text className="text-sm">{query.query}</Text>
                                <Badge 
                                  color={
                                    query.buyingJourney === "Problem Exploration" ? "blue" :
                                    query.buyingJourney === "Solution Education" ? "emerald" :
                                    query.buyingJourney === "Solution Comparison" ? "violet" :
                                    query.buyingJourney === "Solution Evaluation" ? "amber" :
                                    "rose"
                                  }
                                  size="sm"
                                >
                                  {query.buyingJourney}
                                </Badge>
                              </div>
                            </div>
                            
                            {/* Aligned scores */}
                            <div className="flex gap-4 w-[40%]">
                              {platforms.map(platform => {
                                const platformData = query.platforms.find(p => p.name === platform);
                                return (
                                  <div key={platform} className="w-[20%] text-center">
                                    <Text className={`text-sm ${
                                      !platformData?.position || platformData.position === '-' ? 'text-gray-400' :
                                      Number(platformData.position) <= 2 ? 'text-green-600 font-medium' :
                                      Number(platformData.position) <= 4 ? 'text-yellow-600' :
                                      'text-orange-600'
                                    }`}>
                                      {platformData?.position === '-' || !platformData?.position ? 'N/A' : `#${platformData?.position}`}
                                    </Text>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Expandable Content */}
                        {expandedQueries.has(query.id) && (
                          <div className="bg-gray-50 p-4 space-y-4">
                            {/* Ranking Context for each platform */}
                            <div className="grid grid-cols-5 gap-4">
                              {platforms.map(platform => {
                                const platformData = query.platforms.find(p => p.name === platform);
                                if (!platformData || platformData.position === '-') {
                                  return (
                                    <div key={platform} className="bg-white rounded-lg p-3">
                                      <Text className="text-sm font-medium mb-2">{platform}</Text>
                                      <Text className="text-sm text-gray-500">Not currently ranked in this platform</Text>
                                    </div>
                                  );
                                }

                                const rankings = getDetailedRankings(platformData.position);
                                return (
                                  <div key={platform} className="bg-white rounded-lg p-3">
                                    <div className="flex items-center justify-between mb-2">
                                      <Text className="text-sm font-medium">{platform}</Text>
                                      <div className="flex items-center gap-1">
                                        <Text className={`text-sm ${
                                          Number(platformData.position) <= 2 ? 'text-green-600 font-medium' :
                                          Number(platformData.position) <= 4 ? 'text-yellow-600' :
                                          'text-orange-600'
                                        }`}>
                                          #{platformData.position}
                                        </Text>
                                        {platformData.cited && (
                                          <div className="w-1.5 h-1.5 rounded-full bg-green-500" title="Cited"/>
                                        )}
                                      </div>
                                    </div>
                                    <Text className="text-xs text-gray-500 mb-2">Ranking Context:</Text>
                                    <div className="space-y-1">
                                      {rankings.map((rank, idx) => (
                                        <div 
                                          key={idx}
                                          className={`flex justify-between items-center text-sm ${
                                            rank.company === 'Ariga.io' ? 'bg-blue-50 rounded px-1' : ''
                                          }`}
                                        >
                                          <Text className="text-gray-500">#{rank.position}</Text>
                                          <Text className={rank.company === 'Ariga.io' ? 'text-blue-600' : 'text-gray-600'}>
                                            {rank.company}
                                          </Text>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>

                {/* Load More button */}
                <button className="w-full mt-4 py-2 text-sm text-gray-600 hover:text-blue-600 transition-colors">
                  Load More Queries
                </button>
              </div>
            </Card>
          </div>
        </TransitionWrapper>
      );
    }

    return null;
  };

  // First, let's create an interface for the persona structure
  interface Persona {
    id: string;
    title: string;
    icon?: JSX.Element;  // Add this
    metrics: FunnelMetric[];
    queries: QueryPerformance[];
    details: {
      influence: number;
    };
  }

  // Update the renderPersonas function
  const renderPersonas = () => {
    const personas: Persona[] = [
      {
        id: 'devops-lead',
        title: 'DevOps Lead',
        icon: <BuildingOfficeIcon className="w-6 h-6 text-blue-500" />,
        metrics: [
          { label: 'Average Sentiment' as const, value: 48, trend: '+18%' },
          { label: 'Average Position' as const, value: 2.2, trend: '+1.8' },
          { label: 'Company Mentioned' as const, value: 45, trend: '+12%' },
          { label: 'Recommendation Probability' as const, value: 52, trend: '+25%' }
        ] as FunnelMetric[],
        queries: queries.filter(q => q.category === "Problem Recognition").slice(0, 5),
        details: {
          influence: 85
        }
      },
      {
        id: 'db-architect',
        title: 'Database Architect',
        icon: <BuildingOfficeIcon className="w-6 h-6 text-emerald-500" />,
        metrics: [
          { label: 'Average Sentiment' as const, value: 45, trend: '+15%' },
          { label: 'Average Position' as const, value: 2.5, trend: '+1.5' },
          { label: 'Company Mentioned' as const, value: 42, trend: '+10%' },
          { label: 'Recommendation Probability' as const, value: 48, trend: '+20%' }
        ] as FunnelMetric[],
        queries: queries.filter(q => q.category === "Research").slice(0, 5),
        details: {
          influence: 75
        }
      },
      {
        id: 'tech-lead',
        title: 'Tech Lead',
        icon: <UserIcon className="w-6 h-6 text-violet-500" />,
        metrics: [
          { label: 'Average Sentiment' as const, value: 42, trend: '+12%' },
          { label: 'Average Position' as const, value: 2.8, trend: '+1.2' },
          { label: 'Company Mentioned' as const, value: 40, trend: '+8%' },
          { label: 'Recommendation Probability' as const, value: 45, trend: '+15%' }
        ] as FunnelMetric[],
        queries: queries.filter(q => q.category === "Research").slice(0, 5),
        details: {
          influence: 70
        }
      }
    ];

    return (
      <div className="grid grid-cols-3 gap-4">
        {personas.map((persona) => (
          <Card
            key={persona.id}
            className="cursor-pointer hover:shadow-lg transition-shadow bg-white p-6"
            onClick={() => handleCardClick(persona, 'persona')}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-blue-50 rounded-lg">
                {persona.icon}
              </div>
              <Title className="text-xl">{persona.title}</Title>
            </div>
            {renderMetrics(persona.metrics)}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex justify-end">
                <ChevronRightIcon className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };

  // Add the missing handleBackClick function
  const handleBackClick = (level: string) => {
    const newPath = activePath.slice(0, -1);
    handleNavigation(null, newPath);
  };

  // Add the missing handleBreadcrumbClick function
  const handleBreadcrumbClick = (index: number) => {
    const newPath = activePath.slice(0, index + 1);
    handleNavigation(null, newPath);
  };

  // Add this function inside BuyingJourneyFunnel before renderFunnelLevel
  const getDetailedRankings = (position: Position): DetailedRanking[] => {
    if (position === '-') return [];
    
    // Fixed company rankings to ensure consistency
    const rankingMap: { [key: number]: string[] } = {
      1: ['Ariga.io', 'Redgate', 'Hasura', 'PlanetScale', 'Atlas'],
      2: ['Redgate', 'Ariga.io', 'PlanetScale', 'Hasura', 'Atlas'],
      3: ['Hasura', 'PlanetScale', 'Ariga.io', 'Atlas', 'Redgate'],
      4: ['PlanetScale', 'Atlas', 'Hasura', 'Ariga.io', 'Redgate'],
      5: ['Atlas', 'Hasura', 'PlanetScale', 'Redgate', 'Ariga.io'],
      6: ['TypeORM', 'Alembic', 'Atlas', 'Hasura', 'Ariga.io']
    };

    const numPosition = Number(position);
    const rankings: DetailedRanking[] = [];
    
    // Get 5 positions centered around the current position
    for (let i = Math.max(1, numPosition - 2); i <= Math.min(6, numPosition + 2); i++) {
      const companies = rankingMap[i] || rankingMap[1]; // Fallback to first ranking if position not found
      rankings.push({
        position: i,
        company: companies[0] // Always use the first company in the list for that position
      });
    }

    return rankings;
  };

  // Update the expandable content section to use state for expansion
  const [expandedQueries, setExpandedQueries] = useState<Set<string>>(new Set());

  const toggleQueryExpansion = (queryId: string) => {
    setExpandedQueries(prev => {
      const newSet = new Set(prev);
      if (newSet.has(queryId)) {
        newSet.delete(queryId);
      } else {
        newSet.add(queryId);
      }
      return newSet;
    });
  };

  // Add these new components for the journey map
  const JourneyNode: React.FC<{
    title: string;
    subtitle?: string;
    metric?: { value: string | number };
    isActive: boolean;
    isPast: boolean;
    isFuture: boolean;
    previewCount?: number;
    onClick: () => void;
  }> = ({ title, subtitle, metric, isActive, isPast, isFuture, previewCount, onClick }) => (
    <button
      onClick={onClick}
      className={`
        relative group flex flex-col min-w-[200px] h-[120px] p-3 rounded-xl border-2 transition-all
        justify-between
        ${isActive ? 
          'bg-gradient-to-br from-blue-50 to-blue-50/50 border-blue-200 shadow-lg ring-2 ring-blue-100 ring-opacity-50' : 
          isPast ? 
            'bg-gradient-to-br from-gray-50 to-white border-gray-200 hover:border-blue-200 hover:from-blue-50/50 hover:to-white' : 
          isFuture ? 
            'bg-gradient-to-br from-gray-50/50 to-white border-gray-100 hover:border-blue-100 hover:from-blue-50/30 hover:to-white' :
            'bg-white border-gray-200 opacity-50 cursor-not-allowed'
        }
        transform transition-transform duration-150
        ${isActive ? 'scale-102' : 'hover:scale-101'}
      `}
    >
      {/* Top label */}
      <div className={`
        inline-flex px-2 py-0.5 rounded-full text-xs self-start
        ${isActive ? 'bg-blue-100/50 text-blue-700' :
          isPast ? 'bg-gray-100/50 text-gray-600' :
          'bg-gray-50/50 text-gray-400'}
      `}>
        {title}
      </div>

      {/* Center content */}
      <div className="flex-1 flex flex-col justify-center">
        <Text className={`font-semibold text-base ${
          isActive ? 'text-blue-700' : 
          isPast ? 'text-gray-700' :
          isFuture ? 'text-gray-400' :
          'text-gray-300'
        }`}>
          {subtitle || (previewCount ? `${previewCount} options` : 'Select')}
        </Text>
      </div>

      {/* Bottom metric */}
      {metric && (
        <div className="flex items-center gap-2">
          <svg 
            className={`w-4 h-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`}
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" 
            />
          </svg>
          <Text className={`text-sm ${
            isActive ? 'text-blue-600' : 'text-gray-500'
          }`}>
            {metric.value}% mentioned
          </Text>
        </div>
      )}

      {/* Animated connecting line */}
      {(isActive || isPast) && (
        <div className="absolute -right-6 top-1/2 -translate-y-1/2 w-12">
          <div className="relative h-[2px] bg-gradient-to-r from-blue-200 via-blue-100 to-transparent">
            <div className="absolute inset-0 overflow-hidden">
              <div className="h-full animate-current-1 absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
              <div className="h-full animate-current-2 absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
              <div className="h-full animate-current-3 absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/50 to-transparent" />
            </div>
          </div>
        </div>
      )}
    </button>
  );

  // Update the JourneyMap component to show consistent headlines and query level
  const JourneyMap = ({ 
    path, 
    onNodeClick 
  }: { 
    path: BreadcrumbItem[];
    onNodeClick: (index: number) => void;
  }) => {
    // Update getNodeData to include queries
    const getNodeData = (level: 'region' | 'vertical' | 'persona' | 'queries' | 'queryDetails') => {
      switch (level) {
        case 'region':
          return {
            title: 'Geographic Regions',
            metric: { value: 42 },
            previewCount: 4,
            options: ['Americas', 'EMEA', 'APAC', 'LATAM']
          };
        case 'vertical':
          return {
            title: 'Industry Verticals',
            metric: { value: 38 },
            previewCount: 3,
            options: ['Enterprise Software', 'Financial Services', 'Healthcare Tech']
          };
        case 'persona':
          return {
            title: 'Buyer Personas',
            metric: { value: 35 },
            previewCount: 3,
            options: ['DevOps Lead', 'Database Architect', 'Tech Lead']
          };
        case 'queries':
          return {
            title: 'Search Queries',
            metric: { value: 32 },
            previewCount: 124,
            options: ['Schema migration tools', 'Database version control', 'CI/CD integration']
          };
        case 'queryDetails':
          return {
            title: 'Query Details',
            metric: { value: 28 },
            options: ['Full Analysis']
          };
      }
    };

    const getCurrentLevelTitle = (level: 'region' | 'vertical' | 'persona' | 'queries' | 'queryDetails') => {
      const currentItem = path.find(item => item.level === level);
      if (currentItem) return currentItem.name;
      
      const data = getNodeData(level);
      return data.options[0];
    };

    return (
      <div className="bg-gradient-to-br from-gray-50 via-white to-blue-50/20 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-sm">
        <div className="flex items-start gap-6 overflow-x-auto pb-2">
          {/* Geographic Regions */}
          <JourneyNode
            title={getNodeData('region').title}
            subtitle={path.length > 0 ? getCurrentLevelTitle('region') : undefined}
            metric={getNodeData('region').metric}
            isActive={path.length === 0}
            isPast={path.length > 0}
            isFuture={false}
            previewCount={path.length === 0 ? getNodeData('region').previewCount : undefined}
            onClick={() => onNodeClick(-1)}
          />
          
          {/* Industry Verticals */}
          <JourneyNode
            title={getNodeData('vertical').title}
            subtitle={path.length > 1 ? getCurrentLevelTitle('vertical') : undefined}
            metric={path.length > 0 ? { value: 38 } : undefined}
            isActive={path.length === 1}
            isPast={path.length > 1}
            isFuture={path.length === 0}
            previewCount={path.length <= 1 ? getNodeData('vertical').previewCount : undefined}
            onClick={() => path.length >= 1 ? onNodeClick(0) : null}
          />

          {/* Buyer Personas */}
          <JourneyNode
            title={getNodeData('persona').title}
            subtitle={path.length > 2 ? getCurrentLevelTitle('persona') : undefined}
            metric={path.length > 1 ? { value: 35 } : undefined}
            isActive={path.length === 2}
            isPast={path.length > 2}
            isFuture={path.length <= 1}
            previewCount={path.length <= 2 ? getNodeData('persona').previewCount : undefined}
            onClick={() => path.length >= 2 ? onNodeClick(1) : null}
          />

          {/* Search Queries */}
          <JourneyNode
            title={getNodeData('queries').title}
            subtitle={path.length > 3 ? getCurrentLevelTitle('queries') : undefined}
            metric={path.length > 2 ? { value: 32 } : undefined}
            isActive={path.length === 3}
            isPast={path.length > 3}
            isFuture={path.length <= 2}
            previewCount={path.length === 3 ? getNodeData('queries').previewCount : undefined}
            onClick={() => path.length >= 3 ? onNodeClick(2) : null}
          />

          {/* Query Details - Final Node */}
          <div className="relative flex items-center">
            <JourneyNode
              title={getNodeData('queryDetails').title}
              subtitle={path.length > 4 ? 'Full Analysis' : undefined}
              metric={path.length > 3 ? { value: 28 } : undefined}
              isActive={path.length === 4}
              isPast={false}
              isFuture={path.length <= 3}
              onClick={() => path.length >= 4 ? onNodeClick(3) : null}
            />
          </div>
        </div>
      </div>
    );
  };

  // Main return of BuyingJourneyFunnel
  return (
    <div className="space-y-6">
      <Card className="bg-white p-6">
        <div className="mb-6">
          <Title className="text-2xl mb-2">Buying Journey Analysis</Title>
          <Text className="text-gray-500">
            Explore performance metrics across regions, industries, and buyer personas
          </Text>
        </div>

        {/* Add Journey Map */}
        <JourneyMap 
          path={activePath} 
          onNodeClick={(index) => {
            if (index === -1) {
              handleNavigation(null, []);
            } else {
              handleBreadcrumbClick(index);
            }
          }} 
        />

        <TransitionWrapper isVisible={!isTransitioning}>
          {renderFunnelLevel()}
        </TransitionWrapper>
      </Card>
    </div>
  );
} 
