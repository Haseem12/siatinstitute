
"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
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
  Square, 
  PhoneOff,
  Camera,
  CameraOff,
  Maximize,
  Minimize,
  Send,
  PenTool,
  Eraser,
  Circle,
  // SquareIcon, // Replaced with Square
  Type,
  UserCircle, 
  Loader2, // Added Loader2
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useParams } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
// import type { Metadata } from 'next'; // Metadata is typically not set directly in client components

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
  const classId = params.classId as string; 
  const { toast } = useToast();

  const [classDetails, setClassDetails] = useState(classDataMock); 
  const [participants, setParticipants] = useState(participantsMock);
  
  const [userRole, setUserRole] = useState<"instructor" | "student">("student");
  const [isVideoOn, setIsVideoOn] = useState(false);
  const [isAudioOn, setIsAudioOn] = useState(false);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isHandRaised, setIsHandRaised] = useState(false);
  const [messages, setMessages] = useState(initialMessagesMock);
  const [newMessage, setNewMessage] = useState("");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [selectedTool, setSelectedTool] = useState("pen");
  const [selectedColor, setSelectedColor] = useState("#000000"); 
  const [classTime, setClassTime] = useState("00:00");
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [canvasCtx, setCanvasCtx] = useState<CanvasRenderingContext2D | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Effect for camera access and stream management
  useEffect(() => {
    const getCameraStream = async () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        console.error('getUserMedia is not supported in this browser.');
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Device Not Supported',
          description: 'Your browser does not support camera/microphone access.',
          duration: 7000,
        });
        return null;
      }
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        setHasCameraPermission(true);
        return stream;
      } catch (error: any) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        let toastTitle = 'Camera Access Error';
        let toastDescription = 'Could not access the camera. Please ensure it is connected and not in use by another application.';

        if (error.name === 'NotFoundError' || error.name === 'DevicesNotFoundError') {
          toastTitle = 'Camera Not Found';
          toastDescription = 'No camera was found. Please ensure a camera is connected properly and enabled.';
        } else if (error.name === 'NotAllowedError' || error.name === 'PermissionDeniedError') {
          toastTitle = 'Camera Access Denied';
          toastDescription = 'Camera permission was denied. Please enable it in your browser settings.';
        } else if (error.name === 'NotReadableError' || error.name === 'TrackStartError') {
            toastTitle = 'Camera In Use';
            toastDescription = 'Your camera might be in use by another application or browser tab.';
        } else if (error.name === 'OverconstrainedError' || error.name === 'ConstraintNotSatisfiedError') {
            toastTitle = 'Camera Not Supported';
            toastDescription = 'The selected camera does not support the required settings.';
        }
        
        toast({
          variant: 'destructive',
          title: toastTitle,
          description: toastDescription,
          duration: 7000,
        });
        return null;
      }
    };

    const manageCamera = async () => {
      if (isVideoOn) {
        const stream = await getCameraStream(); // This sets hasCameraPermission
        if (stream && videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play().catch(err => console.warn("Video play failed:", err));
        } else {
          // If stream is null, getCameraStream already set hasCameraPermission to false.
          // User's intent (isVideoOn) remains true, UI will reflect error via hasCameraPermission.
          if (videoRef.current) { 
            videoRef.current.srcObject = null; // Clear any old stream
          }
        }
      } else {
        // User explicitly turned video off
        if (videoRef.current && videoRef.current.srcObject) {
          (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
          videoRef.current.srcObject = null;
        }
         // If video is turned off, we can assume permission status is not "denied" for this specific off-state.
         // However, if it was previously false, it should remain false.
         // This line helps reset the visual state if user toggles off after a failure.
        if(hasCameraPermission === false) setHasCameraPermission(null);
      }
    };

    manageCamera();

    return () => {
        if (videoRef.current && videoRef.current.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            videoRef.current.srcObject = null;
        }
    };
  }, [isVideoOn, toast, hasCameraPermission]); // Added hasCameraPermission to dependency array to re-evaluate if it changes


  // Setup Canvas
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      // Ensure canvas dimensions are set based on its actual size on screen
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
      
      const context = canvas.getContext("2d");
      if (context) {
        context.lineCap = "round";
        context.lineWidth = selectedTool === 'eraser' ? 20 : 5;
        context.strokeStyle = selectedColor;
        setCanvasCtx(context);
      }
    }
  }, []); 

  // Update canvas context on tool or color change
  useEffect(() => {
    if (canvasCtx) {
      canvasCtx.strokeStyle = selectedColor;
      canvasCtx.lineWidth = selectedTool === "eraser" ? 20 : 5; 
      canvasCtx.globalCompositeOperation = selectedTool === "eraser" ? "destination-out" : "source-over";
    }
  }, [canvasCtx, selectedColor, selectedTool]);


  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasCtx) return;
    setIsDrawing(true);
    canvasCtx.beginPath();
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    canvasCtx.moveTo(x, y);
    if (selectedTool === 'pen' || selectedTool === 'eraser') {
        canvasCtx.lineTo(x, y);
        canvasCtx.stroke();
    }
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasCtx || (selectedTool !== 'pen' && selectedTool !== 'eraser')) return;
    const rect = (event.target as HTMLCanvasElement).getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    canvasCtx.lineTo(x,y);
    canvasCtx.stroke();
  };

  const stopDrawing = () => {
    if (!canvasCtx) return;
    canvasCtx.closePath();
    setIsDrawing(false);
  };


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

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const toggleVideo = () => setIsVideoOn(!isVideoOn);
  const toggleAudio = () => setIsAudioOn(!isAudioOn);
  const toggleScreenShare = () => setIsScreenSharing(!isScreenSharing);
  const toggleRecording = () => setIsRecording(!isRecording);
  const toggleHandRaise = () => setIsHandRaised(!isHandRaised);

  const sendMessage = () => {
    if (newMessage.trim()) {
      const message = {
        id: messages.length + 1,
        sender: userRole === "instructor" ? classDetails.instructor : "You",
        message: newMessage,
        time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        type: "text" as const,
      };
      setMessages([...messages, message]);
      setNewMessage("");
    }
  };

  const leaveClass = () => {
    window.history.back(); 
  };

  return (
    <div className="space-y-4"> 
      <Card className="shadow-lg border-primary/10">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-xl text-primary">{classDetails.title}</CardTitle>
              <CardDescription className="text-sm"> 
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
        <div className="lg:col-span-3 space-y-4">
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
                  <div className="w-full h-full flex items-center justify-center text-foreground bg-neutral-800">
                     <video ref={videoRef} className="w-full h-full object-cover" autoPlay muted playsInline />
                     
                     {!isVideoOn && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                            <UserCircle className="w-24 h-24 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground">Your video is off</p>
                        </div>
                     )}
                     {isVideoOn && hasCameraPermission === false && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70 text-center p-4">
                            <UserCircle className="w-24 h-24 text-muted-foreground mb-2" />
                            <p className="text-muted-foreground font-semibold">Camera Not Available</p>
                            <p className="text-sm text-muted-foreground/80">
                                Please check if your camera is connected, not in use by another app, and that browser/system permissions are granted.
                            </p>
                        </div>
                     )}
                     {isVideoOn && hasCameraPermission === null && (
                        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/70">
                            <Loader2 className="w-16 h-16 text-muted-foreground animate-spin mb-2" />
                            <p className="text-muted-foreground">Accessing camera...</p>
                        </div>
                     )}
                  </div>
                )}
                
                { isVideoOn && hasCameraPermission === false && (
                    <div className="absolute top-4 left-4 right-4 z-10">
                        <Alert variant="destructive">
                            <AlertTitle>Camera Not Available</AlertTitle>
                            <AlertDescription>
                                Could not access camera. Please ensure it's connected, enabled, and not in use. Check browser and system permissions.
                            </AlertDescription>
                        </Alert>
                    </div>
                )}


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

                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setIsFullscreen(!isFullscreen)} 
                  className="absolute top-2 right-2 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-full"
                  title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
                >
                  {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
                </Button>
              </div>
            </CardContent>
          </Card>

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
                    <Button size="sm" variant={selectedTool === "circle" ? "default" : "outline"} onClick={() => setSelectedTool("circle")} title="Circle (Tool not implemented)"> <Circle className="w-4 h-4" /></Button>
                    <Button size="sm" variant={selectedTool === "square" ? "default" : "outline"} onClick={() => setSelectedTool("square")} title="Square (Tool not implemented)"> <Square className="w-4 h-4" /></Button>
                    <Button size="sm" variant={selectedTool === "text" ? "default" : "outline"} onClick={() => setSelectedTool("text")} title="Text (Tool not implemented)"> <Type className="w-4 h-4" /></Button>
                    <input type="color" value={selectedColor} onChange={(e) => setSelectedColor(e.target.value)} className="w-8 h-8 rounded border-input bg-background cursor-pointer" title="Select Color"/>
                  </div>
                  <div className="border-2 border-dashed border-border rounded-lg h-64 lg:h-96 bg-white">
                    <canvas 
                        ref={canvasRef} 
                        className="w-full h-full cursor-crosshair"
                        onMouseDown={startDrawing}
                        onMouseMove={draw}
                        onMouseUp={stopDrawing}
                        onMouseOut={stopDrawing}
                    />
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

        <div className="space-y-4 lg:sticky lg:top-[calc(var(--header-height,4rem)+1rem)]"> 
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

          <Card className="shadow-lg border-primary/10">
            <CardHeader className="pb-3">
              <CardTitle className="text-lg flex items-center gap-2 text-primary">
                <MessageSquare className="w-5 h-5" /> Chat
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex flex-col" style={{height: 'calc(100% - 3.5rem)'}}> 
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

