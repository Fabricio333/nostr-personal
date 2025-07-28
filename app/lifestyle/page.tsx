"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Checkbox } from "@/components/ui/checkbox"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { PlusCircle, Trash2 } from "lucide-react"
import lifestyleConfig from "@/lib/lifestyle-config.json"
import { fetchNostrPosts } from "@/lib/nostr"
import { getNostrSettings } from "@/lib/nostr-settings"

interface Workout {
  id: string
  name: string
  completed: boolean
}

interface Meal {
  id: string
  name: string
  calories: number
  protein: number
  carbs: number
  fat: number
}

interface Biohack {
  id: string
  name: string
  completed: boolean
}

interface RoutineItem {
  id: string
  name: string
  completed: boolean
}

interface NostrProfile {
  name?: string
  display_name?: string
  about?: string
  picture?: string
  banner?: string
  nip05?: string
  lud16?: string
  website?: string
}

interface NostrPost {
  id: string
  pubkey: string
  created_at: number
  kind: number
  tags: string[][]
  content: string
  sig: string
  profile?: NostrProfile
  type: "note" | "article"
  title?: string
  summary?: string
  image?: string
  published_at?: number
}

export default function LifestylePage() {
  const [workouts, setWorkouts] = useState<Workout[]>(
    lifestyleConfig.workouts as Workout[],
  )
  const [newWorkoutName, setNewWorkoutName] = useState("")

  const [meals, setMeals] = useState<Meal[]>(
    lifestyleConfig.nutrition as Meal[],
  )
  const [newMeal, setNewMeal] = useState({ name: "", calories: 0, protein: 0, carbs: 0, fat: 0 })

  const [biohacks, setBiohacks] = useState<Biohack[]>(
    lifestyleConfig.biohacks as Biohack[],
  )
  const [newBiohackName, setNewBiohackName] = useState("")

  const [morningRoutine, setMorningRoutine] = useState<RoutineItem[]>(
    lifestyleConfig.routines.morning as RoutineItem[],
  )
  const [eveningRoutine, setEveningRoutine] = useState<RoutineItem[]>(
    lifestyleConfig.routines.evening as RoutineItem[],
  )
  const [newMorningRoutineItem, setNewMorningRoutineItem] = useState("")
  const [newEveningRoutineItem, setNewEveningRoutineItem] = useState("")

  const [posts, setPosts] = useState<NostrPost[]>([])
  const [loadingPosts, setLoadingPosts] = useState(true)

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const settings = getNostrSettings()
        if (!settings.ownerNpub) {
          setLoadingPosts(false)
          return
        }

        const allPosts = await fetchNostrPosts(settings.ownerNpub, 20)
        const lifestylePosts = allPosts.filter(
          (post) =>
            post.tags.some(
              (t) => t[0] === "t" && t[1]?.toLowerCase() === "lifestyle",
            ) || post.content.toLowerCase().includes("#lifestyle"),
        )

        setPosts(lifestylePosts)
      } catch (error) {
        console.error("Failed to load lifestyle posts", error)
      } finally {
        setLoadingPosts(false)
      }
    }

    loadPosts()
  }, [])

  // Workout Handlers
  const toggleWorkout = (id: string) => {
    setWorkouts(workouts.map((w) => (w.id === id ? { ...w, completed: !w.completed } : w)))
  }
  const addWorkout = () => {
    if (newWorkoutName.trim()) {
      setWorkouts([...workouts, { id: String(Date.now()), name: newWorkoutName.trim(), completed: false }])
      setNewWorkoutName("")
    }
  }
  const deleteWorkout = (id: string) => {
    setWorkouts(workouts.filter((w) => w.id !== id))
  }
  const workoutProgress = (workouts.filter((w) => w.completed).length / workouts.length) * 100 || 0

  // Meal Handlers
  const addMeal = () => {
    if (newMeal.name.trim() && newMeal.calories > 0) {
      setMeals([...meals, { id: String(Date.now()), ...newMeal }])
      setNewMeal({ name: "", calories: 0, protein: 0, carbs: 0, fat: 0 })
    }
  }
  const deleteMeal = (id: string) => {
    setMeals(meals.filter((m) => m.id !== id))
  }
  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0)
  const totalProtein = meals.reduce((sum, meal) => sum + meal.protein, 0)
  const totalCarbs = meals.reduce((sum, meal) => sum + meal.carbs, 0)
  const totalFat = meals.reduce((sum, meal) => sum + meal.fat, 0)

  // Biohack Handlers
  const toggleBiohack = (id: string) => {
    setBiohacks(biohacks.map((b) => (b.id === id ? { ...b, completed: !b.completed } : b)))
  }
  const addBiohack = () => {
    if (newBiohackName.trim()) {
      setBiohacks([...biohacks, { id: String(Date.now()), name: newBiohackName.trim(), completed: false }])
      setNewBiohackName("")
    }
  }
  const deleteBiohack = (id: string) => {
    setBiohacks(biohacks.filter((b) => b.id !== b))
  }
  const biohackProgress = (biohacks.filter((b) => b.completed).length / biohacks.length) * 100 || 0

  // Routine Handlers
  const toggleMorningRoutineItem = (id: string) => {
    setMorningRoutine(morningRoutine.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }
  const addMorningRoutineItem = () => {
    if (newMorningRoutineItem.trim()) {
      setMorningRoutine([
        ...morningRoutine,
        { id: String(Date.now()), name: newMorningRoutineItem.trim(), completed: false },
      ])
      setNewMorningRoutineItem("")
    }
  }
  const deleteMorningRoutineItem = (id: string) => {
    setMorningRoutine(morningRoutine.filter((item) => item.id !== id))
  }
  const morningRoutineProgress =
    (morningRoutine.filter((item) => item.completed).length / morningRoutine.length) * 100 || 0

  const toggleEveningRoutineItem = (id: string) => {
    setEveningRoutine(eveningRoutine.map((item) => (item.id === id ? { ...item, completed: !item.completed } : item)))
  }
  const addEveningRoutineItem = () => {
    if (newEveningRoutineItem.trim()) {
      setEveningRoutine([
        ...eveningRoutine,
        { id: String(Date.now()), name: newEveningRoutineItem.trim(), completed: false },
      ])
      setNewEveningRoutineItem("")
    }
  }
  const deleteEveningRoutineItem = (id: string) => {
    setEveningRoutine(eveningRoutine.filter((item) => item.id !== id))
  }
  const eveningRoutineProgress =
    (eveningRoutine.filter((item) => item.completed).length / eveningRoutine.length) * 100 || 0

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-8 text-center">My Lifestyle Dashboard</h1>
      <p className="text-xl text-muted-foreground text-center mb-12">
        Track your workouts, nutrition, biohacks, and daily routines.
      </p>

      <Tabs defaultValue="workouts" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workouts">Workouts</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="biohacks">Biohacks</TabsTrigger>
          <TabsTrigger value="routines">Routines</TabsTrigger>
        </TabsList>

        {/* Workouts Tab */}
        <TabsContent value="workouts" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Today's Workouts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Progress value={workoutProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  {workouts.filter((w) => w.completed).length} of {workouts.length} workouts completed
                </p>
              </div>
              <div className="space-y-3">
                {workouts.map((workout) => (
                  <div key={workout.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`workout-${workout.id}`}
                        checked={workout.completed}
                        onCheckedChange={() => toggleWorkout(workout.id)}
                      />
                      <Label htmlFor={`workout-${workout.id}`} className="text-base">
                        {workout.name}
                      </Label>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteWorkout(workout.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex space-x-2">
                <Input
                  placeholder="Add new workout"
                  value={newWorkoutName}
                  onChange={(e) => setNewWorkoutName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") addWorkout()
                  }}
                />
                <Button onClick={addWorkout}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Nutrition Tab */}
        <TabsContent value="nutrition" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Nutrition Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-6 grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mealName">Meal Name</Label>
                  <Input
                    id="mealName"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
                    placeholder="e.g., Chicken & Rice"
                  />
                </div>
                <div>
                  <Label htmlFor="calories">Calories</Label>
                  <Input
                    id="calories"
                    type="number"
                    value={newMeal.calories}
                    onChange={(e) => setNewMeal({ ...newMeal, calories: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="protein">Protein (g)</Label>
                  <Input
                    id="protein"
                    type="number"
                    value={newMeal.protein}
                    onChange={(e) => setNewMeal({ ...newMeal, protein: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="carbs">Carbs (g)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    value={newMeal.carbs}
                    onChange={(e) => setNewMeal({ ...newMeal, carbs: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <Label htmlFor="fat">Fat (g)</Label>
                  <Input
                    id="fat"
                    type="number"
                    value={newMeal.fat}
                    onChange={(e) => setNewMeal({ ...newMeal, fat: Number.parseInt(e.target.value) || 0 })}
                  />
                </div>
                <Button onClick={addMeal} className="col-span-2">
                  <PlusCircle className="h-4 w-4 mr-2" /> Add Meal
                </Button>
              </div>

              <div className="mb-4 text-center">
                <h3 className="text-lg font-semibold">Totals Today:</h3>
                <p>
                  Calories: {totalCalories}kcal | Protein: {totalProtein}g | Carbs: {totalCarbs}g | Fat: {totalFat}g
                </p>
              </div>

              <div className="space-y-3">
                {meals.map((meal) => (
                  <div key={meal.id} className="flex items-center justify-between border-b pb-2">
                    <div>
                      <p className="font-medium">{meal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {meal.calories}kcal | P:{meal.protein}g C:{meal.carbs}g F:{meal.fat}g
                      </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMeal(meal.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Biohacks Tab */}
        <TabsContent value="biohacks" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Biohacks & Optimization</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <Progress value={biohackProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  {biohacks.filter((b) => b.completed).length} of {biohacks.length} biohacks completed
                </p>
              </div>
              <div className="space-y-3">
                {biohacks.map((biohack) => (
                  <div key={biohack.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`biohack-${biohack.id}`}
                        checked={biohack.completed}
                        onCheckedChange={() => toggleBiohack(biohack.id)}
                      />
                      <Label htmlFor={`biohack-${biohack.id}`} className="text-base">
                        {biohack.name}
                      </Label>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteBiohack(biohack.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex space-x-2">
                <Input
                  placeholder="Add new biohack"
                  value={newBiohackName}
                  onChange={(e) => setNewBiohackName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") addBiohack()
                  }}
                />
                <Button onClick={addBiohack}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Routines Tab */}
        <TabsContent value="routines" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Routines</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Morning Routine */}
              <h3 className="text-lg font-semibold mb-3">Morning Routine</h3>
              <div className="mb-4">
                <Progress value={morningRoutineProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  {morningRoutine.filter((item) => item.completed).length} of {morningRoutine.length} items completed
                </p>
              </div>
              <div className="space-y-3 mb-6">
                {morningRoutine.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`mr-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={() => toggleMorningRoutineItem(item.id)}
                      />
                      <Label htmlFor={`mr-${item.id}`} className="text-base">
                        {item.name}
                      </Label>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteMorningRoutineItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex space-x-2 mb-8">
                <Input
                  placeholder="Add morning routine item"
                  value={newMorningRoutineItem}
                  onChange={(e) => setNewMorningRoutineItem(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") addMorningRoutineItem()
                  }}
                />
                <Button onClick={addMorningRoutineItem}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>

              {/* Evening Routine */}
              <h3 className="text-lg font-semibold mb-3">Evening Routine</h3>
              <div className="mb-4">
                <Progress value={eveningRoutineProgress} className="w-full" />
                <p className="text-sm text-muted-foreground mt-2">
                  {eveningRoutine.filter((item) => item.completed).length} of {eveningRoutine.length} items completed
                </p>
              </div>
              <div className="space-y-3">
                {eveningRoutine.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id={`er-${item.id}`}
                        checked={item.completed}
                        onCheckedChange={() => toggleEveningRoutineItem(item.id)}
                      />
                      <Label htmlFor={`er-${item.id}`} className="text-base">
                        {item.name}
                      </Label>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => deleteEveningRoutineItem(item.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex space-x-2">
                <Input
                  placeholder="Add evening routine item"
                  value={newEveningRoutineItem}
                  onChange={(e) => setNewEveningRoutineItem(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === "Enter") addEveningRoutineItem()
                  }}
                />
                <Button onClick={addEveningRoutineItem}>
                  <PlusCircle className="h-4 w-4 mr-2" /> Add
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-12">
        <h2 className="text-2xl font-bold text-center mb-6">Latest #lifestyle Posts</h2>
        {loadingPosts ? (
          <p className="text-center text-muted-foreground">Loading...</p>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{post.title || "Note"}</CardTitle>
                    <span className="text-sm text-muted-foreground">
                      {new Date(post.created_at * 1000).toLocaleDateString()}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p>
                    {post.content.length > 200 ? post.content.slice(0, 200) + "..." : post.content}
                  </p>
                </CardContent>
              </Card>
            ))}
            {posts.length === 0 && !loadingPosts && (
              <p className="text-center text-muted-foreground">No posts found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
