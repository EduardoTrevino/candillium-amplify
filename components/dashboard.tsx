'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { CalendarDays, Search, Plus, ArrowUpDown } from "lucide-react"
import Image from 'next/image'

export function DashboardComponent() {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortAscending, setSortAscending] = useState(true)
  const [selectedCandidate, setSelectedCandidate] = useState(null)

  // Mock data for candidates
  const candidates = [
    { id: 1, name: "Alice Johnson", lastInterview: "2023-06-15" },
    { id: 2, name: "Bob Smith", lastInterview: "2023-06-14" },
    { id: 3, name: "Charlie Brown", lastInterview: "2023-06-13" },
    { id: 4, name: "Diana Ross", lastInterview: "2023-06-12" },
    { id: 5, name: "Edward Norton", lastInterview: "2023-06-11" },
    // Add more candidates as needed
  ]

  const filteredCandidates = candidates
    .filter(candidate => candidate.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      const dateComparison = new Date(b.lastInterview).getTime() - new Date(a.lastInterview).getTime()
      return sortAscending ? -dateComparison : dateComparison
    })

  const handleCandidateClick = (candidate) => {
    setSelectedCandidate(candidate)
  }

  return (
    <div className="flex h-screen flex-col">
      <header className="flex items-center justify-between px-6 py-4 bg-primary text-primary-foreground">
        <div className="flex items-center">
          <Image src="/placeholder.svg" alt="Company Logo" width={32} height={32} className="mr-2" />
          <h1 className="text-xl font-bold">Recruiter Dashboard</h1>
        </div>
        <div className="text-sm">John Doe</div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <aside className="w-64 bg-muted border-r">
          <div className="p-4">
            <div className="relative mb-4">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search candidates"
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setSortAscending(!sortAscending)}
            >
              <ArrowUpDown className="mr-2 h-4 w-4" />
              Sort by Date {sortAscending ? '(Oldest first)' : '(Newest first)'}
            </Button>
          </div>
          <ScrollArea className="h-[calc(100vh-12rem)]">
            {filteredCandidates.map((candidate) => (
              <div
                key={candidate.id}
                className={`p-4 cursor-pointer hover:bg-accent ${selectedCandidate?.id === candidate.id ? 'bg-accent' : ''}`}
                onClick={() => handleCandidateClick(candidate)}
              >
                <h3 className="font-medium">{candidate.name}</h3>
                <p className="text-sm text-muted-foreground">
                  <CalendarDays className="inline mr-1 h-4 w-4" />
                  {new Date(candidate.lastInterview).toLocaleDateString()}
                </p>
              </div>
            ))}
          </ScrollArea>
        </aside>

        <main className="flex-1 p-6 overflow-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              {selectedCandidate ? selectedCandidate.name : 'Select a Candidate'}
            </h2>
            <Button>
              <Plus className="mr-2 h-4 w-4" /> Start New Session
            </Button>
          </div>
          {selectedCandidate ? (
            <div>
              <h3 className="text-lg font-semibold mb-2">Last Interview: {new Date(selectedCandidate.lastInterview).toLocaleDateString()}</h3>
              <p className="text-muted-foreground mb-4">Session Information:</p>
              <div className="bg-muted p-4 rounded-lg">
                <p>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.
                </p>
                <p className="mt-4">
                  Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
                </p>
              </div>
            </div>
          ) : (
            <p className="text-muted-foreground">Select a candidate to view session information.</p>
          )}
        </main>
      </div>
    </div>
  )
}