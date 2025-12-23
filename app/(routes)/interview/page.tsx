

"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, FileText, MessageSquare, ArrowRight, CheckCircle, Calendar, BarChart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useContext } from "react";
import { UserContextDetails } from "@/app/context/userContextDetails";


function Interview() {
  const router = useRouter();
  
  // Get user details from context
  const { userDetail } = useContext(UserContextDetails);

  // Query user's interviews with feedback
  const userInterviewsQuery = useQuery(
    api.interview.getUserInterviews,
    userDetail?.id ? { userId: userDetail.id } : "skip"
  );

  // Filter only attended interviews (those with feedback)
  const attendedInterviews = userInterviewsQuery?.filter((interview: any) => 
    interview.hasFeedback && interview.responseCount > 0
  ) || [];

  const handleInterviewClick = (interviewId: string) => {
    router.push(`/interview/${interviewId}`);
  };

  const handleStartNewInterview = () => {
    router.push('/interview/start');
  };


  if (userInterviewsQuery === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle case where user is not authenticated
  if (!userDetail) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Authentication Required
              </CardTitle>
              <CardDescription>
                Please sign in to view your interview history and progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => router.push('/')}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Go to Homepage
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Attended Interviews
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Your completed interview sessions with feedback and scores
          </p>
        </div>

        {attendedInterviews.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                No Attended Interviews Yet
              </CardTitle>
              <CardDescription>
                You haven't completed any interviews with feedback yet. Start your first interview to see your progress and scores here.
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
        ) : (
          <div className="space-y-6">
            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                      {attendedInterviews.length}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Total Attended Interviews
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 dark:text-green-400 mb-1">
                      {attendedInterviews.length > 0 
                        ? Math.round(attendedInterviews
                            .reduce((sum: number, interview: any) => sum + interview.feedback.overallScore, 0) / 
                          attendedInterviews.length)
                        : 0
                      }
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Average Score
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                      {attendedInterviews.reduce((sum: number, interview: any) => sum + interview.responseCount, 0)}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Total Questions Answered
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Interviews List */}
            <div className="space-y-4">
              {attendedInterviews.map((interview: any) => (
                <Card 
                  key={interview._id} 
                  className="cursor-pointer hover:shadow-lg transition-all duration-200 border-l-4 border-l-green-500"
                  onClick={() => handleInterviewClick(interview._id)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-xl mb-2">
                          {interview.jobTitle || "Interview Session"}
                        </CardTitle>
                        <CardDescription className="text-base">
                          {interview.jobDescription 
                            ? interview.jobDescription.length > 150 
                              ? interview.jobDescription.substring(0, 150) + '...'
                              : interview.jobDescription
                            : "Interview Assessment"
                          }
                        </CardDescription>
                      </div>
                      
                      <div className="flex items-center gap-3 ml-4">
                        {/* Score Badge */}
                        <div className="text-center">
                          <div className="flex items-center gap-1 mb-1">
                            <Star className="w-5 h-5 text-yellow-500 fill-current" />
                            <span className="text-lg font-bold text-gray-900 dark:text-white">
                              {interview.feedback.overallScore}/10
                            </span>
                          </div>
                          <Badge 
                            variant="default"
                            className="bg-green-100 text-green-800 hover:bg-green-200"
                          >
                            <CheckCircle className="w-3 h-3 mr-1" />
                            Completed
                          </Badge>
                        </div>
                        
                        <ArrowRight className="h-5 w-5 text-gray-400" />
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent>
                    <div className="space-y-4">
                      {/* Interview Details */}
                      <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center gap-6">
                          <div className="flex items-center gap-1">
                            <FileText className="w-4 h-4" />
                            <span>{interview.responseCount} questions answered</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(interview._creationTime).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            })}</span>
                          </div>
                          
                          <div className="flex items-center gap-1">
                            <BarChart className="w-4 h-4" />
                            <span>{interview.feedback.knowledgeBasedRating}</span>
                          </div>
                        </div>
                      </div>
                      
                      {/* Feedback Preview */}
                      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center gap-1">
                          <MessageSquare className="w-4 h-4" />
                          Feedback Summary
                        </h4>
                        <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                          {interview.feedback.feedback || "No feedback text available"}
                        </p>
                      </div>
                      
                      {/* Suggestions for Improvement */}
                      {interview.feedback.suggestionsForImprovement && interview.feedback.suggestionsForImprovement.length > 0 && (
                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                          <h4 className="font-medium text-blue-900 dark:text-blue-200 mb-2">
                            Key Suggestions:
                          </h4>
                          <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                            {interview.feedback.suggestionsForImprovement.slice(0, 2).map((suggestion: string, index: number) => (
                              <li key={index} className="flex items-start gap-2">
                                <span className="text-blue-600 dark:text-blue-400 mt-0.5">•</span>
                                <span>{suggestion}</span>
                              </li>
                            ))}
                            {interview.feedback.suggestionsForImprovement.length > 2 && (
                              <li className="text-blue-600 dark:text-blue-400 italic">
                                +{interview.feedback.suggestionsForImprovement.length - 2} more suggestions...
                              </li>
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Action Button */}
            <div className="mt-8 text-center">
              <Button 
                onClick={handleStartNewInterview}
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                Start New Interview
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Interview;
