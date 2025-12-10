"use client";

import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/nextjs";
import React from "react";
import { EmptySate } from "../_components/Emptystate";
import InterviewDialogue from "../_components/InterviewDialogue";

export default function DashboardPage() {
  const { user } = useUser();
  const [interviewList, setInterviewList] = React.useState<any[]>([]);
  return (
    <div className="space-y-6 py-20 px-10 md:px-28 lg:px-44 xl:px-56">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg text-gray-500">My Dashboard</h2>
          <h2 className="text-3xl font-bold">Welcome, {user?.fullName}</h2>
        </div>
        <div></div>
        {/* <Button size={"lg"}>+ Create Interview</Button>      */}
        <InterviewDialogue />
      </div>
      {interviewList.length === 0 && <EmptySate />}

    </div>
  );
}
