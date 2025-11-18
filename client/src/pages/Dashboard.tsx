import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Sparkles, Library, FolderKanban, Instagram, BookOpen, LogOut, User } from "lucide-react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";

export default function Dashboard() {
  const { user, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const logoutMutation = trpc.auth.logout.useMutation();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync();
    logout();
    setLocation("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    window.location.href = getLoginUrl();
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              {APP_TITLE}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => setLocation("/app-profile")}>
              <User className="h-4 w-4 mr-2" />
              {user.name || user.email}
            </Button>
            <Button variant="ghost" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Welcome Section */}
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Welcome back, {user.name?.split(' ')[0] || 'there'}! 👋</h2>
            <p className="text-gray-600 text-lg">What would you like to create today?</p>
          </div>

          {/* Quick Actions */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-purple-300"
              onClick={() => setLocation("/generate")}
            >
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Generate Content</CardTitle>
                <CardDescription>
                  Create AI-powered captions, hashtags, and content ideas
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-pink-300"
              onClick={() => setLocation("/library")}
            >
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-br from-pink-600 to-orange-600 rounded-lg flex items-center justify-center mb-4">
                  <Library className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Content Library</CardTitle>
                <CardDescription>
                  View and manage your saved content
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-orange-300"
              onClick={() => setLocation("/campaigns")}
            >
              <CardHeader>
                <div className="h-12 w-12 bg-gradient-to-br from-orange-600 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                  <FolderKanban className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Campaigns</CardTitle>
                <CardDescription>
                  Organize content into marketing campaigns
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-purple-300"
              onClick={() => setLocation("/accounts")}
            >
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Instagram className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Social Accounts</CardTitle>
                <CardDescription>
                  Manage your Instagram and TikTok accounts
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-pink-300"
              onClick={() => setLocation("/guide")}
            >
              <CardHeader>
                <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                  <BookOpen className="h-6 w-6 text-pink-600" />
                </div>
                <CardTitle>Posting Guide</CardTitle>
                <CardDescription>
                  Learn how to post on Instagram and TikTok
                </CardDescription>
              </CardHeader>
            </Card>

            <Card 
              className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-orange-300"
              onClick={() => setLocation("/app-profile")}
            >
              <CardHeader>
                <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <User className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>App Profile</CardTitle>
                <CardDescription>
                  Update your app information and preferences
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          {/* Getting Started Tips */}
          <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-purple-600" />
                Quick Tips to Get Started
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">1.</span>
                  <span>Set up your <button className="text-purple-600 font-medium underline" onClick={() => setLocation("/app-profile")}>App Profile</button> to get personalized content</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">2.</span>
                  <span>Generate your first content using the <button className="text-purple-600 font-medium underline" onClick={() => setLocation("/generate")}>Content Generator</button></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">3.</span>
                  <span>Save great content to your library for future use</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-purple-600 font-bold">4.</span>
                  <span>Check the <button className="text-purple-600 font-medium underline" onClick={() => setLocation("/guide")}>Posting Guide</button> to learn how to post on Instagram and TikTok</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
