'use client';

import { Card, Title, AreaChart, Grid, Text, Metric, Flex, TabGroup, TabList, Tab, TabPanels, TabPanel, Table, TableHead, TableHeaderCell, TableBody, TableRow, TableCell, Badge, List, ListItem } from '@tremor/react';
import type { CustomTooltipProps } from '@tremor/react';
import WorldMap from "react-svg-worldmap";
import { CountryContext } from "react-svg-worldmap";
import { useState, useEffect, useRef, useCallback } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';
import { createPortal } from 'react-dom';

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

interface MonthlyScore {
  month: string;
  percentageRanked: number;
  avgRankingPosition: number;
  citationAppearance: number;
  avgCitationPosition: number;
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
  percentageRanked: number;
  avgRankingPosition: number;
  citationAppearance: number;
  avgCitationPosition: number;
  overallScore: number;
  trend: string;
}

function HoverCard({ query, platforms, isVisible, position }: { 
  query: QueryPerformance; 
  platforms: readonly string[];
  isVisible: boolean;
  position: { top: number; left: number; };
}) {
  const getPositionBadgeColor = (position: Position): string => {
    if (position === '-') return "red";
    if (position <= 2) return "green";
    if (position <= 4) return "yellow";
    return "orange";
  };

  const getDetailedRankings = (position: Position): DetailedRanking[] => {
    const allCompanies = [
      'Redgate', 'Ariga.io', 'Hasura', 'PlanetScale', 'Atlas',
      'Alembic', 'TypeORM', 'DBmaestro', 'SchemaHero', 'Sequelize'
    ];
    
    if (position === '-') return [];
    
    const rankings: DetailedRanking[] = [];
    for (let i = Math.max(1, Number(position) - 2); i <= Number(position) + 2; i++) {
      rankings.push({
        position: i,
        company: i === Number(position) ? 'Ariga.io' : allCompanies[Math.floor(Math.random() * allCompanies.length)]
      });
    }
    return rankings;
  };

  if (!isVisible) return null;

  return createPortal(
    <div 
      className="fixed bg-white rounded-lg border border-gray-200 shadow-2xl"
      style={{ 
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: '800px',
        zIndex: 50,
        transform: 'translateY(-100%)',
      }}
    >
      <div className="relative">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-violet-500 rounded-t-lg"/>
        <div className="p-6">
          <div>
            <Text className="font-medium text-xl mb-2">{query.query}</Text>
            <div className="flex gap-2">
              <Badge color="blue">{query.category}</Badge>
              <Badge color={query.impact === 'High' ? 'green' : 
                     query.impact === 'Medium' ? 'yellow' : 'orange'}>
                {query.impact} Impact
              </Badge>
              <Badge color="violet">{query.userIntent}</Badge>
              <Badge color="emerald">Avg Position: #{query.averagePosition}</Badge>
            </div>
          </div>

          <div className="grid grid-cols-5 gap-4 mt-6">
            {platforms.map(platformName => {
              const platformData = query.platforms.find(p => p.name === platformName) || 
                { position: '-', cited: false };
              const rankings = getDetailedRankings(platformData.position);
              
              return (
                <div key={platformName} className="bg-gray-100 rounded-lg p-4">
                  <div className="text-center mb-4">
                    <Text className="font-medium text-lg">{platformName}</Text>
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
                      <Text className="text-sm font-medium text-gray-700 mb-2">Ranking Context:</Text>
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
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
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
      percentageRanked: 48,
      avgRankingPosition: 2.3,
      citationAppearance: 42,
      avgCitationPosition: 3.2,
      overallScore: 88,
      trend: '+15%'
    },
    {
      company: 'Hasura',
      percentageRanked: 45,
      avgRankingPosition: 2.4,
      citationAppearance: 40,
      avgCitationPosition: 3.5,
      overallScore: 85,
      trend: '+28%'
    },
    {
      company: 'PlanetScale',
      percentageRanked: 44,
      avgRankingPosition: 2.6,
      citationAppearance: 38,
      avgCitationPosition: 3.7,
      overallScore: 83,
      trend: '+22%'
    },
    {
      company: 'Ariga.io',
      percentageRanked: 42,
      avgRankingPosition: 2.8,
      citationAppearance: 35,
      avgCitationPosition: 4.0,
      overallScore: 80,
      trend: '-8%'
    },
    {
      company: 'Atlas',
      percentageRanked: 40,
      avgRankingPosition: 3.0,
      citationAppearance: 33,
      avgCitationPosition: 4.2,
      overallScore: 78,
      trend: '+18%'
    },
    {
      company: 'Alembic',
      percentageRanked: 38,
      avgRankingPosition: 3.2,
      citationAppearance: 30,
      avgCitationPosition: 4.5,
      overallScore: 75,
      trend: '-5%'
    },
    {
      company: 'TypeORM',
      percentageRanked: 36,
      avgRankingPosition: 3.4,
      citationAppearance: 28,
      avgCitationPosition: 4.8,
      overallScore: 72,
      trend: '+10%'
    },
    {
      company: 'DBmaestro',
      percentageRanked: 34,
      avgRankingPosition: 3.6,
      citationAppearance: 25,
      avgCitationPosition: 5.0,
      overallScore: 70,
      trend: '-3%'
    },
    {
      company: 'SchemaHero',
      percentageRanked: 32,
      avgRankingPosition: 3.8,
      citationAppearance: 22,
      avgCitationPosition: 5.2,
      overallScore: 68,
      trend: '+25%'
    },
    {
      company: 'Sequelize',
      percentageRanked: 30,
      avgRankingPosition: 4.0,
      citationAppearance: 20,
      avgCitationPosition: 5.5,
      overallScore: 65,
      trend: '+8%'
    },
    {
      company: 'DataGrip',
      percentageRanked: 28,
      avgRankingPosition: 4.2,
      citationAppearance: 18,
      avgCitationPosition: 5.8,
      overallScore: 62,
      trend: '+12%'
    },
    {
      company: 'DbUp',
      percentageRanked: 25,
      avgRankingPosition: 4.5,
      citationAppearance: 15,
      avgCitationPosition: 6.0,
      overallScore: 60,
      trend: '-2%'
    }
  ];

  // Enhanced AI Engine Rankings
  const aiEngineRankings = [
    { 
      engine: 'Perplexity',
      visibility: 45,
      percentageRanked: 45,
      avgRankingPosition: 2.5,
      citationAppearance: 38,
      avgCitationPosition: 3.8,
      color: 'indigo'
    },
    { 
      engine: 'SearchGPT',
      visibility: 32,
      percentageRanked: 35,
      avgRankingPosition: 3.2,
      citationAppearance: 28,
      avgCitationPosition: 5.2,
      color: 'emerald'
    },
    { 
      engine: 'Gemini',
      visibility: 38,
      percentageRanked: 42,
      avgRankingPosition: 2.8,
      citationAppearance: 35,
      avgCitationPosition: 4.5,
      color: 'violet'
    },
    { 
      engine: 'Claude',
      visibility: 36,
      percentageRanked: 38,
      avgRankingPosition: 3.0,
      citationAppearance: 32,
      avgCitationPosition: 4.8,
      color: 'amber'
    },
    { 
      engine: 'MetaAI',
      visibility: 24,
      percentageRanked: 25,
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
      visibilityProbability: 78,
      recommendationProbability: 82,
      avgRanking: 2.4,
      citationAppearances: 45,
      overallScore: 85,
      color: 'blue'
    },
    {
      profile: 'Cloud-Native Startups',
      visibilityProbability: 92,
      recommendationProbability: 88,
      avgRanking: 1.8,
      citationAppearances: 52,
      overallScore: 90,
      color: 'emerald'
    },
    {
      profile: 'Financial Services',
      visibilityProbability: 65,
      recommendationProbability: 70,
      avgRanking: 3.2,
      citationAppearances: 28,
      overallScore: 68,
      color: 'violet'
    },
    {
      profile: 'SaaS Providers',
      visibilityProbability: 85,
      recommendationProbability: 75,
      avgRanking: 2.6,
      citationAppearances: 38,
      overallScore: 78,
      color: 'amber'
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

  // Fix the any type in the customTooltip
  const customTooltip = ({ payload, active }: CustomTooltipProps) => {
    if (!active || !payload?.length) return null;

    const monthlyData = payload[0].payload as MonthlyScore;

    return (
      <div className="p-2 bg-white/90 border border-gray-200 rounded-lg shadow-lg">
        <div className="text-sm font-medium">
          {monthlyData.month}
        </div>
        {payload.map((category) => (
          <div key={category.dataKey} className="flex items-center gap-2">
            <div 
              className="w-2 h-2 rounded-full" 
              style={{ backgroundColor: category.color }}
            />
            <span className="text-sm capitalize">
              {category.dataKey as string}:
            </span>
            <span className="text-sm font-medium">
              {category.value}%
            </span>
          </div>
        ))}
      </div>
    );
  };

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
    estimateSize: () => 80,
    overscan: 5,
  });

  const [hoverState, setHoverState] = useState<{
    isVisible: boolean;
    query: QueryPerformance | null;
    position: { top: number; left: number; };
  }>({
    isVisible: false,
    query: null,
    position: { top: 0, left: 0 },
  });

  const timeoutRef = useRef<NodeJS.Timeout>();

  const handleMouseEnter = useCallback((e: React.MouseEvent<HTMLDivElement>, query: QueryPerformance) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - rect.bottom;
    const spaceAbove = rect.top;
    
    const showAbove = spaceBelow < 400 && spaceAbove > 400;
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    setHoverState({
      isVisible: true,
      query,
      position: {
        top: rect.top + window.scrollY + (showAbove ? -10 : rect.height + 10),
        left: Math.max(16, rect.left),
      },
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    timeoutRef.current = setTimeout(() => {
      setHoverState(prev => ({ ...prev, isVisible: false }));
    }, 200);
  }, []);

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
                          <span className="text-sm">Sources Ranking: {payload[0].payload.percentageRanked}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="text-sm">Avg Rank: #{payload[0].payload.avgRankingPosition.toFixed(1)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-amber-500" />
                          <span className="text-sm">Sources Citing: {payload[0].payload.citationAppearance}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-violet-500" />
                          <span className="text-sm">Avg Citation Pos: #{payload[0].payload.avgCitationPosition.toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  );
                }}
              />
              
              {/* Metric cards below the chart */}
              <div className="grid grid-cols-4 gap-4 mt-6">
                <Card decoration="top" decorationColor="blue">
                  <Text>Content Ranked</Text>
                  <Metric className="text-blue-600">
                    {monthlyScores[monthlyScores.length - 1].percentageRanked}%
                  </Metric>
                  <Text className="text-sm text-gray-500">Ranking coverage</Text>
                </Card>
                
                <Card decoration="top" decorationColor="emerald">
                  <Text>Average Position</Text>
                  <Metric className="text-emerald-600">
                    #{monthlyScores[monthlyScores.length - 1].avgRankingPosition.toFixed(1)}
                  </Metric>
                  <Text className="text-sm text-gray-500">Ranking position</Text>
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
                        <Text className="text-xs font-medium mb-2">Ranking Performance</Text>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Text className="text-xs text-gray-500">Content Ranked</Text>
                            <div className="flex items-baseline gap-1">
                              <Text className="font-semibold">{engine.percentageRanked}</Text>
                              <Text className="text-xs text-gray-500">%</Text>
                            </div>
                          </div>
                          <div>
                            <Text className="text-xs text-gray-500">Avg Position</Text>
                            <div className="flex items-baseline gap-1">
                              <Text className="font-semibold">#{engine.avgRankingPosition.toFixed(1)}</Text>
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
          {/* Query Appearances - Full Width */}
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
                          <div 
                            className="group hover:bg-blue-50 transition-colors border-b border-gray-200"
                            onMouseEnter={(e) => handleMouseEnter(e, query)}
                            onMouseLeave={handleMouseLeave}
                          >
                            <div className="grid items-center" style={{ gridTemplateColumns: '1fr repeat(5, 80px)' }}>
                              <div className="px-3 py-2 min-w-0">
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
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
                      <Grid numItems={2} className="gap-4">
                        <Card decoration="left" decorationColor="blue" className="bg-white">
                          <Text className="font-medium mb-2">Ranking Performance</Text>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Text className="text-sm text-gray-600">Content Ranked</Text>
                              <div className="flex items-baseline gap-1">
                                <Text className="font-semibold">{competitor.percentageRanked}</Text>
                                <Text className="text-sm text-gray-500">%</Text>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <Text className="text-sm text-gray-600">Average Position</Text>
                              <Text className="font-semibold">#{competitor.avgRankingPosition.toFixed(1)}</Text>
                            </div>
                          </div>
                        </Card>

                        <Card decoration="left" decorationColor="emerald" className="bg-white">
                          <Text className="font-medium mb-2">Citation Performance</Text>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <Text className="text-sm text-gray-600">Citation Appearances</Text>
                              <div className="flex items-baseline gap-1">
                                <Text className="font-semibold">{competitor.citationAppearance}</Text>
                                <Text className="text-sm text-gray-500">%</Text>
                              </div>
                            </div>
                            <div className="flex justify-between items-center">
                              <Text className="text-sm text-gray-600">Average Position</Text>
                              <Text className="font-semibold">#{competitor.avgCitationPosition.toFixed(1)}</Text>
                            </div>
                          </div>
                        </Card>
                      </Grid>

                      <div className="mt-4">
                        <div className="w-full bg-gray-100 rounded-full h-2">
                          <div 
                            className="h-2 rounded-full bg-blue-500 transition-all duration-500"
                            style={{ width: `${competitor.overallScore}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </details>
                ))}
            </div>
          </Card>

          {/* ICP Analysis */}
          <Card className="bg-white/50 backdrop-blur-sm">
            <Title>ICP Performance Analysis</Title>
            <div className="space-y-6 mt-4">
              {icpData.map((icp) => (
                <Card key={icp.profile} decoration="top" decorationColor={icp.color}>
                  <div className="space-y-4">
                    <div className="flex justify-between items-start">
                      <Text className="font-medium text-lg">{icp.profile}</Text>
                      <Badge size="lg" color={icp.color}>
                        Score: {icp.overallScore}%
                      </Badge>
                    </div>

                    <Grid numItems={2} className="gap-4">
                      <Card decoration="left" decorationColor={icp.color} className="bg-white/50">
                        <Text className="text-sm font-medium mb-2">Visibility Metrics</Text>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <Text className="text-xs text-gray-500">Visibility Probability</Text>
                            <Text className="font-medium">{icp.visibilityProbability}%</Text>
                          </div>
                          <div className="flex justify-between items-center">
                            <Text className="text-xs text-gray-500">Recommendation Probability</Text>
                            <Text className="font-medium">{icp.recommendationProbability}%</Text>
                          </div>
                        </div>
                      </Card>

                      <Card decoration="left" decorationColor={icp.color} className="bg-white/50">
                        <Text className="text-sm font-medium mb-2">Performance Metrics</Text>
                        <div className="space-y-2">
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
                    </Grid>

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
                </Card>
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

        {hoverState.query && (
          <HoverCard 
            query={hoverState.query}
            platforms={platforms}
            isVisible={hoverState.isVisible}
            position={hoverState.position}
          />
        )}
      </div>
    </div>
  );
} 