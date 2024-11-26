'use client';

import { Card, Title, AreaChart, Grid, Text, Metric, Flex, TabGroup, TabList, Tab, TabPanels, TabPanel, Badge } from '@tremor/react';
import WorldMap from "react-svg-worldmap";
import { CountryContext } from "react-svg-worldmap";
import { useState, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

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

interface QueryPerformance {
  id: string;
  query: string;
  category: string;
  impact: "High" | "Medium" | "Low";
  userIntent: string;
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
  trend: string;
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
      userIntent: "Research"
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
      userIntent: "Evaluation"
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
      userIntent: "Comparison"
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
      userIntent: "Technical"
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
      userIntent: "Business"
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
      trend: '+15%'
    },
    {
      company: 'Hasura',
      visibilityProbability: 35,
      recommendationProbability: 40,
      avgRanking: 2.4,
      citationAppearances: 22,
      overallScore: 85,
      trend: '+28%'
    },
    {
      company: 'PlanetScale',
      visibilityProbability: 34,
      recommendationProbability: 38,
      avgRanking: 2.6,
      citationAppearances: 20,
      overallScore: 83,
      trend: '+22%'
    },
    {
      company: 'Ariga.io',
      visibilityProbability: 32,
      recommendationProbability: 35,
      avgRanking: 2.8,
      citationAppearances: 18,
      overallScore: 80,
      trend: '-8%'
    },
    {
      company: 'Atlas',
      visibilityProbability: 30,
      recommendationProbability: 32,
      avgRanking: 3.0,
      citationAppearances: 15,
      overallScore: 78,
      trend: '+18%'
    },
    {
      company: 'Alembic',
      visibilityProbability: 28,
      recommendationProbability: 30,
      avgRanking: 3.2,
      citationAppearances: 12,
      overallScore: 75,
      trend: '-5%'
    },
    {
      company: 'TypeORM',
      visibilityProbability: 25,
      recommendationProbability: 28,
      avgRanking: 3.4,
      citationAppearances: 10,
      overallScore: 72,
      trend: '+10%'
    },
    {
      company: 'DBmaestro',
      visibilityProbability: 22,
      recommendationProbability: 25,
      avgRanking: 3.6,
      citationAppearances: 8,
      overallScore: 70,
      trend: '-3%'
    },
    {
      company: 'SchemaHero',
      visibilityProbability: 20,
      recommendationProbability: 22,
      avgRanking: 3.8,
      citationAppearances: 6,
      overallScore: 68,
      trend: '+25%'
    },
    {
      company: 'Sequelize',
      visibilityProbability: 18,
      recommendationProbability: 20,
      avgRanking: 4.0,
      citationAppearances: 5,
      overallScore: 65,
      trend: '+8%'
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
      engine: 'MetaAI',
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

  const platforms = ['Perplexity', 'Claude', 'Gemini', 'SearchGPT', 'MetaAI'] as const;

  const [queries, setQueries] = useState<QueryPerformance[]>(() => 
    Array.from({ length: 500 }, (_, i) => ({
      id: `query-${i}`,
      query: sampleQueries[i % sampleQueries.length].query,
      category: sampleQueries[i % sampleQueries.length].category,
      impact: sampleQueries[i % sampleQueries.length].impact as "High" | "Medium" | "Low",
      userIntent: sampleQueries[i % sampleQueries.length].userIntent,
      platforms: sampleQueries[i % sampleQueries.length].platforms.map(p => ({
        name: p.name,
        position: p.position,
        cited: p.cited
      })) as PlatformRanking[],
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
      6: ['TypeORM', 'Alembic', 'Atlas', 'Hasura', 'Ariga.io'],
      7: ['Alembic', 'DBmaestro', 'TypeORM', 'Atlas', 'Hasura'],
      8: ['SchemaHero', 'TypeORM', 'Alembic', 'DBmaestro', 'Atlas'],
      9: ['Sequelize', 'SchemaHero', 'TypeORM', 'Alembic', 'DBmaestro'],
      10: ['DBmaestro', 'Sequelize', 'SchemaHero', 'TypeORM', 'Alembic']
    };

    const numPosition = Number(position);
    const rankings: DetailedRanking[] = [];
    
    // Get 5 positions centered around the current position
    for (let i = Math.max(1, numPosition - 2); i <= Math.min(10, numPosition + 2); i++) {
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
    }
  ];

  return (
    <div className="p-8 bg-gradient-to-br from-gray-50 to-blue-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Ariga.io AI Visibility Dashboard</h1>
          <p className="text-gray-500 text-lg">Database Schema-as-Code Platform</p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Monthly Score Tracker - Spans 2 columns */}
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
              
              <AreaChart
                className="h-72 mt-6"
                data={monthlyScores}
                index="month"
                categories={["percentageRanked", "avgRankingPosition", "citationAppearance", "avgCitationPosition"]}
                colors={["blue", "emerald", "amber", "violet"]}
                valueFormatter={(value: number) => {
                  if (value === null) return "";
                  return value.toFixed(1) + (value < 10 ? "" : "%");
                }}
                yAxisWidth={56}
                showAnimation={true}
                showLegend={true}
                curveType="natural"
                showGridLines={false}
                showXAxis={true}
                showYAxis={true}
                minValue={0}
                maxValue={50}
                customTooltip={({ payload, active }) => {
                  if (!active || !payload?.length) return null;

                  return (
                    <div className="p-2 bg-white/90 border border-gray-200 rounded-lg shadow-lg">
                      <div className="text-sm font-medium mb-2">
                        {payload[0].payload.month}
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-blue-500" />
                          <span className="text-sm">Company Mentioned: {payload[0].payload.percentageRanked}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-sm">Average Position: #{payload[0].payload.avgRankingPosition.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="text-sm">Citations: {payload[0].payload.citationAppearance}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-violet-500" />
                          <span className="text-sm">Citation Position: #{payload[0].payload.avgCitationPosition.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              
              {/* Metric cards below the chart */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <Card decoration="top" decorationColor="blue">
                  <Text>Company Mentioned</Text>
                  <Metric className="text-blue-600">
                    {monthlyScores[monthlyScores.length - 1].percentageRanked}%
                  </Metric>
                  <Text className="text-sm text-gray-500">Visibility rate</Text>
                </Card>
                
                <Card decoration="top" decorationColor="emerald">
                  <Text>Average Position</Text>
                  <Metric className="text-emerald-600">
                    #{monthlyScores[monthlyScores.length - 1].avgRankingPosition.toFixed(1)}
                  </Metric>
                  <Text className="text-sm text-gray-500">Overall ranking</Text>
                </Card>
                
                <Card decoration="top" decorationColor="amber">
                  <Text>Citations</Text>
                  <Metric className="text-amber-600">
                    {monthlyScores[monthlyScores.length - 1].citationAppearance}%
                  </Metric>
                  <Text className="text-sm text-gray-500">Appearance rate</Text>
                </Card>

                <Card decoration="top" decorationColor="violet">
                  <Text>Citation Position</Text>
                  <Metric className="text-violet-600">
                    #{monthlyScores[monthlyScores.length - 1].avgCitationPosition.toFixed(1)}
                  </Metric>
                  <Text className="text-sm text-gray-500">Citation rank</Text>
                </Card>
              </div>
            </Card>
          </div>

          {/* AI Engine Performance - Right side column */}
          <Card className="bg-white/50 backdrop-blur-sm">
            <Title>AI Engine Performance</Title>
            <div className="space-y-2 mt-4">
              {aiEngineRankings.map((engine) => (
                <details 
                  key={engine.engine} 
                  className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <summary className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-3 h-3 rounded-full transition-colors duration-300`}
                          style={{
                            backgroundColor: `rgba(${
                              engine.visibility <= 25 ? '239, 68, 68' :  // red
                              engine.visibility <= 35 ? '249, 115, 22' : // orange
                              engine.visibility <= 40 ? '234, 179, 8' :  // yellow
                              '34, 197, 94'                             // green
                            }, ${engine.visibility / 100})`
                          }}
                        />
                        <Text className="font-medium">{engine.engine}</Text>
                      </div>
                      <Text className="text-xs text-gray-500">
                        {engine.visibility <= 25 ? '⚠️ needs attention' :
                         engine.visibility <= 35 ? '👀 monitor closely' :
                         engine.visibility <= 40 ? '📈 improving' :
                         '✨ performing well'}
                      </Text>
                    </div>
                    <svg 
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M19 9l-7 7-7-7" 
                      />
                    </svg>
                  </summary>
                  <div className="p-3 border-t border-gray-200 bg-gray-50">
                    <Grid numItems={2} className="gap-3">
                      <Card decoration="left" decorationColor={engine.color} className="bg-white p-2">
                        <Text className="text-xs font-medium mb-2">Performance Metrics</Text>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Text className="text-xs text-gray-500">Company Mentioned</Text>
                            <div className="flex items-baseline gap-1">
                              <Text className="font-semibold">{engine.percentageRanked}</Text>
                              <Text className="text-xs text-gray-500">%</Text>
                            </div>
                          </div>
                          <div>
                            <Text className="text-xs text-gray-500">Average Ranking</Text>
                            <div className="flex items-baseline gap-1">
                              <Text className="font-semibold">#{engine.avgRankingPosition.toFixed(1)}</Text>
                            </div>
                          </div>
                          <div>
                            <Text className="text-xs text-gray-500">Recommendation Probability</Text>
                            <div className="flex items-baseline gap-1">
                              <Text className="font-semibold">{engine.recommendationProbability}%</Text>
                            </div>
                          </div>
                          <div>
                            <Text className="text-xs text-gray-500">Citation Appearances</Text>
                            <div className="flex items-baseline gap-1">
                              <Text className="font-semibold">{engine.citationAppearance}%</Text>
                            </div>
                          </div>
                        </div>
                      </Card>
                      
                      <Card decoration="left" decorationColor={engine.color} className="bg-white p-2">
                        <Text className="text-xs font-medium mb-2">Citation Performance</Text>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Text className="text-xs text-gray-500">Citation Appearances</Text>
                            <div className="flex items-baseline gap-1">
                              <Text className="font-semibold">{engine.citationAppearance}</Text>
                              <Text className="text-xs text-gray-500">%</Text>
                            </div>
                          </div>
                          <div>
                            <Text className="text-xs text-gray-500">Avg Position</Text>
                            <div className="flex items-baseline gap-1">
                              <Text className="font-semibold">#{engine.avgCitationPosition.toFixed(1)}</Text>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Grid>
                  </div>
                </details>
              ))}
            </div>
          </Card>
        </div>

        {/* Second Row - Full Width Query Section */}
        <div className="mb-6">
          {/* Query Performance Analysis */}
          <div className="bg-white border rounded-lg shadow-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Title>Query Performance Analysis</Title>
                <button
                  onClick={() => {
                    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                    setQueries(prev => [...prev].sort((a, b) => 
                      sortOrder === 'asc' 
                        ? a.averagePosition - b.averagePosition
                        : b.averagePosition - a.averagePosition
                    ));
                  }}
                  className="flex items-center gap-2 px-3 py-1 rounded-md bg-blue-50 hover:bg-blue-100 text-blue-600 text-sm transition-colors"
                >
                  Sort by Position {sortOrder === 'asc' ? '↑' : '↓'}
                </button>
              </div>

              <div className="relative">
                <div className="sticky top-0 bg-white z-10 border-b border-gray-200">
                  <div className="grid" style={{ gridTemplateColumns: '1fr repeat(5, 80px)' }}>
                    <div className="px-3 py-2 font-medium text-gray-700">Query</div>
                    {platforms.map(platform => (
                      <div key={platform} className="px-1 py-2 text-center font-medium text-gray-700 text-xs">
                        {platform}
                      </div>
                    ))}
                  </div>
                </div>

                <div 
                  ref={parentRef}
                  className="h-[600px] overflow-auto bg-white"
                >
                  <div
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      width: '100%',
                      position: 'relative',
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                      const query = queries[virtualRow.index];
                      return (
                        <div
                          key={query.id}
                          data-index={virtualRow.index}
                          ref={rowVirtualizer.measureElement}
                          className="absolute top-0 left-0 w-full"
                          style={{
                            transform: `translateY(${virtualRow.start}px)`,
                          }}
                        >
                          <details className="group border-b border-gray-200">
                            <summary className="cursor-pointer hover:bg-blue-50 transition-all duration-200 list-none">
                              <div className="grid items-center" style={{ gridTemplateColumns: '1fr repeat(5, 80px)' }}>
                                <div className="px-3 py-2 min-w-0 flex items-center gap-2">
                                  <svg 
                                    className="w-4 h-4 text-gray-400 transform transition-transform duration-200 ease-out group-open:rotate-90" 
                                    fill="none" 
                                    viewBox="0 0 24 24" 
                                    stroke="currentColor"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                  </svg>
                                  <Text className="text-gray-900 truncate">
                                    {query.query}
                                  </Text>
                                </div>

                                {platforms.map(platform => {
                                  const platformData = query.platforms.find(p => p.name === platform) || 
                                    { position: '-', cited: false };
                                  return (
                                    <div key={platform} className="px-1 py-2 flex items-center justify-center">
                                      <div className="flex items-center gap-0.5">
                                        <Text className={`text-xs ${
                                          platformData.position === '-' ? 'text-gray-400' :
                                          Number(platformData.position) <= 2 ? 'text-green-600 font-medium' :
                                          Number(platformData.position) <= 4 ? 'text-yellow-600' :
                                          'text-orange-600'
                                        }`}>
                                          {platformData.position === '-' ? '-' : `#${platformData.position}`}
                                        </Text>
                                        {platformData.cited && (
                                          <div className="w-1 h-1 rounded-full bg-green-500" title="Cited"/>
                                        )}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </summary>

                            <div className="overflow-hidden transition-all duration-200 ease-out">
                              <div className="p-4 bg-gray-50 border-t border-gray-100">
                                {/* Query Details - Added details-attributes class */}
                                <div className="flex gap-2 flex-wrap details-attributes">
                                  <Badge color="blue">{query.category}</Badge>
                                  <Badge color={query.impact === 'High' ? 'green' : 
                                         query.impact === 'Medium' ? 'yellow' : 'orange'}>
                                    {query.impact} Impact
                                  </Badge>
                                  <Badge color="violet">{query.userIntent}</Badge>
                                  <Badge color="emerald">Avg Position: #{query.averagePosition}</Badge>
                                </div>

                                {/* Platform Details */}
                                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                  {platforms.map(platformName => {
                                    const platformData = query.platforms.find(p => p.name === platformName) || 
                                      { position: '-', cited: false };
                                    const rankings = getDetailedRankings(platformData.position);
                                    
                                    return (
                                      <Card key={platformName} className="bg-white">
                                        <div className="text-center mb-4">
                                          <Text className="font-medium">{platformName}</Text>
                                          <div className="flex justify-center items-center gap-2 mt-2">
                                            <Badge 
                                              color={getPositionBadgeColor(platformData.position)}
                                              size="lg"
                                            >
                                              {platformData.position === '-' ? 'Not Listed' : `#${platformData.position}`}
                                            </Badge>
                                            {platformData.cited && (
                                              <Badge color="green">Cited</Badge>
                                            )}
                                          </div>
                                        </div>

                                        {platformData.position !== '-' && (
                                          <div className="mt-4 space-y-2">
                                            <Text className="text-sm font-medium text-gray-700">Ranking Context:</Text>
                                            {rankings.map((rank) => (
                                              <div 
                                                key={rank.position}
                                                className={`flex items-center justify-between p-2 rounded ${
                                                  rank.company === 'Ariga.io' 
                                                    ? 'bg-blue-50 border border-blue-200' 
                                                    : 'bg-white border border-gray-100'
                                                }`}
                                              >
                                                <Text className="text-sm">#{rank.position}</Text>
                                                <Text className={`text-sm ${
                                                  rank.company === 'Ariga.io' ? 'font-medium text-blue-600' : ''
                                                }`}>
                                                  {rank.company}
                                                </Text>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {platformData.position === '-' && (
                                          <div className="mt-4 text-center text-gray-500 text-sm">
                                            Not currently ranked in this platform
                                          </div>
                                        )}
                                      </Card>
                                    );
                                  })}
                                </div>
                              </div>
                            </div>
                          </details>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Top Citations Analysis */}
        <div className="mb-6">
          <div className="bg-white border rounded-lg shadow-lg">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <Title>Top Citations Analysis</Title>
                <div className="flex gap-2">
                  <Badge color="blue">Most Referenced Content</Badge>
                </div>
              </div>

              <div className="space-y-4">
                {topCitations.map((citation) => (
                  <details 
                    key={citation.id}
                    className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3">
                          <Badge 
                            color={
                              citation.sentiment === 'Positive' ? 'green' :
                              citation.sentiment === 'Negative' ? 'red' : 'gray'
                            }
                            size="sm"
                          >
                            {citation.sentiment}
                          </Badge>
                          <Text className="font-medium truncate">{citation.title}</Text>
                        </div>
                        <div className="flex gap-3 mt-1 text-sm text-gray-500">
                          <span>{citation.source.type}</span>
                          <span>•</span>
                          <span>{citation.source.lastUpdated}</span>
                          <span>•</span>
                          <span>{citation.source.section}</span>
                        </div>
                      </div>
                      <svg 
                        className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform ml-4" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>

                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <Grid numItems={2} className="gap-4">
                        <Card decoration="left" decorationColor="blue" className="bg-white/50">
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

                        <Card decoration="left" decorationColor="emerald" className="bg-white/50">
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
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
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
                      </Grid>

                      <div className="mt-4 flex justify-between items-center">
                        <a 
                          href={citation.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm flex items-center gap-1"
                        >
                          View Citation
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Third Row - Citation Leaderboard with Analysis and ICP side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Citation Leaderboard */}
          <Card className="bg-white/50 backdrop-blur-sm">
            <Title>Industry Citation Leaderboard</Title>
            <div className="mt-4 space-y-4">
              {competitorData
                .sort((a, b) => b.overallScore - a.overallScore)
                .map((competitor, index) => (
                  <details 
                    key={competitor.company}
                    className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3">
                          <Text className="font-semibold text-lg">#{index + 1}</Text>
                          <Text className={`font-medium ${
                            competitor.company === 'Ariga.io' ? 'text-blue-600' : ''
                          }`}>
                            {competitor.company}
                          </Text>
                        </div>
                        <Badge color={competitor.trend.startsWith('+') ? 'green' : 'red'}>
                          {competitor.trend}
                        </Badge>
                      </div>
                      <svg 
                        className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </summary>

                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <Card decoration="left" decorationColor="blue" className="bg-white/50">
                        <Text className="text-sm font-medium mb-2">Performance Metrics</Text>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Text className="text-xs text-gray-500">Company Mentioned</Text>
                            <Text className="font-medium">{competitor.visibilityProbability}%</Text>
                          </div>
                          <div className="flex justify-between items-center">
                            <Text className="text-xs text-gray-500">Recommendation Probability</Text>
                            <Text className="font-medium">{competitor.recommendationProbability}%</Text>
                          </div>
                          <div className="flex justify-between items-center">
                            <Text className="text-xs text-gray-500">Average Ranking</Text>
                            <Text className="font-medium">#{competitor.avgRanking.toFixed(1)}</Text>
                          </div>
                          <div className="flex justify-between items-center">
                            <Text className="text-xs text-gray-500">Citation Appearances</Text>
                            <Text className="font-medium">{competitor.citationAppearances}%</Text>
                          </div>
                        </div>
                      </Card>
                    </div>
                  </details>
                ))}
            </div>
          </Card>

          {/* ICP Analysis */}
          <Card className="bg-white/50 backdrop-blur-sm">
            <Title>ICP Performance Analysis</Title>
            <div className="mt-4 space-y-4">
              {icpData.map((icp) => (
                <details 
                  key={icp.profile}
                  className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-200"
                >
                  <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <Text className={`font-medium text-lg`}>{icp.profile}</Text>
                      <div className="flex items-center gap-2">
                        <div 
                          className={`w-2 h-2 rounded-full ${
                            icp.overallScore >= 75 ? 'bg-green-500' : 'bg-red-500'
                          }`}
                        />
                        <Text className="text-xs text-gray-500">
                          {icp.overallScore >= 75 ? 'On track' : 'Needs attention'}
                        </Text>
                      </div>
                    </div>
                    <svg 
                      className="w-5 h-5 text-gray-500 group-open:rotate-180 transition-transform" 
                      fill="none" 
                      viewBox="0 0 24 24" 
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </summary>

                    <div className="p-4 border-t border-gray-200 bg-gray-50">
                      <Grid numItems={2} className="gap-4">
                        <Card decoration="left" decorationColor={icp.color} className="bg-white/50">
                          <Text className="text-sm font-medium mb-2">Performance Metrics</Text>
                          <div className="space-y-2">
                            <div className="flex justify-between items-center">
                              <Text className="text-xs text-gray-500">Company Mentioned</Text>
                              <Text className="font-medium">{icp.visibilityProbability}%</Text>
                            </div>
                            <div className="flex justify-between items-center">
                              <Text className="text-xs text-gray-500">Recommendation Probability</Text>
                              <Text className="font-medium">{icp.recommendationProbability}%</Text>
                            </div>
                            <div className="flex justify-between items-center">
                              <Text className="text-xs text-gray-500">Average Ranking</Text>
                              <Text className="font-medium">#{icp.avgRanking.toFixed(1)}</Text>
                            </div>
                            <div className="flex justify-between items-center">
                              <Text className="text-xs text-gray-500">Citation Appearances</Text>
                              <Text className="font-medium">{icp.citationAppearances}%</Text>
                            </div>
                          </div>
                        </Card>

                        <Card decoration="left" decorationColor={icp.color} className="bg-white/50">
                          <Text className="text-sm font-medium mb-2">Top Competitors</Text>
                          <div className="space-y-2">
                            {getCompetitorsForICP(icp.profile).map((competitor, index) => (
                              <div 
                                key={competitor.name}
                                className="flex items-center justify-between p-2 rounded"
                              >
                                <div className="flex items-center gap-2">
                                  <Text className="text-xs font-medium">#{index + 1}</Text>
                                  <Text 
                                    className={`text-sm ${
                                      competitor.name === 'Ariga.io' ? 'text-blue-600 font-medium' : ''
                                    }`}
                                  >
                                    {competitor.name}
                                  </Text>
                                </div>
                                <div className="flex items-center gap-1">
                                  {competitor.trend === 'up' && (
                                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                    </svg>
                                  )}
                                  {competitor.trend === 'down' && (
                                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                    </svg>
                                  )}
                                  {competitor.trend === 'same' && (
                                    <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14" />
                                    </svg>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </Card>
                      </Grid>

                      <div className="mt-4">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full transition-all duration-500"
                            style={{ 
                              width: `${icp.overallScore}%`,
                              backgroundColor: `var(--tremor-${icp.color}-500)`
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
            </div>
          </Card>
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