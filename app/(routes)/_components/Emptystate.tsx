import { Button } from "@/components/ui/button";
import Image from "next/image";
import InterviewDialogue from "./InterviewDialogue";

export function EmptySate() {
  return (
    <div className="mx-auto mt-14 flex w-full max-w-4xl flex-col items-center gap-5">
      <Image
        src="/empty-state-illustration.jpg"
        alt="Empty State Illustration"
        width={180}
        height={180}
      />
      <h2 className="text-xl font-semibold text-gray-800 p-100">
        You do not have any Interview created
      </h2>
      <InterviewDialogue />
    </div>
  );
}