
import Header from "./_components/Header";
import { HeroSectionOne } from "./_components/Hero";
import { InterviewNavbar } from "./_components/InterviewNavbar";

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <HeroSectionOne />
        
        {/* Interview Navbar Section */}
        <div className="mt-12">
          <InterviewNavbar />
        </div>
      </div>
    </div>
  );
}
