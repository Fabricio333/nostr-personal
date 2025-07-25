"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dumbbell, Apple, Zap, Clock, CheckCircle, Circle, TrendingUp, Calendar, Target } from "lucide-react"

// Mock data - in a real app, this would come from a database or API
const workouts = [
  {
    id: 1,
    name: "Upper Body Strength",
    date: "2024-01-25",
    duration: 45,
    exercises: ["Push-ups", "Pull-ups", "Bench Press", "Rows"],
    completed: true,
  },
  {
    id: 2,
    name: "Cardio HIIT",
    date: "2024-01-24",
    duration: 30,
    exercises: ["Burpees", "Mountain Climbers", "Jump Squats", "High Knees"],
    completed: true,
  },
  {
    id: 3,
    name: "Lower Body Power",
    date: "2024-01-26",
    duration: 50,
    exercises: ["Squats", "Deadlifts", "Lunges", "Calf Raises"],
    completed: false,
  },
]

const meals = [
  {
    id: 1,
    name: "Breakfast",
    date: "2024-01-25",
    foods: ["Oatmeal", "Berries", "Almonds", "Greek Yogurt"],
    calories: 450,
    protein: 25,
    carbs: 65,
    fat: 12,
  },
  {
    id: 2,
    name: "Lunch",
    date: "2024-01-25",
    foods: ["Grilled Chicken", "Quinoa", "Vegetables", "Avocado"],
    calories: 620,
    protein: 45,
    carbs: 55,
    fat: 18,
  },
  {
    id: 3,
    name: "Dinner",
    date: "2024-01-25",
    foods: ["Salmon", "Sweet Potato", "Broccoli", "Olive Oil"],
    calories: 580,
    protein: 40,
    carbs: 45,
    fat: 22,
  },
]

const biohacks = [
  {
    id: 1,
    name: "Cold Shower",
    description: "2-3 minutes cold exposure",
    frequency: "Daily",
    completed: true,
    streak: 15,
  },
  {
    id: 2,
    name: "Intermittent Fasting",
    description: "16:8 fasting window",
    frequency: "Daily",
    completed: true,
    streak: 30,
  },
  {
    id: 3,
    name: "Meditation",
    description: "10 minutes mindfulness",
    frequency: "Daily",
    completed: false,
    streak: 7,
  },
  {
    id: 4,
    name: "Blue Light Blocking",
    description: "Glasses after sunset",
    frequency: "Evening",
    completed: true,
    streak: 12,
  },
]

const routines = {
  morning: [
    { task: "Wake up at 6:00 AM", completed: true },
    { task: "Drink 500ml water", completed: true },
    { task: "10 minutes meditation", completed: false },
    { task: "Cold shower", completed: true },
    { task: "Healthy breakfast", completed: true },
    { task: "Review daily goals", completed: false },
  ],
  evening: [
    { task: "No screens 1 hour before bed", completed: false },
    { task: "Read for 30 minutes", completed: true },
    { task: "Gratitude journaling", completed: false },
    { task: "Prepare tomorrow's clothes", completed: true },
    { task: "In bed by 10:30 PM", completed: false },
  ],
}

export default function LifestylePage() {
  const [activeTab, setActiveTab] = useState("workouts")

  const toggleTask = (routine: "morning" | "evening", index: number) => {
    // In a real app, this would update the database
    console.log(`Toggle ${routine} task ${index}`)
  }

  const toggleBiohack = (id: number) => {
    // In a real app, this would update the database
    console.log(`Toggle biohack ${id}`)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Lifestyle Tracking</h1>
        <p className="text-muted-foreground">Monitor your fitness, nutrition, biohacks, and daily routines</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="workouts" className="flex items-center gap-2">
            <Dumbbell className="h-4 w-4" />
            Workouts
          </TabsTrigger>
          <TabsTrigger value="nutrition" className="flex items-center gap-2">
            <Apple className="h-4 w-4" />
            Nutrition
          </TabsTrigger>
          <TabsTrigger value="biohacks" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Biohacks
          </TabsTrigger>
          <TabsTrigger value="routines" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Routines
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workouts" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {workouts.map((workout) => (
              <Card
                key={workout.id}
                className={`transition-all ${workout.completed ? "border-green-200 bg-green-50/50" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      {workout.completed ? (
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      ) : (
                        <Circle className="h-5 w-5 text-muted-foreground" />
                      )}
                      {workout.name}
                    </CardTitle>
                    <Badge variant={workout.completed ? "default" : "secondary"}>
                      {workout.completed ? "Done" : "Pending"}
                    </Badge>
                  </div>
                  <CardDescription className="flex items-center gap-4">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {workout.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {workout.duration}min
                    </span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">Exercises:</p>
                    <div className="flex flex-wrap gap-1">
                      {workout.exercises.map((exercise) => (
                        <Badge key={exercise} variant="outline" className="text-xs">
                          {exercise}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button className="w-full mt-4" variant={workout.completed ? "outline" : "default"}>
                    {workout.completed ? "View Details" : "Start Workout"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-6">
          <div className="grid gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Daily Nutrition Goals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Calories</span>
                      <span>1650 / 2000</span>
                    </div>
                    <Progress value={82.5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Protein</span>
                      <span>110g / 150g</span>
                    </div>
                    <Progress value={73.3} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Carbs</span>
                      <span>165g / 200g</span>
                    </div>
                    <Progress value={82.5} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4">
              {meals.map((meal) => (
                <Card key={meal.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle>{meal.name}</CardTitle>
                      <Badge variant="outline">{meal.calories} cal</Badge>
                    </div>
                    <CardDescription>{meal.date}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-1 mb-4">
                      {meal.foods.map((food) => (
                        <Badge key={food} variant="secondary" className="text-xs">
                          {food}
                        </Badge>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-center">
                        <p className="font-medium text-blue-600">{meal.protein}g</p>
                        <p className="text-muted-foreground">Protein</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-green-600">{meal.carbs}g</p>
                        <p className="text-muted-foreground">Carbs</p>
                      </div>
                      <div className="text-center">
                        <p className="font-medium text-orange-600">{meal.fat}g</p>
                        <p className="text-muted-foreground">Fat</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="biohacks" className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            {biohacks.map((biohack) => (
              <Card
                key={biohack.id}
                className={`transition-all ${biohack.completed ? "border-green-200 bg-green-50/50" : ""}`}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() => toggleBiohack(biohack.id)}
                      >
                        {biohack.completed ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                      {biohack.name}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">{biohack.streak}</span>
                    </div>
                  </div>
                  <CardDescription>{biohack.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">{biohack.frequency}</Badge>
                    <span className="text-sm text-muted-foreground">{biohack.streak} day streak</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="routines" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-500" />
                  Morning Routine
                </CardTitle>
                <CardDescription>Start your day right</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {routines.morning.map((task, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() => toggleTask("morning", index)}
                      >
                        {task.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.task}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {routines.morning.filter((t) => t.completed).length} / {routines.morning.length}
                    </span>
                  </div>
                  <Progress
                    value={(routines.morning.filter((t) => t.completed).length / routines.morning.length) * 100}
                    className="h-2 mt-1"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  Evening Routine
                </CardTitle>
                <CardDescription>Wind down for better sleep</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {routines.evening.map((task, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="p-0 h-auto"
                        onClick={() => toggleTask("evening", index)}
                      >
                        {task.completed ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                      </Button>
                      <span className={`text-sm ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                        {task.task}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>
                      {routines.evening.filter((t) => t.completed).length} / {routines.evening.length}
                    </span>
                  </div>
                  <Progress
                    value={(routines.evening.filter((t) => t.completed).length / routines.evening.length) * 100}
                    className="h-2 mt-1"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
