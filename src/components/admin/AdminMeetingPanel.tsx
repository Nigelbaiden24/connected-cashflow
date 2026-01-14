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
  Phone, 
  Copy, 
  ExternalLink, 
  Download,
  Users,
  Clock,
  FileText,
  Sparkles,
  Loader2,
  Send
} from "lucide-react";
import { toast } from "sonner";
import { useMeetingTranscription } from "@/hooks/useMeetingTranscription";
import { supabase } from "@/integrations/supabase/client";
import jsPDF from "jspdf";

interface AdminMeetingPanelProps {
  onAddToChat?: (content: string, isReport?: boolean) => void;
}

export const AdminMeetingPanel = ({ onAddToChat }: AdminMeetingPanelProps) => {
  const [zoomUrl, setZoomUrl] = useState("");
  const [googleMeetUrl, setGoogleMeetUrl] = useState("");
  const [teamsUrl, setTeamsUrl] = useState("");
  const [activeMeeting, setActiveMeeting] = useState<{
    platform: string;
    url: string;
    startTime: Date;
  } | null>(null);
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
  const [meetingDuration, setMeetingDuration] = useState(0);
  const [summary, setSummary] = useState<string | null>(null);
  
  const { 
    isTranscribing, 
    transcript, 
    startTranscription, 
    stopTranscription, 
    clearTranscript 
  } = useMeetingTranscription();

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

  const handleJoinMeeting = async (platform: string, url: string) => {
    if (!url.trim()) {
      toast.error("Please enter a meeting URL");
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
      setSummary(null);

      toast.success(`Connected to ${platform}. Live transcription active.`);
    } catch (error) {
      console.error('Error joining meeting:', error);
      toast.error("Please enable microphone access to transcribe meetings.");
      setActiveMeeting(null);
    }
  };

  const handleEndMeeting = async () => {
    if (!activeMeeting) return;

    stopTranscription();
    
    // Generate meeting summary
    if (transcript.length > 0) {
      await generateMeetingSummary();
    }

    toast.success(`Meeting ended. Duration: ${formatDuration(meetingDuration)}`);
  };

  const generateMeetingSummary = async () => {
    if (transcript.length === 0) return;

    setIsGeneratingSummary(true);
    
    try {
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/admin-research-chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
          messages: [{
            role: 'user',
            content: `Generate a professional meeting summary report from this transcript. Include:

## Meeting Summary Report
**Date:** ${new Date().toLocaleDateString()}
**Platform:** ${activeMeeting?.platform}
**Duration:** ${formatDuration(meetingDuration)}

## Executive Summary
[Brief 2-3 sentence overview]

## Key Discussion Points
[Bullet points of main topics]

## Decisions Made
[Any decisions or conclusions]

## Action Items
[Tasks with owners if mentioned]

## Next Steps
[Follow-up items]

---

**Transcript:**
${transcript.join('\n')}`
          }],
          generateReport: true,
          stream: false
        }),
      });

      if (!response.ok) throw new Error('Failed to generate summary');

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullContent = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.startsWith('data: ') && !line.includes('[DONE]')) {
              try {
                const data = JSON.parse(line.slice(6));
                const content = data.choices?.[0]?.delta?.content;
                if (content) fullContent += content;
              } catch (e) {
                // Skip invalid JSON
              }
            }
          }
        }
      }

      setSummary(fullContent);
      toast.success("Meeting summary generated!");
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error("Failed to generate summary");
    } finally {
      setIsGeneratingSummary(false);
      setActiveMeeting(null);
      setMeetingDuration(0);
    }
  };

  const copyTranscript = () => {
    if (transcript.length > 0) {
      navigator.clipboard.writeText(transcript.join('\n\n'));
      toast.success("Transcript copied to clipboard");
    }
  };

  const downloadTranscript = () => {
    if (transcript.length === 0 && !summary) return;
    
    const content = summary || `Meeting Transcript
==================
Platform: ${activeMeeting?.platform || 'Meeting'}
Date: ${new Date().toLocaleDateString()}
Duration: ${formatDuration(meetingDuration)}

==================

${transcript.join('\n\n')}`;
    
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `meeting-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    
    toast.success("Downloaded successfully");
  };

  const downloadPDF = () => {
    if (!summary && transcript.length === 0) return;

    const pdf = new jsPDF();
    const content = summary || transcript.join('\n\n');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let y = 20;

    // Header
    pdf.setFillColor(15, 23, 42);
    pdf.rect(0, 0, pageWidth, 30, "F");
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(16);
    pdf.text("Meeting Summary Report", margin, 18);

    y = 40;
    pdf.setTextColor(0, 0, 0);
    pdf.setFontSize(10);

    const lines = pdf.splitTextToSize(content, pageWidth - 2 * margin);
    for (const line of lines) {
      if (y > pdf.internal.pageSize.getHeight() - 20) {
        pdf.addPage();
        y = 20;
      }
      pdf.text(line, margin, y);
      y += 6;
    }

    pdf.save(`meeting-summary-${new Date().toISOString().slice(0, 10)}.pdf`);
    toast.success("PDF downloaded");
  };

  const addSummaryToChat = () => {
    if (summary && onAddToChat) {
      onAddToChat(summary, true);
      toast.success("Summary added to chat");
    }
  };

  const resetMeeting = () => {
    clearTranscript();
    setSummary(null);
    setActiveMeeting(null);
    setMeetingDuration(0);
  };

  return (
    <Card className="border-slate-200 shadow-lg bg-white">
      <CardHeader className="border-b border-slate-100 bg-gradient-to-r from-violet-50 via-white to-indigo-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-violet-500 to-indigo-600 rounded-lg">
            <Video className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl text-slate-900">Meeting Transcription</CardTitle>
            <CardDescription>
              Join Zoom, Google Meet, or Teams with live AI transcription
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        {!activeMeeting && !summary ? (
          <Tabs defaultValue="zoom" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="zoom">Zoom</TabsTrigger>
              <TabsTrigger value="meet">Google Meet</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="zoom" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Zoom URL or Meeting ID"
                  value={zoomUrl}
                  onChange={(e) => setZoomUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleJoinMeeting("Zoom", zoomUrl)}
                  className="bg-blue-500 hover:bg-blue-600"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="meet" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Google Meet URL"
                  value={googleMeetUrl}
                  onChange={(e) => setGoogleMeetUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleJoinMeeting("Google Meet", googleMeetUrl)}
                  className="bg-green-500 hover:bg-green-600"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="teams" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Teams Meeting URL"
                  value={teamsUrl}
                  onChange={(e) => setTeamsUrl(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={() => handleJoinMeeting("Microsoft Teams", teamsUrl)}
                  className="bg-purple-500 hover:bg-purple-600"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Join
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        ) : activeMeeting ? (
          <div className="space-y-4">
            {/* Live Meeting Status */}
            <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-center gap-3">
                <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                <span className="font-semibold text-green-700">{activeMeeting.platform}</span>
              </div>
              <Badge className="bg-green-100 text-green-700">
                <Clock className="h-3 w-3 mr-1" />
                {formatDuration(meetingDuration)}
              </Badge>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between">
              <Badge variant={isTranscribing ? "default" : "secondary"}>
                {isTranscribing ? <Mic className="h-3 w-3 mr-1" /> : <MicOff className="h-3 w-3 mr-1" />}
                {isTranscribing ? "Recording" : "Paused"}
              </Badge>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={copyTranscript} disabled={transcript.length === 0}>
                  <Copy className="h-4 w-4" />
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
            <div>
              <h3 className="font-semibold text-sm mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Live Transcript
                {isTranscribing && (
                  <Sparkles className="h-3 w-3 text-violet-500 animate-pulse" />
                )}
              </h3>
              <ScrollArea className="h-[200px] rounded-lg border p-3 bg-slate-50">
                {transcript.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    <Mic className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Listening for speech...</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {transcript.map((entry, i) => (
                      <div key={i} className="text-sm p-2 bg-white rounded border">
                        {entry}
                      </div>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </div>
          </div>
        ) : summary ? (
          <div className="space-y-4">
            {/* Summary Generated */}
            <div className="flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-violet-500" />
                Meeting Summary
              </h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(summary)}>
                  <Copy className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={downloadTranscript}>
                  <Download className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={downloadPDF}>
                  <FileText className="h-4 w-4" />
                </Button>
                {onAddToChat && (
                  <Button size="sm" onClick={addSummaryToChat}>
                    <Send className="h-4 w-4 mr-1" />
                    Add to Chat
                  </Button>
                )}
              </div>
            </div>
            
            <ScrollArea className="h-[300px] rounded-lg border p-4 bg-slate-50">
              <div className="prose prose-sm max-w-none">
                {summary.split('\n').map((line, i) => (
                  <p key={i} className={line.startsWith('#') ? 'font-bold' : ''}>
                    {line}
                  </p>
                ))}
              </div>
            </ScrollArea>

            <Button variant="outline" className="w-full" onClick={resetMeeting}>
              Start New Meeting
            </Button>
          </div>
        ) : null}
      </CardContent>
    </Card>
  );
};
