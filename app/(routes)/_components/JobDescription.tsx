import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import React from "react";

interface JobDescriptionProps {
  onHandleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
}

function JobDescription({ onHandleInputChange }: JobDescriptionProps) {
  return (
    <div className="border rounded-2xl p-10">
      <div>
        <label>Job Title</label>
        <Input
          type="text"
          name="jobTitle"
          placeholder="ex. React Developer"
          onChange={onHandleInputChange}
        />
      </div>
      <div className="mt-6">
        <label>Job Description</label>
        <Textarea
          name="jobDescription"
          placeholder="Type your message here."
          className="h-[200px]"
          onChange={onHandleInputChange}
        />
      </div>
    </div>
  );
}

export default JobDescription;
