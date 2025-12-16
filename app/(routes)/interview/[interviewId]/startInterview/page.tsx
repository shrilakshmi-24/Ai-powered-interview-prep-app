"use client";

import { useEffect, useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { ArrowLeft} from "lucide-react";
import { useParams } from "next/navigation";

function StartInterview() {
  const params = useParams();
  const interviewId = Array.isArray(params.interviewId) ? params.interviewId[0] : params.interviewId;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Always call useQuery at the top level
  const interview = useQuery(
    api.interview.getInterviewById,
    interviewId ? { id: interviewId as any } : "skip"
  );

  useEffect(() => {
    if (interview !== undefined) {
      setLoading(false);
      if (interview === null && interviewId) {
        setError("Interview not found");
      }
    }
  }, [interview, interviewId]);
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => window.history.back()}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Interview Questions
            </h1>
            </div>
        </div>


        {/* Actions */}
        <div className="mt-8 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Ready to Start?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Take your time to review the questions. When you're ready, begin your interview with AI avatar.
            </p>
            <div className="flex gap-4 justify-center">
              <Button 
                variant="outline"
                onClick={() => window.print()}
              >
                Print Questions
              </Button>
              <Button 
                onClick={() => {
                  if (interviewId) {
                    window.location.href = `/interview/${interviewId}/streaming`;
                  }
                }}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                Start AI Interview
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StartInterview;
