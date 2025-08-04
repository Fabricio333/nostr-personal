"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getNostrSettings, saveNostrSettings, type NostrSettings } from "@/lib/nostr-settings"
import { Textarea } from "@/components/ui/textarea"
import { CheckCircle, Save, Plus, X, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function NostrSettingsPage() {
  const [settings, setSettings] = useState<NostrSettings>({
    ownerNpub: "",
    relays: ["wss://relay.damus.io", "wss://relay.snort.social", "wss://nostr.wine"],
    noteEventIds: [],
    articleEventIds: [],
    enableComments: true,
    enableViews: true,
  })
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const [newNoteId, setNewNoteId] = useState("")
  const [newArticleId, setNewArticleId] = useState("")
  const { toast } = useToast()

  useEffect(() => {
    const loadedSettings = getNostrSettings()
    setSettings(loadedSettings)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setSettings((prev) => ({ ...prev, [id]: value }))
  }


  const handleSwitchChange = (id: keyof NostrSettings) => (checked: boolean) => {
    setSettings((prev) => ({ ...prev, [id]: checked }))
  }

  const handleRelaysChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const relaysArray = e.target.value
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
    setSettings((prev) => ({ ...prev, relays: relaysArray }))
  }

  const addNoteId = () => {
    if (newNoteId.trim() && !settings.noteEventIds.includes(newNoteId.trim())) {
      setSettings((prev) => ({
        ...prev,
        noteEventIds: [...prev.noteEventIds, newNoteId.trim()],
      }))
      setNewNoteId("")
    }
  }

  const removeNoteId = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      noteEventIds: prev.noteEventIds.filter((noteId) => noteId !== id),
    }))
  }

  const addArticleId = () => {
    if (newArticleId.trim() && !settings.articleEventIds.includes(newArticleId.trim())) {
      setSettings((prev) => ({
        ...prev,
        articleEventIds: [...prev.articleEventIds, newArticleId.trim()],
      }))
      setNewArticleId("")
    }
  }

  const removeArticleId = (id: string) => {
    setSettings((prev) => ({
      ...prev,
      articleEventIds: prev.articleEventIds.filter((articleId) => articleId !== id),
    }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      saveNostrSettings(settings)
      setLastSaved(new Date())

      toast({
        title: "Nostr Settings Saved Successfully!",
        description: "Your Nostr configuration has been updated and will take effect immediately.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your Nostr settings. Please try again.",
        variant: "destructive",
        duration: 3000,
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-4xl mx-auto backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <Zap className="h-8 w-8 text-purple-600" />
              Nostr Settings
            </CardTitle>
            <CardDescription className="text-lg">
              Configure your Nostr integration, relays, and content management.
            </CardDescription>
            {lastSaved && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 mt-2">
                <CheckCircle className="h-4 w-4" />
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Owner Nostr Public Key */}
            <div className="space-y-2">
              <Label htmlFor="ownerNpub" className="text-sm font-medium">
                Your Nostr Public Key (npub)
              </Label>
              <Input
                id="ownerNpub"
                placeholder="e.g., npub1..."
                value={settings.ownerNpub}
                onChange={handleInputChange}
                className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
              />
              <p className="text-xs text-muted-foreground">
                This is used to fetch your Nostr profile and posts, and to receive contact form messages.
              </p>
            </div>

            {/* Nostr Relays */}
            <div className="space-y-2">
              <Label htmlFor="relays" className="text-sm font-medium">
                Nostr Relays (one per line)
              </Label>
              <Textarea
                id="relays"
                placeholder="wss://relay.damus.io"
                value={settings.relays.join("\n")}
                onChange={handleRelaysChange}
                rows={5}
                className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
              />
              <p className="text-xs text-muted-foreground">List of Nostr relays to connect to for fetching data.</p>
            </div>

            {/* Note Event IDs */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Note Event IDs</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Specific Nostr note event IDs to display on your blog (optional - leave empty to show all notes)
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Enter note event ID..."
                  value={newNoteId}
                  onChange={(e) => setNewNoteId(e.target.value)}
                  className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                  onKeyPress={(e) => e.key === "Enter" && addNoteId()}
                />
                <Button onClick={addNoteId} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {settings.noteEventIds.map((id) => (
                  <Badge key={id} variant="secondary" className="flex items-center gap-1">
                    {id.substring(0, 16)}...
                    <button onClick={() => removeNoteId(id)} className="ml-1 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Article Event IDs */}
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Article Event IDs</Label>
                <p className="text-xs text-muted-foreground mb-3">
                  Specific Nostr article event IDs to display on your blog (optional - leave empty to show all articles)
                </p>
              </div>

              <div className="flex gap-2">
                <Input
                  placeholder="Enter article event ID..."
                  value={newArticleId}
                  onChange={(e) => setNewArticleId(e.target.value)}
                  className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                  onKeyPress={(e) => e.key === "Enter" && addArticleId()}
                />
                <Button onClick={addArticleId} size="sm" variant="outline">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap gap-2">
                {settings.articleEventIds.map((id) => (
                  <Badge key={id} variant="secondary" className="flex items-center gap-1">
                    {id.substring(0, 16)}...
                    <button onClick={() => removeArticleId(id)} className="ml-1 hover:text-red-500">
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>

            {/* Enable Comments */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 dark:bg-slate-700/30">
              <div className="space-y-1">
                <Label htmlFor="enableComments" className="text-sm font-medium">
                  Enable Comments
                </Label>
                <p className="text-xs text-muted-foreground">Allow visitors to comment on your posts</p>
              </div>
              <Switch
                id="enableComments"
                checked={settings.enableComments}
                onCheckedChange={handleSwitchChange("enableComments")}
              />
            </div>

            {/* Enable Views */}
            <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 dark:bg-slate-700/30">
              <div className="space-y-1">
                <Label htmlFor="enableViews" className="text-sm font-medium">
                  Enable Views Count
                </Label>
                <p className="text-xs text-muted-foreground">Display view counts on your posts</p>
              </div>
              <Switch
                id="enableViews"
                checked={settings.enableViews}
                onCheckedChange={handleSwitchChange("enableViews")}
              />
            </div>

            <Button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Nostr Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
