import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function AppProfile() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const { data: profile, isLoading } = trpc.appProfile.get.useQuery(undefined, {
    enabled: !!user,
  });
  
  const upsertMutation = trpc.appProfile.upsert.useMutation({
    onSuccess: () => {
      toast.success("Profile saved successfully!");
    },
    onError: (error) => {
      toast.error(`Failed to save profile: ${error.message}`);
    },
  });

  const [formData, setFormData] = useState({
    appName: "",
    appDescription: "",
    targetAudience: "",
    brandVoice: "",
    keywords: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        appName: profile.appName || "",
        appDescription: profile.appDescription || "",
        targetAudience: profile.targetAudience || "",
        brandVoice: profile.brandVoice || "",
        keywords: profile.keywords || "",
      });
    }
  }, [profile]);

  if (authLoading || isLoading) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await upsertMutation.mutateAsync(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              App Profile
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Tell Us About Your App</CardTitle>
              <CardDescription>
                This information helps our AI generate personalized content that matches your brand and resonates with your audience.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="appName">App Name *</Label>
                  <Input
                    id="appName"
                    placeholder="e.g., FitTracker Pro"
                    value={formData.appName}
                    onChange={(e) => setFormData({ ...formData, appName: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="appDescription">App Description *</Label>
                  <Textarea
                    id="appDescription"
                    placeholder="Describe what your app does, its key features, and what makes it unique..."
                    value={formData.appDescription}
                    onChange={(e) => setFormData({ ...formData, appDescription: e.target.value })}
                    rows={4}
                    required
                  />
                  <p className="text-sm text-gray-500">
                    Be specific about your app's features and benefits
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetAudience">Target Audience</Label>
                  <Textarea
                    id="targetAudience"
                    placeholder="e.g., Fitness enthusiasts aged 25-40, health-conscious professionals..."
                    value={formData.targetAudience}
                    onChange={(e) => setFormData({ ...formData, targetAudience: e.target.value })}
                    rows={3}
                  />
                  <p className="text-sm text-gray-500">
                    Who are you trying to reach? Include demographics, interests, and pain points
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="brandVoice">Brand Voice & Tone</Label>
                  <Textarea
                    id="brandVoice"
                    placeholder="e.g., Friendly and motivational, professional but approachable..."
                    value={formData.brandVoice}
                    onChange={(e) => setFormData({ ...formData, brandVoice: e.target.value })}
                    rows={3}
                  />
                  <p className="text-sm text-gray-500">
                    How should your content sound? (e.g., casual, professional, humorous, inspirational)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords & Topics</Label>
                  <Input
                    id="keywords"
                    placeholder="e.g., fitness, health, workout, nutrition, wellness"
                    value={formData.keywords}
                    onChange={(e) => setFormData({ ...formData, keywords: e.target.value })}
                  />
                  <p className="text-sm text-gray-500">
                    Comma-separated keywords related to your app
                  </p>
                </div>

                <div className="flex gap-4">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                    disabled={upsertMutation.isPending}
                  >
                    {upsertMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Profile
                      </>
                    )}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/dashboard")}
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Tips Card */}
          <Card className="mt-6 bg-purple-50 border-purple-200">
            <CardHeader>
              <CardTitle className="text-lg">💡 Pro Tips</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-gray-700">
              <p>• The more detailed your profile, the better the AI-generated content will be</p>
              <p>• Update your profile as your app evolves or when targeting new audiences</p>
              <p>• Include specific features and benefits that set your app apart</p>
              <p>• Mention any unique selling points or competitive advantages</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
