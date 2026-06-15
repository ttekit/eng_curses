"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Volume2, ChevronDown } from "lucide-react"

interface VocabularyItem {
  word: string
  definition: string
  example: string
}

interface VideoVocabularyProps {
  vocabulary: VocabularyItem[]
}

export function VideoVocabulary({ vocabulary }: VideoVocabularyProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0)

  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-foreground mb-4">Key Vocabulary</h3>
      
      {vocabulary.map((item, index) => (
        <div 
          key={index}
          className="border border-border rounded-lg overflow-hidden"
        >
          <button
            onClick={() => setExpandedIndex(expandedIndex === index ? null : index)}
            className="w-full flex items-center justify-between p-3 hover:bg-muted/50 transition-colors"
          >
            <div className="flex items-center gap-3">
              <button 
                className="p-1.5 rounded-full bg-primary/10 hover:bg-primary/20 transition-colors"
                onClick={(e) => {
                  e.stopPropagation()
                  // In a real app, this would play audio pronunciation
                }}
              >
                <Volume2 className="w-4 h-4 text-primary" />
              </button>
              <span className="font-medium text-foreground">{item.word}</span>
            </div>
            <ChevronDown 
              className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                expandedIndex === index && "rotate-180"
              )}
            />
          </button>
          
          {expandedIndex === index && (
            <div className="px-3 pb-3 space-y-2">
              <div className="pl-10">
                <p className="text-sm text-muted-foreground">
                  {item.definition}
                </p>
                <div className="mt-2 p-2 bg-muted/50 rounded-lg">
                  <p className="text-sm italic text-foreground">
                    &quot;{item.example}&quot;
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
