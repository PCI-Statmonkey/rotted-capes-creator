import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"; 
import { Slider } from "@/components/ui/slider";
import { 
  TrendingUp, 
  BarChart3, 
  PieChart, 
  Calendar, 
  PanelBottomClose, 
  RefreshCcw, 
  Download,
  ArrowUpRight,
  Target,
  LayoutGrid,
  Server,
  Layers
} from "lucide-react";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Scatter,
  ScatterChart,
  ZAxis,
  BarChart,
  Bar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ComposedChart,
  Line
} from "recharts";

// Mock data utilities - will be replaced with real data in production
const getTimeSeriesData = (days = 30) => {
  const result = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (days - i - 1));
    result.push({
      date: date.toISOString().substr(0, 10),
      characterCreations: Math.floor(Math.random() * 10) + 1,
      logins: Math.floor(Math.random() * 20) + 5,
      pdfExports: Math.floor(Math.random() * 8),
    });
  }
  return result;
};

const getAttributeCorrelationData = () => {
  const attributes = [
    'strength', 'dexterity', 'constitution', 
    'intelligence', 'wisdom', 'charisma'
  ];
  
  const result = [];
  
  // Create correlation clusters for interesting patterns
  for (let i = 0; i < 30; i++) {
    const baseStr = Math.floor(Math.random() * 5) + 1;
    const baseDex = Math.floor(Math.random() * 5) + 1;
    
    // Cluster 1: High STR/CON characters (brawlers)
    if (i < 10) {
      result.push({
        strength: baseStr + 4,
        dexterity: baseDex + 1,
        constitution: baseStr + 3,
        intelligence: Math.max(1, baseStr - 2),
        wisdom: 3,
        charisma: Math.floor(Math.random() * 5) + 1,
        powerCount: Math.floor(Math.random() * 3) + 2,
        characterType: "Brawler"
      });
    } 
    // Cluster 2: High DEX/INT characters (tech/nimble types)
    else if (i < 20) {
      result.push({
        strength: Math.max(1, baseStr - 1),
        dexterity: baseDex + 4,
        constitution: Math.max(1, baseStr),
        intelligence: baseDex + 3,
        wisdom: Math.floor(Math.random() * 3) + 3,
        charisma: Math.floor(Math.random() * 4) + 2,
        powerCount: Math.floor(Math.random() * 4) + 3,
        characterType: "Tech"
      });
    } 
    // Cluster 3: High WIS/CHA characters (leaders/mystics)
    else {
      result.push({
        strength: Math.max(1, baseStr),
        dexterity: Math.max(1, baseDex),
        constitution: Math.max(1, baseStr + 1),
        intelligence: baseDex + 2,
        wisdom: baseDex + 4,
        charisma: baseStr + 4,
        powerCount: Math.floor(Math.random() * 5) + 2,
        characterType: "Mystic"
      });
    }
  }
  
  return result;
};

const getPowerDistributionData = () => [
  { name: 'Movement', value: 65 },
  { name: 'Attack', value: 85 },
  { name: 'Defense', value: 45 },
  { name: 'Utility', value: 35 },
  { name: 'Mental', value: 25 },
];

const getCharacterTypeRadarData = () => [
  {
    "type": "Strength",
    "Brawler": 5,
    "Tech": 2,
    "Mystic": 3,
  },
  {
    "type": "Dexterity",
    "Brawler": 3,
    "Tech": 5,
    "Mystic": 2,
  },
  {
    "type": "Constitution",
    "Brawler": 5,
    "Tech": 2,
    "Mystic": 3,
  },
  {
    "type": "Intelligence",
    "Brawler": 2,
    "Tech": 5,
    "Mystic": 4,
  },
  {
    "type": "Wisdom",
    "Brawler": 2,
    "Tech": 4,
    "Mystic": 5,
  },
  {
    "type": "Charisma",
    "Brawler": 3,
    "Tech": 3,
    "Mystic": 5,
  },
];

// Helper function to format dates for charts
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return `${date.getMonth() + 1}/${date.getDate()}`;
};

// Colors for the charts
const COLORS = ['#f44336', '#ff9800', '#ffc107', '#4caf50', '#2196f3', '#9c27b0'];

type AdvancedAnalyticsProps = {
  analyticsData?: any[];
  isLoading?: boolean;
  onRefresh?: () => void;
};

export default function AdvancedAnalytics({ 
  analyticsData = [], 
  isLoading = false,
  onRefresh = () => {}
}: AdvancedAnalyticsProps) {
  const [timeRange, setTimeRange] = useState("month");
  const [chartType, setChartType] = useState("area");
  const [timeSeriesData, setTimeSeriesData] = useState(getTimeSeriesData());
  
  // Change time range data
  useEffect(() => {
    let days = 30;
    if (timeRange === "week") days = 7;
    if (timeRange === "quarter") days = 90;
    
    setTimeSeriesData(getTimeSeriesData(days));
  }, [timeRange]);
  
  // Here you'd process real analytics data instead of using the mock data
  // This would replace the mock data generators with real data processing
  
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-comic text-2xl text-accent">Advanced Analytics</h2>
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex items-center" 
            size="sm"
            onClick={onRefresh}
          >
            <RefreshCcw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
          <Button 
            variant="outline" 
            className="flex items-center" 
            size="sm"
          >
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-panel halftone-bg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <TrendingUp className="mr-2 h-4 w-4 text-accent" />
              Character Creation Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-comic">+24%</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
              <span className="text-green-500 font-medium">Increasing</span> from last period
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-panel halftone-bg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Target className="mr-2 h-4 w-4 text-accent" />
              Most Popular Origin
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-comic">Super-Human</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="font-medium">35%</span> of characters
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-panel halftone-bg">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Layers className="mr-2 h-4 w-4 text-accent" />
              Avg. Character Complexity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-comic">High</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <span className="font-medium">3.8 powers</span> per character
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="timeseries" className="w-full">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-6 gap-4">
          <TabsList className="grid w-full sm:w-auto grid-cols-3">
            <TabsTrigger value="timeseries" className="font-comic">
              <Calendar className="h-4 w-4 mr-2" />
              Time Series
            </TabsTrigger>
            <TabsTrigger value="correlations" className="font-comic">
              <LayoutGrid className="h-4 w-4 mr-2" />
              Correlations
            </TabsTrigger>
            <TabsTrigger value="patterns" className="font-comic">
              <Server className="h-4 w-4 mr-2" />
              Patterns
            </TabsTrigger>
          </TabsList>
          
          <div className="flex space-x-4">
            {/* Conditional controls based on the active tab */}
            <TabsContent value="timeseries" className="m-0 p-0 border-none flex items-center space-x-4">
              <Select value={timeRange} onValueChange={setTimeRange}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Last Week</SelectItem>
                  <SelectItem value="month">Last Month</SelectItem>
                  <SelectItem value="quarter">Last Quarter</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={chartType} onValueChange={setChartType}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Chart Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="area">Area Chart</SelectItem>
                  <SelectItem value="bar">Bar Chart</SelectItem>
                  <SelectItem value="composed">Composed</SelectItem>
                </SelectContent>
              </Select>
            </TabsContent>
          </div>
        </div>
        
        <TabsContent value="timeseries" className="m-0 p-0 border-none">
          <Card className="bg-panel halftone-bg comic-border">
            <CardHeader>
              <CardTitle className="font-comic text-xl flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-accent" />
                Activity Over Time
              </CardTitle>
              <CardDescription>
                Track character creation and user activity trends over time
              </CardDescription>
            </CardHeader>
            <CardContent className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                {chartType === 'area' && (
                  <AreaChart data={timeSeriesData}>
                    <defs>
                      <linearGradient id="colorCharacters" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f44336" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f44336" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorLogins" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2196f3" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#2196f3" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorExports" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4caf50" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#4caf50" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      interval={Math.floor(timeSeriesData.length / 7)}
                    />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip 
                      labelFormatter={(val) => `Date: ${new Date(val).toLocaleDateString()}`}
                    />
                    <Legend />
                    <Area 
                      type="monotone" 
                      dataKey="characterCreations" 
                      stroke="#f44336" 
                      fillOpacity={1} 
                      fill="url(#colorCharacters)" 
                      name="Character Creations"
                    />
                    <Area 
                      type="monotone" 
                      dataKey="logins" 
                      stroke="#2196f3" 
                      fillOpacity={1} 
                      fill="url(#colorLogins)"
                      name="User Logins" 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="pdfExports" 
                      stroke="#4caf50" 
                      fillOpacity={1} 
                      fill="url(#colorExports)"
                      name="PDF Exports" 
                    />
                  </AreaChart>
                )}
                
                {chartType === 'bar' && (
                  <BarChart data={timeSeriesData}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      interval={Math.floor(timeSeriesData.length / 7)}
                    />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip 
                      labelFormatter={(val) => `Date: ${new Date(val).toLocaleDateString()}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="characterCreations" 
                      fill="#f44336" 
                      name="Character Creations" 
                    />
                    <Bar 
                      dataKey="logins" 
                      fill="#2196f3"
                      name="User Logins" 
                    />
                    <Bar 
                      dataKey="pdfExports" 
                      fill="#4caf50"
                      name="PDF Exports" 
                    />
                  </BarChart>
                )}
                
                {chartType === 'composed' && (
                  <ComposedChart data={timeSeriesData}>
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      interval={Math.floor(timeSeriesData.length / 7)}
                    />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip 
                      labelFormatter={(val) => `Date: ${new Date(val).toLocaleDateString()}`}
                    />
                    <Legend />
                    <Bar 
                      dataKey="characterCreations" 
                      fill="#f44336" 
                      name="Character Creations" 
                    />
                    <Bar 
                      dataKey="pdfExports" 
                      fill="#4caf50"
                      name="PDF Exports" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="logins" 
                      stroke="#2196f3"
                      name="User Logins" 
                    />
                  </ComposedChart>
                )}
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="correlations" className="m-0 p-0 border-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-panel halftone-bg comic-border">
              <CardHeader>
                <CardTitle className="font-comic text-xl flex items-center">
                  <BarChart3 className="mr-2 h-5 w-5 text-accent" />
                  Ability Score Distribution
                </CardTitle>
                <CardDescription>
                  Correlation between character types and ability scores
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart outerRadius={90} data={getCharacterTypeRadarData()}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="type" />
                    <PolarRadiusAxis angle={30} domain={[0, 5]} />
                    <Radar 
                      name="Brawler" 
                      dataKey="Brawler" 
                      stroke="#f44336" 
                      fill="#f44336" 
                      fillOpacity={0.6} 
                    />
                    <Radar 
                      name="Tech" 
                      dataKey="Tech" 
                      stroke="#2196f3" 
                      fill="#2196f3" 
                      fillOpacity={0.6} 
                    />
                    <Radar 
                      name="Mystic" 
                      dataKey="Mystic" 
                      stroke="#4caf50" 
                      fill="#4caf50" 
                      fillOpacity={0.6} 
                    />
                    <Legend />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="bg-panel halftone-bg comic-border">
              <CardHeader>
                <CardTitle className="font-comic text-xl flex items-center">
                  <LayoutGrid className="mr-2 h-5 w-5 text-accent" />
                  Character Attribute Correlation
                </CardTitle>
                <CardDescription>
                  Correlation between strength and dexterity scores
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <ScatterChart>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      type="number" 
                      dataKey="strength" 
                      name="Strength" 
                      domain={[0, 7]}
                    />
                    <YAxis 
                      type="number" 
                      dataKey="dexterity" 
                      name="Dexterity" 
                      domain={[0, 7]}
                    />
                    <ZAxis 
                      type="number" 
                      range={[50, 400]} 
                      dataKey="powerCount" 
                      name="Power Count"
                    />
                    <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={(value) => value} />
                    <Legend />
                    <Scatter 
                      name="Brawler Types" 
                      data={getAttributeCorrelationData().filter(d => d.characterType === "Brawler")} 
                      fill="#f44336" 
                    />
                    <Scatter 
                      name="Tech Types" 
                      data={getAttributeCorrelationData().filter(d => d.characterType === "Tech")} 
                      fill="#2196f3" 
                    />
                    <Scatter 
                      name="Mystic Types" 
                      data={getAttributeCorrelationData().filter(d => d.characterType === "Mystic")} 
                      fill="#4caf50" 
                    />
                  </ScatterChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="patterns" className="m-0 p-0 border-none">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card className="bg-panel halftone-bg comic-border">
              <CardHeader>
                <CardTitle className="font-comic text-xl flex items-center">
                  <PieChart className="mr-2 h-5 w-5 text-accent" />
                  Powers Distribution
                </CardTitle>
                <CardDescription>
                  Categorization of power types across all characters
                </CardDescription>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={getPowerDistributionData()}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <CartesianGrid strokeDasharray="3 3" />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#f44336" name="Frequency" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card className="bg-panel halftone-bg comic-border">
              <CardHeader>
                <CardTitle className="font-comic text-xl flex items-center">
                  <PanelBottomClose className="mr-2 h-5 w-5 text-accent" />
                  User Adoption Insights
                </CardTitle>
                <CardDescription>
                  Key metrics for user engagement and retention
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm">User Retention</p>
                      <Badge variant="outline">72%</Badge>
                    </div>
                    <Slider value={[72]} max={100} disabled />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm">Character Completion Rate</p>
                      <Badge variant="outline">85%</Badge>
                    </div>
                    <Slider value={[85]} max={100} disabled />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm">PDF Export Rate</p>
                      <Badge variant="outline">64%</Badge>
                    </div>
                    <Slider value={[64]} max={100} disabled />
                  </div>
                  
                  <div>
                    <div className="flex justify-between mb-1">
                      <p className="text-sm">Feature Discovery</p>
                      <Badge variant="outline">58%</Badge>
                    </div>
                    <Slider value={[58]} max={100} disabled />
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-medium mb-2">Key Insights</h4>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start">
                        <ArrowUpRight className="mt-0.5 mr-2 h-3 w-3 text-green-500" />
                        <span>Most users complete character creation in one session</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowUpRight className="mt-0.5 mr-2 h-3 w-3 text-green-500" />
                        <span>Power selection has highest engagement time</span>
                      </li>
                      <li className="flex items-start">
                        <ArrowUpRight className="mt-0.5 mr-2 h-3 w-3 text-amber-500" />
                        <span>PDF exports correlate with return visits</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}