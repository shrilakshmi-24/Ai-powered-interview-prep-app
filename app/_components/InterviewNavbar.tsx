"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, FileText, MessageSquare, ArrowRight, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function InterviewNavbar() {
  const router = useRouter();

  // Get current user - for demo purposes, using a hardcoded userId
  // In a real app, you'd get this from authentication context
  const currentUserId = "user1" as any; // This should come from your auth system

  // Query user's interviews with feedback
  const userInterviewsQuery = useQuery(
    api.interview.getUserInterviews,
    currentUserId ? { userId: currentUserId } : "skip"
  );

  const handleInterviewClick = (interviewId: string) => {
    router.push(`/interview/${interviewId}`);
  };

  const handleStartNewInterview = () => {
    router.push('/interview/start');
  };

  if (userInterviewsQuery === undefined) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (userInterviewsQuery.length === 0) {
    return (
      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Your Interviews
            </CardTitle>
            <CardDescription>
              You haven't taken any interviews yet. Start your first one!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleStartNewInterview}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              Start Your First Interview
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Your Interviews
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            {userInterviewsQuery.length} interview{userInterviewsQuery.length !== 1 ? 's' : ''} completed
          </p>
        </div>
        <Button 
          onClick={handleStartNewInterview}
          className="bg-blue-600 hover:bg-blue-700"
        >
          New Interview
        </Button>
      </div>

      {/* Interviews List */}
      <div className="space-y-4">
        {userInterviewsQuery.map((interview: any) => (
          <Card 
            key={interview._id} 
            className="cursor-pointer hover:shadow-lg transition-shadow duration-200"
            onClick={() => handleInterviewClick(interview._id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-lg">
                    {interview.jobTitle || "Interview Session"}
                  </CardTitle>
                  <CardDescription className="mt-1">
                    {interview.jobDescription 
                      ? interview.jobDescription.substring(0, 100) + (interview.jobDescription.length > 100 ? '...' : '')
                      : "Interview Assessment"
                    }
                  </CardDescription>
                </div>
                
                <div className="flex items-center gap-2 ml-4">
                  {/* Status Badge */}
                  <Badge 
                    variant={interview.hasFeedback ? "default" : "secondary"}
                    className={interview.hasFeedback ? "bg-green-100 text-green-800" : ""}
                  >
                    {interview.hasFeedback ? (
                      <>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </>
                    ) : (
                      <>
                        <Clock className="w-3 h-3 mr-1" />
                        In Progress
                      </>
                    )}
                  </Badge>
                  
                  {/* Arrow */}
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="flex items-center justify-between">
                {/* Interview Details */}
                <div className="flex items-center gap-6 text-sm text-gray-600 dark:text-gray-300">
                  <div className="flex items-center gap-1">
                    <FileText className="w-4 h-4" />
                    <span>{interview.responseCount} responses</span>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{new Date(interview._creationTime).toLocaleDateString()}</span>
                  </div>
                </div>

                {/* Feedback Score */}
                {interview.hasFeedback && interview.feedback && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="text-sm font-medium">
                        {interview.feedback.overallScore}/10
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      <MessageSquare className="w-3 h-3 mr-1" />
                      Feedback Available
                    </Badge>
                  </div>
                )}
              </div>
              
              {/* Progress Bar for In-Progress Interviews */}
              {!interview.hasFeedback && interview.status !== "completed" && (
                <div className="mt-3">
                  <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                    <span>Progress</span>
                    <span>{interview.responseCount} questions answered</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div 
                      className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min((interview.responseCount / 10) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Summary Stats */}
      {userInterviewsQuery.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                  {userInterviewsQuery.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Total Interviews
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {userInterviewsQuery.filter((i: any) => i.hasFeedback).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Completed with Feedback
                </div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                  {userInterviewsQuery.length > 0 
                    ? Math.round(userInterviewsQuery
                        .filter((i: any) => i.hasFeedback)
                        .reduce((sum: number, i: any) => sum + i.feedback.overallScore, 0) / 
                      userInterviewsQuery.filter((i: any) => i.hasFeedback).length || 0)
                    : 0
                  }
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Average Score
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
