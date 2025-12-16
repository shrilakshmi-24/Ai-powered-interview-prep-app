"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Mic, Video, MicOff, VideoOff, ArrowRight } from "lucide-react";

interface PermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPermissionsGranted: (permissions: { audio: boolean; video: boolean }) => void;
}

export function PermissionModal({ isOpen, onClose, onPermissionsGranted }: PermissionModalProps) {
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [isRequesting, setIsRequesting] = useState(false);

  const requestPermissions = async () => {
    setIsRequesting(true);
    
    try {
      const constraints: MediaStreamConstraints = {
        audio: audioEnabled,
        video: videoEnabled
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      
      // Stop the stream immediately as we just want to test permissions
      stream.getTracks().forEach(track => track.stop());
      
      onPermissionsGranted({ audio: audioEnabled, video: videoEnabled });
      onClose();
    } catch (error) {
      console.error("Permission request failed:", error);
      // If permission is denied, we can still proceed with text-only mode
      onPermissionsGranted({ audio: false, video: false });
      onClose();
    } finally {
      setIsRequesting(false);
    }
  };

  const handleStartTextOnly = () => {
    onPermissionsGranted({ audio: false, video: false });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            Enable Camera & Microphone
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            For the best interview experience, please allow access to your camera and microphone. 
            You can also choose to continue with text-only responses.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-6">
          {/* Permission Toggles */}
          <div className="space-y-4">
            {/* Audio Permission */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {audioEnabled ? (
                  <Mic className="h-5 w-5 text-green-600" />
                ) : (
                  <MicOff className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <h4 className="font-medium">Microphone</h4>
                  <p className="text-sm text-gray-500">
                    {audioEnabled ? "Will record your voice" : "Text-only responses"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  audioEnabled ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    audioEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            {/* Video Permission */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center gap-3">
                {videoEnabled ? (
                  <Video className="h-5 w-5 text-green-600" />
                ) : (
                  <VideoOff className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <h4 className="font-medium">Camera</h4>
                  <p className="text-sm text-gray-500">
                    {videoEnabled ? "Will record your video" : "Text-only responses"}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setVideoEnabled(!videoEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  videoEnabled ? "bg-green-600" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    videoEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button 
              onClick={requestPermissions}
              disabled={isRequesting}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white"
            >
              {isRequesting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Requesting Permissions...
                </>
              ) : (
                <>
                  <ArrowRight className="mr-2 h-4 w-4" />
                  Start Interview with {audioEnabled && videoEnabled ? "Audio & Video" : audioEnabled ? "Audio Only" : videoEnabled ? "Video Only" : "Text Only"}
                </>
              )}
            </Button>

            <Button 
              onClick={handleStartTextOnly}
              variant="outline"
              className="w-full"
              disabled={isRequesting}
            >
              Continue with Text Only
            </Button>
          </div>

          {/* Info */}
          <div className="text-xs text-gray-500 text-center">
            You can change these settings anytime during the interview
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
