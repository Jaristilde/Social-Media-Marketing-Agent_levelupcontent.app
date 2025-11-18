import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { Sparkles, Instagram, Music, Zap, TrendingUp, Target } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Home() {
  const { user, loading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (!loading && user) {
      setLocation("/dashboard");
    }
  }, [user, loading, setLocation]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Don't render landing page if user is authenticated (will redirect via useEffect)
  if (user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="container mx-auto px-4 py-6 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <img src={APP_LOGO} alt={APP_TITLE} className="h-10 w-10" />
          <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            {APP_TITLE}
          </h1>
        </div>
        <Button onClick={() => window.location.href = getLoginUrl()} size="lg">
          Get Started
        </Button>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium text-purple-600 border border-purple-200">
            <Sparkles className="h-4 w-4" />
            AI-Powered Social Media Marketing
          </div>
          
          <h2 className="text-5xl md:text-6xl font-bold leading-tight">
            Create Viral Content for{" "}
            <span className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 bg-clip-text text-transparent">
              Instagram & TikTok
            </span>
          </h2>
          
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate engaging captions, trending hashtags, and creative content ideas in seconds. 
            Let AI handle your social media marketing while you focus on growing your business.
          </p>
          
          <div className="flex gap-4 justify-center flex-wrap">
            <Button 
              size="lg" 
              className="text-lg px-8 py-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              onClick={() => window.location.href = getLoginUrl()}
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Start Creating Free
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-6"
              onClick={() => setLocation("/guide")}
            >
              View Posting Guide
            </Button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need to Go Viral</h3>
          <p className="text-gray-600 text-lg">Powerful AI tools designed for modern social media marketers</p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          <Card className="border-2 hover:border-purple-300 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Sparkles className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>AI Caption Generator</CardTitle>
              <CardDescription>
                Create compelling, platform-optimized captions that capture attention and drive engagement
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-pink-300 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle>Trending Hashtags</CardTitle>
              <CardDescription>
                Get relevant, trending hashtags tailored to your content and target audience
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-orange-300 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Content Ideas</CardTitle>
              <CardDescription>
                Never run out of ideas with AI-generated content suggestions for your niche
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-300 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Instagram className="h-6 w-6 text-purple-600" />
              </div>
              <CardTitle>Instagram Optimized</CardTitle>
              <CardDescription>
                Content specifically crafted for Instagram's algorithm and audience preferences
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-pink-300 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Music className="h-6 w-6 text-pink-600" />
              </div>
              <CardTitle>TikTok Ready</CardTitle>
              <CardDescription>
                Viral-worthy content designed for TikTok's fast-paced, creative environment
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-orange-300 transition-colors">
            <CardHeader>
              <div className="h-12 w-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="h-6 w-6 text-orange-600" />
              </div>
              <CardTitle>Content Library</CardTitle>
              <CardDescription>
                Save, organize, and manage all your generated content in one place
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* How It Works */}
      <section className="container mx-auto px-4 py-20 bg-white/50 backdrop-blur-sm rounded-3xl">
        <div className="text-center mb-16">
          <h3 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h3>
          <p className="text-gray-600 text-lg">Get started in three simple steps</p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
              1
            </div>
            <h4 className="text-xl font-semibold">Set Up Your Profile</h4>
            <p className="text-gray-600">
              Tell us about your app, target audience, and brand voice
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-gradient-to-br from-pink-600 to-orange-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
              2
            </div>
            <h4 className="text-xl font-semibold">Generate Content</h4>
            <p className="text-gray-600">
              Use AI to create captions, hashtags, and content ideas instantly
            </p>
          </div>
          
          <div className="text-center space-y-4">
            <div className="h-16 w-16 bg-gradient-to-br from-orange-600 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto">
              3
            </div>
            <h4 className="text-xl font-semibold">Post & Grow</h4>
            <p className="text-gray-600">
              Copy your content and post to Instagram or TikTok to grow your audience
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-3xl mx-auto space-y-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl p-12 text-white">
          <h3 className="text-4xl font-bold">Ready to Create Viral Content?</h3>
          <p className="text-xl text-purple-100">
            Join thousands of marketers using AI to grow their social media presence
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            className="text-lg px-8 py-6 bg-white text-purple-600 hover:bg-gray-100"
            onClick={() => window.location.href = getLoginUrl()}
          >
            <Sparkles className="mr-2 h-5 w-5" />
            Get Started Free
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="container mx-auto px-4 py-8 text-center text-gray-600 border-t">
        <p>© 2025 {APP_TITLE}. Powered by AI for Instagram & TikTok Marketing.</p>
      </footer>
    </div>
  );
}
