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
import { useRouter } from "next/navigation";


function InterviewDialogue() {
  const [formData, setFormData] = useState<any>();
  const [file, setFiles] = useState<File | null>(null);
  const [open, setOpen] = useState(false);
  const { userDetail, setUserDetail } = useContext(UserContextDetails);
  const [loading, setLoading] = useState(false);
  const dbResponse = useMutation(api.interview.saveInterviewQuestion);
  const router = useRouter()


  const onHandleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCancel = () => {
    setOpen(false);
    // Reset form data when canceling
    setFormData({});
    setFiles(null);
  };

  const canSubmit = () => {
    // Can submit if there's a file OR both jobTitle and jobDescription are provided
    return file || (formData?.jobTitle && formData?.jobDescription);
  };

  const onSubmit = async () => {
    
    if (!canSubmit()) {
      console.log("Cannot submit - validation failed");
      return;
    }
    
    if (!userDetail?.id) {
      console.log("Cannot submit - userDetail or userDetail.id is missing");
      return;
    }
    
    setLoading(true);
    const formData_ = new FormData();
    
    if (file) {
      formData_.append("file", file);
    }
    
    formData_.append("jobDescription", formData?.jobDescription ?? "");
    formData_.append("jobTitle", formData?.jobTitle ?? "");
    
    try {
      const res = await axios.post(
        "/api/generate-interview-question",
        formData_
      );   
      //   save to db
     const objectId = await dbResponse({
        userId: userDetail?.id,
        questionText: res.data.question,
        status: "pending",
        resumeUrl: res.data.fileUrl && res.data.fileUrl.trim() ? res.data.fileUrl : null,
        jobDescription: formData?.jobDescription && formData.jobDescription.trim() ? formData.jobDescription : null,
        jobTitle: formData?.jobTitle && formData.jobTitle.trim() ? formData.jobTitle : null,
      });

      console.log("Stored Data:", objectId);
      router.push('/interview/'+objectId);
    } catch (err) {
      console.log("Error uploading file:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
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
          <Button variant="secondary" onClick={handleCancel}>Cancel</Button>
          <Button disabled={!canSubmit() || loading} onClick={onSubmit}>
            {loading && <Loader2Icon className="mr-2 animate-spin" />}
            Proceed
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default InterviewDialogue;
