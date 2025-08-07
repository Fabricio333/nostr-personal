'use client'

import { useEffect, useState } from 'react'
import WikiGraph from '@/components/wiki-graph'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { useI18n } from '@/components/locale-provider'

interface GraphData {
  nodes: { id: string; title: string; tags: string[] }[]
  links: { source: string; target: string }[]
}

interface Settings {
  showArrows: boolean
  textFadeThreshold: number
  nodeSize: number
  linkWidth: number
  centerForce: number
  chargeForce: number
  linkForce: number
  linkDistance: number
  tagColors: Record<string, string>
  hiddenTags: string[]
}

const defaultSettings: Settings = {
  showArrows: false,
  textFadeThreshold: 1,
  nodeSize: 8,
  linkWidth: 1,
  centerForce: 0.1,
  chargeForce: -200,
  linkForce: 1,
  linkDistance: 100,
  tagColors: {},
  hiddenTags: [],
}

export default function GraphWithSettings({
  data,
  tags,
}: {
  data: GraphData
  tags: string[]
}) {
  const [settings, setSettings] = useState<Settings>(defaultSettings)
  const [refresh, setRefresh] = useState(0)
  const { t } = useI18n()

  useEffect(() => {
    const stored = localStorage.getItem('graphSettings')
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setSettings((s) => ({ ...s, ...parsed }))
      } catch {}
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('graphSettings', JSON.stringify(settings))
  }, [settings])

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="outline">{t('digital_garden.settings')}</Button>
          </SheetTrigger>
          <SheetContent className="overflow-y-auto">
            <SheetHeader>
              <SheetTitle>{t('digital_garden.graph_settings')}</SheetTitle>
            </SheetHeader>
            <div className="mt-4 space-y-6">
              <div className="flex items-center justify-between">
                <Label>{t('digital_garden.show_arrows')}</Label>
                <Switch
                  checked={settings.showArrows}
                  onCheckedChange={(checked) =>
                    setSettings((s) => ({ ...s, showArrows: checked }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('digital_garden.text_fade')}</Label>
                <Slider
                  value={[settings.textFadeThreshold]}
                  min={0}
                  max={3}
                  step={0.1}
                  onValueChange={([v]) =>
                    setSettings((s) => ({ ...s, textFadeThreshold: v }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('digital_garden.node_size')}</Label>
                <Slider
                  value={[settings.nodeSize]}
                  min={4}
                  max={20}
                  step={1}
                  onValueChange={([v]) =>
                    setSettings((s) => ({ ...s, nodeSize: v }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('digital_garden.link_thickness')}</Label>
                <Slider
                  value={[settings.linkWidth]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={([v]) =>
                    setSettings((s) => ({ ...s, linkWidth: v }))
                  }
                />
              </div>
              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => setRefresh((r) => r + 1)}
                >
                  {t('digital_garden.animate')}
                </Button>
              </div>
              <div className="space-y-2">
                <Label>{t('digital_garden.center_force')}</Label>
                <Slider
                  value={[settings.centerForce]}
                  min={0}
                  max={1}
                  step={0.01}
                  onValueChange={([v]) =>
                    setSettings((s) => ({ ...s, centerForce: v }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('digital_garden.repel_force')}</Label>
                <Slider
                  value={[settings.chargeForce]}
                  min={-500}
                  max={0}
                  step={10}
                  onValueChange={([v]) =>
                    setSettings((s) => ({ ...s, chargeForce: v }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('digital_garden.link_force')}</Label>
                <Slider
                  value={[settings.linkForce]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={([v]) =>
                    setSettings((s) => ({ ...s, linkForce: v }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{t('digital_garden.link_distance')}</Label>
                <Slider
                  value={[settings.linkDistance]}
                  min={20}
                  max={300}
                  step={10}
                  onValueChange={([v]) =>
                    setSettings((s) => ({ ...s, linkDistance: v }))
                  }
                />
              </div>
              <div className="space-y-4">
                <Label>{t('digital_garden.tag_colors')}</Label>
                {tags.map((tag) => (
                  <div
                    key={tag}
                    className="flex items-center justify-between space-x-2"
                  >
                    <Input
                      type="color"
                      value={settings.tagColors[tag] || '#1f77b4'}
                      className="h-8 w-8 p-1"
                      onChange={(e) =>
                        setSettings((s) => ({
                          ...s,
                          tagColors: { ...s.tagColors, [tag]: e.target.value },
                        }))
                      }
                    />
                    <span className="flex-1 text-sm">{tag}</span>
                    <Checkbox
                      checked={!settings.hiddenTags.includes(tag)}
                      onCheckedChange={(checked) =>
                        setSettings((s) => ({
                          ...s,
                          hiddenTags: checked
                            ? s.hiddenTags.filter((t) => t !== tag)
                            : [...s.hiddenTags, tag],
                        }))
                      }
                    />
                  </div>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>
      <WikiGraph key={refresh} data={data} settings={settings} />
    </div>
  )
}

