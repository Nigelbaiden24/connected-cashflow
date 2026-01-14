import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Video, 
  Mic, 
  MicOff, 
  VideoOff, 
  Phone, 
  Copy, 
  ExternalLink, 
  Download,
  Users,
  Clock,
  FileText,
  Sparkles,
  Loader2,
  ChevronDown,
  ChevronUp,
  X
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMeetingTranscription } from "@/hooks/useMeetingTranscription";
import { supabase } from "@/integrations/supabase/client";

interface ChatMeetingPanelProps {
  onTranscriptUpdate?: (transcript: string[]) => void;
  onMeetingSummary?: (summary: string) => void;
  isMinimized?: boolean;
  onMinimizeToggle?: () => void;
  onClose?: () => void;
}

interface MeetingInfo {
  platform: string;
  url: string;
  startTime: Date;
  participants?: string[];
}

export const ChatMeetingPanel = ({ 
  onTranscriptUpdate, 
  onMeetingSummary,
  isMinimized = false,
  onMinimizeToggle,
  onClose
}: ChatMeetingPanelProps) => {
  const [zoomUrl, setZoomUrl] = useState("");
  const [googleMeetUrl, setGoogleMeetUrl] = useState("");
  const [teamsUrl, setTeamsUrl] = useState("");
  const [activeMeeting, setActiveMeeting] = useState<MeetingInfo | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const { toast } = useToast();
  const { 
    isTranscribing, 
    transcript, 
    startTranscription, 
    stopTranscription, 
    clearTranscript 
  } = useMeetingTranscription();

  // Update parent with transcript changes
  useEffect(() => {
    if (onTranscriptUpdate) {
      onTranscriptUpdate(transcript);
    }
  }, [transcript, onTranscriptUpdate]);

  // Track meeting duration
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeMeeting) {
      interval = setInterval(() => {
        setMeetingDuration(Math.floor((Date.now() - activeMeeting.startTime.getTime()) / 1000));
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeMeeting]);

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hrs > 0) {
      return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const validateMeetingUrl = (platform: string, url: string): boolean => {
    if (!url.trim()) return false;
    
    switch (platform) {
      case "Zoom":
        return url.includes("zoom.us") || /^\d{9,11}$/.test(url.replace(/\s/g, ''));
      case "Google Meet":
        return url.includes("meet.google.com");
      case "Microsoft Teams":
        return url.includes("teams.microsoft.com") || url.includes("teams.live.com");
      default:
        return true;
    }
  };

  const handleJoinMeeting = async (platform: string, url: string) => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a meeting URL or ID",
        variant: "destructive",
      });
      return;
    }

    if (!validateMeetingUrl(platform, url)) {
      toast({
        title: "Invalid URL",
        description: `Please enter a valid ${platform} meeting URL`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Open meeting in new tab
      let meetingLink = url;
      if (platform === "Zoom" && !url.includes("http")) {
        meetingLink = `https://zoom.us/j/${url.replace(/\s/g, '')}`;
      }
      window.open(meetingLink, '_blank');

      setActiveMeeting({
        platform,
        url,
        startTime: new Date(),
      });

      await startTranscription();

      toast({
        title: "Meeting Joined",
        description: `Connected to ${platform}. Real-time transcription is now active.`,
      });
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast({
        title: "Microphone Access Required",
        description: "Please enable microphone access to transcribe the meeting.",
        variant: "destructive",
      });
      setActiveMeeting(null);
    }
  };

  const handleEndMeeting = async () => {
    if (!activeMeeting) return;

    stopTranscription();
    
    // Generate meeting summary if we have transcript
    if (transcript.length > 0 && onMeetingSummary) {
      await generateMeetingSummary();
    }

    toast({
      title: "Meeting Ended",
      description: `${activeMeeting.platform} session ended. Duration: ${formatDuration(meetingDuration)}`,
    });
    
    setActiveMeeting(null);
    setMeetingDuration(0);
  };

  const generateMeetingSummary = async () => {
    if (transcript.length === 0) return;

    setIsGeneratingSummary(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('financial-chat', {
        body: {
          messages: [{
            role: 'user',
            content: `Please provide a comprehensive meeting summary with the following structure:

## Meeting Summary
- **Duration**: ${formatDuration(meetingDuration)}
- **Platform**: ${activeMeeting?.platform}
- **Date**: ${new Date().toLocaleDateString()}

## Key Discussion Points
[List main topics discussed]

## Decisions Made
[List any decisions that were made]

## Action Items
[List action items with owners if mentioned]

## Follow-up Required
[List any follow-up items]

---

**Full Transcript:**
${transcript.join('\n')}`
          }],
          stream: false
        }
      });

      if (error) throw error;

      const summary = data?.content || data?.message || 'Meeting summary generated.';
      
      if (onMeetingSummary) {
        onMeetingSummary(summary);
      }

      toast({
        title: "Summary Generated",
        description: "AI meeting summary has been added to the chat.",
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      toast({
        title: "Summary Error",
        description: "Failed to generate meeting summary.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const copyTranscript = () => {
    if (transcript.length > 0) {
      navigator.clipboard.writeText(transcript.join('\n\n'));
      toast({
        title: "Copied",
        description: "Full transcript copied to clipboard",
      });
    }
  };

  const downloadTranscript = () => {
    if (transcript.length === 0) return;
    
    const content = `Meeting Transcript
==================
Platform: ${activeMeeting?.platform || 'Unknown'}
Date: ${new Date().toLocaleDateString()}
Duration: ${formatDuration(meetingDuration)}

==================

${transcript.join('\n\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-transcript-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Downloaded",
      description: "Transcript saved to file",
    });
  };

  if (isMinimized && activeMeeting) {
    return (
      <div className="fixed bottom-24 right-4 z-50">
        <Card className="w-64 shadow-xl border-green-500/50 bg-background/95 backdrop-blur">
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-sm font-medium">{activeMeeting.platform}</span>
              </div>
              <div className="flex items-center gap-1">
                <Badge variant="secondary" className="text-xs">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(meetingDuration)}
                </Badge>
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onMinimizeToggle}>
                  <ChevronUp className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                className="flex-1 h-7 text-xs"
                onClick={onMinimizeToggle}
              >
                Expand
              </Button>
              <Button 
                variant="destructive" 
                size="sm" 
                className="h-7 text-xs"
                onClick={handleEndMeeting}
              >
                End
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <Card className="w-full border-primary/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg">
              <Video className="h-5 w-5 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg">Meeting Integration</CardTitle>
              <CardDescription className="text-sm">
                Join meetings with live AI transcription
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {activeMeeting && onMinimizeToggle && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onMinimizeToggle}>
                <ChevronDown className="h-4 w-4" />
              </Button>
            )}
            {onClose && (
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!activeMeeting ? (
          <Tabs defaultValue="zoom" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="zoom" className="text-sm">
                <Video className="h-4 w-4 mr-1" />
                Zoom
              </TabsTrigger>
              <TabsTrigger value="meet" className="text-sm">
                <Users className="h-4 w-4 mr-1" />
                Google Meet
              </TabsTrigger>
              <TabsTrigger value="teams" className="text-sm">
                <Video className="h-4 w-4 mr-1" />
                Teams
              </TabsTrigger>
            </TabsList>

            <TabsContent value="zoom" className="space-y-3 mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Zoom URL or Meeting ID"
                  value={zoomUrl}
                  onChange={(e) => setZoomUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleJoinMeeting("Zoom", zoomUrl)}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join & Transcribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste your Zoom link or enter Meeting ID (e.g., 123 456 789)
              </p>
            </TabsContent>

            <TabsContent value="meet" className="space-y-3 mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Google Meet URL"
                  value={googleMeetUrl}
                  onChange={(e) => setGoogleMeetUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleJoinMeeting("Google Meet", googleMeetUrl)}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join & Transcribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Example: https://meet.google.com/abc-defg-hij
              </p>
            </TabsContent>

            <TabsContent value="teams" className="space-y-3 mt-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Microsoft Teams URL"
                  value={teamsUrl}
                  onChange={(e) => setTeamsUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleJoinMeeting("Microsoft Teams", teamsUrl)}
                  className="bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join & Transcribe
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Paste your Teams meeting invitation link
              </p>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            {/* Meeting Status Bar */}
            <div className="flex items-center justify-between p-3 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border border-green-500/30">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <div>
                  <span className="font-semibold text-green-700 dark:text-green-400">
                    {activeMeeting.platform}
                  </span>
                  <span className="text-sm text-muted-foreground ml-2">
                    Live Session
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="secondary" className="bg-green-500/20 text-green-700 dark:text-green-300">
                  <Clock className="h-3 w-3 mr-1" />
                  {formatDuration(meetingDuration)}
                </Badge>
              </div>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className={isTranscribing ? "border-green-500/50 text-green-600" : "border-red-500/50 text-red-600"}
                >
                  {isTranscribing ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  <span className="ml-1">{isTranscribing ? "Recording" : "Paused"}</span>
                </Button>
              </div>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={copyTranscript}
                  disabled={transcript.length === 0}
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={downloadTranscript}
                  disabled={transcript.length === 0}
                >
                  <Download className="h-4 w-4" />
                </Button>
                <Button 
                  variant="destructive" 
                  size="sm"
                  onClick={handleEndMeeting}
                  disabled={isGeneratingSummary}
                >
                  {isGeneratingSummary ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Phone className="h-4 w-4 rotate-135 mr-1" />
                  )}
                  End & Summarize
                </Button>
              </div>
            </div>

            <Separator />

            {/* Live Transcript */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  Live Transcript
                  {isTranscribing && (
                    <Badge variant="outline" className="text-xs animate-pulse">
                      <Sparkles className="h-3 w-3 mr-1" />
                      AI Processing
                    </Badge>
                  )}
                </h3>
                <span className="text-xs text-muted-foreground">
                  {transcript.length} segment{transcript.length !== 1 ? 's' : ''}
                </span>
              </div>
              <ScrollArea className="h-[250px] w-full rounded-lg border bg-muted/20 p-4">
                <div className="space-y-3">
                  {transcript.length === 0 ? (
                    <div className="text-center py-8">
                      <Mic className="h-8 w-8 mx-auto text-muted-foreground/50 mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Listening for speech...
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Speak clearly near your microphone
                      </p>
                    </div>
                  ) : (
                    transcript.map((entry, index) => (
                      <div 
                        key={index} 
                        className="text-sm p-2 rounded-lg bg-background/50 border border-border/50"
                      >
                        {entry}
                      </div>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>

            <p className="text-xs text-muted-foreground text-center">
              {activeMeeting.url}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
