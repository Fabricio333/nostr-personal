"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { getSettings, saveSettings, type AppSettings } from "@/lib/settings"
import { Textarea } from "@/components/ui/textarea"

export default function SettingsPage() {
  const [settings, setSettings] = useState<AppSettings>({
    npub: "",
    relays: ["wss://relay.damus.io", "wss://relay.snort.social", "wss://nostr.wine"],
    maxPosts: 10,
    selectedPosts: [],
    enableComments: true,
    enableViews: true,
  })
  const { toast } = useToast()

  useEffect(() => {
    const loadedSettings = getSettings()
    setSettings(loadedSettings)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target
    setSettings((prev) => ({ ...prev, [id]: value }))
  }

  const handleNumberInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    setSettings((prev) => ({ ...prev, [id]: Number.parseInt(value, 10) || 0 }))
  }

  const handleSwitchChange = (id: keyof AppSettings) => (checked: boolean) => {
    setSettings((prev) => ({ ...prev, [id]: checked }))
  }

  const handleRelaysChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const relaysArray = e.target.value
      .split("\n")
      .map((url) => url.trim())
      .filter(Boolean)
    setSettings((prev) => ({ ...prev, relays: relaysArray }))
  }

  const handleSave = () => {
    saveSettings(settings)
    toast({
      title: "Settings Saved!",
      description: "Your preferences have been updated.",
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold">App Settings</CardTitle>
          <CardDescription>Manage your personal blog preferences and Nostr integration.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Nostr Public Key */}
          <div>
            <Label htmlFor="npub" className="mb-2 block">
              Your Nostr Public Key (npub)
            </Label>
            <Input id="npub" placeholder="e.g., npub1..." value={settings.npub} onChange={handleInputChange} />
            <p className="text-sm text-muted-foreground mt-1">This is used to fetch your Nostr profile and posts.</p>
          </div>

          {/* Nostr Relays */}
          <div>
            <Label htmlFor="relays" className="mb-2 block">
              Nostr Relays (one per line)
            </Label>
            <Textarea
              id="relays"
              placeholder="wss://relay.damus.io"
              value={settings.relays.join("\n")}
              onChange={handleRelaysChange}
              rows={5}
            />
            <p className="text-sm text-muted-foreground mt-1">List of Nostr relays to connect to for fetching data.</p>
          </div>

          {/* Max Posts on Homepage */}
          <div>
            <Label htmlFor="maxPosts" className="mb-2 block">
              Max Posts on Homepage
            </Label>
            <Input id="maxPosts" type="number" value={settings.maxPosts} onChange={handleNumberInputChange} min={1} />
            <p className="text-sm text-muted-foreground mt-1">Number of latest posts to display on the homepage.</p>
          </div>

          {/* Enable Comments */}
          <div className="flex items-center justify-between">
            <Label htmlFor="enableComments">Enable Comments</Label>
            <Switch
              id="enableComments"
              checked={settings.enableComments}
              onCheckedChange={handleSwitchChange("enableComments")}
            />
          </div>

          {/* Enable Views */}
          <div className="flex items-center justify-between">
            <Label htmlFor="enableViews">Enable Views Count</Label>
            <Switch
              id="enableViews"
              checked={settings.enableViews}
              onCheckedChange={handleSwitchChange("enableViews")}
            />
          </div>

          <Button onClick={handleSave} className="w-full">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
