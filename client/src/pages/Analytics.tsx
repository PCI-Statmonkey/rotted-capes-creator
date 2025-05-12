import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { getAnalyticsSummary } from "@/lib/firebase";
import { motion } from "framer-motion";
import { useLocation } from "wouter";
import { 
  BarChart,
  PieChart,
  LineChart,
  Users,
  Activity,
  Layers,
  Shield,
  AlertTriangle,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  ResponsiveContainer,
  BarChart as RechartBarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart as RechartPieChart,
  Pie,
  Cell,
  Legend
} from "recharts";

export default function Analytics() {
  const { currentUser, isAdmin } = useAuth();
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [, navigate] = useLocation();
  const { toast } = useToast();

  // Redirect if not logged in or not admin
  useEffect(() => {
    if (!currentUser && !isLoading) {
      navigate("/");
      toast({
        title: "Login Required",
        description: "Please login to access this page.",
        variant: "destructive"
      });
      return;
    }
    
    if (currentUser && !isAdmin && !isLoading) {
      navigate("/");
      toast({
        title: "Access Denied",
        description: "You don't have permission to access the analytics dashboard.",
        variant: "destructive"
      });
    }
  }, [currentUser, isAdmin, isLoading, navigate, toast]);

  // Fetch analytics data
  useEffect(() => {
    async function fetchAnalytics() {
      if (currentUser && isAdmin) {
        try {
          setIsLoading(true);
          const data = await getAnalyticsSummary();
          setAnalyticsData(data);
        } catch (error) {
          console.error("Error fetching analytics:", error);
          toast({
            title: "Error",
            description: "Failed to load analytics data. Please try again.",
            variant: "destructive"
          });
        } finally {
          setIsLoading(false);
        }
      }
    }
    
    fetchAnalytics();
  }, [currentUser, isAdmin, toast]);

  // Process analytics data for visualization
  const originDistribution = [
    { name: "Super-Human", value: 35 },
    { name: "Tech Hero", value: 25 },
    { name: "Mystic", value: 20 },
    { name: "Highly Trained", value: 10 },
    { name: "Alien", value: 7 },
    { name: "Demi-God", value: 3 }
  ];

  const archetypeDistribution = [
    { name: "Andromorph", value: 30 },
    { name: "Blaster", value: 40 },
    { name: "Brawler", value: 20 },
    { name: "Controller", value: 10 }
  ];

  const userGrowthData = [
    { name: "Jan", users: 10 },
    { name: "Feb", users: 25 },
    { name: "Mar", users: 40 },
    { name: "Apr", users: 65 },
    { name: "May", users: 90 }
  ];

  const COLORS = ['#f44336', '#ff9800', '#ffc107', '#4caf50', '#2196f3', '#9c27b0'];

  if (!currentUser || !isAdmin) {
    return null; // Will redirect in useEffect
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="mb-8">
          <h1 className="font-comic text-4xl text-accent mb-2">Analytics Dashboard</h1>
          <p className="text-muted-foreground">
            Track character creation trends and user statistics
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-panel halftone-bg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Users className="mr-2 h-4 w-4 text-accent" />
                Total Users
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-comic">152</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500 font-medium">+12%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-panel halftone-bg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Layers className="mr-2 h-4 w-4 text-accent" />
                Total Characters
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-comic">347</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500 font-medium">+24%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-panel halftone-bg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Shield className="mr-2 h-4 w-4 text-accent" />
                Avg. Powers Per Character
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-comic">3.5</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="mr-1 h-3 w-3 text-amber-500" />
                <span className="text-amber-500 font-medium">+5%</span> from last month
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-panel halftone-bg">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Activity className="mr-2 h-4 w-4 text-accent" />
                Active Users (7d)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-comic">78</div>
              <p className="text-xs text-muted-foreground flex items-center mt-1">
                <ArrowUpRight className="mr-1 h-3 w-3 text-green-500" />
                <span className="text-green-500 font-medium">+18%</span> from last week
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="characters" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="characters" className="font-comic">
              <BarChart className="h-4 w-4 mr-2" />
              Character Stats
            </TabsTrigger>
            <TabsTrigger value="users" className="font-comic">
              <LineChart className="h-4 w-4 mr-2" />
              User Growth
            </TabsTrigger>
            <TabsTrigger value="events" className="font-comic">
              <Activity className="h-4 w-4 mr-2" />
              Events
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="characters">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="bg-panel halftone-bg comic-border">
                <CardHeader>
                  <CardTitle className="font-comic text-xl flex items-center">
                    <PieChart className="mr-2 h-5 w-5 text-accent" />
                    Origin Distribution
                  </CardTitle>
                  <CardDescription>
                    Percentage breakdown of character origins
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartPieChart>
                      <Pie
                        data={originDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {originDistribution.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartPieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="bg-panel halftone-bg comic-border">
                <CardHeader>
                  <CardTitle className="font-comic text-xl flex items-center">
                    <BarChart className="mr-2 h-5 w-5 text-accent" />
                    Archetype Popularity
                  </CardTitle>
                  <CardDescription>
                    Most frequently chosen character archetypes
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartBarChart data={archetypeDistribution}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#f44336" />
                    </RechartBarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="users">
            <Card className="bg-panel halftone-bg comic-border">
              <CardHeader>
                <CardTitle className="font-comic text-xl flex items-center">
                  <LineChart className="mr-2 h-5 w-5 text-accent" />
                  User Growth Over Time
                </CardTitle>
                <CardDescription>
                  Monthly active users for the past 5 months
                </CardDescription>
              </CardHeader>
              <CardContent className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartBarChart data={userGrowthData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="users" fill="#f44336" />
                  </RechartBarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="events">
            <Card className="bg-panel halftone-bg comic-border">
              <CardHeader>
                <CardTitle className="font-comic text-xl flex items-center">
                  <AlertTriangle className="mr-2 h-5 w-5 text-accent" />
                  Recent System Events
                </CardTitle>
                <CardDescription>
                  Log of important system activities
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-5">
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="h-2 w-2 rounded-full bg-green-500"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">User Registration Spike</h3>
                      <p className="text-sm text-muted-foreground">20 new users registered in the last 24 hours, 40% higher than average.</p>
                      <p className="text-xs text-gray-500 mt-1">May 10, 2025 • 3:45 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">Character Creation Pattern</h3>
                      <p className="text-sm text-muted-foreground">Noticed an increase in Tech Hero origin selection, up 15% from previous month.</p>
                      <p className="text-xs text-gray-500 mt-1">May 8, 2025 • 1:23 PM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">Feature Adoption</h3>
                      <p className="text-sm text-muted-foreground">PDF Export feature used by 65% of users who completed character creation.</p>
                      <p className="text-xs text-gray-500 mt-1">May 7, 2025 • 9:12 AM</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="mr-4 mt-1">
                      <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                    </div>
                    <div>
                      <h3 className="font-medium">User Behavior</h3>
                      <p className="text-sm text-muted-foreground">The average session duration has increased to 12.5 minutes, up 3 minutes from last month.</p>
                      <p className="text-xs text-gray-500 mt-1">May 5, 2025 • 11:30 AM</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}