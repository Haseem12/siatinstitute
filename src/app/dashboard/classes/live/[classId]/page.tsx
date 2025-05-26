
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input"; // Added Input import
import {
  Video,
  VideoOff,
  Mic,
  MicOff,
  Monitor,
  MonitorOff,
  Users,
  MessageSquare,
  FileText,
  Hand,
  Download,
  Upload,
  Play,
  Square, // Assuming SquareIcon was meant to be Square
  PhoneOff,
  Camera,
  CameraOff,
  Maximize,
  Minimize,
  Send,
  PenTool,
  Eraser,
  Circle,
  Type,
  UserCircle, // Added UserCircle import
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import type { Metadata } from 'next';

// Note: Metadata in client components needs to be handled differently,
// typically in a parent Server Component or layout. For simplicity here,
// we'll assume it might be set via a custom hook or context in a real app if dynamic.
// export const metadata: Metadata = {
//   title: 'Live Class - Arewa Scholar Hub',
// };


// Mock data for the class
const classDataMock = {
  id: "CSC101-001",
  title: "Introduction to Computer Science",
  instructor: "Dr. Amina Hassan",
  duration: "2 hours",
  startTime: "10:00 AM",
  endTime: "12:00 PM",
  participants: 45,
  maxParticipants: 50,
};

// Mock participants data
const participantsMock = [
  { id: 1, name: "Dr. Amina Hassan", role: "instructor" as const, isOnline: true, hasVideo: true, hasAudio: true },
  { id: 2, name: "Ahmed Musa", role: "student" as const, isOnline: true, hasVideo: true, hasAudio: false },
  { id: 3, name: "Fatima Ibrahim", role: "student" as const, isOnline: true, hasVideo: false, hasAudio: true },
  { id: 4, name: "Yusuf Abdullahi", role: "student" as const, isOnline: true, hasVideo: true, hasAudio: true },
  { id: 5, name: "Aisha Mohammed", role: "student" as const, isOnline: false, hasVideo: false, hasAudio: false },
];

// Mock chat messages
const initialMessagesMock = [
  { id: 1, sender: "Dr. Amina Hassan", message: "Welcome everyone to today's class!", time: "10:00 AM", type: "text" as const },
  { id: 2, sender: "Ahmed Musa", message: "Good morning, Dr. Hassan!", time: "10:01 AM", type: "text" as const },
  { id: 3, sender: "System", message: "Fatima Ibrahim joined the class", time: "10:02 AM", type: "system" as const },
];

export default function LiveClassPage() {
  const params = useParams();
  const classId = params.classId as string; // Get classId from route

  // In a real app, fetch classData, participants, etc. based on classId
  const [classDetails, setClassDetails] = useState(classDataMock); 
  const [participants, setParticipants] = useState(participantsMock);
  
  const [userRole, setUserRole] = useState<"instructor" | "student">("student"); // This would come from auth
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [messages, setMessages] = useState(initialMessagesMock);
  const [newMessage, setNewMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTool, setSelectedTool] = useState("pen");
  const [selectedColor, setSelectedColor] = useState("#000000"); // Default to black
  const [classTime, setClassTime] = useState("00:00");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Simulate class timer
  useEffect(() => {
    const startTime = new Date();
    const timer = setInterval(() => {
      const now = new Date();
      const diff = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      const minutes = Math.floor(diff / 60);
      const seconds = diff % 60;
      setClassTime(`${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // TODO: Implement actual WebRTC logic for video, audio, screen sharing
  // TODO: Implement actual canvas drawing logic

  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleAudio = () => setIsAudioOn(!isAudioOn);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);
  const toggleRecording = () => setIsRecording(!isRecording);
  const toggleHandRaise = () => setIsHandRaised(!isHandRaised);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: userRole === "instructor" ? classDetails.instructor : "You", // Use dynamic instructor name
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "text" as const,
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const leaveClass = () => {
    // Handle leaving class, e.g., navigate back or to a feedback page
    window.history.back(); // Simple back navigation
  };

  return (
    <div className="space-y-4"> {/* AppLayout handles overall padding and background */}
      {/* Header */}
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl text-primary">{classDetails.title}</CardTitle>
              <CardDescription className="text-sm"> {/* Changed p to CardDescription */}
                Instructor: {classDetails.instructor} • {classDetails.startTime} - {classDetails.endTime}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap">
              <Badge variant="outline" className="text-primary border-primary">
                <div className="w-2 h-2 bg-primary rounded-full mr-2 animate-pulse"></div>
                Live • {classTime}
              </Badge>
              <Badge variant="secondary">
                <Users className="w-4 h-4 mr-1" />
                {participants.filter((p) => p.isOnline).length}/{classDetails.maxParticipants}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-4">
          {/* Video/Screen Share Area */}
          <Card className="shadow-lg border-primary/10">
            <CardContent className="p-0">
              <div className="relative bg-muted aspect-video rounded-lg overflow-hidden">
                {isScreenSharing ? (
                  <div className="w-full h-full flex items-center justify-center text-foreground">
                    <div className="text-center">
                      <Monitor className="w-16 h-16 mx-auto mb-4 text-primary" />
                      <p className="text-lg">Screen is being shared</p>
                      <p className="text-sm text-muted-foreground">{classDetails.instructor} is sharing their screen</p>
                    </div>
                  </div>
                ) : (
                  // Mock Video Area
                  <div className="w-full h-full flex items-center justify-center text-foreground bg-neutral-800">
                     <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                     {!isVideoOn && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                            <UserCircle className="w-24 h-24 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">Your video is off</p>
                        </div>
                     )}
                  </div>
                )}

                {/* Video Controls Overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-2 bg-background/80 border border-border rounded-full px-3 py-2 shadow-md">
                    <Button
                      size="icon"
                      variant={isVideoOn ? "outline" : "destructive"}
                      onClick={toggleVideo}
                      className="rounded-full"
                      title={isVideoOn ? "Turn Video Off" : "Turn Video On"}
                    >
                      {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                    </Button>
                    <Button
                      size="icon"
                      variant={isAudioOn ? "outline" : "destructive"}
                      onClick={toggleAudio}
                      className="rounded-full"
                      title={isAudioOn ? "Mute Audio" : "Unmute Audio"}
                    >
                      {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                    </Button>
                    {userRole === "instructor" && (
                      <Button
                        size="icon"
                        variant={isScreenSharing ? "default" : "outline"}
                        onClick={toggleScreenShare}
                        className="rounded-full"
                        title={isScreenSharing ? "Stop Sharing" : "Share Screen"}
                      >
                        {isScreenSharing ? <MonitorOff className="w-5 h-5" /> : <Monitor className="w-5 h-5" />}
                      </Button>
                    )}
                    {userRole === "instructor" && (
                      <Button
                        size="icon"
                        variant={isRecording ? "destructive" : "outline"}
                        onClick={toggleRecording}
                        className="rounded-full"
                        title={isRecording ? "Stop Recording" : "Start Recording"}
                      >
                        {isRecording ? <Square className="w-5 h-5" /> : <Play className="w-5 h-5" />}
                      </Button>
                    )}
                    {userRole === "student" && (
                      <Button
                        size="icon"
                        variant={isHandRaised ? "default" : "outline"}
                        onClick={toggleHandRaise}
                        className="rounded-full"
                        title={isHandRaised ? "Lower Hand" : "Raise Hand"}
                      >
                        <Hand className="w-5 h-5" />
                      </Button>
                    )}
                    <Button
                      size="icon"
                      variant="destructive"
                      onClick={leaveClass}
                      className="rounded-full"
                      title="Leave Class"
                    >
                      <PhoneOff className="w-5 h-5" />
                    </Button>
                  </div>
                </div>

                {/* Fullscreen Toggle */}
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsFullscreen(!isFullscreen)} // Actual fullscreen logic needed
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Interactive Tools */}
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg text-primary">Interactive Tools</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="whiteboard" className="w-full">
                <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4">
                  <TabsTrigger value="whiteboard">Whiteboard</TabsTrigger>
                  <TabsTrigger value="files">Files</TabsTrigger>
                  <TabsTrigger value="polls">Polls</TabsTrigger>
                  <TabsTrigger value="breakout">Breakout</TabsTrigger>
                </TabsList>

                <TabsContent value="whiteboard" className="mt-4 space-y-4">
                  <div className="flex flex-wrap items-center gap-2 p-2 border rounded-lg bg-muted/50">
                    <Button size="sm" variant={selectedTool === "pen" ? "default" : "outline"} onClick={() => setSelectedTool("pen")} title="Pen"> <PenTool className="w-4 h-4" /></Button>
                    <Button size="sm" variant={selectedTool === "eraser" ? "default" : "outline"} onClick={() => setSelectedTool("eraser")} title="Eraser"> <Eraser className="w-4 h-4" /></Button>
                    <Button size="sm" variant={selectedTool === "circle" ? "default" : "outline"} onClick={() => setSelectedTool("circle")} title="Circle"> <Circle className="w-4 h-4" /></Button>
                    <Button size="sm" variant={selectedTool === "square" ? "default" : "outline"} onClick={() => setSelectedTool("square")} title="Square"> <Square className="w-4 h-4" /></Button>
                    <Button size="sm" variant={selectedTool === "text" ? "default" : "outline"} onClick={() => setSelectedTool("text")} title="Text"> <Type className="w-4 h-4" /></Button>
                    <input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-8 h-8 rounded border-input bg-background cursor-pointer" title="Select Color"/>
                  </div>
                  <div className="border-2 border-dashed border-border rounded-lg h-64 lg:h-96 flex items-center justify-center bg-white">
                    <canvas ref={canvasRef} className="w-full h-full cursor-crosshair" />
                    {/* Canvas drawing logic needs to be implemented */}
                     <p className="text-muted-foreground text-center p-4">Whiteboard area. Drawing functionality to be implemented.</p>
                  </div>
                </TabsContent>

                <TabsContent value="files" className="mt-4 space-y-4">
                  <div className="flex gap-2">
                    <Button size="sm" className="bg-accent hover:bg-accent/90 text-accent-foreground"> <Upload className="w-4 h-4 mr-2" /> Upload File </Button>
                    <Button size="sm" variant="outline"> <Download className="w-4 h-4 mr-2" /> Download All </Button>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-2"> <FileText className="w-4 h-4 text-primary" /> <span className="text-sm">Lecture_Notes_Week1.pdf</span> </div>
                      <Button size="icon" variant="ghost" title="Download Note"> <Download className="w-4 h-4" /> </Button>
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex items-center gap-2"> <FileText className="w-4 h-4 text-primary" /> <span className="text-sm">Assignment_1.docx</span> </div>
                      <Button size="icon" variant="ghost" title="Download Assignment"> <Download className="w-4 h-4" /> </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="polls" className="mt-4 space-y-4">
                  {userRole === "instructor" ? (
                    <div className="space-y-4">
                      <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Create New Poll</Button>
                      <Card className="bg-muted/30">
                        <CardHeader><CardTitle className="text-base">Active Poll: Understanding of Topic</CardTitle></CardHeader>
                        <CardContent className="space-y-2">
                          <div className="flex justify-between text-sm"><span>Excellent</span><span>45%</span></div>
                          <div className="flex justify-between text-sm"><span>Good</span><span>35%</span></div>
                          <div className="flex justify-between text-sm"><span>Need Help</span><span>20%</span></div>
                        </CardContent>
                      </Card>
                    </div>
                  ) : (
                    <Card className="bg-muted/30">
                      <CardHeader><CardTitle className="text-base">How well do you understand today's topic?</CardTitle></CardHeader>
                      <CardContent className="space-y-2">
                        <Button variant="outline" className="w-full justify-start">Excellent</Button>
                        <Button variant="outline" className="w-full justify-start">Good</Button>
                        <Button variant="outline" className="w-full justify-start">Need Help</Button>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="breakout" className="mt-4 space-y-4">
                  {userRole === "instructor" ? (
                    <div className="space-y-4">
                      <Button className="bg-accent hover:bg-accent/90 text-accent-foreground">Create Breakout Rooms</Button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Card className="bg-muted/30"><CardHeader><CardTitle className="text-base">Room 1</CardTitle><CardDescription>3 participants</CardDescription></CardHeader></Card>
                        <Card className="bg-muted/30"><CardHeader><CardTitle className="text-base">Room 2</CardTitle><CardDescription>4 participants</CardDescription></CardHeader></Card>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center p-8 text-muted-foreground">
                      <Users className="w-12 h-12 mx-auto mb-4" />
                      <p>No breakout rooms currently active.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-4 lg:sticky lg:top-[calc(var(--header-height,4rem)+1rem)]"> {/* Make sidebar sticky on large screens */}
          {/* Participants */}
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <Users className="w-5 h-5" />
                Participants ({participants.filter((p) => p.isOnline).length})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 max-h-60 overflow-y-auto">
              {participants.map((participant) => (
                <div key={participant.id} className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${participant.isOnline ? "bg-primary" : "bg-muted-foreground"}`}></div>
                    <span className="text-sm">{participant.name}</span>
                    {participant.role === "instructor" && ( <Badge variant="secondary" className="text-xs">Instructor</Badge> )}
                  </div>
                  <div className="flex gap-1.5">
                    {participant.hasVideo ? <Camera className="w-3.5 h-3.5 text-primary" /> : <CameraOff className="w-3.5 h-3.5 text-muted-foreground" />}
                    {participant.hasAudio ? <Mic className="w-3.5 h-3.5 text-primary" /> : <MicOff className="w-3.5 h-3.5 text-muted-foreground" />}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Chat */}
          <Card className="shadow-lg border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <MessageSquare className="w-5 h-5" /> Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col" style={{height: 'calc(100% - 3.5rem)'}}> {/* Adjust height for chat */}
              <div className="flex-grow h-64 overflow-y-auto p-4 space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`text-sm ${message.type === "system" ? "text-muted-foreground italic text-center" : ""}`}>
                    {message.type !== "system" && (
                      <div className={`font-semibold text-xs ${message.sender === "You" ? "text-accent" : "text-primary"}`}>{message.sender}</div>
                    )}
                    <div className={`p-2 rounded-md ${message.sender === "You" ? "bg-accent/10 text-accent-foreground" : "bg-muted/50"}`}>
                        {message.message}
                    </div>
                    <div className={`text-xs text-muted-foreground mt-0.5 ${message.sender === "You" ? "text-right" : "text-left"}`}>{message.time}</div>
                  </div>
                ))}
                <div ref={chatEndRef} />
              </div>
              <div className="p-3 border-t bg-background">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    placeholder="Type a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && sendMessage()}
                    className="flex-1 text-sm"
                  />
                  <Button size="icon" onClick={sendMessage} title="Send Message" className="bg-accent hover:bg-accent/80 text-accent-foreground">
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

