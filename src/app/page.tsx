/* eslint-disable @typescript-eslint/no-unused-vars */
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
// Update your VisibilityDashboard component to include the new funnel
export default function VisibilityDashboard() {
  // Monthly visibility scores
  const monthlyScores = [
    { 
      month: 'May 2024',
      percentageRanked: 25,
      avgRankingPosition: 4.2,
      citationAppearance: 15,
      avgCitationPosition: 8.5,
    },
    { 
      month: 'Jun 2024',
      percentageRanked: 28,
      avgRankingPosition: 3.8,
      citationAppearance: 18,
      avgCitationPosition: 7.8,
    },
    { 
      month: 'Jul 2024',
      percentageRanked: 32,
      avgRankingPosition: 3.5,
      citationAppearance: 22,
      avgCitationPosition: 6.5,
    },
    { 
      month: 'Aug 2024',
      percentageRanked: 35,
      avgRankingPosition: 3.2,
      citationAppearance: 28,
      avgCitationPosition: 5.2,
    },
    { 
      month: 'Sep 2024',
      percentageRanked: 42,
      avgRankingPosition: 2.8,
      citationAppearance: 35,
      avgCitationPosition: 4.5,
    },
    { 
      month: 'Oct 2024',
      percentageRanked: 45,
      avgRankingPosition: 2.5,
      citationAppearance: 38,
      avgCitationPosition: 3.8,
    },
  ];

  // Sample queries where Ariga.io appears
  const sampleQueries = [
    {
      category: "Problem Recognition",
      query: "What challenges do teams face with manual database schema changes?",
      platforms: [
        { name: "Perplexity", position: 2 as Position, cited: true },
        { name: "Claude", position: 4 as Position, cited: true },
        { name: "Gemini", position: '-' as Position, cited: false }
      ],
      impact: "High",
      userIntent: "Research",
      buyingJourney: "Problem Exploration"
    },
    {
      category: "Research",
      query: "What tools are available for database schema management?",
      platforms: [
        { name: "Gemini", position: 1, cited: true },
        { name: "SearchGPT", position: 3, cited: true },
        { name: "Claude", position: 5, cited: false }
      ],
      impact: "High",
      userIntent: "Evaluation",
      buyingJourney: "Solution Education"
    },
    {
      category: "Vendor Analysis",
      query: "How does Ariga's solution compare to other vendors?",
      platforms: [
        { name: "Claude", position: 2, cited: true },
        { name: "Perplexity", position: '-', cited: false },
        { name: "Gemini", position: 4, cited: true }
      ],
      impact: "High",
      userIntent: "Comparison",
      buyingJourney: "Solution Comparison"
    },
    {
      category: "Deep Evaluation",
      query: "How does Ariga's tool handle complex schema migrations?",
      platforms: [
        { name: "Gemini", position: 3, cited: true },
        { name: "MetaAI", position: '-', cited: false },
        { name: "Perplexity", position: 6, cited: true }
      ],
      impact: "Medium",
      userIntent: "Technical",
      buyingJourney: "Solution Evaluation"
    },
    {
      category: "Decision Support",
      query: "What is the projected ROI and payback period for adopting Ariga's platform?",
      platforms: [
        { name: "Perplexity", position: 1, cited: true },
        { name: "Claude", position: 3, cited: true },
        { name: "SearchGPT", position: '-', cited: false }
      ],
      impact: "High",
      userIntent: "Business",
      buyingJourney: "Final Research"
    }
  ];

  // Citation leaderboard
  const competitorData: CompetitorData[] = [
    {
      company: 'Redgate',
      visibilityProbability: 38,
      recommendationProbability: 42,
      avgRanking: 2.3,
      citationAppearances: 25,
      overallScore: 88,
      trend: 'up',  // Changed from '+15%' to 'up'
      demographics: {
        topICPs: [
          { name: 'Enterprise DevOps', score: 85 },
          { name: 'Financial Services', score: 78 },
          { name: 'Healthcare', score: 72 }
        ],
        topVerticals: [
          { name: 'Banking', score: 82 },
          { name: 'Insurance', score: 76 },
          { name: 'Healthcare', score: 70 }
        ],
        topRegions: [
          { name: 'North America', score: 88 },
          { name: 'Europe', score: 82 },
          { name: 'Asia Pacific', score: 65 }
        ]
      },
      topSources: [
        { 
          name: 'DB Server Central',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 90,
          sourceType: 'Documentation',
          relevance: 90
        },
        { 
          name: 'DBA StackExchange',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 86,
          sourceType: 'Forum',
          relevance: 86
        },
        { 
          name: "Comparing Top Database Schema Management Tools",
          url: "https://dzone.com/articles/database-schema-tools-comparison",
          platforms: ["Claude", "Gemini"],
          citationRate: 3.5,
          sourceType: 'Documentation',
          relevance: 88
        },
        { 
          name: "Best Practices for Database Change Management",
          url: "https://devops.com/database-change-management-guide",
          platforms: ["Perplexity"],
          citationRate: 2.9,
          sourceType: 'Blog',
          relevance: 84
        },
        { 
          name: "Enterprise Database Deployment Automation Solutions",
          url: "https://www.dbta.com/enterprise-database-automation",
          platforms: ["Claude"],
          citationRate: 2.4,
          sourceType: 'News',
          relevance: 80
        }
      ]
    },
    {
      company: 'Hasura',
      visibilityProbability: 35,
      recommendationProbability: 40,
      avgRanking: 2.4,
      citationAppearances: 22,
      overallScore: 85,
      trend: 'up',  // Changed from '+28%' to 'up'
      demographics: {
        topICPs: [
          { name: 'Enterprise DevOps', score: 82 },
          { name: 'Financial Services', score: 76 },
          { name: 'Healthcare', score: 70 }
        ],
        topVerticals: [
          { name: 'Banking', score: 80 },
          { name: 'Insurance', score: 74 },
          { name: 'Healthcare', score: 68 }
        ],
        topRegions: [
          { name: 'North America', score: 85 },
          { name: 'Europe', score: 80 },
          { name: 'Asia Pacific', score: 62 }
        ]
      },
      topSources: [
        { 
          name: 'DB Server Central',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 90,
          sourceType: 'Documentation',
          relevance: 90
        },
        { 
          name: 'DBA StackExchange',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 86,
          sourceType: 'Forum',
          relevance: 86
        },
        { 
          name: "Comparing Top Database Schema Management Tools",
          url: "https://dzone.com/articles/database-schema-tools-comparison",
          platforms: ["Claude", "Gemini"],
          citationRate: 3.5,
          sourceType: 'Documentation',
          relevance: 88
        },
        { 
          name: "Best Practices for Database Change Management",
          url: "https://devops.com/database-change-management-guide",
          platforms: ["Perplexity"],
          citationRate: 2.9,
          sourceType: 'Blog',
          relevance: 84
        },
        { 
          name: "Enterprise Database Deployment Automation Solutions",
          url: "https://www.dbta.com/enterprise-database-automation",
          platforms: ["Claude"],
          citationRate: 2.4,
          sourceType: 'News',
          relevance: 80
        }
      ]
    },
    {
      company: 'PlanetScale',
      visibilityProbability: 34,
      recommendationProbability: 38,
      avgRanking: 2.6,
      citationAppearances: 20,
      overallScore: 83,
      trend: 'up',  // Changed from '+22%' to 'up'
      demographics: {
        topICPs: [
          { name: 'Enterprise DevOps', score: 80 },
          { name: 'Financial Services', score: 74 },
          { name: 'Healthcare', score: 68 }
        ],
        topVerticals: [
          { name: 'Banking', score: 78 },
          { name: 'Insurance', score: 72 },
          { name: 'Healthcare', score: 66 }
        ],
        topRegions: [
          { name: 'North America', score: 83 },
          { name: 'Europe', score: 78 },
          { name: 'Asia Pacific', score: 60 }
        ]
      },
      topSources: [
        { 
          name: 'DB Server Central',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 90,
          sourceType: 'Documentation',
          relevance: 88
        },
        { 
          name: 'DBA StackExchange',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 84,
          sourceType: 'Forum',
          relevance: 81
        },
        { 
          name: "Comparing Top Database Schema Management Tools",
          url: "https://dzone.com/articles/database-schema-tools-comparison",
          platforms: ["Claude", "Gemini"],
          citationRate: 3.5,
          sourceType: 'Documentation',
          relevance: 88
        },
        { 
          name: "Best Practices for Database Change Management",
          url: "https://devops.com/database-change-management-guide",
          platforms: ["Perplexity"],
          citationRate: 2.9,
          sourceType: 'Blog',
          relevance: 84
        },
        { 
          name: "Enterprise Database Deployment Automation Solutions",
          url: "https://www.dbta.com/enterprise-database-automation",
          platforms: ["Claude"],
          citationRate: 2.4,
          sourceType: 'News',
          relevance: 80
        }
      ]
    },
    {
      company: 'Ariga.io',
      visibilityProbability: 32,
      recommendationProbability: 35,
      avgRanking: 2.8,
      citationAppearances: 18,
      overallScore: 80,
      trend: 'down',  // Changed from '-8%' to 'down'
      demographics: {
        topICPs: [
          { name: 'Enterprise DevOps', score: 78 },
          { name: 'Financial Services', score: 72 },
          { name: 'Healthcare', score: 66 }
        ],
        topVerticals: [
          { name: 'Banking', score: 76 },
          { name: 'Insurance', score: 70 },
          { name: 'Healthcare', score: 64 }
        ],
        topRegions: [
          { name: 'North America', score: 80 },
          { name: 'Europe', score: 76 },
          { name: 'Asia Pacific', score: 62 }
        ]
      },
      topSources: [
        { 
          name: 'DB Server Central',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 90,
          sourceType: 'Documentation',
          relevance: 86
        },
        { 
          name: 'DBA StackExchange',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 82,
          sourceType: 'Forum',
          relevance: 79
        },
        { 
          name: "Comparing Top Database Schema Management Tools",
          url: "https://dzone.com/articles/database-schema-tools-comparison",
          platforms: ["Claude", "Gemini"],
          citationRate: 3.5,
          sourceType: 'Documentation',
          relevance: 88
        },
        { 
          name: "Best Practices for Database Change Management",
          url: "https://devops.com/database-change-management-guide",
          platforms: ["Perplexity"],
          citationRate: 2.9,
          sourceType: 'Blog',
          relevance: 84
        },
        { 
          name: "Enterprise Database Deployment Automation Solutions",
          url: "https://www.dbta.com/enterprise-database-automation",
          platforms: ["Claude"],
          citationRate: 2.4,
          sourceType: 'News',
          relevance: 80
        }
      ]
    },
    {
      company: 'Atlas',
      visibilityProbability: 30,
      recommendationProbability: 32,
      avgRanking: 3.0,
      citationAppearances: 15,
      overallScore: 78,
      trend: 'up',  // Changed from '+18%' to 'up'
      demographics: {
        topICPs: [
          { name: 'Enterprise DevOps', score: 76 },
          { name: 'Financial Services', score: 70 },
          { name: 'Healthcare', score: 64 }
        ],
        topVerticals: [
          { name: 'Banking', score: 74 },
          { name: 'Insurance', score: 68 },
          { name: 'Healthcare', score: 62 }
        ],
        topRegions: [
          { name: 'North America', score: 78 },
          { name: 'Europe', score: 74 },
          { name: 'Asia Pacific', score: 58 }
        ]
      },
      topSources: [
        { 
          name: 'DB Server Central',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 84,
          sourceType: 'Documentation',
          relevance: 84
        },
        { 
          name: 'DBA StackExchange',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 80,
          sourceType: 'Forum',
          relevance: 77
        },
        { 
          name: "Comparing Top Database Schema Management Tools",
          url: "https://dzone.com/articles/database-schema-tools-comparison",
          platforms: ["Claude", "Gemini"],
          citationRate: 3.5,
          sourceType: 'Documentation',
          relevance: 88
        },
        { 
          name: "Best Practices for Database Change Management",
          url: "https://devops.com/database-change-management-guide",
          platforms: ["Perplexity"],
          citationRate: 2.9,
          sourceType: 'Blog',
          relevance: 84
        },
        { 
          name: "Enterprise Database Deployment Automation Solutions",
          url: "https://www.dbta.com/enterprise-database-automation",
          platforms: ["Claude"],
          citationRate: 2.4,
          sourceType: 'News',
          relevance: 80
        }
      ]
    },
    {
      company: 'Alembic',
      visibilityProbability: 28,
      recommendationProbability: 30,
      avgRanking: 3.2,
      citationAppearances: 12,
      overallScore: 75,
      trend: 'down',  // Changed from '-5%' to 'down'
      demographics: {
        topICPs: [
          { name: 'Enterprise DevOps', score: 72 },
          { name: 'Financial Services', score: 66 },
          { name: 'Healthcare', score: 60 }
        ],
        topVerticals: [
          { name: 'Banking', score: 70 },
          { name: 'Insurance', score: 64 },
          { name: 'Healthcare', score: 58 }
        ],
        topRegions: [
          { name: 'North America', score: 75 },
          { name: 'Europe', score: 70 },
          { name: 'Asia Pacific', score: 56 }
        ]
      },
      topSources: [
        { 
          name: 'DB Server Central',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 82,
          sourceType: 'Documentation',
          relevance: 82
        },
        { 
          name: 'DBA StackExchange',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 78,
          sourceType: 'Forum',
          relevance: 75
        },
        { 
          name: "Comparing Top Database Schema Management Tools",
          url: "https://dzone.com/articles/database-schema-tools-comparison",
          platforms: ["Claude", "Gemini"],
          citationRate: 3.5,
          sourceType: 'Documentation',
          relevance: 88
        },
        { 
          name: "Best Practices for Database Change Management",
          url: "https://devops.com/database-change-management-guide",
          platforms: ["Perplexity"],
          citationRate: 2.9,
          sourceType: 'Blog',
          relevance: 84
        },
        { 
          name: "Enterprise Database Deployment Automation Solutions",
          url: "https://www.dbta.com/enterprise-database-automation",
          platforms: ["Claude"],
          citationRate: 2.4,
          sourceType: 'News',
          relevance: 80
        }
      ]
    },
    {
      company: 'TypeORM',
      visibilityProbability: 25,
      recommendationProbability: 28,
      avgRanking: 3.4,
      citationAppearances: 10,
      overallScore: 72,
      trend: 'up',  // Changed from '+10%' to 'up'
      demographics: {
        topICPs: [
          { name: 'Enterprise DevOps', score: 68 },
          { name: 'Financial Services', score: 62 },
          { name: 'Healthcare', score: 56 }
        ],
        topVerticals: [
          { name: 'Banking', score: 66 },
          { name: 'Insurance', score: 60 },
          { name: 'Healthcare', score: 54 }
        ],
        topRegions: [
          { name: 'North America', score: 72 },
          { name: 'Europe', score: 68 },
          { name: 'Asia Pacific', score: 52 }
        ]
      },
      topSources: [
        { 
          name: 'DB Server Central',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 78,
          sourceType: 'Documentation',
          relevance: 78
        },
        { 
          name: 'DBA StackExchange',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 74,
          sourceType: 'Forum',
          relevance: 71
        },
        { 
          name: "Comparing Top Database Schema Management Tools",
          url: "https://dzone.com/articles/database-schema-tools-comparison",
          platforms: ["Claude", "Gemini"],
          citationRate: 3.5,
          sourceType: 'Documentation',
          relevance: 88
        },
        { 
          name: "Best Practices for Database Change Management",
          url: "https://devops.com/database-change-management-guide",
          platforms: ["Perplexity"],
          citationRate: 2.9,
          sourceType: 'Blog',
          relevance: 84
        },
        { 
          name: "Enterprise Database Deployment Automation Solutions",
          url: "https://www.dbta.com/enterprise-database-automation",
          platforms: ["Claude"],
          citationRate: 2.4,
          sourceType: 'News',
          relevance: 80
        }
      ]
    },
    {
      company: 'DBmaestro',
      visibilityProbability: 22,
      recommendationProbability: 25,
      avgRanking: 3.6,
      citationAppearances: 8,
      overallScore: 70,
      trend: 'down',  // Changed from '-3%' to 'down'
      demographics: {
        topICPs: [
          { name: 'Enterprise DevOps', score: 64 },
          { name: 'Financial Services', score: 58 },
          { name: 'Healthcare', score: 52 }
        ],
        topVerticals: [
          { name: 'Banking', score: 62 },
          { name: 'Insurance', score: 56 },
          { name: 'Healthcare', score: 50 }
        ],
        topRegions: [
          { name: 'North America', score: 70 },
          { name: 'Europe', score: 66 },
          { name: 'Asia Pacific', score: 48 }
        ]
      },
      topSources: [
        { 
          name: 'DB Server Central',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 74,
          sourceType: 'Documentation',
          relevance: 74
        },
        { 
          name: 'DBA StackExchange',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 70,
          sourceType: 'Forum',
          relevance: 67
        },
        { 
          name: "Comparing Top Database Schema Management Tools",
          url: "https://dzone.com/articles/database-schema-tools-comparison",
          platforms: ["Claude", "Gemini"],
          citationRate: 3.5,
          sourceType: 'Documentation',
          relevance: 88
        },
        { 
          name: "Best Practices for Database Change Management",
          url: "https://devops.com/database-change-management-guide",
          platforms: ["Perplexity"],
          citationRate: 2.9,
          sourceType: 'Blog',
          relevance: 84
        },
        { 
          name: "Enterprise Database Deployment Automation Solutions",
          url: "https://www.dbta.com/enterprise-database-automation",
          platforms: ["Claude"],
          citationRate: 2.4,
          sourceType: 'News',
          relevance: 80
        }
      ]
    },
    {
      company: 'SchemaHero',
      visibilityProbability: 20,
      recommendationProbability: 22,
      avgRanking: 3.8,
      citationAppearances: 6,
      overallScore: 68,
      trend: 'up',  // Changed from '+25%' to 'up'
      demographics: {
        topICPs: [
          { name: 'Enterprise DevOps', score: 60 },
          { name: 'Financial Services', score: 54 },
          { name: 'Healthcare', score: 48 }
        ],
        topVerticals: [
          { name: 'Banking', score: 58 },
          { name: 'Insurance', score: 52 },
          { name: 'Healthcare', score: 46 }
        ],
        topRegions: [
          { name: 'North America', score: 68 },
          { name: 'Europe', score: 64 },
          { name: 'Asia Pacific', score: 44 }
        ]
      },
      topSources: [
        { 
          name: 'DB Server Central',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 70,
          sourceType: 'Documentation',
          relevance: 70
        },
        { 
          name: 'DBA StackExchange',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 66,
          sourceType: 'Forum',
          relevance: 63
        },
        { 
          name: "Comparing Top Database Schema Management Tools",
          url: "https://dzone.com/articles/database-schema-tools-comparison",
          platforms: ["Claude", "Gemini"],
          citationRate: 3.5,
          sourceType: 'Documentation',
          relevance: 88
        },
        { 
          name: "Best Practices for Database Change Management",
          url: "https://devops.com/database-change-management-guide",
          platforms: ["Perplexity"],
          citationRate: 2.9,
          sourceType: 'Blog',
          relevance: 84
        },
        { 
          name: "Enterprise Database Deployment Automation Solutions",
          url: "https://www.dbta.com/enterprise-database-automation",
          platforms: ["Claude"],
          citationRate: 2.4,
          sourceType: 'News',
          relevance: 80
        }
      ]
    },
    {
      company: 'Sequelize',
      visibilityProbability: 18,
      recommendationProbability: 20,
      avgRanking: 4.0,
      citationAppearances: 5,
      overallScore: 65,
      trend: 'up',  // Changed from '+8%' to 'up'
      demographics: {
        topICPs: [
          { name: 'Enterprise DevOps', score: 56 },
          { name: 'Financial Services', score: 50 },
          { name: 'Healthcare', score: 44 }
        ],
        topVerticals: [
          { name: 'Banking', score: 54 },
          { name: 'Insurance', score: 48 },
          { name: 'Healthcare', score: 42 }
        ],
        topRegions: [
          { name: 'North America', score: 65 },
          { name: 'Europe', score: 62 },
          { name: 'Asia Pacific', score: 40 }
        ]
      },
      topSources: [
        { 
          name: 'DB Server Central',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 66,
          sourceType: 'Documentation',
          relevance: 66
        },
        { 
          name: 'DBA StackExchange',
          url: 'https://example.com',
          platforms: ["Claude"],
          citationRate: 62,
          sourceType: 'Forum',
          relevance: 59
        },
        { 
          name: "Comparing Top Database Schema Management Tools",
          url: "https://dzone.com/articles/database-schema-tools-comparison",
          platforms: ["Claude", "Gemini"],
          citationRate: 3.5,
          sourceType: 'Documentation',
          relevance: 88
        },
        { 
          name: "Best Practices for Database Change Management",
          url: "https://devops.com/database-change-management-guide",
          platforms: ["Perplexity"],
          citationRate: 2.9,
          sourceType: 'Blog',
          relevance: 84
        },
        { 
          name: "Enterprise Database Deployment Automation Solutions",
          url: "https://www.dbta.com/enterprise-database-automation",
          platforms: ["Claude"],
          citationRate: 2.4,
          sourceType: 'News',
          relevance: 80
        }
      ]
    }
  ];

  // Enhanced AI Engine Rankings
  const aiEngineRankings: AIEngine[] = [
    { 
      engine: 'Perplexity',
      visibility: 45,
      percentageRanked: 45,
      recommendationProbability: 42,
      avgRankingPosition: 2.5,
      citationAppearance: 38,
      avgCitationPosition: 3.8,
      color: 'indigo'
    },
    { 
      engine: 'SearchGPT',
      visibility: 32,
      percentageRanked: 35,
      recommendationProbability: 38,
      avgRankingPosition: 3.2,
      citationAppearance: 28,
      avgCitationPosition: 5.2,
      color: 'emerald'
    },
    { 
      engine: 'Gemini',
      visibility: 38,
      percentageRanked: 42,
      recommendationProbability: 40,
      avgRankingPosition: 2.8,
      citationAppearance: 35,
      avgCitationPosition: 4.5,
      color: 'violet'
    },
    { 
      engine: 'Claude',
      visibility: 36,
      percentageRanked: 38,
      recommendationProbability: 35,
      avgRankingPosition: 3.0,
      citationAppearance: 32,
      avgCitationPosition: 4.8,
      color: 'amber'
    },
    { 
      engine: 'AIO',
      visibility: 24,
      percentageRanked: 25,
      recommendationProbability: 28,
      avgRankingPosition: 4.2,
      citationAppearance: 15,
      avgCitationPosition: 8.5,
      color: 'rose'
    },
  ];

  const regionalData: RegionalData[] = [
    {
      region: 'North America',
      score: 62,
      color: 'blue',
      topQueries: ['schema migration tools', 'database version control', 'CI/CD database integration'],
      growth: '+18%',
      marketPenetration: '34%'
    },
    {
      region: 'Europe',
      score: 45,
      color: 'emerald',
      topQueries: ['GDPR compliant schema management', 'enterprise database tools', 'multi-region database control'],
      growth: '+22%',
      marketPenetration: '28%'
    },
    {
      region: 'Asia Pacific',
      score: 28,
      color: 'amber',
      topQueries: ['cloud database management', 'schema automation tools', 'database DevOps'],
      growth: '+45%',
      marketPenetration: '15%'
    },
    {
      region: 'Latin America',
      score: 18,
      color: 'rose',
      topQueries: ['database migration solutions', 'schema version control', 'automated database updates'],
      growth: '+38%',
      marketPenetration: '12%'
    },
  ];

  const icpData: ICPData[] = [
    {
      profile: 'Enterprise DevOps Teams',
      visibilityProbability: 38,
      recommendationProbability: 42,
      avgRanking: 2.4,
      citationAppearances: 25,
      overallScore: 85,
      color: 'blue'
    },
    {
      profile: 'Cloud-Native Startups',
      visibilityProbability: 42,
      recommendationProbability: 48,
      avgRanking: 1.8,
      citationAppearances: 32,
      overallScore: 90,
      color: 'emerald'
    },
    {
      profile: 'Financial Services',
      visibilityProbability: 35,
      recommendationProbability: 40,
      avgRanking: 3.2,
      citationAppearances: 18,
      overallScore: 68,
      color: 'violet'
    },
    {
      profile: 'SaaS Providers',
      visibilityProbability: 45,
      recommendationProbability: 35,
      avgRanking: 2.6,
      citationAppearances: 28,
      overallScore: 78,
      color: 'amber'
    },
    {
      profile: 'Mid-Market Companies',
      visibilityProbability: 32,
      recommendationProbability: 38,
      avgRanking: 2.8,
      citationAppearances: 22,
      overallScore: 72,
      color: 'rose'
    },
    {
      profile: 'E-commerce Platforms',
      visibilityProbability: 40,
      recommendationProbability: 45,
      avgRanking: 2.2,
      citationAppearances: 30,
      overallScore: 82,
      color: 'indigo'
    },
    {
      profile: 'Healthcare Tech',
      visibilityProbability: 28,
      recommendationProbability: 32,
      avgRanking: 3.4,
      citationAppearances: 20,
      overallScore: 65,
      color: 'cyan'
    },
    {
      profile: 'Government & Public Sector',
      visibilityProbability: 25,
      recommendationProbability: 30,
      avgRanking: 3.8,
      citationAppearances: 15,
      overallScore: 60,
      color: 'slate'
    },
    {
      profile: 'Educational Institutions',
      visibilityProbability: 35,
      recommendationProbability: 40,
      avgRanking: 2.9,
      citationAppearances: 25,
      overallScore: 75,
      color: 'purple'
    }
  ];

  const visibilityMapData: MapData[] = [
    { country: "us", value: 62 },
    { country: "ca", value: 58 },
    { country: "mx", value: 15 },

    { country: "gb", value: 45 },
    { country: "de", value: 42 },
    { country: "fr", value: 40 },
    { country: "nl", value: 38 },
    { country: "se", value: 35 },
    { country: "es", value: 32 },
    { country: "it", value: 30 },
    { country: "ch", value: 36 },
    { country: "no", value: 33 },

    { country: "jp", value: 28 },
    { country: "au", value: 25 },
    { country: "sg", value: 22 },
    { country: "kr", value: 20 },
    { country: "in", value: 18 },
    { country: "cn", value: 15 },
    { country: "nz", value: 24 },

    { country: "br", value: 18 },
    { country: "mx", value: 15 },
    { country: "ar", value: 12 },
    { country: "cl", value: 14 },
    { country: "co", value: 10 },

    { country: "il", value: 30 },
    { country: "ae", value: 25 },
    { country: "sa", value: 20 },

    { country: "za", value: 15 },
    { country: "ng", value: 8 },
    { country: "eg", value: 12 }
  ];

  const platforms = ['Perplexity', 'Claude', 'Gemini', 'SearchGPT', 'AIO'] as const;

  // Update the queries initialization
  const [queries, setQueries] = useState<QueryPerformance[]>(() => 
    Array.from({ length: 500 }, (_, i) => ({
      id: `query-${i}`,
      query: sampleQueries[i % sampleQueries.length].query,
      category: sampleQueries[i % sampleQueries.length].category,
      impact: sampleQueries[i % sampleQueries.length].impact as "High" | "Medium" | "Low",
      userIntent: sampleQueries[i % sampleQueries.length].userIntent,
      buyingJourney: sampleQueries[i % sampleQueries.length].buyingJourney as BuyingJourneyStage,
      platforms: sampleQueries[i % sampleQueries.length].platforms.map(p => ({
        name: p.name,
        position: p.position as Position,
        cited: p.cited
      })),
      averagePosition: Number((Math.random() * 10 + 1).toFixed(1))
    }))
  );

  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const parentRef = useRef<HTMLDivElement>(null);

  const rowVirtualizer = useVirtualizer({
    count: queries.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 60,
    overscan: 10,
  });

  const getPositionBadgeColor = (position: Position): string => {
    if (position === '-') return "red";
    if (position <= 2) return "green";
    if (position <= 4) return "yellow";
    return "orange";
  };

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

  const getCompetitorsForICP = (profile: string): { name: string; trend: 'up' | 'down' | 'same' }[] => {
    const competitorsByProfile: { [key: string]: { name: string; trend: 'up' | 'down' | 'same' }[] } = {
      'Enterprise DevOps Teams': [
        { name: 'Redgate', trend: 'same' },
        { name: 'Ariga.io', trend: 'up' },
        { name: 'PlanetScale', trend: 'down' },
        { name: 'Hasura', trend: 'up' },
        { name: 'Atlas', trend: 'down' }
      ],
      'Cloud-Native Startups': [
        { name: 'Ariga.io', trend: 'up' },
        { name: 'PlanetScale', trend: 'same' },
        { name: 'Hasura', trend: 'down' },
        { name: 'Atlas', trend: 'up' },
        { name: 'Redgate', trend: 'down' }
      ],
      'Financial Services': [
        { name: 'Redgate', trend: 'same' },
        { name: 'Atlas', trend: 'up' },
        { name: 'PlanetScale', trend: 'down' },
        { name: 'Ariga.io', trend: 'up' },
        { name: 'Hasura', trend: 'down' }
      ],
      'SaaS Providers': [
        { name: 'PlanetScale', trend: 'up' },
        { name: 'Hasura', trend: 'up' },
        { name: 'Ariga.io', trend: 'up' },
        { name: 'Atlas', trend: 'same' },
        { name: 'Redgate', trend: 'down' }
      ],
      'Mid-Market Companies': [
        { name: 'PlanetScale', trend: 'up' },
        { name: 'Ariga.io', trend: 'up' },
        { name: 'Redgate', trend: 'down' },
        { name: 'Atlas', trend: 'same' },
        { name: 'Hasura', trend: 'down' }
      ],
      'E-commerce Platforms': [
        { name: 'Hasura', trend: 'up' },
        { name: 'Ariga.io', trend: 'up' },
        { name: 'PlanetScale', trend: 'down' },
        { name: 'Atlas', trend: 'same' },
        { name: 'Redgate', trend: 'down' }
      ],
      'Healthcare Tech': [
        { name: 'Redgate', trend: 'same' },
        { name: 'Atlas', trend: 'up' },
        { name: 'Ariga.io', trend: 'up' },
        { name: 'PlanetScale', trend: 'down' },
        { name: 'Hasura', trend: 'down' }
      ],
      'Government & Public Sector': [
        { name: 'Atlas', trend: 'up' },
        { name: 'Redgate', trend: 'same' },
        { name: 'Ariga.io', trend: 'up' },
        { name: 'Hasura', trend: 'down' },
        { name: 'PlanetScale', trend: 'down' }
      ],
      'Educational Institutions': [
        { name: 'PlanetScale', trend: 'up' },
        { name: 'Ariga.io', trend: 'up' },
        { name: 'Atlas', trend: 'down' },
        { name: 'Hasura', trend: 'same' },
        { name: 'Redgate', trend: 'down' }
      ]
    };

    return competitorsByProfile[profile] || [];
  };

  const topCitations: Citation[] = [
    {
      id: '1',
      title: 'Schema Migration Best Practices Guide',
      url: 'https://ariga.io/docs/guides/schema-migrations',
      source: {
        type: 'Documentation',
        lastUpdated: '2024-01-20',
        section: 'Schema Migration'
      },
      metrics: {
        totalQueryReferences: 142, // out of 1000 queries
        queryBreakdown: {
          awareness: 45,    // queries about understanding schema migration
          consideration: 68, // queries comparing solutions
          decision: 29      // queries about implementation
        },
        engineReferences: [
          { platform: 'Claude', references: 58, percentage: 41 },
          { platform: 'Perplexity', references: 42, percentage: 30 },
          { platform: 'Gemini', references: 28, percentage: 20 },
          { platform: 'SearchGPT', references: 14, percentage: 9 }
        ]
      },
      sentiment: 'Positive',
      competitorMentions: [
        {
          company: 'Redgate',
          coMentionCount: 12,
          context: 'Comparison',
          sentiment: 'Neutral'
        },
        {
          company: 'Liquibase',
          coMentionCount: 8,
          context: 'Alternative',
          sentiment: 'Neutral'
        }
      ],
      attention: {
        type: 'Opportunity',
        message: 'High citation rate in enterprise context - expand enterprise-focused content'
      },
      quote: "Atlas provides a unique approach to schema versioning through declarative schema definitions and version control integration, making it particularly suitable for teams using GitOps practices."
    },
    {
      id: '2',
      title: 'Atlas CLI Documentation',
      url: 'https://ariga.io/atlas/cli',
      source: {
        type: 'Documentation',
        lastUpdated: '2024-02-01',
        section: 'CLI Usage'
      },
      metrics: {
        totalQueryReferences: 98, // out of 1000 queries
        queryBreakdown: {
          awareness: 32,
          consideration: 45,
          decision: 21
        },
        engineReferences: [
          { platform: 'Perplexity', references: 42, percentage: 43 },
          { platform: 'Claude', references: 28, percentage: 29 },
          { platform: 'Gemini', references: 18, percentage: 18 },
          { platform: 'SearchGPT', references: 10, percentage: 10 }
        ]
      },
      sentiment: 'Positive',
      competitorMentions: [
        {
          company: 'Flyway',
          coMentionCount: 8,
          context: 'Comparison',
          sentiment: 'Neutral'
        },
        {
          company: 'DBmate',
          coMentionCount: 5,
          context: 'Alternative',
          sentiment: 'Neutral'
        }
      ],
      attention: {
        type: 'Monitor',
        message: 'CLI documentation frequently cited - monitor for user pain points'
      },
      quote: "The Atlas CLI offers powerful schema inspection and diff capabilities, enabling teams to validate schema changes before deployment."
    },
    {
      id: '3',
      title: 'Database Schema Versioning Blog Post',
      url: 'https://ariga.io/blog/schema-versioning',
      source: {
        type: 'Blog',
        lastUpdated: '2024-01-15',
        section: 'Schema Migration'
      },
      metrics: {
        totalQueryReferences: 76, // out of 1000 queries
        queryBreakdown: {
          awareness: 28,
          consideration: 35,
          decision: 13
        },
        engineReferences: [
          { platform: 'Gemini', references: 35, percentage: 46 },
          { platform: 'Claude', references: 22, percentage: 29 },
          { platform: 'Perplexity', references: 19, percentage: 25 }
        ]
      },
      sentiment: 'Neutral',
      competitorMentions: [
        {
          company: 'Redgate',
          coMentionCount: 15,
          context: 'Comparison',
          sentiment: 'Neutral'
        },
        {
          company: 'Liquibase',
          coMentionCount: 8,
          context: 'Alternative',
          sentiment: 'Neutral'
        },
        {
          company: 'Flyway',
          coMentionCount: 6,
          context: 'Comparison',
          sentiment: 'Neutral'
        }
      ],
      attention: {
        type: 'Risk',
        message: 'Competitors frequently cited alongside - need stronger differentiation'
      },
      quote: "Atlas provides a unique approach to schema versioning through declarative schema definitions and version control integration, making it particularly suitable for teams using GitOps practices."
    },
    {
      id: '4',
      title: 'Atlas GitHub Repository',
      url: 'https://github.com/ariga/atlas',
      source: {
        type: 'GitHub',
        lastUpdated: '2024-01-10',
        section: 'Schema Migration'
      },
      metrics: {
        totalQueryReferences: 65, // out of 1000 queries
        queryBreakdown: {
          awareness: 25,
          consideration: 28,
          decision: 12
        },
        engineReferences: [
          { platform: 'Claude', references: 30, percentage: 46 },
          { platform: 'Perplexity', references: 20, percentage: 31 },
          { platform: 'Gemini', references: 15, percentage: 23 }
        ]
      },
      sentiment: 'Positive',
      competitorMentions: [],
      attention: {
        type: 'Opportunity',
        message: 'Open source aspect resonates well - highlight community contributions'
      },
      quote: "Atlas provides a unique approach to schema versioning through declarative schema definitions and version control integration, making it particularly suitable for teams using GitOps practices."
    },
    {
      id: '5',
      title: 'Database CI/CD Integration Guide',
      url: 'https://ariga.io/docs/ci-cd',
      source: {
        type: 'Guide',
        lastUpdated: '2024-01-05',
        section: 'CI/CD Integration'
      },
      metrics: {
        totalQueryReferences: 58, // out of 1000 queries
        queryBreakdown: {
          awareness: 22,
          consideration: 25,
          decision: 11
        },
        engineReferences: [
          { platform: 'Perplexity', references: 25, percentage: 43 },
          { platform: 'Claude', references: 18, percentage: 31 },
          { platform: 'Gemini', references: 15, percentage: 26 }
        ]
      },
      sentiment: 'Positive',
      competitorMentions: [
        {
          company: 'DBmaestro',
          coMentionCount: 6,
          context: 'Comparison',
          sentiment: 'Neutral'
        },
        {
          company: 'Liquibase',
          coMentionCount: 4,
          context: 'Alternative',
          sentiment: 'Neutral'
        }
      ],
      attention: null,
      quote: "Atlas provides a unique approach to schema versioning through declarative schema definitions and version control integration, making it particularly suitable for teams using GitOps practices."
    },
    {
      id: '6',
      title: 'Database Schema Testing Strategies',
      url: 'https://ariga.io/docs/testing',
      source: {
        type: 'Guide',
        lastUpdated: '2024-01-25',
        section: 'Testing'
      },
      metrics: {
        totalQueryReferences: 52,
        queryBreakdown: {
          awareness: 20,
          consideration: 22,
          decision: 10
        },
        engineReferences: [
          { platform: 'Claude', references: 22, percentage: 42 },
          { platform: 'Perplexity', references: 18, percentage: 35 },
          { platform: 'Gemini', references: 12, percentage: 23 }
        ]
      },
      sentiment: 'Positive',
      competitorMentions: [
        {
          company: 'Redgate',
          coMentionCount: 5,
          context: 'Comparison',
          sentiment: 'Neutral'
        }
      ],
      attention: {
        type: 'Opportunity',
        message: 'High engagement in testing section - expand testing documentation'
      },
      quote: "Atlas provides comprehensive testing capabilities for database schema changes, ensuring safe deployments across environments."
    },
    {
      id: '7',
      title: 'Schema Migration Performance Optimization',
      url: 'https://ariga.io/blog/performance',
      source: {
        type: 'Blog',
        lastUpdated: '2024-01-18',
        section: 'Performance'
      },
      metrics: {
        totalQueryReferences: 48,
        queryBreakdown: {
          awareness: 18,
          consideration: 20,
          decision: 10
        },
        engineReferences: [
          { platform: 'Perplexity', references: 20, percentage: 42 },
          { platform: 'Claude', references: 16, percentage: 33 },
          { platform: 'Gemini', references: 12, percentage: 25 }
        ]
      },
      sentiment: 'Positive',
      competitorMentions: [],
      attention: {
        type: 'Monitor',
        message: 'Performance metrics resonating well - monitor for user feedback'
      },
      quote: "Atlas optimizes schema migrations through intelligent batching and parallel execution strategies."
    },
    {
      id: '8',
      title: 'Multi-Database Schema Management',
      url: 'https://ariga.io/docs/multi-db',
      source: {
        type: 'Documentation',
        lastUpdated: '2024-01-12',
        section: 'Multi-DB Support'
      },
      metrics: {
        totalQueryReferences: 45,
        queryBreakdown: {
          awareness: 15,
          consideration: 20,
          decision: 10
        },
        engineReferences: [
          { platform: 'Gemini', references: 20, percentage: 44 },
          { platform: 'Claude', references: 15, percentage: 33 },
          { platform: 'Perplexity', references: 10, percentage: 23 }
        ]
      },
      sentiment: 'Neutral',
      competitorMentions: [
        {
          company: 'Liquibase',
          coMentionCount: 4,
          context: 'Alternative',
          sentiment: 'Neutral'
        }
      ],
      attention: null,
      quote: "Atlas supports consistent schema management across multiple database types and versions."
    },
    {
      id: '9',
      title: 'Database Schema Drift Detection',
      url: 'https://ariga.io/docs/drift',
      source: {
        type: 'Documentation',
        lastUpdated: '2024-01-08',
        section: 'Drift Detection'
      },
      metrics: {
        totalQueryReferences: 42,
        queryBreakdown: {
          awareness: 15,
          consideration: 18,
          decision: 9
        },
        engineReferences: [
          { platform: 'Claude', references: 18, percentage: 43 },
          { platform: 'Perplexity', references: 14, percentage: 33 },
          { platform: 'Gemini', references: 10, percentage: 24 }
        ]
      },
      sentiment: 'Positive',
      competitorMentions: [],
      attention: {
        type: 'Opportunity',
        message: 'Strong interest in drift detection - expand automated solutions'
      },
      quote: "Atlas automatically detects and reports schema drift between environments, preventing unexpected inconsistencies."
    },
    {
      id: '10',
      title: 'Enterprise Schema Governance',
      url: 'https://ariga.io/enterprise/governance',
      source: {
        type: 'Documentation',
        lastUpdated: '2024-01-03',
        section: 'Enterprise'
      },
      metrics: {
        totalQueryReferences: 38,
        queryBreakdown: {
          awareness: 12,
          consideration: 16,
          decision: 10
        },
        engineReferences: [
          { platform: 'Perplexity', references: 16, percentage: 42 },
          { platform: 'Claude', references: 14, percentage: 37 },
          { platform: 'Gemini', references: 8, percentage: 21 }
        ]
      },
      sentiment: 'Positive',
      competitorMentions: [
        {
          company: 'Redgate',
          coMentionCount: 3,
          context: 'Comparison',
          sentiment: 'Positive'
        }
      ],
      attention: {
        type: 'Opportunity',
        message: 'Growing enterprise interest - develop more governance features'
      },
      quote: "Atlas provides enterprise-grade schema governance with role-based access control and approval workflows."
    }
  ];

  // Update the aiEngineTimeSeries data with more volatility
  const aiEngineTimeSeries: AIEngineTimeSeriesData[] = [
    // Perplexity - downward trend with volatility
    { date: '2024-01-01', engine: 'Perplexity', avgSentiment: 0.45, avgPosition: 4.2, visibilityRate: 28, recommendationProb: 25 },
    { date: '2024-02-01', engine: 'Perplexity', avgSentiment: 0.43, avgPosition: 4.9, visibilityRate: 23, recommendationProb: 24 },
    { date: '2024-03-01', engine: 'Perplexity', avgSentiment: 0.41, avgPosition: 4.7, visibilityRate: 25, recommendationProb: 21 },
    { date: '2024-04-01', engine: 'Perplexity', avgSentiment: 0.35, avgPosition: 5.3, visibilityRate: 19, recommendationProb: 18 },
    { date: '2024-05-01', engine: 'Perplexity', avgSentiment: 0.32, avgPosition: 5.1, visibilityRate: 21, recommendationProb: 15 },
    
    // Claude - upward trend with volatility
    { date: '2024-01-01', engine: 'Claude', avgSentiment: 0.30, avgPosition: 5.2, visibilityRate: 15, recommendationProb: 12 },
    { date: '2024-02-01', engine: 'Claude', avgSentiment: 0.28, avgPosition: 5.0, visibilityRate: 14, recommendationProb: 13 },
    { date: '2024-03-01', engine: 'Claude', avgSentiment: 0.35, avgPosition: 4.7, visibilityRate: 19, recommendationProb: 16 },
    { date: '2024-04-01', engine: 'Claude', avgSentiment: 0.33, avgPosition: 4.4, visibilityRate: 17, recommendationProb: 19 },
    { date: '2024-05-01', engine: 'Claude', avgSentiment: 0.40, avgPosition: 4.1, visibilityRate: 22, recommendationProb: 22 },
    
    // Gemini - stable low trend with volatility
    { date: '2024-01-01', engine: 'Gemini', avgSentiment: 0.25, avgPosition: 5.3, visibilityRate: 12, recommendationProb: 10 },
    { date: '2024-02-01', engine: 'Gemini', avgSentiment: 0.28, avgPosition: 5.6, visibilityRate: 11, recommendationProb: 9 },
    { date: '2024-03-01', engine: 'Gemini', avgSentiment: 0.24, avgPosition: 5.4, visibilityRate: 13, recommendationProb: 11 },
    { date: '2024-04-01', engine: 'Gemini', avgSentiment: 0.27, avgPosition: 5.7, visibilityRate: 10, recommendationProb: 8 },
    { date: '2024-05-01', engine: 'Gemini', avgSentiment: 0.23, avgPosition: 5.5, visibilityRate: 12, recommendationProb: 10 },
    
    // SearchGPT - very low trend with volatility
    { date: '2024-01-01', engine: 'SearchGPT', avgSentiment: 0.20, avgPosition: 5.8, visibilityRate: 8, recommendationProb: 6 },
    { date: '2024-02-01', engine: 'SearchGPT', avgSentiment: 0.18, avgPosition: 6.1, visibilityRate: 6, recommendationProb: 7 },
    { date: '2024-03-01', engine: 'SearchGPT', avgSentiment: 0.21, avgPosition: 5.9, visibilityRate: 9, recommendationProb: 5 },
    { date: '2024-04-01', engine: 'SearchGPT', avgSentiment: 0.17, avgPosition: 6.2, visibilityRate: 7, recommendationProb: 4 },
    { date: '2024-05-01', engine: 'SearchGPT', avgSentiment: 0.19, avgPosition: 6.0, visibilityRate: 8, recommendationProb: 3 },
    
    // AIO - very low trend with volatility
    { date: '2024-01-01', engine: 'AIO', avgSentiment: 0.15, avgPosition: 6.3, visibilityRate: 5, recommendationProb: 3 },
    { date: '2024-02-01', engine: 'AIO', avgSentiment: 0.17, avgPosition: 6.5, visibilityRate: 3, recommendationProb: 4 },
    { date: '2024-03-01', engine: 'AIO', avgSentiment: 0.14, avgPosition: 6.4, visibilityRate: 6, recommendationProb: 2 },
    { date: '2024-04-01', engine: 'AIO', avgSentiment: 0.16, avgPosition: 6.6, visibilityRate: 4, recommendationProb: 3 },
    { date: '2024-05-01', engine: 'AIO', avgSentiment: 0.13, avgPosition: 6.7, visibilityRate: 5, recommendationProb: 1 },
  ];

  // Add state for the selected metric
  const [selectedMetric, setSelectedMetric] = useState<
    'avgSentiment' | 'avgPosition' | 'visibilityRate' | 'recommendationProb'
  >('visibilityRate');

  // Metric configurations
  const metricConfig = {
    avgSentiment: {
      title: 'Average Sentiment',
      valueFormatter: (value: number) => `${(value * 100).toFixed(0)}%`,
      color: 'blue',
    },
    avgPosition: {
      title: 'Average Position',
      valueFormatter: (value: number) => `#${value.toFixed(1)}`,
      color: 'emerald',
    },
    visibilityRate: {
      title: 'Company Mentioned',
      valueFormatter: (value: number) => `${value}%`,
      color: 'violet',
    },
    recommendationProb: {
      title: 'Recommendation Probability',
      valueFormatter: (value: number) => `${value}%`,
      color: 'amber',
    },
  };

  // First, let's fix the transformDataForChart function to handle dates better
  const transformDataForChart = (metric: typeof selectedMetric) => {
    // Convert Set to Array to avoid iteration issues
    const uniqueDates = Array.from(new Set(aiEngineTimeSeries.map(item => item.date)));
    
    // Create formatted data array
    const formattedData = uniqueDates.map(date => {
      const entries = aiEngineTimeSeries.filter(item => item.date === date);
      const formattedDate = new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        year: 'numeric'
      });
      
      const dataPoint: any = {
        date: formattedDate,
      };

      entries.forEach(entry => {
        dataPoint[entry.engine] = Number(entry[metric]);
      });

      return dataPoint;
    });

    return formattedData.sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ariga.io AI Visibility Dashboard</h1>
          <p className="text-gray-500 text-lg">Database Schema-as-Code Platform</p>
        </div>

        {/* AI Engine Performance Chart */}
        <Card className="bg-white/50 backdrop-blur-sm shadow-glow mb-6">
          <div className="p-4">
            <Tabs value={selectedMetric} onValueChange={(value) => setSelectedMetric(value as typeof selectedMetric)}>
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <Title className="text-xl font-semibold">AI Engine Performance Over Time</Title>
                <TabsList>
                  {Object.entries(metricConfig).map(([key, config]) => (
                    <TabsTrigger key={key} value={key}>
                      {config.title}
                    </TabsTrigger>
                  ))}
                </TabsList>
              </div>

              {Object.entries(metricConfig).map(([key, config]) => (
                <TabsContent key={key} value={key}>
                  <LineChart
                    className="h-96"
                    data={transformDataForChart(key as typeof selectedMetric)}
                    index="date"
                    categories={['Perplexity', 'Claude', 'Gemini', 'SearchGPT', 'AIO']}
                    colors={['blue', 'violet', 'emerald', 'amber', 'rose']}
                    valueFormatter={config.valueFormatter}
                    yAxisWidth={56}
                    showAnimation={true}
                    showLegend={true}
                    curveType="linear"
                    showGridLines={true}
                    showXAxis={true}
                    showYAxis={true}
                    minValue={key === 'avgSentiment' ? 0 : undefined}
                    maxValue={key === 'avgSentiment' ? 1 : undefined}
                    enableLegendSlider={true}
                    connectNulls={true}
                    noDataText="No data available"
                    rotateLabelX={{
                      angle: -45,
                      verticalShift: 20,
                      xAxisHeight: 60
                    }}
                  />
                </TabsContent>
              ))}
            </Tabs>
          </div>
        </Card>

        {/* Move BuyingJourneyFunnel here, right after the AI Engine Performance */}
        <div className="mb-6">
          <BuyingJourneyFunnel />
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Temporarily hiding Monthly Score Tracker 
          <div className="lg:col-span-2">
            <Card className="bg-white/50 backdrop-blur-sm shadow-glow h-full">
              <div className="flex items-center justify-between">
                <Title className="flex items-center gap-4">
                  Monthly Visibility Performance
                  <div className="flex gap-2 items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                    <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                    <div className="w-3 h-3 rounded-full bg-violet-500"></div>
                  </div>
                </Title>
              </div>
              
              <LineChart
                // ... chart props
              />
              
              <div className="grid grid-cols-4 gap-4 mt-6">
                // ... metric cards
              </div>
            </Card>
          </div>
          */}

          {/* Temporarily hiding AI Engine Performance 
          <Card className="bg-white/50 backdrop-sm">
            <Title>AI Engine Performance</Title>
            <div className="space-y-2 mt-4">
              {aiEngineRankings.map((engine) => (
                // ... engine details
              ))}
            </div>
          </Card>
          */}
        </div>

        {/* Third Row - Citation Leaderboard with Analysis side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Top Citations Analysis */}
          <div>
            <div className="bg-white rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <Title>Top Citations Analysis</Title>
                <Badge color="blue">Most Referenced Content</Badge>
              </div>
              
              <div className="space-y-2">
                {topCitations.map((citation) => (
                  <details 
                    key={citation.id} 
                    className="group bg-white border rounded-lg overflow-hidden hover:bg-gray-50/50 transition-all duration-200"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer">
                      <div className="flex items-center gap-3">
                        <Badge color={citation.sentiment === 'Positive' ? 'green' : citation.sentiment === 'Negative' ? 'red' : 'gray'}>
                          {citation.sentiment}
                        </Badge>
                        <Text>{citation.title}</Text>
                      </div>
                      <div className="flex items-center gap-3">
                        <Text className="text-sm text-gray-500">{citation.source.lastUpdated}</Text>
                        <ChevronRightIcon className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-90" />
                      </div>
                    </summary>
                    
                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <div className="space-y-4">
                        {/* Citation Analysis */}
                        <Card decoration="left" decorationColor="blue" className="bg-white/60">
                          <Text className="text-sm font-medium mb-2">Citation Analysis</Text>
                          <div className="space-y-4">
                            <div>
                              <Text className="text-xs text-gray-500 mb-1">Source Quote</Text>
                              <Text className="text-sm text-gray-600 italic">{citation.quote}</Text>
                            </div>

                            <div>
                              <Text className="text-xs text-gray-500 mb-2">Query Distribution ({citation.metrics.totalQueryReferences} queries)</Text>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full bg-blue-500"
                                    style={{ width: `${(citation.metrics.queryBreakdown.awareness / citation.metrics.totalQueryReferences) * 100}%` }}
                                  />
                                </div>
                                <Text className="text-xs">Awareness ({citation.metrics.queryBreakdown.awareness})</Text>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 bg-gray-100 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full bg-emerald-500"
                                    style={{ width: `${(citation.metrics.queryBreakdown.consideration / citation.metrics.totalQueryReferences) * 100}%` }}
                                  />
                                </div>
                                <Text className="text-xs">Consideration ({citation.metrics.queryBreakdown.consideration})</Text>
                              </div>
                              <div className="flex items-center gap-2 mt-1">
                                <div className="flex-1 bg-gray-100 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full bg-violet-500"
                                    style={{ width: `${(citation.metrics.queryBreakdown.decision / citation.metrics.totalQueryReferences) * 100}%` }}
                                  />
                                </div>
                                <Text className="text-xs">Decision ({citation.metrics.queryBreakdown.decision})</Text>
                              </div>
                            </div>

                            <div>
                              <Text className="text-xs text-gray-500 mb-2">AI Engine References</Text>
                              <div className="grid grid-cols-2 gap-2">
                                {citation.metrics.engineReferences.map(engine => (
                                  <div key={engine.platform} className="flex justify-between items-center">
                                    <Text className="text-xs">{engine.platform}</Text>
                                    <div className="flex items-center gap-1">
                                      <Text className="text-xs font-medium">{engine.references} refs</Text>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <Text className="text-xs text-gray-500 mb-2">Competitor Co-mentions</Text>
                              <div className="space-y-2">
                                {citation.competitorMentions.map((competitor, idx) => (
                                  <div key={idx} className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <Badge size="sm" color="gray">
                                        {competitor.company}
                                      </Badge>
                                      <Badge size="sm" color="blue">
                                        {competitor.context}
                                      </Badge>
                                    </div>
                                    <Text className="text-xs">{competitor.coMentionCount} refs</Text>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {citation.attention && (
                              <div className={`p-3 rounded-lg ${
                                citation.attention.type === 'Opportunity' ? 'bg-green-50 text-green-700' :
                                citation.attention.type === 'Risk' ? 'bg-red-50 text-red-700' :
                                'bg-yellow-50 text-yellow-700'
                              }`}>
                                <div className="flex items-center gap-2 text-sm font-medium mb-1">
                                  {citation.attention.type === 'Opportunity' && '✨'}
                                  {citation.attention.type === 'Risk' && '⚠️'}
                                  {citation.attention.type === 'Monitor' && '👀'}
                                  {citation.attention.type}
                                </div>
                                <Text className="text-sm">{citation.attention.message}</Text>
                              </div>
                            )}
                          </div>
                        </Card>
                        
                        {/* Content Opportunities */}
                        <Card decoration="left" decorationColor="emerald" className="bg-white/60">
                          <Text className="text-sm font-medium mb-2">Content Opportunities</Text>
                          <div className="space-y-4">
                            <div className="p-3 rounded-lg bg-blue-50">
                              <div className="flex items-center gap-2 text-blue-700">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <Text className="font-medium">Add Quotations (+40%)</Text>
                              </div>
                              <Text className="text-sm text-blue-600 mt-1">
                                Add {Math.round((1 - citation.metrics.queryBreakdown.awareness / citation.metrics.totalQueryReferences) * 100)}% more direct quotes from industry experts and users
                              </Text>
                            </div>

                            <div className="p-3 rounded-lg bg-emerald-50">
                              <div className="flex items-center gap-2 text-emerald-700">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                <Text className="font-medium">Include Statistics (+37%)</Text>
                              </div>
                              <Text className="text-sm text-emerald-600 mt-1">
                                Add performance metrics and success rates to increase credibility
                              </Text>
                            </div>

                            <div className="p-3 rounded-lg bg-violet-50">
                              <div className="flex items-center gap-2 text-violet-700">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                                </svg>
                                <Text className="font-medium">Cite Sources (+35%)</Text>
                              </div>
                              <Text className="text-sm text-violet-600 mt-1">
                                Link to {citation.competitorMentions.length + 2} more authoritative sources in this section
                              </Text>
                            </div>

                            <div className="p-3 rounded-lg bg-amber-50">
                              <div className="flex items-center gap-2 text-amber-700">
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 12 12 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                </svg>
                                <Text className="font-medium">Improve Fluency (+30%)</Text>
                              </div>
                              <Text className="text-sm text-amber-600 mt-1">
                                Enhance readability with more technical examples and use cases
                              </Text>
                            </div>

                            <div className="mt-6 pt-4 border-t border-gray-200">
                              <Text className="text-xs text-gray-500 mb-2">Potential Impact</Text>
                              <div className="flex items-center gap-2">
                                <div className="flex-1 bg-gray-100 rounded-full h-2">
                                  <div 
                                    className="h-2 rounded-full bg-green-500"
                                    style={{ width: '35%' }}
                                  />
                                </div>
                                <Text className="text-xs font-medium">+35% Citation Rate</Text>
                              </div>
                            </div>
                          </div>
                        </Card>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>

          {/* Competitive Analysis */}
          <div>
            <div className="bg-white rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <Title>Competitive Analysis</Title>
                <Badge color="blue">Top competitors ranked by % mentioned</Badge>
              </div>
              
              <div className="space-y-2">
                {competitorData
                  .sort((a, b) => b.overallScore - a.overallScore)
                  .map((competitor, index) => (
                    <details 
                      key={competitor.company}
                      className="group bg-white border rounded-lg overflow-hidden hover:bg-gray-50/50 transition-all duration-200"
                    >
                      <summary className="flex items-center justify-between p-4 cursor-pointer">
                        <div className="flex items-center gap-3">
                          <Text className="text-gray-500">#{index + 1}</Text>
                          <Text className={competitor.company === 'Ariga.io' ? 'text-blue-600' : ''}>
                            {competitor.company}
                          </Text>
                          <Badge color={competitor.trend === 'up' ? 'green' : competitor.trend === 'down' ? 'red' : 'gray'}>
                            {competitor.trend === 'up' ? '↑' : competitor.trend === 'down' ? '↓' : '→'}
                          </Badge>
                        </div>
                        <ChevronRightIcon className="w-4 h-4 text-gray-500 transition-transform group-open:rotate-90" />
                      </summary>
                      
                      <div className="p-4 border-t border-gray-200 bg-gray-50">
                        <div className="space-y-4">
                          {/* Performance Metrics */}
                          <Card decoration="left" decorationColor="blue" className="bg-white/60">
                            <Text className="text-base font-semibold mb-4">Performance Metrics</Text>
                            <div className="space-y-3">
                              <div className="flex justify-between items-center">
                                <Text className="text-sm text-gray-600">Visibility Rate</Text>
                                <Text className="text-sm font-medium">{competitor.visibilityProbability}%</Text>
                              </div>
                              <div className="flex justify-between items-center">
                                <Text className="text-sm text-gray-600">Recommendation Rate</Text>
                                <Text className="text-sm font-medium">{competitor.recommendationProbability}%</Text>
                              </div>
                              <div className="flex justify-between items-center">
                                <Text className="text-sm text-gray-600">Average Ranking</Text>
                                <Text className="text-sm font-medium">#{competitor.avgRanking.toFixed(1)}</Text>
                              </div>
                              <div className="flex justify-between items-center">
                                <Text className="text-sm text-gray-600">Citations</Text>
                                <Text className="text-sm font-medium">{competitor.citationAppearances}</Text>
                              </div>
                            </div>
                          </Card>

                          {/* Top Sources with link icons */}
                          <Card decoration="left" decorationColor="emerald" className="bg-white/60">
                            <Text className="text-base font-semibold mb-4">Top Sources</Text>
                            <div className="space-y-3">
                              {competitor.topSources.map((source, idx) => (
                                <div key={idx} className="flex items-center justify-between">
                                  <div className="flex items-center gap-2 flex-1 group/link hover:text-blue-600 cursor-pointer">
                                    <Text className="text-sm text-gray-600 group-hover/link:text-blue-600">
                                      {source.name}
                                    </Text>
                                    <svg 
                                      className="w-4 h-4 text-gray-400 group-hover/link:text-blue-500" 
                                      fill="none" 
                                      viewBox="0 0 24 24" 
                                      stroke="currentColor"
                                    >
                                      <path 
                                        strokeLinecap="round" 
                                        strokeLinejoin="round" 
                                        strokeWidth={2} 
                                        d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
                                      />
                                    </svg>
                                  </div>
                                  <Text className="text-sm text-gray-500">{source.citationRate}%</Text>
                                </div>
                              ))}
                            </div>
                          </Card>

                          {/* Demographics */}
                          <Card decoration="left" decorationColor="violet" className="bg-white/60">
                            <Text className="text-base font-semibold mb-4">How You Compare</Text>
                            <div className="space-y-4">
                              <table className="w-full">
                                <thead>
                                  <tr>
                                    <th className="text-left text-sm text-gray-500 font-medium">Category</th>
                                    <th className="text-right text-sm text-gray-500 font-medium">Ariga.io</th>
                                    <th className="text-right text-sm text-gray-500 font-medium">{competitor.company}</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {/* Overall */}
                                  <tr className="border-b border-gray-100 bg-gray-50">
                                    <td className="py-3 text-sm font-semibold">Overall Company Mentioned</td>
                                    <td className="text-right text-sm font-medium">12%</td>
                                    <td className="text-right text-sm font-medium">{competitor.visibilityProbability}%</td>
                                  </tr>

                                  {/* Regional Category */}
                                  <tr className="border-b border-gray-100 bg-blue-50">
                                    <td colSpan={3} className="py-3 text-sm font-semibold">Regional</td>
                                  </tr>
                                  {competitor.demographics.topRegions.map((region, idx) => (
                                    <tr key={`region-${idx}`} className="border-b border-gray-100">
                                      <td className="py-2 text-sm pl-4 text-gray-600">{region.name}</td>
                                      <td className="text-right text-sm text-gray-600">{Math.max(2, region.score - 15)}%</td>
                                      <td className="text-right text-sm text-gray-600">{Math.max(5, region.score - 10)}%</td>
                                    </tr>
                                  ))}

                                  {/* Vertical Category */}
                                  <tr className="border-b border-gray-100 bg-blue-50">
                                    <td colSpan={3} className="py-3 text-sm font-semibold">Vertical</td>
                                  </tr>
                                  {competitor.demographics.topVerticals.map((vertical, idx) => (
                                    <tr key={`vertical-${idx}`} className="border-b border-gray-100">
                                      <td className="py-2 text-sm pl-4 text-gray-600">{vertical.name}</td>
                                      <td className="text-right text-sm text-gray-600">{Math.max(2, vertical.score - 12)}%</td>
                                      <td className="text-right text-sm text-gray-600">{Math.max(5, vertical.score - 8)}%</td>
                                    </tr>
                                  ))}

                                  {/* Persona Category */}
                                  <tr className="border-b border-gray-100 bg-blue-50">
                                    <td colSpan={3} className="py-3 text-sm font-semibold">Persona</td>
                                  </tr>
                                  {competitor.demographics.topICPs.map((icp, idx) => (
                                    <tr key={`icp-${idx}`} className="border-b border-gray-100">
                                      <td className="py-2 text-sm pl-4 text-gray-600">{icp.name}</td>
                                      <td className="text-right text-sm text-gray-600">{Math.max(2, icp.score - 10)}%</td>
                                      <td className="text-right text-sm text-gray-600">{Math.max(5, icp.score - 5)}%</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          </Card>
                        </div>
                      </div>
                    </details>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Fourth Row - Full Width Map Section */}
        <div className="mb-6">
          <Card className="bg-white/50 backdrop-blur-sm">
            <Title>Global Market Presence</Title>
            <TabGroup>
              <TabList className="mt-4">
                <Tab>Map View</Tab>
                <Tab>Regional Details</Tab>
              </TabList>
              <TabPanels>
                <TabPanel>
                  <div className="w-full h-[800px] flex justify-center items-center mt-4">
                    <div className="w-[95%] h-full">
                      <WorldMap
                        color="blue"
                        title="Global Visibility Scores"
                        valueSuffix="%"
                        size="xxl"
                        data={visibilityMapData}
                        richInteraction={true}
                        tooltipTextFunction={(context: CountryContext<number>) => {
                          return `${context.countryName}: ${context.countryValue ?? 0}% visibility`;
                        }}
                        styleFunction={(context: CountryContext<number>) => {
                          const calculatedValue = context.countryValue ?? 0;
                          const opacityLevel = calculatedValue 
                            ? 0.1 + (1.5 * (calculatedValue - context.minValue)) / (context.maxValue - context.minValue)
                            : 0.1;
                          
                          return {
                            fill: context.color,
                            fillOpacity: opacityLevel,
                            stroke: "#1d4ed8",
                            strokeWidth: 1,
                            strokeOpacity: 0.3,
                            cursor: "pointer",
                          };
                        }}
                        frame={true}
                        frameColor="#cbd5e1"
                      />
                    </div>
                  </div>
                </TabPanel>
                <TabPanel>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                    {regionalData.map((region) => (
                      <Card key={region.region} decoration="left" decorationColor={region.color}>
                        <Flex>
                          <div>
                            <Text className="font-medium">{region.region}</Text>
                            <Metric className="mt-1">{region.score}%</Metric>
                          </div>
                          <div className="space-y-1">
                            <Badge color={region.color} size="xl">
                              Growth: {region.growth}
                            </Badge>
                            <Text className="text-sm">Market: {region.marketPenetration}</Text>
                          </div>
                        </Flex>
                        <Text className="mt-4 text-sm font-medium">Top Queries:</Text>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {region.topQueries.map((query, idx) => (
                            <Badge key={idx} color={region.color} size="sm">
                              {query}
                            </Badge>
                          ))}
                        </div>
                      </Card>
                    ))}
                  </div>
                </TabPanel>
              </TabPanels>
            </TabGroup>
          </Card>
        </div>
      </div>
    </div>
  );
} 

