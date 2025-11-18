import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Instagram, Music, Copy, Check, Clock, Hash, TrendingUp, Users, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { useLocation } from "wouter";

export default function PostingGuide() {
  const [, setLocation] = useLocation();
  const [copiedStep, setCopiedStep] = useState<string | null>(null);

  const copyToClipboard = (text: string, stepId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedStep(stepId);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopiedStep(null), 2000);
  };

  const instagramSteps = [
    {
      id: "ig-1",
      title: "Copy Your Caption",
      description: "Copy the AI-generated caption from your Content Library",
      icon: Copy,
      tip: "Make sure to include all hashtags and emojis",
      sampleText: "🌟 Check out our amazing new feature! #NewRelease #TechInnovation"
    },
    {
      id: "ig-2",
      title: "Open Instagram App",
      description: "Launch the Instagram app on your mobile device",
      icon: Instagram,
      tip: "Make sure you're logged into the correct account"
    },
    {
      id: "ig-3",
      title: "Tap the + Button",
      description: "Tap the + icon at the bottom center of your screen",
      icon: Sparkles,
      tip: "You can also swipe right from your feed to create a post"
    },
    {
      id: "ig-4",
      title: "Select Photo or Video",
      description: "Choose your content from your camera roll or take a new photo/video",
      icon: Instagram,
      tip: "Instagram supports images up to 1080x1350px and videos up to 60 seconds for feed posts"
    },
    {
      id: "ig-5",
      title: "Paste Your Caption",
      description: "Tap 'Write a caption...' and paste your copied text",
      icon: Copy,
      tip: "You can edit the caption before posting if needed"
    },
    {
      id: "ig-6",
      title: "Add Hashtags",
      description: "Your hashtags are already included in the caption, or add them in the first comment",
      icon: Hash,
      tip: "Use 5-10 relevant hashtags for best reach. You can add up to 30."
    },
    {
      id: "ig-7",
      title: "Share Your Post",
      description: "Tap 'Share' to publish your post to Instagram",
      icon: TrendingUp,
      tip: "Post during peak hours (11 AM - 1 PM or 7 PM - 9 PM) for maximum engagement"
    }
  ];

  const tiktokSteps = [
    {
      id: "tt-1",
      title: "Copy Your Caption",
      description: "Copy the AI-generated caption from your Content Library",
      icon: Copy,
      tip: "TikTok captions are limited to 2,200 characters",
      sampleText: "🎵 Trying this new trend! What do you think? #TikTokTrend #Viral"
    },
    {
      id: "tt-2",
      title: "Open TikTok App",
      description: "Launch the TikTok app on your mobile device",
      icon: Music,
      tip: "Ensure you're logged into your creator account"
    },
    {
      id: "tt-3",
      title: "Tap the + Button",
      description: "Tap the large + icon at the bottom center of the screen",
      icon: Sparkles,
      tip: "This opens the TikTok camera interface"
    },
    {
      id: "tt-4",
      title: "Record or Upload Video",
      description: "Record a new video or upload from your gallery",
      icon: Music,
      tip: "Videos between 15-60 seconds perform best. Use trending sounds for better reach."
    },
    {
      id: "tt-5",
      title: "Add Your Caption",
      description: "Tap 'Describe your video...' and paste your caption",
      icon: Copy,
      tip: "Add your caption before selecting the cover image"
    },
    {
      id: "tt-6",
      title: "Add Hashtags",
      description: "Include hashtags in your caption or add them separately",
      icon: Hash,
      tip: "Use 3-5 trending hashtags + 2-3 niche hashtags for best results"
    },
    {
      id: "tt-7",
      title: "Post Your Video",
      description: "Tap 'Post' to publish your TikTok",
      icon: TrendingUp,
      tip: "Post 1-4 times per day for maximum visibility and growth"
    }
  ];

  const bestPractices = {
    instagram: {
      postingTimes: [
        "Monday-Friday: 11 AM - 1 PM (lunch break)",
        "Daily: 7 PM - 9 PM (evening engagement)",
        "Wednesday: 11 AM and 2 PM (highest engagement day)",
        "Avoid: Early mornings (before 6 AM) and late nights (after 11 PM)"
      ],
      hashtagTips: [
        "Use 5-10 relevant hashtags (sweet spot for reach)",
        "Mix popular (100K+ posts) and niche (10K-50K posts) hashtags",
        "Create a branded hashtag for your business",
        "Place hashtags in the first comment to keep caption clean",
        "Research trending hashtags in your industry weekly"
      ],
      engagementTips: [
        "Post consistently (4-7 times per week minimum)",
        "Respond to comments within the first hour",
        "Use Instagram Stories daily to boost visibility",
        "Include a clear call-to-action in your caption",
        "Engage with your audience's content regularly"
      ]
    },
    tiktok: {
      postingTimes: [
        "Tuesday-Thursday: 9 AM, 12 PM, and 7 PM",
        "Friday: 5 AM, 1 PM, and 3 PM",
        "Best overall: Tuesday at 9 AM and Thursday at 12 PM",
        "Experiment with your audience's active hours"
      ],
      hashtagTips: [
        "Use 3-5 hashtags maximum (TikTok algorithm prefers fewer)",
        "Always include #FYP or #ForYouPage for discovery",
        "Mix trending hashtags with niche-specific ones",
        "Create challenges with branded hashtags",
        "Check the 'Discover' page daily for trending tags"
      ],
      engagementTips: [
        "Post 1-4 times daily for algorithm favor",
        "Hook viewers in the first 3 seconds",
        "Use trending sounds and effects",
        "Engage with comments immediately after posting",
        "Duet and stitch popular videos in your niche",
        "Keep videos between 15-60 seconds for best retention"
      ]
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50 p-4 md:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <Button
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              className="mb-4"
            >
              ← Back
            </Button>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Posting Guide
            </h1>
            <p className="text-gray-600 mt-2">
              Step-by-step instructions for posting your content to Instagram and TikTok
            </p>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="instagram" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="instagram" className="flex items-center gap-2">
              <Instagram className="h-4 w-4" />
              Instagram
            </TabsTrigger>
            <TabsTrigger value="tiktok" className="flex items-center gap-2">
              <Music className="h-4 w-4" />
              TikTok
            </TabsTrigger>
          </TabsList>

          {/* Instagram Guide */}
          <TabsContent value="instagram" className="space-y-6">
            <Card className="border-2 border-purple-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <Instagram className="h-6 w-6" />
                  How to Post on Instagram
                </CardTitle>
                <CardDescription>
                  Follow these steps to share your AI-generated content on Instagram
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {instagramSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.id}
                      className="flex gap-4 p-4 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <Icon className="h-5 w-5 text-purple-600" />
                              {step.title}
                            </h3>
                            <p className="text-gray-600 mt-1">{step.description}</p>
                          </div>
                          {step.sampleText && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(step.sampleText!, step.id)}
                              className="flex-shrink-0"
                            >
                              {copiedStep === step.id ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy Sample
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        {step.sampleText && (
                          <div className="bg-white p-3 rounded border border-purple-200 text-sm font-mono">
                            {step.sampleText}
                          </div>
                        )}
                        <div className="flex items-start gap-2 text-sm text-purple-700 bg-purple-100 p-2 rounded">
                          <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span><strong>Tip:</strong> {step.tip}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* Instagram Best Practices */}
            <Card className="border-2 border-purple-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-600">
                  <TrendingUp className="h-6 w-6" />
                  Instagram Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Clock className="h-5 w-5 text-purple-600" />
                    Best Times to Post
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {bestPractices.instagram.postingTimes.map((time, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>{time}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Hash className="h-5 w-5 text-pink-600" />
                    Hashtag Tips
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {bestPractices.instagram.hashtagTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-pink-600 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Users className="h-5 w-5 text-orange-600" />
                    Engagement Tips
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {bestPractices.instagram.engagementTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* TikTok Guide */}
          <TabsContent value="tiktok" className="space-y-6">
            <Card className="border-2 border-pink-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-600">
                  <Music className="h-6 w-6" />
                  How to Post on TikTok
                </CardTitle>
                <CardDescription>
                  Follow these steps to share your AI-generated content on TikTok
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {tiktokSteps.map((step, index) => {
                  const Icon = step.icon;
                  return (
                    <div
                      key={step.id}
                      className="flex gap-4 p-4 rounded-lg bg-gradient-to-r from-pink-50 to-orange-50 border border-pink-200"
                    >
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 rounded-full bg-gradient-to-br from-pink-600 to-orange-600 flex items-center justify-center text-white font-bold text-lg">
                          {index + 1}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h3 className="font-semibold text-lg flex items-center gap-2">
                              <Icon className="h-5 w-5 text-pink-600" />
                              {step.title}
                            </h3>
                            <p className="text-gray-600 mt-1">{step.description}</p>
                          </div>
                          {step.sampleText && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => copyToClipboard(step.sampleText!, step.id)}
                              className="flex-shrink-0"
                            >
                              {copiedStep === step.id ? (
                                <>
                                  <Check className="h-4 w-4 mr-1" />
                                  Copied
                                </>
                              ) : (
                                <>
                                  <Copy className="h-4 w-4 mr-1" />
                                  Copy Sample
                                </>
                              )}
                            </Button>
                          )}
                        </div>
                        {step.sampleText && (
                          <div className="bg-white p-3 rounded border border-pink-200 text-sm font-mono">
                            {step.sampleText}
                          </div>
                        )}
                        <div className="flex items-start gap-2 text-sm text-pink-700 bg-pink-100 p-2 rounded">
                          <Sparkles className="h-4 w-4 flex-shrink-0 mt-0.5" />
                          <span><strong>Tip:</strong> {step.tip}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>

            {/* TikTok Best Practices */}
            <Card className="border-2 border-pink-200 bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-pink-600">
                  <TrendingUp className="h-6 w-6" />
                  TikTok Best Practices
                </CardTitle>
              </CardHeader>
              <CardContent className="grid md:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Clock className="h-5 w-5 text-pink-600" />
                    Best Times to Post
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {bestPractices.tiktok.postingTimes.map((time, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-pink-600 mt-1">•</span>
                        <span>{time}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Hash className="h-5 w-5 text-orange-600" />
                    Hashtag Tips
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {bestPractices.tiktok.hashtagTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-orange-600 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-lg font-semibold">
                    <Users className="h-5 w-5 text-purple-600" />
                    Engagement Tips
                  </div>
                  <ul className="space-y-2 text-sm text-gray-700">
                    {bestPractices.tiktok.engagementTips.map((tip, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-purple-600 mt-1">•</span>
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Quick Action Card */}
        <Card className="border-2 border-purple-200 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h3 className="text-2xl font-bold mb-2">Ready to Create Content?</h3>
                <p className="text-purple-100">
                  Generate AI-powered captions and hashtags for your next post
                </p>
              </div>
              <Button
                size="lg"
                variant="secondary"
                onClick={() => setLocation("/generate")}
                className="bg-white text-purple-600 hover:bg-gray-100"
              >
                <Sparkles className="mr-2 h-5 w-5" />
                Generate Content
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
