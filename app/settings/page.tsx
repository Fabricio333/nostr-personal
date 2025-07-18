"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Save, RefreshCw, Trash2, Plus } from "lucide-react"
import { getSettings, saveSettings, type Settings } from "@/lib/settings"
import { fetchNostrPosts, type NostrPost } from "@/lib/nostr"

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    npub: "",
    selectedPosts: [],
    postsPerPage: 10,
    showComments: true,
    autoRefresh: true,
    refreshInterval: 30,
    theme: "system",
    blogTitle: "My Personal Blog",
    blogDescription: "Welcome to my personal blog and portfolio",
  })
  const [availablePosts, setAvailablePosts] = useState<NostrPost[]>([])
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const loadSettings = () => {
      const savedSettings = getSettings()
      setSettings(savedSettings)
    }
    loadSettings()
  }, [])

  const handleFetchPosts = async () => {
    if (!settings.npub.trim()) {
      alert("Please enter a valid npub first")
      return
    }

    if (!settings.npub.startsWith("npub1")) {
      alert("Invalid npub format. Must start with 'npub1'")
      return
    }

    setLoading(true)
    try {
      console.log("Fetching posts for npub:", settings.npub)
      const posts = await fetchNostrPosts(settings.npub)
      console.log("Fetched posts:", posts)
      setAvailablePosts(posts)

      if (posts.length === 0) {
        alert("No posts found for this npub. Make sure you have published text notes (kind 1 events) to Nostr relays.")
      } else {
        alert(`Successfully fetched ${posts.length} posts!`)
      }
    } catch (error) {
      console.error("Error fetching posts:", error)
      alert(`Failed to fetch posts: ${error.message}. Please check your npub and internet connection.`)
    }
    setLoading(false)
  }

  const handleSaveSettings = () => {
    setSaving(true)
    saveSettings(settings)
    setTimeout(() => {
      setSaving(false)
      alert("Settings saved successfully!")
    }, 1000)
  }

  const togglePostSelection = (postId: string) => {
    setSettings((prev) => ({
      ...prev,
      selectedPosts: prev.selectedPosts.includes(postId)
        ? prev.selectedPosts.filter((id) => id !== postId)
        : [...prev.selectedPosts, postId],
    }))
  }

  const selectAllPosts = () => {
    setSettings((prev) => ({
      ...prev,
      selectedPosts: availablePosts.map((post) => post.id),
    }))
  }

  const clearAllPosts = () => {
    setSettings((prev) => ({
      ...prev,
      selectedPosts: [],
    }))
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-4">Settings</h1>
          <p className="text-xl text-muted-foreground">
            Configure your blog, Nostr integration, and content preferences.
          </p>
        </div>

        <div className="space-y-8">
          {/* Blog Configuration */}
          <Card>
            <CardHeader>
              <CardTitle>Blog Configuration</CardTitle>
              <CardDescription>Basic settings for your blog appearance and behavior</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="blogTitle">Blog Title</Label>
                  <Input
                    id="blogTitle"
                    value={settings.blogTitle}
                    onChange={(e) => setSettings((prev) => ({ ...prev, blogTitle: e.target.value }))}
                    placeholder="My Personal Blog"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postsPerPage">Posts Per Page</Label>
                  <Select
                    value={settings.postsPerPage.toString()}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, postsPerPage: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 posts</SelectItem>
                      <SelectItem value="10">10 posts</SelectItem>
                      <SelectItem value="20">20 posts</SelectItem>
                      <SelectItem value="50">50 posts</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="blogDescription">Blog Description</Label>
                <Textarea
                  id="blogDescription"
                  value={settings.blogDescription}
                  onChange={(e) => setSettings((prev) => ({ ...prev, blogDescription: e.target.value }))}
                  placeholder="Welcome to my personal blog and portfolio"
                  className="min-h-[80px]"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Show Comments</Label>
                  <p className="text-sm text-muted-foreground">Allow visitors to leave comments on your posts</p>
                </div>
                <Switch
                  checked={settings.showComments}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, showComments: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Nostr Integration */}
          <Card>
            <CardHeader>
              <CardTitle>Nostr Integration</CardTitle>
              <CardDescription>Connect your Nostr account to fetch and display your posts</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="npub">Nostr Public Key (npub)</Label>
                <div className="flex gap-2">
                  <Input
                    id="npub"
                    value={settings.npub}
                    onChange={(e) => setSettings((prev) => ({ ...prev, npub: e.target.value }))}
                    placeholder="npub1..."
                    className="flex-1"
                  />
                  <Button onClick={handleFetchPosts} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                    Fetch Posts
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Enter your Nostr public key to fetch your posts from the network
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Auto Refresh</Label>
                  <p className="text-sm text-muted-foreground">Automatically refresh posts from Nostr</p>
                </div>
                <Switch
                  checked={settings.autoRefresh}
                  onCheckedChange={(checked) => setSettings((prev) => ({ ...prev, autoRefresh: checked }))}
                />
              </div>

              {settings.autoRefresh && (
                <div className="space-y-2">
                  <Label htmlFor="refreshInterval">Refresh Interval (minutes)</Label>
                  <Select
                    value={settings.refreshInterval.toString()}
                    onValueChange={(value) =>
                      setSettings((prev) => ({ ...prev, refreshInterval: Number.parseInt(value) }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="15">15 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="60">1 hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Post Selection */}
          {availablePosts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Post Selection</CardTitle>
                <CardDescription>
                  Choose which posts to display on your blog ({settings.selectedPosts.length} selected)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={selectAllPosts}>
                    <Plus className="w-4 h-4 mr-2" />
                    Select All
                  </Button>
                  <Button variant="outline" size="sm" onClick={clearAllPosts}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Clear All
                  </Button>
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {availablePosts.map((post) => (
                    <div
                      key={post.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        settings.selectedPosts.includes(post.id)
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-primary/50"
                      }`}
                      onClick={() => togglePostSelection(post.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-medium mb-1">{post.title || "Untitled Post"}</h4>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {post.content.substring(0, 150)}...
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {new Date(post.created_at * 1000).toLocaleDateString()}
                            </Badge>
                            {post.tags?.slice(0, 2).map((tag) => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="ml-4">
                          {settings.selectedPosts.includes(post.id) && (
                            <Badge className="bg-primary text-primary-foreground">Selected</Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Save Settings */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} disabled={saving} size="lg">
              <Save className={`w-4 h-4 mr-2 ${saving ? "animate-pulse" : ""}`} />
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
