"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { sendNostrDM } from "@/lib/nostr-contact"
import { getNostrSettings } from "@/lib/nostr-settings"
import { Mail, Send, MessageCircle, CheckCircle } from "lucide-react"
import { useI18n } from "@/components/locale-provider"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const { toast } = useToast()
  const { t } = useI18n()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const settings = getNostrSettings()
    if (!settings.ownerNpub) {
      toast({
        title: t("contact.configuration_error_title"),
        description: t("contact.configuration_error_description"),
        variant: "destructive",
      })
      return
    }

    setIsSubmitting(true)

    try {
      const messageContent = `Contact Form Message

Name: ${formData.name}
Email: ${formData.email}
Subject: ${formData.subject}

Message:
${formData.message}`

      await sendNostrDM(settings.ownerNpub, messageContent, settings.relays)

      setIsSubmitted(true)
      toast({
        title: t("contact.message_sent_title"),
        description: t("contact.message_sent_description"),
      })

      // Reset form
      setFormData({
        name: "",
        email: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      console.error("Error sending message:", error)
      toast({
        title: t("contact.failed_title"),
        description: t("contact.failed_description"),
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-2xl mx-auto backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
            <CardContent className="p-8 text-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold mb-2 text-green-600 dark:text-green-400">
                {t("contact.message_sent_heading")}
              </h2>
              <p className="text-slate-600 dark:text-slate-300 mb-6">
                {t("contact.message_sent_text")}
              </p>
              <Button onClick={() => setIsSubmitted(false)} variant="outline">
                {t("contact.send_another")}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-2xl mx-auto backdrop-blur-sm bg-white/80 dark:bg-slate-800/80 border-0 shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center justify-center gap-2">
              <Mail className="h-8 w-8 text-blue-600" />
              {t("contact.header")}
            </CardTitle>
            <CardDescription className="text-lg">
              {t("contact.subheader")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-sm font-medium">
                    {t("contact.name")}
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder={t("contact.name_placeholder")}
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">
                    {t("contact.email")}
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder={t("contact.email_placeholder")}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject" className="text-sm font-medium">
                  {t("contact.subject")}
                </Label>
                <Input
                  id="subject"
                  name="subject"
                  placeholder={t("contact.subject_placeholder")}
                  value={formData.subject}
                  onChange={handleInputChange}
                  required
                  className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message" className="text-sm font-medium">
                  {t("contact.message")}
                </Label>
                <Textarea
                  id="message"
                  name="message"
                  placeholder={t("contact.message_placeholder")}
                  value={formData.message}
                  onChange={handleInputChange}
                  required
                  rows={6}
                  className="bg-white/50 dark:bg-slate-700/50 border-slate-200 dark:border-slate-600"
                />
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                  <div className="text-sm text-blue-800 dark:text-blue-200">
                    <p className="font-medium mb-1">{t("contact.sent_via")}</p>
                    <p>{t("contact.sent_via_description")}</p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200 transform hover:scale-[1.02]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t("contact.send")}
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    {t("contact.send")}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
