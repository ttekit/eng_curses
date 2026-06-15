import { Header } from "@/components/header"
import { CatalogHero } from "@/components/catalog/catalog-hero"
import { VideoRow } from "@/components/catalog/video-row"
import { CatalogSidebar } from "@/components/catalog/catalog-sidebar"

// Mock data for video content
const continueWatching = [
  { id: "1", title: "The Office - Business Meeting", thumbnail: "/thumbnails/office.jpg", duration: "24:30", progress: 65, level: "B1" },
  { id: "2", title: "TED Talk: The Power of Vulnerability", thumbnail: "/thumbnails/ted.jpg", duration: "20:15", progress: 30, level: "B2" },
  { id: "3", title: "Friends - The One with the Interview", thumbnail: "/thumbnails/friends.jpg", duration: "22:00", progress: 80, level: "A2" },
]

const recommendedForYou = [
  { id: "4", title: "Breaking Bad - Chemistry Lesson", thumbnail: "/thumbnails/breaking.jpg", duration: "45:00", level: "C1" },
  { id: "5", title: "The Crown - Royal Speech", thumbnail: "/thumbnails/crown.jpg", duration: "55:00", level: "B2" },
  { id: "6", title: "Black Mirror - Tech Talk", thumbnail: "/thumbnails/mirror.jpg", duration: "42:00", level: "C1" },
  { id: "7", title: "Sherlock - Deduction Scene", thumbnail: "/thumbnails/sherlock.jpg", duration: "35:00", level: "C1" },
  { id: "8", title: "The Good Place - Ethics Debate", thumbnail: "/thumbnails/goodplace.jpg", duration: "22:00", level: "B1" },
]

const beginnerFriendly = [
  { id: "9", title: "Peppa Pig - Family Day", thumbnail: "/thumbnails/peppa.jpg", duration: "5:00", level: "A1" },
  { id: "10", title: "Word Party - Colors", thumbnail: "/thumbnails/wordparty.jpg", duration: "12:00", level: "A1" },
  { id: "11", title: "Dora - Adventure Time", thumbnail: "/thumbnails/dora.jpg", duration: "22:00", level: "A1" },
  { id: "12", title: "Sesame Street - Counting", thumbnail: "/thumbnails/sesame.jpg", duration: "15:00", level: "A1" },
]

const businessEnglish = [
  { id: "13", title: "The Intern - Professional Communication", thumbnail: "/thumbnails/intern.jpg", duration: "38:00", level: "B2" },
  { id: "14", title: "Suits - Negotiation Tactics", thumbnail: "/thumbnails/suits.jpg", duration: "44:00", level: "C1" },
  { id: "15", title: "The Social Network - Pitch Meeting", thumbnail: "/thumbnails/social.jpg", duration: "35:00", level: "B2" },
  { id: "16", title: "Mad Men - Client Presentation", thumbnail: "/thumbnails/madmen.jpg", duration: "48:00", level: "C1" },
]

const travelEnglish = [
  { id: "17", title: "Emily in Paris - At the Cafe", thumbnail: "/thumbnails/emily.jpg", duration: "28:00", level: "B1" },
  { id: "18", title: "Lost in Translation - Hotel Check-in", thumbnail: "/thumbnails/lost.jpg", duration: "32:00", level: "B1" },
  { id: "19", title: "The Amazing Race - Airport Scene", thumbnail: "/thumbnails/race.jpg", duration: "25:00", level: "A2" },
  { id: "20", title: "Travel Channel - Street Food", thumbnail: "/thumbnails/travel.jpg", duration: "20:00", level: "A2" },
]

export default function CatalogPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex pt-16">
        {/* Sidebar */}
        <CatalogSidebar />
        
        {/* Main Content */}
        <main className="flex-1 ml-0 lg:ml-64">
          <CatalogHero />
          
          <div className="px-4 sm:px-6 lg:px-8 pb-12 space-y-10">
            <VideoRow 
              title="Continue Watching" 
              videos={continueWatching} 
              showProgress 
            />
            
            <VideoRow 
              title="Recommended For You" 
              videos={recommendedForYou} 
            />
            
            <VideoRow 
              title="Beginner Friendly" 
              videos={beginnerFriendly}
              description="Perfect for A1-A2 levels" 
            />
            
            <VideoRow 
              title="Business English" 
              videos={businessEnglish}
              description="Professional communication skills" 
            />
            
            <VideoRow 
              title="Travel & Conversation" 
              videos={travelEnglish}
              description="Real-world situations" 
            />
          </div>
        </main>
      </div>
    </div>
  )
}
