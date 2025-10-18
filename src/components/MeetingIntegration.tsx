import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Video, Mic, MicOff, VideoOff, Phone, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";

interface MeetingIntegrationProps {
  onMeetingJoined: (platform: string, meetingUrl: string) => void;
}

export const MeetingIntegration = ({ onMeetingJoined }: MeetingIntegrationProps) => {
  const [zoomUrl, setZoomUrl] = useState("");
  const [googleMeetUrl, setGoogleMeetUrl] = useState("");
  const [teamsUrl, setTeamsUrl] = useState("");
  const [activeMeeting, setActiveMeeting] = useState<{
    platform: string;
    url: string;
    transcript: string[];
    isRecording: boolean;
  } | null>(null);
  const { toast } = useToast();

  const handleJoinMeeting = (platform: string, url: string) => {
    if (!url.trim()) {
      toast({
        title: "Error",
        description: "Please enter a meeting URL",
        variant: "destructive",
      });
      return;
    }

    // Simulate joining meeting
    setActiveMeeting({
      platform,
      url,
      transcript: [`Joined ${platform} meeting at ${new Date().toLocaleTimeString()}`],
      isRecording: true,
    });

    onMeetingJoined(platform, url);

    toast({
      title: "Meeting Joined",
      description: `Connected to ${platform} meeting. Transcription started.`,
    });

    // Simulate receiving transcript entries
    setTimeout(() => {
      if (activeMeeting) {
        setActiveMeeting(prev => prev ? {
          ...prev,
          transcript: [...prev.transcript, "Theodore (AI): Hello, I've joined the meeting and will transcribe all dialogue."]
        } : null);
      }
    }, 2000);
  };

  const handleEndMeeting = () => {
    if (activeMeeting) {
      toast({
        title: "Meeting Ended",
        description: "Transcription saved and meeting disconnected.",
      });
      setActiveMeeting(null);
    }
  };

  const copyTranscript = () => {
    if (activeMeeting) {
      navigator.clipboard.writeText(activeMeeting.transcript.join('\n'));
      toast({
        title: "Copied",
        description: "Transcript copied to clipboard",
      });
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Video className="h-5 w-5" />
          Meeting Integration & Transcription
        </CardTitle>
        <CardDescription>
          Join meetings on Zoom, Google Meet, or Microsoft Teams with live transcription
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!activeMeeting ? (
          <Tabs defaultValue="zoom" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="zoom">Zoom</TabsTrigger>
              <TabsTrigger value="meet">Google Meet</TabsTrigger>
              <TabsTrigger value="teams">Teams</TabsTrigger>
            </TabsList>

            <TabsContent value="zoom" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Zoom meeting URL or ID"
                  value={zoomUrl}
                  onChange={(e) => setZoomUrl(e.target.value)}
                />
                <Button onClick={() => handleJoinMeeting("Zoom", zoomUrl)}>
                  Join & Transcribe
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Example: https://zoom.us/j/123456789 or Meeting ID: 123 456 789
              </p>
            </TabsContent>

            <TabsContent value="meet" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Google Meet URL"
                  value={googleMeetUrl}
                  onChange={(e) => setGoogleMeetUrl(e.target.value)}
                />
                <Button onClick={() => handleJoinMeeting("Google Meet", googleMeetUrl)}>
                  Join & Transcribe
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Example: https://meet.google.com/abc-defg-hij
              </p>
            </TabsContent>

            <TabsContent value="teams" className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Enter Microsoft Teams meeting URL"
                  value={teamsUrl}
                  onChange={(e) => setTeamsUrl(e.target.value)}
                />
                <Button onClick={() => handleJoinMeeting("Microsoft Teams", teamsUrl)}>
                  Join & Transcribe
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Example: https://teams.microsoft.com/l/meetup-join/...
              </p>
            </TabsContent>
          </Tabs>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-500">
                  <div className="h-2 w-2 rounded-full bg-white animate-pulse mr-2" />
                  Live
                </Badge>
                <span className="font-medium">{activeMeeting.platform}</span>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  {activeMeeting.isRecording ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                </Button>
                <Button variant="outline" size="sm">
                  <Video className="h-4 w-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={handleEndMeeting}>
                  <Phone className="h-4 w-4 rotate-135" />
                  End
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Live Transcript</h3>
                <Button variant="ghost" size="sm" onClick={copyTranscript}>
                  <Copy className="h-4 w-4 mr-2" />
                  Copy
                </Button>
              </div>
              <ScrollArea className="h-[300px] w-full rounded-md border p-4">
                <div className="space-y-2">
                  {activeMeeting.transcript.map((entry, index) => (
                    <div key={index} className="text-sm">
                      {entry}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            <p className="text-xs text-muted-foreground">
              Meeting URL: {activeMeeting.url}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
