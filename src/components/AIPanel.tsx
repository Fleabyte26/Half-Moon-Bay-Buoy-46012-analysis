"use client"

import { useState, useTransition, useMemo } from "react"
import { Sparkles, Brain, Target, LineChart, Loader2, Info } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { predictSession, SessionPredictionOutput } from "@/ai/flows/session-prediction-flow"
import { currentForecastByStation, OceanLocation } from "@/lib/mock-data"
import { Progress } from "@/components/ui/progress"

interface AIPanelProps {
  location: OceanLocation
}

export function AIPanel({ location }: AIPanelProps) {
  const [isPredicting, startPredicting] = useTransition()
  const [prediction, setPrediction] = useState<SessionPredictionOutput | null>(null)

  const currentForecast = useMemo(() => {
    return currentForecastByStation[location.stationId] || currentForecastByStation['default']
  }, [location])

  const handlePredict = () => {
    startPredicting(async () => {
      const result = await predictSession({
        locationName: location.name,
        historicalTrends: location.historicalTrends,
        currentForecast: {
          height: currentForecast.waveHeight,
          period: currentForecast.period,
          direction: currentForecast.direction,
          wind: currentForecast.wind,
          tide: currentForecast.tide,
        },
        activity: "advanced surfing"
      })
      setPrediction(result)
    })
  }

  return (
    <Card className="glass-panel h-full border-primary/20">
      <CardHeader>
        <div className="flex items-center gap-2 mb-1">
          <Badge variant="outline" className="border-primary text-primary bg-primary/5">
            Predictive Model v4.2
          </Badge>
        </div>
        <CardTitle className="text-2xl gradient-text font-headline">Session Predictor</CardTitle>
        <CardDescription>Correlating real-time data with 40 years of analysis.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="prediction" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/30">
            <TabsTrigger value="prediction" className="data-[state=active]:bg-primary">
              <Brain className="w-4 h-4 mr-2" /> Score
            </TabsTrigger>
            <TabsTrigger value="forecast" className="data-[state=active]:bg-primary">
              <LineChart className="w-4 h-4 mr-2" /> 7-Day
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="prediction" className="mt-6 space-y-4">
            <div className="space-y-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                Run the ML model to correlate Buoy <span className="text-foreground font-semibold">#{location.stationId}</span> against the 1984-2024 historical dataset.
              </p>
              <Button 
                onClick={handlePredict} 
                disabled={isPredicting}
                className="w-full bg-gradient-to-r from-primary to-accent hover:opacity-90 transition-opacity"
              >
                {isPredicting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                Run Predictive Model
              </Button>

              {prediction && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 rounded-lg bg-secondary/50 border border-border">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-bold text-accent uppercase tracking-widest">Match Score</span>
                      <span className="text-xl font-bold text-primary">{prediction.probabilityScore}%</span>
                    </div>
                    <Progress value={prediction.probabilityScore} className="h-1.5 mb-2" />
                    <p className="text-xs text-muted-foreground leading-relaxed italic">
                      {prediction.predictionSummary}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                    <Info className="w-3 h-3" /> Confidence: {prediction.confidenceLevel}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="forecast" className="mt-6 space-y-4">
            {prediction ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2">
                {prediction.upcomingWindows.map((window, i) => (
                  <div key={i} className="p-3 rounded-lg bg-secondary/40 border border-white/5 flex flex-col gap-1">
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-sm">{window.day}</span>
                      <Badge variant={window.score > 80 ? 'default' : 'secondary'} className="text-[10px]">
                        {window.score}% Quality
                      </Badge>
                    </div>
                    <p className="text-[10px] text-muted-foreground">{window.reason}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <LineChart className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-xs">Run prediction to generate 7-day model.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
