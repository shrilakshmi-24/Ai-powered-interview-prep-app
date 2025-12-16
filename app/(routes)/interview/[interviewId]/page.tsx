"use client";

import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Send, CheckCircle, Star, FileText, MessageSquare } from "lucide-react";
import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

function Interview() {
  const router = useRouter();
  const params = useParams();
  const interviewId = params.interviewId as string;

  // Query interview data and responses
  const interviewQuery = useQuery(
    api.interview.getInterviewById,
    interviewId ? { id: interviewId as any } : "skip"
  );
  
  const responsesQuery = useQuery(
    api.interview.getInterviewResponses,
    interviewId ? { interviewId: interviewId as any } : "skip"
  );

  const feedbackQuery = useQuery(
    api.interview.getInterviewFeedback,
    interviewId ? { interviewId: interviewId as any } : "skip"
  );


  const [showFeedback, setShowFeedback] = useState(false);

  // Mutation to save feedback to database
  const saveFeedbackMutation = useMutation(api.interview.saveInterviewFeedback);

  const handleStartInterview = () => {
    router.push(`/interview/${interviewId}/startInterview`);
  };

  const handleContinueInterview = () => {
    router.push(`/interview/${interviewId}/streaming`);
  };

  const handleCompleteInterview = () => {
    router.push(`/interview/${interviewId}/streaming`);
  };

  // Determine interview status
  const hasResponses = responsesQuery && responsesQuery.length > 0;
  const totalQuestions = interviewQuery?.questionText ? 
    (Array.isArray(interviewQuery.questionText) ? interviewQuery.questionText.length : 1) : 0;
  const answeredQuestions = responsesQuery?.length || 0;
  const isCompleted = hasResponses && answeredQuestions >= totalQuestions;
  const hasFeedback = feedbackQuery && feedbackQuery.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Interview Navbar */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Interview Info */}
            <div className="flex items-center space-x-4">
              <div>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {interviewQuery?.jobTitle || "Interview Session"}
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {interviewQuery?.jobDescription ? 
                    `${interviewQuery.jobDescription.substring(0, 100)}...` : 
                    "Interview Assessment"
                  }
                </p>
              </div>
            </div>

            {/* Status & Actions */}
            <div className="flex items-center space-x-4">
              {/* Progress Status */}
              {hasResponses && (
                <div className="flex items-center space-x-2">
                  <div className="text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      {answeredQuestions}/{totalQuestions} questions
                    </span>
                    {isCompleted && (
                      <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Feedback Status */}
              <div className="flex items-center space-x-2">
                {hasFeedback ? (
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800"
                  >
                    <Star className="w-4 h-4 mr-1" />
                    View Feedback
                  </button>
                ) : isCompleted ? (
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
                  >
                    <MessageSquare className="w-4 h-4 mr-1" />
                    Generate Feedback
                  </button>
                ) : null}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-2">
                {hasResponses && !isCompleted && (
                  <Button
                    size="sm"
                    onClick={handleContinueInterview}
                    className="bg-blue-600 hover:bg-blue-700 text-white"
                  >
                    Continue
                  </Button>
                )}
                {isCompleted && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleContinueInterview}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    <FileText className="w-4 h-4 mr-1" />
                    Review
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex items-center justify-center p-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header Section */}
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <Image
                src="/empty-state-illustration.jpg"
                alt="Interview Illustration"
                width={180}
                height={180}
              />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              {isCompleted ? "Interview Completed!" : hasResponses ? "Continue Interview" : "Ready for Your Interview?"}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {isCompleted ? "View your results and feedback" : hasResponses ? "Continue where you left off" : "Take the next step in your career journey"}
            </p>
            
            {/* Progress indicator */}
            {hasResponses && (
              <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center justify-between text-sm text-blue-800 dark:text-blue-200">
                  <span>Progress</span>
                  <span>{answeredQuestions}/{totalQuestions} questions answered</span>
                </div>
                <div className="w-full bg-blue-200 dark:bg-blue-800 rounded-full h-2 mt-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(answeredQuestions / totalQuestions) * 100}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>

          {/* Interview Action Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
            {!hasResponses ? (
              // Not started yet
              <>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Are you ready to take the Interview?
                </h2>
                <Button 
                  size="lg" 
                  onClick={handleStartInterview}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3"
                >
                  Start Interview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            ) : isCompleted ? (
              // Interview completed
              <>
                <div className="flex items-center gap-3 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Interview Completed!
                    </h2>
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {answeredQuestions} questions answered
                    </p>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <Button 
                    size="lg" 
                    onClick={() => setShowFeedback(true)}
                    className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium py-3"
                  >
                    <Star className="mr-2 h-4 w-4" />
                    {hasFeedback ? "View Feedback" : "Get Feedback"}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={handleContinueInterview}
                    className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    Review Responses
                  </Button>
                </div>
              </>
            ) : (
              // In progress
              <>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Continue Your Interview
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  You have answered {answeredQuestions} of {totalQuestions} questions
                </p>
                <Button 
                  size="lg" 
                  onClick={handleContinueInterview}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3"
                >
                  Continue Interview
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </>
            )}
          </div>

          {/* Invite Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Want to send this to someone else?
            </h2>
            <div className="space-y-3">
              <Input 
                type="email" 
                placeholder="Enter email address"
                className="w-full"
              />
              <Button 
                variant="outline" 
                className="w-full border-blue-200 text-blue-600 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-400 dark:hover:bg-blue-900/20"
              >
                Send Invite
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                Interview Feedback
              </h2>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFeedback(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>

            {hasFeedback && feedbackQuery && feedbackQuery.length > 0 ? (
              // Show existing feedback
              <div className="space-y-6">
                {feedbackQuery.map((feedback: any) => (
                  <div key={feedback._id} className="space-y-4">
                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <Star className="h-5 w-5 text-green-600" />
                        <span className="font-semibold text-green-800 dark:text-green-200">
                          Overall Score: {feedback.overallScore}/10
                        </span>
                      </div>
                      <p className="text-green-700 dark:text-green-300">{feedback.feedback}</p>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                      <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
                        Knowledge-Based Rating: {feedback.knowledgeBasedRating}
                      </h4>
                    </div>

                    {feedback.suggestionsForImprovement && feedback.suggestionsForImprovement.length > 0 && (
                      <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                        <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                          Suggestions for Improvement:
                        </h4>
                        <ul className="list-disc list-inside text-yellow-700 dark:text-yellow-300">
                          {feedback.suggestionsForImprovement.map((suggestion: string, index: number) => (
                            <li key={index}>{suggestion}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {feedback.questionsAndResponses && feedback.questionsAndResponses.length > 0 && (
                      <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
                        <h4 className="font-semibold text-gray-800 dark:text-gray-200 mb-3">
                          Questions & Responses:
                        </h4>
                        <div className="space-y-3">
                          {feedback.questionsAndResponses.map((qa: any, index: number) => (
                            <div key={index} className="border-l-4 border-blue-400 pl-4">
                              <p className="font-medium text-gray-800 dark:text-gray-200">
                                Q: {qa.question}
                              </p>
                              <p className="text-gray-600 dark:text-gray-300 mt-1">
                                A: {qa.response || "No response"}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              // Generate new feedback
              <div className="text-center">
                <MessageSquare className="h-16 w-16 text-blue-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Generate AI Feedback
                </h3>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Get detailed feedback on your interview performance including strengths, 
                  areas for improvement, and overall scoring.
                </p>


                <Button 
                  onClick={async () => {
                    try {
                      // Get userId from the interview data
                      const userId = interviewQuery?.userId;
                      
                      if (!userId) {
                        console.error('User ID not found');
                        alert('User ID not found. Please refresh the page and try again.');
                        return;
                      }
                      
                      // Call the feedback API
                      const response = await fetch('/api/feedback', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                          interviewId: interviewId,
                          userId: userId,
                        }),
                      });
                      
                      if (response.ok) {
                        const feedbackData = await response.json();
                        
                        if (feedbackData.success && feedbackData.feedback) {
                          const feedback = feedbackData.feedback;
                          

                          // Transform responses data to the correct format for the mutation
                          const questionsAndResponses = responsesQuery?.map((response: any) => ({
                            question: response.questionText,
                            response: response.responseText || ""
                          })) || [];

                          // Store the feedback in the database using Convex mutation
                          try {
                            await saveFeedbackMutation({
                              interviewId: interviewId as any,
                              userId: userId,
                              feedback: feedback.feedback || "",
                              knowledgeBasedRating: feedback.knowledge_based_rating || "",
                              suggestionsForImprovement: feedback.suggestions_for_improvement || [],
                              overallScore: feedback.overall_score || 0,
                              questionsAndResponses: questionsAndResponses,
                            });
                            
                            console.log('Feedback saved to database successfully');
                            
                            // Refresh the page to show the feedback
                            window.location.reload();
                          } catch (saveError) {
                            console.error('Error saving feedback to database:', saveError);
                            alert('Failed to save feedback to database, but feedback was generated successfully.');
                            // Still refresh to show the feedback from API
                            window.location.reload();
                          }
                        } else {
                          throw new Error('No feedback data received');
                        }
                      } else {
                        const errorData = await response.json();
                        console.error('Failed to generate feedback:', errorData.error);
                        alert(`Failed to generate feedback: ${errorData.error || 'Unknown error'}. Please try again.`);
                      }
                    } catch (error) {
                      console.error('Error generating feedback:', error);
                      alert('Error generating feedback. Please try again.');
                    }
                  }}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3"
                >
                  <Star className="mr-2 h-4 w-4" />
                  Generate Feedback
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Interview;
