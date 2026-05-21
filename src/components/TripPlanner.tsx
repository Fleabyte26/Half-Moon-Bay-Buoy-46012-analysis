"use client"

import { useState, useTransition } from "react"
import { 
  Calendar as CalendarIcon, 
  Palmtree, 
  Sparkles, 
  ChevronRight, 
  Loader2, 
  AlertCircle,
  Clock,
  Waves,
  Navigation,
  Activity,
  Tide
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { planTrip } from "@/ai/flows/trip-planner-flow"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/hooks/use-toast"
import { locations } from "@/lib/mock-data"

export function TripPlanner() {
  const [isPlanning, startPlanning] = useTransition()
  const [itinerary, setItinerary] = useState<any>(null)
  const [formData, setFormData] = useState({
    location: "North Shore, Hawaii",
    startDate: "2027-01-12",
    endDate: "2027-01-20"
  })

  const handleBuildItinerary = () => {
    // Attempt to find historical context for the location
    const matchedLoc = locations.find(l => l.name.toLowerCase().includes(formData.location.toLowerCase()))
    const historicalContext = matchedLoc?.historicalTrends || "Analyzing generic 40-year NOAA global climate trends..."

    startPlanning(async () => {
      try {
        const result = await planTrip({
          location: formData.location,
          startDate: formData.startDate,
          endDate: formData.endDate,
          experienceLevel: 'advanced',
          historicalContext
        })
        setItinerary(result)
        toast({ title: "Itinerary Synthesized", description: `Predictive model loaded using historical correlations.` })
      } catch (e) {
        toast({ variant: "destructive", title: "Synthesis Error", description: "Failed to correlate historical buoy data." })
      }
    })
  }

  return (
    <Card className="bg-[#0d1117] border-accent/20 overflow-hidden h-full flex flex-col">
      <CardHeader className="bg-accent/5 border-b border-white/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-accent flex items-center justify-center">
              <Palmtree className="text-white w-5 h-5" />
            </div>
            <div>
              <CardTitle className="text-sm font-bold uppercase tracking-widest">Historical Predictor Trip Builder</CardTitle>
              <CardDescription className="text-[10px] font-mono">CORRELATING 1984-2024 SWELL SIGNATURES</CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="text-[9px] border-accent/30 text-accent font-mono">ML_PLANNER_V2</Badge>
        </div>
      </CardHeader>
      
      <CardContent className="p-0 flex-1 flex flex-col overflow-hidden">
        <div className="p-6 border-b border-white/5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground/60">Destination</Label>
              <div className="relative">
                <Navigation className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-accent" />
                <Input 
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="pl-9 bg-black/40 border-white/10 h-9 text-xs" 
                />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label className="text-[10px] uppercase font-bold text-muted-foreground/60">Trip Window</Label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input 
                  value={`${formData.startDate} to ${formData.endDate}`}
                  readOnly
                  className="pl-9 bg-black/40 border-white/10 h-9 text-xs" 
                />
              </div>
            </div>
          </div>
          <Button 
            onClick={handleBuildItinerary}
            disabled={isPlanning}
            className="w-full bg-accent hover:bg-accent/80 text-white font-bold uppercase tracking-widest text-[10px] h-10"
          >
            {isPlanning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
            Synthesize Trip Prediction
          </Button>
        </div>

        <ScrollArea className="flex-1">
          {itinerary ? (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="p-4 rounded bg-accent/5 border border-accent/20">
                  <h4 className="text-[10px] font-bold text-accent uppercase mb-2 flex items-center gap-2">
                    <Activity className="w-3.5 h-3.5" /> Prediction Logic
                  </h4>
                  <p className="text-[11px] leading-relaxed text-muted-foreground/80 font-mono italic">
                    "{itinerary.historicalPredictorSummary}"
                  </p>
                </div>
                <div className="p-4 rounded bg-primary/5 border border-primary/20">
                  <h4 className="text-[10px] font-bold text-primary uppercase mb-2 flex items-center gap-2">
                    <Waves className="w-3.5 h-3.5" /> Gear Recommendation
                  </h4>
                  <p className="text-[11px] leading-relaxed text-muted-foreground/80 font-mono italic">
                    {itinerary.gearRecommendation}
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                {itinerary.days.map((day: any, i: number) => (
                  <div key={i} className="group relative pl-4 border-l-2 border-white/5 hover:border-accent transition-colors">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                         <span className="text-xs font-bold font-mono">{day.date}</span>
                         <Badge variant="outline" className="text-[8px] font-mono py-0 h-4 uppercase opacity-60">
                           {day.tideContext}
                         </Badge>
                      </div>
                      <Badge variant="outline" className={`text-[10px] font-mono ${day.probabilityScore > 80 ? 'text-green-400 border-green-400/20' : 'border-white/10'}`}>
                        CORR_SCORE: {day.probabilityScore}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
                      <div className="p-3 rounded bg-black/40 border border-white/5">
                        <div className="text-[9px] uppercase font-bold text-primary flex items-center gap-1 mb-1">
                          <Clock className="w-2.5 h-2.5" /> AM Forecast
                        </div>
                        <div className="text-[11px] font-medium leading-tight text-white/90">{day.morningSession}</div>
                      </div>
                      <div className="p-3 rounded bg-black/40 border border-white/5">
                        <div className="text-[9px] uppercase font-bold text-accent flex items-center gap-1 mb-1">
                          <Clock className="w-2.5 h-2.5" /> PM Forecast
                        </div>
                        <div className="text-[11px] font-medium leading-tight text-white/90">{day.afternoonSession}</div>
                      </div>
                    </div>
                    <div className="mt-2 space-y-1">
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        <span className="text-accent/60 font-bold uppercase mr-1">Historical Pattern:</span> {day.historicalMatch}
                      </p>
                      <p className="text-[10px] text-muted-foreground/40 italic">
                        {day.reasoning}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-[300px] flex flex-col items-center justify-center text-center p-10">
              <Waves className="w-12 h-12 text-muted-foreground/10 mb-4" />
              <div className="text-xs font-bold uppercase tracking-widest text-muted-foreground/40">No Model Loaded</div>
              <p className="text-[10px] text-muted-foreground/20 mt-2 max-w-[240px]">
                Enter your destination and dates to trigger the 40-year historical correlation agent.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
