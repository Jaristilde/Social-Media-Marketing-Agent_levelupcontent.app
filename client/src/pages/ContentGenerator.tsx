import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Sparkles, Copy, Save, Loader2, Check } from "lucide-react";
import { useState } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function ContentGenerator() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  const [platform, setPlatform] = useState<"instagram" | "tiktok" | "both">("instagram");
  const [topic, setTopic] = useState("");
  const [tone, setTone] = useState("");
  const [hashtagCount, setHashtagCount] = useState(10);
  const [ideaCount, setIdeaCount] = useState(10);
  
  const [generatedCaption, setGeneratedCaption] = useState("");
  const [generatedHashtags, setGeneratedHashtags] = useState("");
  const [generatedIdeas, setGeneratedIdeas] = useState("");
  
  const [copiedCaption, setCopiedCaption] = useState(false);
  const [copiedHashtags, setCopiedHashtags] = useState(false);

  const captionMutation = trpc.aiGenerate.caption.useMutation({
    onSuccess: (data) => {
      setGeneratedCaption(String(data.caption));
      toast.success("Caption generated!");
    },
    onError: (error) => {
      toast.error(`Failed to generate caption: ${error.message}`);
    },
  });

  const hashtagsMutation = trpc.aiGenerate.hashtags.useMutation({
    onSuccess: (data) => {
      setGeneratedHashtags(String(data.hashtags));
      toast.success("Hashtags generated!");
    },
    onError: (error) => {
      toast.error(`Failed to generate hashtags: ${error.message}`);
    },
  });

  const ideasMutation = trpc.aiGenerate.ideas.useMutation({
    onSuccess: (data) => {
      setGeneratedIdeas(String(data.ideas));
      toast.success("Content ideas generated!");
    },
    onError: (error) => {
      toast.error(`Failed to generate ideas: ${error.message}`);
    },
  });

  const saveContentMutation = trpc.content.create.useMutation({
    onSuccess: () => {
      toast.success("Content saved to library!");
    },
    onError: (error) => {
      toast.error(`Failed to save content: ${error.message}`);
    },
  });

  if (authLoading) {
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

  const handleGenerateCaption = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    captionMutation.mutate({ platform, topic, tone: tone || undefined });
  };

  const handleGenerateHashtags = () => {
    if (!topic.trim()) {
      toast.error("Please enter a topic");
      return;
    }
    hashtagsMutation.mutate({ platform, topic, count: hashtagCount });
  };

  const handleGenerateIdeas = () => {
    ideasMutation.mutate({ platform, count: ideaCount });
  };

  const copyToClipboard = async (text: string, type: "caption" | "hashtags") => {
    await navigator.clipboard.writeText(text);
    if (type === "caption") {
      setCopiedCaption(true);
      setTimeout(() => setCopiedCaption(false), 2000);
    } else {
      setCopiedHashtags(true);
      setTimeout(() => setCopiedHashtags(false), 2000);
    }
    toast.success("Copied to clipboard!");
  };

  const saveToLibrary = (content: string, contentType: "caption" | "hashtags" | "idea", hashtags?: string) => {
    saveContentMutation.mutate({
      platform,
      contentType,
      content,
      hashtags,
    });
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
              Content Generator
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto">
          {/* Platform Selector */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Platform</CardTitle>
              <CardDescription>Choose which platform you're creating content for</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={platform} onValueChange={(value: any) => setPlatform(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="tiktok">TikTok</SelectItem>
                  <SelectItem value="both">Both Platforms</SelectItem>
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Tabs for different content types */}
          <Tabs defaultValue="caption" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="caption">Caption</TabsTrigger>
              <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
              <TabsTrigger value="ideas">Content Ideas</TabsTrigger>
            </TabsList>

            {/* Caption Tab */}
            <TabsContent value="caption" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Caption</CardTitle>
                  <CardDescription>Create engaging captions for your posts</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="caption-topic">Topic *</Label>
                    <Input
                      id="caption-topic"
                      placeholder="e.g., New app feature launch, fitness motivation..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="caption-tone">Tone (Optional)</Label>
                    <Input
                      id="caption-tone"
                      placeholder="e.g., Exciting, professional, casual, inspirational..."
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleGenerateCaption}
                    disabled={captionMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {captionMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Caption
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {generatedCaption && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Caption</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={generatedCaption}
                      onChange={(e) => setGeneratedCaption(e.target.value)}
                      rows={6}
                      className="font-sans"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(generatedCaption, "caption")}
                        variant="outline"
                        className="flex-1"
                      >
                        {copiedCaption ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => saveToLibrary(generatedCaption, "caption", generatedHashtags || undefined)}
                        variant="outline"
                        className="flex-1"
                        disabled={saveContentMutation.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save to Library
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Hashtags Tab */}
            <TabsContent value="hashtags" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Hashtags</CardTitle>
                  <CardDescription>Get trending and relevant hashtags</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="hashtag-topic">Topic *</Label>
                    <Input
                      id="hashtag-topic"
                      placeholder="e.g., Fitness app, productivity tools..."
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="hashtag-count">Number of Hashtags: {hashtagCount}</Label>
                    <input
                      id="hashtag-count"
                      type="range"
                      min="5"
                      max="30"
                      value={hashtagCount}
                      onChange={(e) => setHashtagCount(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={handleGenerateHashtags}
                    disabled={hashtagsMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {hashtagsMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Hashtags
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {generatedHashtags && (
                <Card>
                  <CardHeader>
                    <CardTitle>Generated Hashtags</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Textarea
                      value={generatedHashtags}
                      onChange={(e) => setGeneratedHashtags(e.target.value)}
                      rows={4}
                      className="font-mono text-sm"
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={() => copyToClipboard(generatedHashtags, "hashtags")}
                        variant="outline"
                        className="flex-1"
                      >
                        {copiedHashtags ? (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="mr-2 h-4 w-4" />
                            Copy
                          </>
                        )}
                      </Button>
                      <Button
                        onClick={() => saveToLibrary(generatedHashtags, "hashtags")}
                        variant="outline"
                        className="flex-1"
                        disabled={saveContentMutation.isPending}
                      >
                        <Save className="mr-2 h-4 w-4" />
                        Save to Library
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            {/* Ideas Tab */}
            <TabsContent value="ideas" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Generate Content Ideas</CardTitle>
                  <CardDescription>Get creative post ideas for your content calendar</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="idea-count">Number of Ideas: {ideaCount}</Label>
                    <input
                      id="idea-count"
                      type="range"
                      min="3"
                      max="20"
                      value={ideaCount}
                      onChange={(e) => setIdeaCount(Number(e.target.value))}
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={handleGenerateIdeas}
                    disabled={ideasMutation.isPending}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                  >
                    {ideasMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-2 h-4 w-4" />
                        Generate Ideas
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {generatedIdeas && (
                <Card>
                  <CardHeader>
                    <CardTitle>Content Ideas</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="prose max-w-none">
                      <pre className="whitespace-pre-wrap font-sans text-sm bg-gray-50 p-4 rounded-lg">
                        {generatedIdeas}
                      </pre>
                    </div>
                    <Button
                      onClick={() => saveToLibrary(generatedIdeas, "idea")}
                      variant="outline"
                      className="w-full"
                      disabled={saveContentMutation.isPending}
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save to Library
                    </Button>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}
