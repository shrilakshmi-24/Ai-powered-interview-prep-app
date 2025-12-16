"use client";

import { useEffect, useState, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Mic, Video, Send, AlertCircle, LogOut, Upload, Loader2 } from "lucide-react";

import { useParams, useRouter } from "next/navigation";
import { PermissionModal } from "@/app/(routes)/_components/PermissionModal";

interface Question {
  text: string;
  index: number;
}



// Speech recognition hook
const useSpeechRecognition = () => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [recognition, setRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined" && ("SpeechRecognition" in window || "webkitSpeechRecognition" in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = "en-US";

      recognitionInstance.onresult = (event: any) => {
        let finalTranscript = "";
        let interimTranscript = "";

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript + " ";
          } else {
            interimTranscript += transcript;
          }
        }


        setTranscript((prev: string) => {
          // Only add new final transcript, reset interim transcript
          return prev + finalTranscript;
        });
      };


      recognitionInstance.onerror = (event: any) => {
        console.error("Speech recognition error:", event.error);
        // Don't set to false for "aborted" errors as they can be intentional
        if (event.error !== "aborted") {
          setIsListening(false);
        }
      };

      recognitionInstance.onend = () => {
        setIsListening(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const startListening = () => {
    if (recognition && !isListening) {
      setTranscript("");
      recognition.start();
      setIsListening(true);
    }
  };

  const stopListening = () => {
    if (recognition && isListening) {
      recognition.stop();
      setIsListening(false);
    }
  };

  const resetTranscript = () => {
    setTranscript("");
  };

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: !!recognition
  };
};

function StreamingInterview() {
  const router = useRouter();
  const params = useParams();
  const interviewId = Array.isArray(params.interviewId) ? params.interviewId[0] : params.interviewId;

  // State management
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordedResponse, setRecordedResponse] = useState<string>("");
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [avatarVideoUrl, setAvatarVideoUrl] = useState<string>("");
  const [captions, setCaptions] = useState<string>("");
  const [avatarError, setAvatarError] = useState<string>("");
  const [isGeneratingAvatar, setIsGeneratingAvatar] = useState(false);
  const [permissions, setPermissions] = useState<{ audio: boolean; video: boolean } | null>(null);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Refs for recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const videoChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Speech recognition
  const {
    isListening,
    transcript,
    startListening,
    stopListening,
    resetTranscript,
    isSupported: speechSupported
  } = useSpeechRecognition();

  // Convex queries and mutations
  const interviewQuery = useQuery(
    api.interview.getInterviewById,
    interviewId ? { id: interviewId as any } : "skip"
  );

  const responsesQuery = useQuery(
    api.interview.getInterviewResponses,
    interviewId ? { interviewId: interviewId as any } : "skip"
  );

  const nextQuestionIndexQuery = useQuery(
    api.interview.getNextQuestionIndex,
    interviewId ? { interviewId: interviewId as any } : "skip"
  );



  const saveResponseMutation = useMutation(api.interview.saveInterviewResponse);

  // Initialize questions when interview data is loaded
  useEffect(() => {
    if (interviewQuery?.questionText) {
      let parsedQuestions: Question[] = [];
      
      if (typeof interviewQuery.questionText === 'string') {
        // If it's a string, split by lines or create array
        const lines = interviewQuery.questionText.split('\n').filter(line => line.trim());
        parsedQuestions = lines.map((line, index) => ({
          text: line.replace(/^\d+\.\s*/, '').replace(/^\-\s*/, '').trim(),
          index
        }));
      } else if (Array.isArray(interviewQuery.questionText)) {
        parsedQuestions = interviewQuery.questionText.map((q: any, index: number) => ({
          text: typeof q === 'string' ? q : q.question || q.text || '',
          index
        }));
      }

      // Filter out empty questions
      parsedQuestions = parsedQuestions.filter(q => q.text.trim().length > 0);
      setQuestions(parsedQuestions);

      // Set starting question index
      if (nextQuestionIndexQuery !== undefined) {
        setCurrentQuestionIndex(nextQuestionIndexQuery);
      }
    }
  }, [interviewQuery, nextQuestionIndexQuery]);

  // Show permission modal when starting
  useEffect(() => {
    if (questions.length > 0 && !permissions) {
      setShowPermissionModal(true);
    }
  }, [questions, permissions]);

  // Handle permissions granted
  const handlePermissionsGranted = (newPermissions: { audio: boolean; video: boolean }) => {
    setPermissions(newPermissions);
    setShowPermissionModal(false);
    
    // Start the first question after permissions are set
    if (questions.length > 0) {
      setTimeout(() => {
        startAvatarStreaming(questions[0].text);
      }, 1000);
    }
  };


  // Upload file to server-side API (secure)
  const uploadFileToImageKit = async (blob: Blob, fileName: string, type: 'audio' | 'video') => {
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', new File([blob], fileName, { type: blob.type }));
      formData.append('folder', `interviews/${interviewId}`);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.url;
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(`${type} upload error:`, error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Start avatar streaming with improved error handling
  const startAvatarStreaming = async (questionText: string) => {
    try {
      setIsAvatarSpeaking(true);
      setIsGeneratingAvatar(true);
      setCaptions(questionText);
      setAvatarError("");

      console.log("Starting avatar generation for:", questionText);

      const response = await fetch('/api/d-id/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: questionText,
          sessionId: interviewId,
        }),
      });


      if (response.ok) {
        const data = await response.json();
        console.log("D-ID response:", data);

        if (data.success && data.resultUrl) {
          setAvatarVideoUrl(data.resultUrl);
          setIsGeneratingAvatar(false);
          
          // Set a timer for avatar speaking duration (assume 5-10 seconds)
          setTimeout(() => {
            setIsAvatarSpeaking(false);
            setCaptions("");
            setAvatarVideoUrl("");
            startRecording();
          }, 6000);
        } else if (data.talkId) {
          // Start polling for completion
          pollForAvatarCompletion(data.talkId, questionText);
        } else {
          throw new Error("No video URL or talk ID received");
        }
      } else {
        const errorData = await response.json();
        console.error("D-ID API Error:", errorData);
        
        // Check if it's a credits error and proceed without avatar
        if (errorData.error && errorData.error.includes("InsufficientCreditsError")) {
          console.log("D-ID credits insufficient, proceeding without avatar");
          setIsAvatarSpeaking(false);
          setIsGeneratingAvatar(false);
          setCaptions("");
          setAvatarError("Avatar temporarily unavailable, proceeding with text-only mode");
          
          // Proceed directly to recording after a short delay
          setTimeout(() => {
            startRecording();
          }, 2000);
        } else {
          throw new Error(errorData.error || "Failed to generate avatar");
        }
      }
    } catch (error) {
      console.error("Avatar streaming error:", error);
      setIsAvatarSpeaking(false);
      setIsGeneratingAvatar(false);
      setCaptions("");
      setAvatarError(error instanceof Error ? error.message : "Avatar generation failed");
      
      // Fallback: proceed to recording without avatar
      setTimeout(() => {
        startRecording();
      }, 2000);
    }
  };

  // Poll for avatar generation completion
  const pollForAvatarCompletion = (talkId: string, questionText: string) => {
    const pollInterval = 2000; // 2 seconds
    let attempts = 0;
    const maxAttempts = 15; // 30 seconds max

    pollIntervalRef.current = setInterval(async () => {
      attempts++;
      
      try {
        const response = await fetch(`/api/d-id/stream?talkId=${talkId}`);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`Poll attempt ${attempts}:`, data);
          
          if (data.status === "done" && data.resultUrl) {
            setAvatarVideoUrl(data.resultUrl);
            setIsGeneratingAvatar(false);
            
            // Clear interval
            if (pollIntervalRef.current) {
              clearInterval(pollIntervalRef.current);
              pollIntervalRef.current = null;
            }
            
            // Avatar is ready, start speaking timer
            setTimeout(() => {
              setIsAvatarSpeaking(false);
              setCaptions("");
              setAvatarVideoUrl("");
              startRecording();
            }, 6000);
            
          } else if (data.status === "error") {
            throw new Error("Avatar generation failed");
          }
        }
        
        // Check if we've exceeded max attempts
        if (attempts >= maxAttempts) {
          throw new Error("Avatar generation timeout");
        }
      } catch (pollError) {
        console.error("Polling error:", pollError);
        setIsAvatarSpeaking(false);
        setIsGeneratingAvatar(false);
        setCaptions("");
        setAvatarError("Avatar generation failed, proceeding without video");
        
        // Clear interval
        if (pollIntervalRef.current) {
          clearInterval(pollIntervalRef.current);
          pollIntervalRef.current = null;
        }
        
        // Proceed to recording without avatar
        setTimeout(() => {
          startRecording();
        }, 2000);
      }
    }, pollInterval);
  };

  // Start recording user response
  const startRecording = async () => {
    try {
      if (!permissions?.audio && !permissions?.video) {
        // Text-only mode, just start speech recognition if available
        if (speechSupported && permissions?.audio) {
          startListening();
        }
        return;
      }

      const constraints: MediaStreamConstraints = {
        audio: permissions?.audio || false,
        video: permissions?.video || false
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Setup video preview
      if (videoRef.current && permissions?.video) {
        videoRef.current.srcObject = stream;
      }

      // Start speech recognition if audio is enabled
      if (permissions?.audio && speechSupported) {
        startListening();
      }

      // Setup media recorder
      const mimeTypes = [
        permissions?.video ? 'video/webm;codecs=vp9,opus' : 'audio/webm;codecs=opus',
        permissions?.video ? 'video/webm' : 'audio/webm',
        'video/mp4',
        'audio/mp4'
      ];

      let selectedMimeType = '';
      for (const mimeType of mimeTypes) {
        if (MediaRecorder.isTypeSupported(mimeType)) {
          selectedMimeType = mimeType;
          break;
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: selectedMimeType
      });

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          if (permissions?.video) {
            videoChunksRef.current.push(event.data);
          } else {
            audioChunksRef.current.push(event.data);
          }
        }
      };

      mediaRecorder.start(1000); // Collect data every second
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      console.log("Recording started");
    } catch (error) {
      console.error("Recording error:", error);
      // For demo, we'll simulate recording even if permission is denied
      setIsRecording(true);
      setTimeout(() => {
        stopRecording();
      }, 5000);
    }
  };

  // Stop recording and save response
  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
    }

    if (isListening) {
      stopListening();
    }

    // Wait for data to be available
    setTimeout(async () => {
      let audioUrl = "";
      let videoUrl = "";

      try {


        // Upload files to ImageKit if permissions were granted
        if (permissions?.audio && audioChunksRef.current.length > 0) {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
          audioUrl = await uploadFileToImageKit(audioBlob, `audio_${Date.now()}_response.webm`, 'audio');
        }

        if (permissions?.video && videoChunksRef.current.length > 0) {
          const videoBlob = new Blob(videoChunksRef.current, { type: 'video/webm' });
          videoUrl = await uploadFileToImageKit(videoBlob, `video_${Date.now()}_response.webm`, 'video');
        }

        // Use speech transcript if available, otherwise use manual text
        const finalResponseText = transcript.trim() || recordedResponse;

        // Save to Convex
        await saveResponseMutation({
          interviewId: interviewId as any,
          questionIndex: currentQuestionIndex,
          questionText: questions[currentQuestionIndex]?.text || '',
          responseText: finalResponseText,
          audioUrl: audioUrl || "",
          videoUrl: videoUrl || "",
          userId: interviewQuery?.userId as any,
          duration: 30,
        });


        console.log("Response saved successfully");
        
        // Clear current response state
        setRecordedResponse("");
        resetTranscript();
        audioChunksRef.current = [];
        videoChunksRef.current = [];
        
        // Move to next question
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
          setCurrentQuestionIndex(nextIndex);
          
          // Start next question after a delay
          setTimeout(() => {
            startAvatarStreaming(questions[nextIndex].text);
          }, 2000);
        } else {
          console.log("Interview completed!");
          
          // Generate feedback for the completed interview
          try {
            const feedbackResponse = await fetch('/api/feedback', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                interviewId: interviewId,
                userId: interviewQuery?.userId
              }),
            });
            
            if (feedbackResponse.ok) {
              const feedbackData = await feedbackResponse.json();
              console.log('Feedback generated successfully:', feedbackData);
            } else {
              console.error('Failed to generate feedback:', await feedbackResponse.text());
            }
          } catch (feedbackError) {
            console.error('Error generating feedback:', feedbackError);
            // Continue with redirect even if feedback fails
          }
          
          router.push(`/interview/${interviewId}`);
        }
      } catch (error) {
        console.error("Save error:", error);
      }

      // Clean up
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }
      
      setIsRecording(false);
    }, 1000);
  };

  // Leave session
  const leaveSession = () => {
    // Clean up resources
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
    }
    if (isListening) {
      stopListening();
    }

    // Redirect to dashboard
    router.push('/');
  };

  // Auto-start first question (only after permissions are granted)
  useEffect(() => {
    if (questions.length > 0 && currentQuestionIndex < questions.length && !isAvatarSpeaking && !isRecording && permissions) {
      const timer = setTimeout(() => {
        startAvatarStreaming(questions[currentQuestionIndex].text);
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [questions, currentQuestionIndex, isAvatarSpeaking, isRecording, permissions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, []);

  if (!interviewId || !interviewQuery) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading interview...</p>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <Button 
              variant="ghost" 
              onClick={() => router.back()}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
            
            <Button 
              variant="destructive"
              onClick={leaveSession}
              className="bg-red-600 hover:bg-red-700"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Leave Session
            </Button>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              AI-Powered Interview
            </h1>
            <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300">
              <span>Question {currentQuestionIndex + 1} of {questions.length}</span>
              <span>•</span>
              <span>Status: {isAvatarSpeaking ? "Avatar Speaking" : isRecording ? "Recording Response" : isGeneratingAvatar ? "Generating Avatar" : permissions ? "Ready" : "Setting up permissions"}</span>
              {isUploading && (
                <>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Upload className="h-3 w-3" />
                    Uploading...
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Avatar Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Interviewer
            </h2>
            
            <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg overflow-hidden relative">
              {isGeneratingAvatar ? (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Generating avatar...</p>
                  </div>
                </div>
              ) : avatarVideoUrl ? (
                <video 
                  src={avatarVideoUrl}
                  autoPlay
                  loop
                  className="w-full h-full object-cover"
                  onError={() => {
                    console.error("Avatar video failed to load");
                    setAvatarError("Avatar video failed to load");
                  }}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 bg-blue-500 rounded-full mx-auto mb-4 flex items-center justify-center">
                      <span className="text-white text-xl font-bold">AI</span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300">
                      {isAvatarSpeaking ? "Avatar is speaking..." : "Avatar ready"}
                    </p>
                  </div>
                </div>
              )}
              
              {captions && (
                <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 text-white p-4">
                  <p className="text-sm">{captions}</p>
                </div>
              )}
              
              {avatarError && (
                <div className="absolute top-4 right-4 bg-red-500 text-white p-2 rounded-lg flex items-center gap-2">
                  <AlertCircle className="h-4 w-4" />
                  <span className="text-sm">{avatarError}</span>
                </div>
              )}
            </div>
            
            {currentQuestion && (
              <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <h3 className="font-medium text-blue-900 dark:text-blue-100 mb-2">
                  Current Question:
                </h3>
                <p className="text-blue-800 dark:text-blue-200">
                  {currentQuestion.text}
                </p>
              </div>
            )}
          </div>

          {/* User Response Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Your Response
            </h2>
            
            {/* Video Preview */}
            {permissions?.video && (
              <div className="aspect-video bg-gray-100 dark:bg-gray-700 rounded-lg mb-4 overflow-hidden">
                {streamRef.current ? (
                  <video 
                    ref={videoRef}
                    autoPlay
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <div className="text-center">
                      <Video className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-600 dark:text-gray-300">
                        Camera {isRecording ? "recording" : "ready"}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Speech Recognition Display */}
            {isListening && transcript && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <Mic className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Listening...
                  </span>
                </div>
                <p className="text-green-700 dark:text-green-300 text-sm">
                  {transcript}
                </p>
              </div>
            )}

            {/* Text Response */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Or type your response:
                </label>
                <textarea
                  value={recordedResponse}
                  onChange={(e) => setRecordedResponse(e.target.value)}
                  placeholder="Type your response here..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={4}
                />
              </div>

              {/* Recording Controls */}
              <div className="flex gap-4 justify-center">
                {!isRecording ? (
                  <Button 
                    onClick={startRecording}
                    disabled={isAvatarSpeaking || isGeneratingAvatar || !permissions}
                    className="bg-red-600 hover:bg-red-700 text-white"
                  >
                    <Mic className="mr-2 h-4 w-4" />
                    Start Recording
                  </Button>
                ) : (
                  <Button 
                    onClick={stopRecording}
                    disabled={isUploading}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Stop & Submit
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Permission Modal */}
        <PermissionModal
          isOpen={showPermissionModal}
          onClose={() => setShowPermissionModal(false)}
          onPermissionsGranted={handlePermissionsGranted}
        />
      </div>
    </div>
  );
}

export default StreamingInterview;
