
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, Send } from "lucide-react";
import React from "react";

function Interview() {
  return (
    <div className="flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/interview.jpg"
              alt="Interview Illustration"
              width={180}
              height={180}
            />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Ready for Your Interview?
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Take the next step in your career journey
          </p>
        </div>

        {/* Start Interview Section */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Are you ready to take the Interview?
          </h2>
          <Button 
            size="lg" 
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-medium py-3"
          >
            Start Interview
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
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
  );
}

export default Interview;
