import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { ArrowLeft, Copy, Trash2, Check, Instagram, Music, Grid3x3, List, Search, Download, Edit, Loader2 } from "lucide-react";
import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { toast } from "sonner";

type ViewMode = "grid" | "list";

export default function ContentLibrary() {
  const { user, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  
  // View and filter state
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [platformFilter, setPlatformFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Selection state
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  
  // Edit modal state
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editContent, setEditContent] = useState("");
  const [editHashtags, setEditHashtags] = useState("");
  const [editStatus, setEditStatus] = useState<"draft" | "published" | "archived">("draft");
  
  // Campaign assignment state
  const [assigningItem, setAssigningItem] = useState<any>(null);
  const [selectedCampaignId, setSelectedCampaignId] = useState<string>("none");

  const { data: content, isLoading, refetch } = trpc.content.list.useQuery(undefined, {
    enabled: !!user,
  });
  
  const { data: campaigns } = trpc.campaigns.list.useQuery(undefined, {
    enabled: !!user,
  });

  const deleteMutation = trpc.content.delete.useMutation({
    onSuccess: () => {
      toast.success("Content deleted");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete: ${error.message}`);
    },
  });

  const updateMutation = trpc.content.update.useMutation({
    onSuccess: () => {
      toast.success("Content updated");
      setEditingItem(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to update: ${error.message}`);
    },
  });
  
  const assignCampaignMutation = trpc.campaigns.assignContent.useMutation({
    onSuccess: () => {
      toast.success("Campaign assigned");
      setAssigningItem(null);
      setSelectedCampaignId("none");
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to assign campaign: ${error.message}`);
    },
  });

  // Filtered content - must be before early returns to follow hooks rules
  const filteredContent = useMemo(() => {
    if (!content) return [];
    
    return content.filter((item) => {
      // Platform filter
      if (platformFilter !== "all" && item.platform !== platformFilter) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== "all" && item.status !== statusFilter) {
        return false;
      }
      
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const contentMatch = item.content.toLowerCase().includes(query);
        const hashtagMatch = item.hashtags?.toLowerCase().includes(query);
        if (!contentMatch && !hashtagMatch) {
          return false;
        }
      }
      
      return true;
    });
  }, [content, platformFilter, statusFilter, searchQuery]);

  // Early returns must come after all hooks
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

  const copyToClipboard = async (text: string, id: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = (id: number) => {
    if (confirm("Are you sure you want to delete this content?")) {
      deleteMutation.mutate({ id });
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) {
      toast.error("No items selected");
      return;
    }
    
    if (confirm(`Delete ${selectedIds.size} selected items?`)) {
      Promise.all(
        Array.from(selectedIds).map((id) => deleteMutation.mutateAsync({ id }))
      ).then(() => {
        setSelectedIds(new Set());
        toast.success(`Deleted ${selectedIds.size} items`);
      });
    }
  };

  const handleExport = (format: "csv" | "json") => {
    const selectedContent = filteredContent.filter((item) => 
      selectedIds.size === 0 || selectedIds.has(item.id)
    );
    
    if (selectedContent.length === 0) {
      toast.error("No content to export");
      return;
    }
    
    let data: string;
    let filename: string;
    let mimeType: string;
    
    if (format === "json") {
      data = JSON.stringify(selectedContent, null, 2);
      filename = `content-library-${Date.now()}.json`;
      mimeType = "application/json";
    } else {
      // CSV format
      const headers = ["ID", "Platform", "Type", "Content", "Hashtags", "Status", "Created"];
      const rows = selectedContent.map((item) => [
        item.id,
        item.platform,
        item.contentType,
        `"${item.content.replace(/"/g, '""')}"`,
        `"${(item.hashtags || "").replace(/"/g, '""')}"`,
        item.status,
        new Date(item.createdAt).toISOString(),
      ]);
      data = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
      filename = `content-library-${Date.now()}.csv`;
      mimeType = "text/csv";
    }
    
    const blob = new Blob([data], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success(`Exported ${selectedContent.length} items as ${format.toUpperCase()}`);
  };

  const toggleSelection = (id: number) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredContent.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredContent.map((item) => item.id)));
    }
  };

  const openEditModal = (item: any) => {
    setEditingItem(item);
    setEditContent(item.content);
    setEditHashtags(item.hashtags || "");
    setEditStatus(item.status);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    
    updateMutation.mutate({
      id: editingItem.id,
      content: editContent,
      hashtags: editHashtags || undefined,
      status: editStatus,
    });
  };
  
  const openAssignCampaignModal = (item: any) => {
    setAssigningItem(item);
    setSelectedCampaignId(item.campaignId ? String(item.campaignId) : "none");
  };
  
  const handleAssignCampaign = () => {
    if (!assigningItem) return;
    
    const campaignId = selectedCampaignId === "none" ? null : parseInt(selectedCampaignId);
    
    assignCampaignMutation.mutate({
      contentId: assigningItem.id,
      campaignId,
    });
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === "instagram") return <Instagram className="h-4 w-4" />;
    if (platform === "tiktok") return <Music className="h-4 w-4" />;
    return null;
  };

  const getPlatformColor = (platform: string) => {
    if (platform === "instagram") return "bg-purple-100 text-purple-700 border-purple-200";
    if (platform === "tiktok") return "bg-pink-100 text-pink-700 border-pink-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getStatusColor = (status: string) => {
    if (status === "draft") return "bg-gray-100 text-gray-700 border-gray-200";
    if (status === "published") return "bg-green-100 text-green-700 border-green-200";
    if (status === "archived") return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  const getTypeColor = (type: string) => {
    if (type === "caption") return "bg-blue-100 text-blue-700 border-blue-200";
    if (type === "hashtags") return "bg-green-100 text-green-700 border-green-200";
    if (type === "idea") return "bg-orange-100 text-orange-700 border-orange-200";
    return "bg-gray-100 text-gray-700 border-gray-200";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => setLocation("/dashboard")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <img src={APP_LOGO} alt={APP_TITLE} className="h-8 w-8" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Content Library
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Filters and Actions Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search content..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Platform Filter */}
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Platform" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Platforms</SelectItem>
                    <SelectItem value="instagram">Instagram</SelectItem>
                    <SelectItem value="tiktok">TikTok</SelectItem>
                    <SelectItem value="both">Both</SelectItem>
                  </SelectContent>
                </Select>

                {/* Status Filter */}
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-full lg:w-40">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                {/* View Toggle */}
                <div className="flex gap-2">
                  <Button
                    variant={viewMode === "grid" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "outline"}
                    size="icon"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Bulk Actions */}
              {filteredContent.length > 0 && (
                <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedIds.size === filteredContent.length && filteredContent.length > 0}
                      onCheckedChange={toggleSelectAll}
                    />
                    <span className="text-sm text-gray-600">
                      {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select all"}
                    </span>
                  </div>

                  {selectedIds.size > 0 && (
                    <>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleBulkDelete}
                        disabled={deleteMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    </>
                  )}

                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport("csv")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export CSV
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleExport("json")}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Export JSON
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Count */}
          <div className="text-sm text-gray-600">
            Showing {filteredContent.length} of {content?.length || 0} items
          </div>

          {/* Empty State */}
          {filteredContent.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500 mb-4">
                  {content?.length === 0 
                    ? "No content saved yet" 
                    : "No content matches your filters"}
                </p>
                <Button onClick={() => setLocation("/generate")}>
                  Generate Your First Content
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Grid View */}
          {viewMode === "grid" && filteredContent.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredContent.map((item) => (
                <Card key={item.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => toggleSelection(item.id)}
                      />
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={getPlatformColor(item.platform)}>
                            {getPlatformIcon(item.platform)}
                            <span className="ml-1 capitalize">{item.platform}</span>
                          </Badge>
                          <Badge className={getTypeColor(item.contentType)}>
                            {item.contentType === "caption" && "Caption"}
                            {item.contentType === "hashtags" && "Hashtags"}
                            {item.contentType === "idea" && "Idea"}
                          </Badge>
                          <Badge className={getStatusColor(item.status)}>
                            {item.status}
                          </Badge>
                        </div>
                        <CardDescription className="text-xs">
                          {new Date(item.createdAt).toLocaleDateString()}
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm line-clamp-3">
                          {item.content.substring(0, 100)}
                          {item.content.length > 100 && "..."}
                        </p>
                      </div>
                      
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => copyToClipboard(item.content, item.id)}
                        >
                          {copiedId === item.id ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1"
                          onClick={() => openEditModal(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openAssignCampaignModal(item)}
                          title="Assign to Campaign"
                        >
                          📁
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteMutation.isPending}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* List View */}
          {viewMode === "list" && filteredContent.length > 0 && (
            <div className="space-y-4">
              {filteredContent.map((item) => (
                <Card key={item.id}>
                  <CardContent className="py-4">
                    <div className="flex items-start gap-4">
                      <Checkbox
                        checked={selectedIds.has(item.id)}
                        onCheckedChange={() => toggleSelection(item.id)}
                        className="mt-1"
                      />
                      
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap mb-2">
                              <Badge className={getPlatformColor(item.platform)}>
                                {getPlatformIcon(item.platform)}
                                <span className="ml-1 capitalize">{item.platform}</span>
                              </Badge>
                              <Badge className={getTypeColor(item.contentType)}>
                                {item.contentType === "caption" && "Caption"}
                                {item.contentType === "hashtags" && "Hashtags"}
                                {item.contentType === "idea" && "Idea"}
                              </Badge>
                              <Badge className={getStatusColor(item.status)}>
                                {item.status}
                              </Badge>
                              <span className="text-xs text-gray-500">
                                {new Date(item.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {item.content}
                            </p>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => copyToClipboard(item.content, item.id)}
                            >
                              {copiedId === item.id ? (
                                <Check className="h-4 w-4" />
                              ) : (
                                <Copy className="h-4 w-4" />
                              )}
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openEditModal(item)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => openAssignCampaignModal(item)}
                              title="Assign to Campaign"
                            >
                              📁
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleDelete(item.id)}
                              disabled={deleteMutation.isPending}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Edit Modal */}
      <Dialog open={!!editingItem} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Content</DialogTitle>
            <DialogDescription>
              Make changes to your content and save when you're done.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-content">Content</Label>
              <Textarea
                id="edit-content"
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                rows={6}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-hashtags">Hashtags (Optional)</Label>
              <Input
                id="edit-hashtags"
                value={editHashtags}
                onChange={(e) => setEditHashtags(e.target.value)}
                placeholder="#example #hashtags"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select value={editStatus} onValueChange={(value: any) => setEditStatus(value)}>
                <SelectTrigger id="edit-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleSaveEdit}
              disabled={updateMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Assign Campaign Dialog */}
      <Dialog open={!!assigningItem} onOpenChange={(open) => !open && setAssigningItem(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Assign to Campaign</DialogTitle>
            <DialogDescription>
              Choose a campaign for this content or remove it from its current campaign.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="campaign-select">Campaign</Label>
              <Select value={selectedCampaignId} onValueChange={setSelectedCampaignId}>
                <SelectTrigger id="campaign-select">
                  <SelectValue placeholder="Select a campaign" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">No Campaign</SelectItem>
                  {campaigns?.map((campaign) => (
                    <SelectItem key={campaign.id} value={String(campaign.id)}>
                      {campaign.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssigningItem(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleAssignCampaign}
              disabled={assignCampaignMutation.isPending}
              className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
            >
              {assignCampaignMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Assigning...
                </>
              ) : (
                "Assign"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
