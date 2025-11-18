import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Calendar, Copy, Edit, FileText, Hash, Instagram, Lightbulb, Music, Plus, Trash2 } from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { useLocation, useRoute } from "wouter";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

export default function CampaignDetail() {
  const { user, loading, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute("/campaigns/:id");
  const campaignId = params?.id ? parseInt(params.id) : null;

  const [isAddContentOpen, setIsAddContentOpen] = useState(false);
  const [selectedContentIds, setSelectedContentIds] = useState<number[]>([]);

  const utils = trpc.useUtils();
  
  const { data: campaign, isLoading: campaignLoading } = trpc.campaigns.getById.useQuery(
    { id: campaignId! },
    { enabled: !!campaignId }
  );

  const { data: campaignContent, isLoading: contentLoading } = trpc.campaigns.getContent.useQuery(
    { id: campaignId! },
    { enabled: !!campaignId }
  );

  const { data: allContent } = trpc.content.list.useQuery();

  const assignMutation = trpc.campaigns.assignContent.useMutation({
    onSuccess: () => {
      toast.success("Content added to campaign!");
      setSelectedContentIds([]);
      setIsAddContentOpen(false);
      utils.campaigns.getContent.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to add content: ${error.message}`);
    },
  });

  const removeMutation = trpc.campaigns.assignContent.useMutation({
    onSuccess: () => {
      toast.success("Content removed from campaign!");
      utils.campaigns.getContent.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to remove content: ${error.message}`);
    },
  });

  const deleteMutation = trpc.content.delete.useMutation({
    onSuccess: () => {
      toast.success("Content deleted!");
      utils.campaigns.getContent.invalidate();
      utils.content.list.invalidate();
    },
    onError: (error) => {
      toast.error(`Failed to delete content: ${error.message}`);
    },
  });

  // Calculate metrics
  const metrics = useMemo(() => {
    if (!campaignContent) return { total: 0, draft: 0, published: 0, archived: 0 };
    
    return {
      total: campaignContent.length,
      draft: campaignContent.filter(c => c.status === "draft").length,
      published: campaignContent.filter(c => c.status === "published").length,
      archived: campaignContent.filter(c => c.status === "archived").length,
    };
  }, [campaignContent]);

  // Get unassigned content
  const unassignedContent = useMemo(() => {
    if (!allContent) return [];
    return allContent.filter(c => !c.campaignId || c.campaignId === campaignId);
  }, [allContent, campaignId]);

  const handleAddContent = () => {
    if (selectedContentIds.length === 0) {
      toast.error("Please select at least one content item");
      return;
    }

    // Add each selected content to campaign
    selectedContentIds.forEach(contentId => {
      assignMutation.mutate({ contentId, campaignId: campaignId! });
    });
  };

  const handleRemoveContent = (contentId: number) => {
    if (confirm("Remove this content from the campaign?")) {
      removeMutation.mutate({ contentId, campaignId: null });
    }
  };

  const handleDeleteContent = (contentId: number) => {
    if (confirm("Permanently delete this content?")) {
      deleteMutation.mutate({ id: contentId });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard!");
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case "instagram":
        return <Instagram className="w-4 h-4" />;
      case "tiktok":
        return <Music className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "caption":
        return <FileText className="w-4 h-4" />;
      case "hashtags":
        return <Hash className="w-4 h-4" />;
      case "idea":
        return <Lightbulb className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "draft":
        return "bg-gray-100 text-gray-800 border-gray-200";
      case "published":
        return "bg-green-100 text-green-800 border-green-200";
      case "archived":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  useEffect(() => {
    if (!loading && !isAuthenticated) {
      window.location.href = getLoginUrl();
    }
  }, [loading, isAuthenticated]);

  if (loading || campaignLoading || contentLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user || !campaign) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-white">
      <div className="container mx-auto py-8 px-4">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/campaigns")}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Campaigns
          </Button>

          {/* Campaign Info Card */}
          <Card className="p-6 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-2">
                  {campaign.name}
                </h1>
                {campaign.description && (
                  <p className="text-muted-foreground mb-4">{campaign.description}</p>
                )}
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  {(campaign.startDate || campaign.endDate) && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>
                        {campaign.startDate && new Date(campaign.startDate).toLocaleDateString()}
                        {campaign.startDate && campaign.endDate && " - "}
                        {campaign.endDate && new Date(campaign.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  )}
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${
                    campaign.status === "active" ? "bg-green-100 text-green-800 border-green-200" :
                    campaign.status === "paused" ? "bg-yellow-100 text-yellow-800 border-yellow-200" :
                    "bg-blue-100 text-blue-800 border-blue-200"
                  }`}>
                    {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                  </span>
                </div>
              </div>
              <Button
                onClick={() => setLocation("/campaigns")}
                variant="outline"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Campaign
              </Button>
            </div>
          </Card>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Total Posts</div>
              <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                {metrics.total}
              </div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Draft</div>
              <div className="text-3xl font-bold text-gray-600">{metrics.draft}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Published</div>
              <div className="text-3xl font-bold text-green-600">{metrics.published}</div>
            </Card>
            <Card className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Archived</div>
              <div className="text-3xl font-bold text-blue-600">{metrics.archived}</div>
            </Card>
          </div>

          {/* Content Section Header */}
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-semibold">Campaign Content</h2>
            <Button
              onClick={() => setIsAddContentOpen(true)}
              className="bg-gradient-to-r from-purple-600 to-pink-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Content
            </Button>
          </div>
        </div>

        {/* Content List */}
        {!campaignContent || campaignContent.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No Content Yet</h3>
              <p className="text-muted-foreground mb-6">
                Add content to this campaign to start organizing your marketing materials.
              </p>
              <Button
                onClick={() => setIsAddContentOpen(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Content
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {campaignContent.map((content) => (
              <Card key={content.id} className="p-4 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        {getPlatformIcon(content.platform)}
                        <span className="capitalize">{content.platform}</span>
                      </div>
                      <div className="flex items-center gap-1 px-2 py-1 bg-pink-100 text-pink-700 rounded text-xs font-medium">
                        {getContentTypeIcon(content.contentType)}
                        <span className="capitalize">{content.contentType}</span>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getStatusColor(content.status)}`}>
                        {content.status.charAt(0).toUpperCase() + content.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-sm mb-2 line-clamp-2">{content.content}</p>
                    {content.hashtags && (
                      <p className="text-xs text-muted-foreground">{content.hashtags}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-2">
                      Created {new Date(content.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(content.content + (content.hashtags ? `\n\n${content.hashtags}` : ""))}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoveContent(content.id)}
                    >
                      Remove
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteContent(content.id)}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {/* Add Content Dialog */}
        <Dialog open={isAddContentOpen} onOpenChange={setIsAddContentOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add Content to Campaign</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              {unassignedContent.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No available content to add.</p>
                  <Button
                    onClick={() => {
                      setIsAddContentOpen(false);
                      setLocation("/generate");
                    }}
                    className="mt-4 bg-gradient-to-r from-purple-600 to-pink-600"
                  >
                    Generate New Content
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2 mb-4">
                    {unassignedContent.map((content) => (
                      <Card
                        key={content.id}
                        className={`p-3 cursor-pointer transition-all ${
                          selectedContentIds.includes(content.id)
                            ? "border-purple-500 bg-purple-50"
                            : "hover:border-gray-300"
                        }`}
                        onClick={() => {
                          setSelectedContentIds(prev =>
                            prev.includes(content.id)
                              ? prev.filter(id => id !== content.id)
                              : [...prev, content.id]
                          );
                        }}
                      >
                        <div className="flex items-start gap-3">
                          <input
                            type="checkbox"
                            checked={selectedContentIds.includes(content.id)}
                            onChange={() => {}}
                            className="mt-1"
                          />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">
                                {getPlatformIcon(content.platform)}
                                <span className="capitalize">{content.platform}</span>
                              </div>
                              <div className="flex items-center gap-1 px-2 py-0.5 bg-pink-100 text-pink-700 rounded text-xs">
                                {getContentTypeIcon(content.contentType)}
                                <span className="capitalize">{content.contentType}</span>
                              </div>
                            </div>
                            <p className="text-sm line-clamp-2">{content.content}</p>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                  <div className="flex justify-end gap-2 pt-4 border-t">
                    <Button variant="outline" onClick={() => { setIsAddContentOpen(false); setSelectedContentIds([]); }}>
                      Cancel
                    </Button>
                    <Button
                      onClick={handleAddContent}
                      disabled={selectedContentIds.length === 0 || assignMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-pink-600"
                    >
                      {assignMutation.isPending ? "Adding..." : `Add ${selectedContentIds.length} Item${selectedContentIds.length !== 1 ? 's' : ''}`}
                    </Button>
                  </div>
                </>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
