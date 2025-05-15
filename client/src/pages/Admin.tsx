import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/AuthContext";
import { saveAnalyticsEvent } from "@/lib/api";
import { trackEvent } from "@/lib/analytics";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

import {
  Database,
  Users,
  Swords,
  Shield,
  BookOpen,
  Zap,
  Sparkles,
  Lightbulb
} from "lucide-react";

export default function AdminPage() {
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const { currentUser, isAdmin, isLoading } = useAuth();
  const [hasDirectAccess, setHasDirectAccess] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  
  // Check for special Opera admin access
  useEffect(() => {
    const directAccess = localStorage.getItem('isAdmin') === 'true';
    setHasDirectAccess(directAccess);
  }, []);
  
  // Redirect if not logged in or not admin
  useEffect(() => {
    // Don't redirect if the user has direct admin access OR if opera admin is set in localStorage
    if (hasDirectAccess || localStorage.getItem('isAdmin') === 'true') {
      return;
    }
    
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
        description: "You don't have permission to access the admin dashboard.",
        variant: "destructive"
      });
    }
  }, [currentUser, isAdmin, isLoading, navigate, toast, hasDirectAccess]);
  
  // Log admin page view for analytics
  useEffect(() => {
    if ((currentUser && isAdmin) || hasDirectAccess) {
      // Record analytics event
      if (currentUser) {
        saveAnalyticsEvent('admin_view', {
          userId: currentUser.uid
        }, currentUser.uid);
      } else if (hasDirectAccess) {
        saveAnalyticsEvent('admin_view', {
          userId: 'opera-admin-user',
          note: 'Opera browser direct access'
        }, 'opera-admin-user');
      }
      
      // Track in Google Analytics
      trackEvent('admin_view', 'admin');
    }
  }, [currentUser, isAdmin, hasDirectAccess]);

  // Placeholder for actual admin functionalities
  const contentCards = [
    {
      id: "origins",
      title: "Origins",
      description: "Edit character origins and their special abilities",
      icon: <Shield className="h-5 w-5 text-blue-500" />,
      action: () => navigate("/admin/origins")
    },
    {
      id: "archetypes",
      title: "Archetypes",
      description: "Manage character archetypes and their abilities",
      icon: <Swords className="h-5 w-5 text-red-500" />,
      action: () => navigate("/admin/archetypes")
    },
    {
      id: "skills",
      title: "Skills",
      description: "Edit individual skills and their descriptions",
      icon: <BookOpen className="h-5 w-5 text-green-500" />,
      action: () => navigate("/admin/skills")
    },
    {
      id: "feats",
      title: "Feats",
      description: "Manage feats and their prerequisites",
      icon: <Sparkles className="h-5 w-5 text-purple-500" />,
      action: () => navigate("/admin/feats")
    },
    {
      id: "skillsets",
      title: "Skill Sets",
      description: "Edit skill sets and their included skills and feats",
      icon: <BookOpen className="h-5 w-5 text-teal-500" />,
      action: () => navigate("/admin/skill-sets")
    },
    {
      id: "powers",
      title: "Powers",
      description: "Manage powers and their effects",
      icon: <Zap className="h-5 w-5 text-yellow-500" />,
      action: () => navigate("/admin/powers")
    },
    {
      id: "powersets",
      title: "Power Sets",
      description: "Edit power sets and their included powers",
      icon: <Lightbulb className="h-5 w-5 text-amber-500" />,
      action: () => navigate("/admin/power-sets")
    },
    {
      id: "users",
      title: "Users",
      description: "Manage user accounts and permissions",
      icon: <Users className="h-5 w-5 text-gray-500" />,
      action: () => navigate("/admin/users")
    }
  ];

  const handleTabChange = (value: string) => {
    setActiveTab(value);
    // Track tab change in analytics
    trackEvent('admin_tab_change', 'admin', value);
  };

  if (isLoading) {
    // Show loading state
    return (
      <div className="container mx-auto py-8 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
        <p className="mt-4 text-muted-foreground">Loading admin dashboard...</p>
      </div>
    );
  }

  // Only render content if user is admin or has direct access
  if (!isAdmin && !hasDirectAccess && localStorage.getItem('isAdmin') !== 'true' && !isLoading) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center mb-8">
        <Database className="h-8 w-8 mr-3 text-accent" />
        <h1 className="text-4xl font-comic">Admin Dashboard</h1>
      </div>
      
      <Tabs defaultValue="overview" value={activeTab} onValueChange={handleTabChange} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="content">Game Content</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Welcome to Admin Dashboard</CardTitle>
              <CardDescription>
                Manage game content, users, and view analytics data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p>From here, you can:</p>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Edit game content like Origins, Archetypes, Skills, Feats, and Powers</li>
                <li>Manage user accounts and permissions</li>
                <li>View analytics data about character creation trends</li>
                <li>Update game content to match errata or add new options as new products are published</li>
              </ul>
            </CardContent>
            <CardFooter>
              <p className="text-sm text-muted-foreground">
                Access to this section is restricted to admin users only.
              </p>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="content" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {contentCards
              .filter(card => card.id !== "users")
              .map(card => (
                <Card key={card.id} className="overflow-hidden">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">{card.title}</CardTitle>
                    {card.icon}
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">
                      {card.description}
                    </p>
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Button 
                      variant="default" 
                      size="sm" 
                      onClick={card.action}
                      className="w-full"
                    >
                      Manage {card.title}
                    </Button>
                  </CardFooter>
                </Card>
              ))}
          </div>
        </TabsContent>
        
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>
                View and manage user accounts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black/5 dark:bg-white/5 rounded-md p-4 text-center">
                <Users className="h-12 w-12 mx-auto text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  User management features coming soon
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={() => toast({
                  title: "Feature in Development",
                  description: "User management features will be available soon.",
                })}
              >
                <Users className="h-4 w-4 mr-2" />
                View Users
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                View character creation statistics and usage data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="bg-black/5 dark:bg-white/5 rounded-md p-4 text-center">
                <p className="text-muted-foreground">
                  For detailed analytics, visit the Analytics page
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                variant="default" 
                size="sm" 
                className="w-full"
                onClick={() => navigate("/analytics")}
              >
                Go to Analytics
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}