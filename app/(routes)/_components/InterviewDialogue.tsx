import { useContext, useState } from "react";
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
import axios from "axios";
import { Loader2Icon } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { UserContextDetails } from "@/app/context/userContextDetails";

function InterviewDialogue() {
  const [formData, setFormData] = useState<any>();
  const [file, setFiles] = useState<File | null>(null);
  const { userDetail, setUserDetail } = useContext(UserContextDetails);
  const [loading, setLoading] = useState(false);
  const dbResponse = useMutation(api.interview.saveInterviewQuestion);

  const onHandleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const onSubmit = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post(
        "/api/generate-interview-question",
        formData
      );
      //   save to db
      await dbResponse({
        userId: userDetail?.id,
        questionText: res.data.question,
        status: "pending",
        resumeUrl: res.data.fileUrl,
      });
    } catch (err) {
      console.log("Error uploading file:", err);
    } finally {
      setLoading(false);
    }
  };
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
            <ResumeUpload setFiles={(file: File) => setFiles(file)} />
          </TabsContent>

          <TabsContent value="job-description">
            <JobDescription onHandleInputChange={onHandleInputChange} />
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex gap-6">
          <Button variant="secondary">Cancel</Button>
          <Button disabled={!file || loading} onClick={onSubmit}>
            {loading && <Loader2Icon className="mr-2 animate-spin" />}
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InterviewDialogue;
