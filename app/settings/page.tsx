"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { getSettings, saveSettings, type Settings } from "@/lib/settings"
import { CheckCircle, Save, SettingsIcon, ExternalLink } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({
    showResume: true,
    showEvents: true,
    showLifestyle: true,
    siteName: "My Personal Blog",
    siteDescription: "A personal blog powered by Nostr",
    contactEmail: "",
    socialLinks: {
      twitter: "",
      github: "",
      linkedin: "",
    },
  })
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date | null>(null)
  const { toast } = useToast()

  useEffect(() => {
    const loadedSettings = getSettings()
    setSettings(loadedSettings)
  }, [])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target
    if (id.startsWith("social.")) {
      const socialKey = id.split(".")[1] as keyof typeof settings.socialLinks
      setSettings((prev) => ({
        ...prev,
        socialLinks: {
          ...prev.socialLinks,
          [socialKey]: value,
        },
      }))
    } else {
      setSettings((prev) => ({ ...prev, [id]: value }))
    }
  }

  const handleSwitchChange = (id: keyof Settings) => (checked: boolean) => {
    setSettings((prev) => ({ ...prev, [id]: checked }))
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 500))

      saveSettings(settings)
      setLastSaved(new Date())

      toast({
        title: "Settings Saved Successfully!",
        description: "Your site configuration has been updated and will take effect immediately.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Error Saving Settings",
        description: "There was a problem saving your settings. Please try again.",
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
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <SettingsIcon className="h-8 w-8 text-blue-600" />
              Site Settings
            </CardTitle>
            <CardDescription className="text-lg">
              Configure your site preferences and content visibility.
            </CardDescription>
            {lastSaved && (
              <div className="flex items-center justify-center gap-2 text-sm text-green-600 dark:text-green-400 mt-2">
                <CheckCircle className="h-4 w-4" />
                Last saved: {lastSaved.toLocaleTimeString()}
              </div>
            )}
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Nostr Settings Link */}
            <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-700">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-2">
                      Nostr Configuration
                    </h3>
                    <p className="text-purple-600 dark:text-purple-300 text-sm">
                      Configure your Nostr public key, relays, and content filtering in the dedicated Nostr settings.
                    </p>
                  </div>
                  <Button
                    asChild
                    variant="outline"
                    className="border-purple-300 text-purple-700 hover:bg-purple-100 dark:border-purple-600 dark:text-purple-300 dark:hover:bg-purple-900/30 bg-transparent"
                  >
                    <Link href="/nostr-settings">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Nostr Settings
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Site Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Site Information</CardTitle>
                <CardDescription>Basic information about your site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName" className="text-sm font-medium">
                    Site Name
                  </Label>
                  <Input
                    id="siteName"
                    placeholder="My Personal Blog"
                    value={settings.siteName}
                    onChange={handleInputChange}
                    className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription" className="text-sm font-medium">
                    Site Description
                  </Label>
                  <Input
                    id="siteDescription"
                    placeholder="A personal blog powered by Nostr"
                    value={settings.siteDescription}
                    onChange={handleInputChange}
                    className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="contactEmail" className="text-sm font-medium">
                    Contact Email
                  </Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    placeholder="your.email@example.com"
                    value={settings.contactEmail}
                    onChange={handleInputChange}
                    className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Page Visibility */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Page Visibility</CardTitle>
                <CardDescription>Control which pages are visible on your site</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 dark:bg-slate-700/30">
                  <div className="space-y-1">
                    <Label htmlFor="showResume" className="text-sm font-medium">
                      Show Resume Page
                    </Label>
                    <p className="text-xs text-muted-foreground">Display your resume/CV page in navigation</p>
                  </div>
                  <Switch
                    id="showResume"
                    checked={settings.showResume}
                    onCheckedChange={handleSwitchChange("showResume")}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 dark:bg-slate-700/30">
                  <div className="space-y-1">
                    <Label htmlFor="showEvents" className="text-sm font-medium">
                      Show Events Page
                    </Label>
                    <p className="text-xs text-muted-foreground">Display your events/speaking page in navigation</p>
                  </div>
                  <Switch
                    id="showEvents"
                    checked={settings.showEvents}
                    onCheckedChange={handleSwitchChange("showEvents")}
                  />
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-slate-50/50 dark:bg-slate-700/30">
                  <div className="space-y-1">
                    <Label htmlFor="showLifestyle" className="text-sm font-medium">
                      Show Lifestyle Page
                    </Label>
                    <p className="text-xs text-muted-foreground">Display your lifestyle/personal page in navigation</p>
                  </div>
                  <Switch
                    id="showLifestyle"
                    checked={settings.showLifestyle}
                    onCheckedChange={handleSwitchChange("showLifestyle")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social Links */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Social Links</CardTitle>
                <CardDescription>Your social media profiles (optional)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="social.twitter" className="text-sm font-medium">
                    Twitter/X
                  </Label>
                  <Input
                    id="social.twitter"
                    placeholder="https://twitter.com/yourusername"
                    value={settings.socialLinks.twitter}
                    onChange={handleInputChange}
                    className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="social.github" className="text-sm font-medium">
                    GitHub
                  </Label>
                  <Input
                    id="social.github"
                    placeholder="https://github.com/yourusername"
                    value={settings.socialLinks.github}
                    onChange={handleInputChange}
                    className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="social.linkedin" className="text-sm font-medium">
                    LinkedIn
                  </Label>
                  <Input
                    id="social.linkedin"
                    placeholder="https://linkedin.com/in/yourusername"
                    value={settings.socialLinks.linkedin}
                    onChange={handleInputChange}
                    className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                  />
                </div>
              </CardContent>
            </Card>

            <Button
              onClick={handleSave}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
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
                  Save Settings
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
