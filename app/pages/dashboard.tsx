import { useState, useEffect } from 'react';
import { getCurrentUser, signOut } from 'aws-amplify/auth'; // Updated imports
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CalendarDays, Search, Plus, ArrowUpDown } from "lucide-react";
import Image from 'next/image';
import { generateClient } from 'aws-amplify/data';
import type { Schema } from '@/amplify/data/resource';
import { useRouter } from 'next/navigation';  // For navigation in Next.js App Router
import { LogOut, User } from 'lucide-react';  // Lucide icon for user and log out

// Define a type for AuthUser
interface AuthUserWithLoginId {
  loginId: string;
  email: string;
}

interface Candidate {
  name: string | null;
  lastInterview: string | null; // Date is stored as a string (can be AWSDateTime if needed)
  recruiter: string | null; // This will store the recruiter ID (owner)
}

// Generate Amplify Data client
const client = generateClient<Schema>();

export default function Dashboard() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortAscending, setSortAscending] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null); // Define candidate type
  const [candidates, setCandidates] = useState<Candidate[]>([]); // Define candidates type
  const [user, setUser] = useState<AuthUserWithLoginId | null>(null);  // Store logged-in user info
  const [loading, setLoading] = useState(true);  // Manage loading state
  const [error, setError] = useState<string | null>(null); // Handle errors
  const [isClient, setIsClient] = useState(false);  // To check if running on the client
  const [menuOpen, setMenuOpen] = useState(false); // Dropdown state for user menu

  const router = useRouter();  // For navigation and redirection

  // Fetch the logged-in user and their session information
  useEffect(() => {
    setIsClient(true);  // Now running on the client side

    async function fetchUserAndCandidates() {
      try {
        // Get the current authenticated user's info
        const currentUser = await getCurrentUser();
        console.log("Current user structure:", currentUser);

        // Extract loginId and email from the appropriate places
        const loginId = currentUser?.signInDetails?.loginId || currentUser?.username;
        const email = currentUser?.signInDetails?.loginId;  // Assuming the loginId is the user's email

        if (!loginId || !email) {
          throw new Error("User not authenticated or loginId missing");
        }

        // Set the user info to state
        setUser({
          loginId,
          email,
        });

        // Fetch the candidates associated with the logged-in user (recruiter)
        console.log("Fetching candidates for recruiter:", loginId);
        const { data: candidatesData } = await client.models.Candidate.list({
          filter: { recruiter: { eq: loginId } },  // Filter by loginId
        });
        console.log("Fetched candidates data:", candidatesData);

        // If no candidates are found (first-time user), set candidates to an empty array
        setCandidates(candidatesData || []);  // Handle no candidates gracefully

      } catch (err) {
        console.error("Error fetching candidates:", err);  // Log the error
        setError('An error occurred while fetching data. Please try again.');
      } finally {
        setLoading(false);
      }
    }

    if (isClient) {
      fetchUserAndCandidates();  // Only fetch data on the client
    }
  }, [isClient, router]);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(); // Call Amplify's signOut
      router.push('/'); // Redirect to homepage or login page
    } catch (error) {
      console.error("Error during sign out", error);
    }
  };

  // Filter and sort candidates based on search and sort settings
  const filteredCandidates = candidates
    .filter((candidate: Candidate) => candidate.name?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a: Candidate, b: Candidate) => {
      const dateComparison = new Date(b.lastInterview || "").getTime() - new Date(a.lastInterview || "").getTime();
      return sortAscending ? -dateComparison : dateComparison;
    });

  // Handle when a candidate is clicked
  const handleCandidateClick = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
  };

  if (loading) {
    return <p>Loading candidates...</p>; // Show loading state
  }

  if (error) {
    return <p>{error}</p>; // Show error message if any
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-300 text-black">
        <div className="flex items-center">
          <Image src="/favicon.ico" alt="Company Logo" width={17} height={17} className="mr-2" />
          <h1 className="text-xl font-bold">Candillium</h1>
        </div>

        <div className="relative">
          {/* User Icon with Name */}
          <div
            className="flex items-center cursor-pointer space-x-2"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            <User className="h-6 w-6 text-black" />
            <span>{user ? user.email : "Loading..."}</span>
          </div>

          {/* Dropdown Menu for Logout */}
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
              <ul className="py-1">
                <li
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2 text-red-500" />
                  Logout
                </li>
              </ul>
            </div>
          )}
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-muted border-r">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates"
                className="pl-8 rounded-lg"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full rounded-lg"
              onClick={() => setSortAscending(!sortAscending)}
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort by Date {sortAscending ? '(Oldest first)' : '(Newest first)'}
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {filteredCandidates.length === 0 ? (
              <p className="text-muted-foreground p-4">No candidates found.</p>  // Display message if no candidates
            ) : (
              filteredCandidates.map((candidate : Candidate) => (
                <div
                  key={candidate.recruiter}
                  className={`p-4 cursor-pointer hover:bg-accent ${selectedCandidate?.recruiter === candidate.recruiter ? 'bg-accent' : ''}`}
                  onClick={() => handleCandidateClick(candidate)}
                >
                  <h3 className="font-medium">{candidate.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    <CalendarDays className="inline mr-1 h-4 w-4" />
                    {new Date(candidate.lastInterview || "").toLocaleDateString()}
                  </p>
                </div>
              ))
            )}
          </ScrollArea>
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCandidate ? selectedCandidate.name : 'Select a Candidate'}
            </h2>
            <Button className="rounded-lg bg-gray-200 text-black hover:bg-[#ffbf00] hover:text-black">
              <Plus className="mr-2 h-4 w-4" /> Start New Session
            </Button>
          </div>
          {selectedCandidate ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Last Interview: {new Date(selectedCandidate.lastInterview || "").toLocaleDateString()}
              </h3>
              <p className="text-muted-foreground mb-4">Session Information:</p>
              <div className="bg-muted p-4 rounded-lg">
                <p>Interview summary for {selectedCandidate.name} will go here...</p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Select a candidate to view session information.</p>
          )}
        </main>
      </div>
    </div>
  );
}
