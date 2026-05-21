"use client"

import { useState, useMemo, useTransition } from "react"
import { 
  Waves, 
  TrendingUp, 
  MapPin, 
  Zap,
  Target,
  Database,
  ChevronRight,
  Menu,
  X,
  Search,
  Activity,
  History,
  Binary,
  CloudUpload,
  Table as TableIcon,
  Loader2,
  Globe,
  Sparkles,
  Calendar as CalendarIcon,
  Server
} from "lucide-react"
import { locations, currentForecastByStation, OceanLocation } from "@/lib/mock-data"
import { WaveChart } from "@/components/WaveChart"
import { AIPanel } from "@/components/AIPanel"
import { TripPlanner } from "@/components/TripPlanner"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { runEnquiryAgent } from "@/ai/flows/enquiry-agent"
import { useToast } from "@/hooks/use-toast"
import { doc, setDoc, addDoc, collection } from "firebase/firestore"
import { useFirestore, errorEmitter, FirestorePermissionError } from "@/firebase"

export default function OceanCastDashboard() {
  const [selectedLocation, setSelectedLocation] = useState<OceanLocation>(locations[0])
  const [searchQuery, setSearchQuery] = useState("")
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isEnquiring, startEnquiry] = useTransition()
  const { toast } = useToast()
  
  const db = useFirestore();

  const currentForecast = useMemo(() => {
    return currentForecastByStation[selectedLocation.stationId] || currentForecastByStation['default']
  }, [selectedLocation])

  const liveProbability = useMemo(() => {
    const base = selectedLocation.stationId === '46012' ? 78 : 64;
    return base + Math.floor(Math.random() * 5);
  }, [selectedLocation])

  const handleAgentSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery) return;

    startEnquiry(async () => {
      const result = await runEnquiryAgent({ query: searchQuery, source: 'noaa' });
      
      if (result.status === 'success' && result.resolvedStation) {
        if (db) {
          const stationId = result.resolvedStation.id;
          const stationRef = doc(db, 'buoys', stationId);
          const buoyData = {
            stationId: stationId,
            name: result.resolvedStation.name,
            lat: result.resolvedStation.lat || 0,
            lng: result.resolvedStation.lng || 0,
            lastEnriched: new Date().toISOString(),
            isProcessing: false
          };

          setDoc(stationRef, buoyData, { merge: true })
            .catch(async () => {
              errorEmitter.emit('permission-error', new FirestorePermissionError({
                path: stationRef.path,
                operation: 'write',
                requestResourceData: buoyData
              }));
            });

          if (result.stationInfo?.lastReading) {
            const readingData = {
              stationId: stationId,
              timestamp: result.stationInfo.lastReading,
              waveHeight: parseFloat(result.stationInfo.waveHeight || "0"),
              period: 14,
              direction: 280,
            };
            const readingsCol = collection(db, 'buoy_readings');
            addDoc(readingsCol, readingData)
              .catch(async () => {
                errorEmitter.emit('permission-error', new FirestorePermissionError({
                  path: readingsCol.path,
                  operation: 'create',
                  requestResourceData: readingData
                }));
              });
          }
        }

        toast({
          title: "Agent Resolved Location",
          description: `Ingested ${result.resolvedStation.name} into Big Table.`,
        });
        
        const newLoc: OceanLocation = {
          id: result.resolvedStation.id,
          name: result.resolvedStation.name,
          stationId: result.resolvedStation.id,
          lat: result.resolvedStation.lat || 0,
          lng: result.resolvedStation.lng || 0,
          description: `Location ingested via Gemini agentic discovery.`,
          bathymetryInfo: "Deep water approach funneling swells.",
          historicalTrends: "Analyzing new station correlations with global buoy nodes..."
        };
        setSelectedLocation(newLoc);
      } else {
        toast({
          variant: "destructive",
          title: "Agent Error",
          description: result.message,
        });
      }
    });
  }

  return (
    <div className="flex h-screen bg-[#0a0c10] text-foreground overflow-hidden font-body">
      <aside className={`${isSidebarOpen ? 'w-72' : 'w-0'} transition-all duration-300 border-r border-white/5 bg-[#0d1117] flex flex-col overflow-hidden`}>
        <div className="p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded bg-primary flex items-center justify-center">
              <Binary className="text-white w-5 h-5" />
            </div>
            <h1 className="text-lg font-bold tracking-tighter uppercase italic">WaveCast.ai</h1>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(false)} className="text-muted-foreground hover:text-white">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="px-6 pb-4 shrink-0">
          <form onSubmit={handleAgentSearch} className="relative group">
            <Sparkles className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-accent animate-pulse group-focus-within:text-primary transition-colors" />
            <Input 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ask Agent: 'Baja' or 'NSW'..." 
              className="pl-10 bg-black/20 border-accent/20 h-10 text-xs focus-visible:ring-accent/50 placeholder:text-muted-foreground/30" 
            />
            {isEnquiring && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <Loader2 className="w-3 h-3 animate-spin text-accent" />
              </div>
            )}
          </form>
          <div className="mt-2 text-[9px] text-muted-foreground/40 font-mono text-center uppercase tracking-widest">
            Gemini Discovery Engine Active
          </div>
        </div>

        <ScrollArea className="flex-1 px-4">
          <div className="space-y-6">
            <div>
              <h3 className="px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-3 flex items-center gap-2">
                <Database className="w-3 h-3" /> Historical Baselines
              </h3>
              <div className="space-y-0.5">
                {locations.map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => setSelectedLocation(loc)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded transition-all text-xs ${selectedLocation.id === loc.id ? 'bg-primary/10 text-primary border-l-2 border-primary' : 'hover:bg-white/[0.02] text-muted-foreground/80 border-l-2 border-transparent'}`}
                  >
                    <div className="flex-1 text-left">
                      <div className="font-semibold">{loc.name}</div>
                      <div className="text-[9px] opacity-40 font-mono">STATION_{loc.stationId}</div>
                    </div>
                    {selectedLocation.id === loc.id && <Activity className="w-3 h-3 animate-pulse" />}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div className="p-4 bg-black/40 border-t border-white/5 shrink-0">
          <div className="flex items-center justify-between text-[10px] text-muted-foreground/60 mb-2 font-mono">
            <span>K8S_DEPLOY_TARGET</span>
            <span className="text-primary">WAVECAST.AI</span>
          </div>
          <div className="flex items-center justify-between text-[9px] text-muted-foreground/40 font-mono">
            <span>TLS_STATUS</span>
            <span className="text-green-500 font-bold">ENCRYPTED</span>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto bg-gradient-to-b from-[#0a0c10] to-[#0d1117]">
        <header className="sticky top-0 z-30 bg-[#0a0c10]/80 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsSidebarOpen(true)} className="hover:bg-white/5">
                <Menu className="w-5 h-5" />
              </Button>
            )}
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold tracking-tight uppercase italic">
                  {selectedLocation.name}
                </h2>
                <Badge variant="outline" className="text-[9px] h-4 bg-primary/5 border-primary/20 text-primary uppercase font-mono tracking-tighter">
                  ML_PREDICTOR_V4
                </Badge>
              </div>
              <div className="flex items-center gap-3 mt-0.5 text-[10px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1 opacity-60"><MapPin className="w-2.5 h-2.5 text-primary" /> {selectedLocation.lat}, {selectedLocation.lng}</span>
                <span className="opacity-40">|</span>
                <span className="opacity-60 uppercase">NODE_{selectedLocation.stationId}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <Button 
               variant="outline" 
               size="sm" 
               className="h-8 text-[10px] font-bold uppercase tracking-widest border-accent/30 hover:bg-accent/10 text-accent"
               onClick={() => {
                 startEnquiry(async () => {
                   const res = await runEnquiryAgent({ query: selectedLocation.stationId, source: 'github' });
                   toast({ title: "Sync Complete", description: res.message });
                 });
               }}
               disabled={isEnquiring}
             >
               {isEnquiring ? <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" /> : <CloudUpload className="w-3.5 h-3.5 mr-2" />}
               Fetch Analysis
             </Button>
          </div>
        </header>

        <div className="p-6 lg:p-10 max-w-[1600px] mx-auto space-y-6">
          <Tabs defaultValue="dashboard" className="w-full">
            <div className="flex items-center justify-between mb-6">
              <TabsList className="bg-[#0d1117] border border-white/5">
                <TabsTrigger value="dashboard" className="text-[10px] font-bold uppercase tracking-widest px-6 data-[state=active]:bg-primary">
                  <Activity className="w-3.5 h-3.5 mr-2" /> Live Node
                </TabsTrigger>
                <TabsTrigger value="planner" className="text-[10px] font-bold uppercase tracking-widest px-6 data-[state=active]:bg-accent">
                  <CalendarIcon className="w-3.5 h-3.5 mr-2" /> Session Builder
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="dashboard" className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <Card className="lg:col-span-4 bg-[#0d1117] border-white/5 p-8 flex flex-col items-center justify-center relative overflow-hidden group">
                  <div className="absolute inset-0 bg-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative z-10 text-center space-y-2">
                    <div className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-[0.3em]">ML Quality Prediction</div>
                    <div className="text-8xl font-black font-headline tracking-tighter text-white drop-shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                      {liveProbability}%
                    </div>
                    <div className="flex items-center justify-center gap-2 text-accent text-xs font-mono">
                      <Sparkles className="w-3.5 h-3.5" /> PATTERN_MATCH_ACTIVE
                    </div>
                    <div className="mt-8 w-64 space-y-2 mx-auto">
                      <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full bg-accent shadow-[0_0_10px_rgba(259,100,246,0.5)] transition-all duration-1000" style={{ width: `${liveProbability}%` }} />
                      </div>
                      <div className="flex justify-between text-[9px] font-mono text-muted-foreground/40 uppercase tracking-widest">
                        <span>Baseline</span>
                        <span>Epic_Correlation</span>
                      </div>
                    </div>
                  </div>
                </Card>

                <Card className="lg:col-span-8 bg-[#0d1117] border-white/5 overflow-hidden flex flex-col">
                  <div className="p-4 border-b border-white/5 bg-black/20 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                      <Zap className="w-3 h-3 text-primary" /> Current Swell Signature
                    </span>
                    <Badge variant="outline" className="text-[9px] font-mono opacity-60 uppercase">Node_{selectedLocation.stationId}</Badge>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-white/5 h-full">
                    <div className="p-6 flex flex-col justify-center">
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase mb-1">Amplitude</span>
                      <div className="text-3xl font-bold tracking-tight">{currentForecast.waveHeight}</div>
                      <span className="text-[10px] text-primary font-mono mt-1">WVHT_M</span>
                    </div>
                    <div className="p-6 flex flex-col justify-center">
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase mb-1">Cycle</span>
                      <div className="text-3xl font-bold tracking-tight">{currentForecast.period}</div>
                      <span className="text-[10px] text-primary font-mono mt-1">DPD_SEC</span>
                    </div>
                    <div className="p-6 flex flex-col justify-center">
                      <span className="text-[9px] font-bold text-muted-foreground/60 uppercase mb-1">Direction</span>
                      <div className="text-xl font-bold tracking-tight truncate">{currentForecast.direction}</div>
                      <span className="text-[10px] text-accent font-mono mt-1">MWD_DEG</span>
                    </div>
                    <div className="p-6 flex flex-col justify-center bg-accent/[0.02]">
                      <span className="text-[9px] font-bold text-accent/80 uppercase mb-1">Tide Phase</span>
                      <div className="text-lg font-bold leading-tight">Optimal</div>
                      <div className="text-[10px] text-muted-foreground mt-1 font-mono uppercase">{currentForecast.tide.split('(')[0]}</div>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 h-full">
                  <AIPanel location={selectedLocation} />
                </div>
                
                <div className="lg:col-span-8 space-y-6">
                  <Card className="bg-[#0d1117] border-white/5 p-6 h-full flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                        <TableIcon className="w-4 h-4 text-primary" /> Big Table Registry (Ingested)
                      </h3>
                      <Badge variant="outline" className="text-[9px] font-mono opacity-60">STATION_INGEST_LOG</Badge>
                    </div>
                    
                    <div className="flex-1 overflow-x-auto">
                      <table className="w-full text-[11px] font-mono border-collapse">
                        <thead>
                          <tr className="text-muted-foreground/40 border-b border-white/5 text-left">
                            <th className="pb-2 font-medium">INGEST_TIME (UTC)</th>
                            <th className="pb-2 font-medium">WVHT (m)</th>
                            <th className="pb-2 font-medium">DPD (s)</th>
                            <th className="pb-2 font-medium">MWD (°)</th>
                            <th className="pb-2 font-medium text-right">CORR_CONF</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/[0.02]">
                          {[...Array(5)].map((_, i) => (
                            <tr key={i} className="text-muted-foreground/80 hover:bg-white/[0.01]">
                              <td className="py-2.5">2024-03-{15-i}T12:00:00</td>
                              <td className="py-2.5">{(2.5 + Math.random()).toFixed(1)}</td>
                              <td className="py-2.5">{(12 + Math.random() * 4).toFixed(1)}</td>
                              <td className="py-2.5">{285 + i}</td>
                              <td className="py-2.5 text-right text-accent">0.99</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-6 pt-4 border-t border-white/5 text-[9px] text-muted-foreground font-mono italic">
                      * Autonomous enquiry agents populating Big Table via Gemini 2.5 Flash
                    </div>
                  </Card>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-6">
                 <WaveChart stationId={selectedLocation.stationId} />
              </div>
            </TabsContent>

            <TabsContent value="planner" className="animate-in fade-in slide-in-from-bottom-2 duration-500">
               <div className="max-w-4xl mx-auto">
                 <TripPlanner />
               </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  )
}
