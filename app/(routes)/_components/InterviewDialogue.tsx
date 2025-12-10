import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ResumeUpload from "./ResumeUpload";
import JobDescription from "./JobDescription";

function InterviewDialogue() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button size={"lg"}>+ Create Interview</Button>
      </DialogTrigger>

      <DialogContent className="min-w-3xl">
        <DialogHeader>
          <DialogTitle>Please select the relevant one</DialogTitle>
          <DialogDescription>
            Select either to upload a resume or provide a job description.
          </DialogDescription>
        </DialogHeader>

        {/* Tabs moved outside of DialogDescription */}
        <Tabs defaultValue="upload-resume" className="w-full mt-5">
          <TabsList>
            <TabsTrigger value="upload-resume">Upload Resume</TabsTrigger>
            <TabsTrigger value="job-description">Job Description</TabsTrigger>
          </TabsList>

          <TabsContent value="upload-resume">
            <ResumeUpload />
          </TabsContent>

          <TabsContent value="job-description">
            <JobDescription />
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-6">
          <Button variant="secondary">Cancel</Button>
          <Button>Proceed</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InterviewDialogue;
