import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FaqItem {
  category: string;
  question: string;
  answer: string;
}

export const FaqPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [openIndices, setOpenIndices] = useState<number[]>([0]);

  const faqs: FaqItem[] = [
    {
      category: 'Authentication & Multi-Tenancy',
      question: 'Why does login require an Institution Code in addition to User ID?',
      answer: 'Navark CBT operates on a multi-institution architecture. User IDs (such as "STU001" or "ADMIN") are scoped to individual institutions, which allows colleges to use their own internal roll-number schemes without risk of collision or cross-tenant data leakage.',
    },
    {
      category: 'Authentication & Multi-Tenancy',
      question: 'Can the same student User ID exist in two different institutions?',
      answer: 'Yes. In Navark CBT, User ID is interpreted exclusively within the namespace of the specified Institution Code. For example, "STU001" at Apex Institute of Science is an entirely distinct student entity from "STU001" at Zenith Global Academy.',
    },
    {
      category: 'Examination Experience',
      question: 'What do the different colors on the Question Palette represent during an exam?',
      answer: 'The palette features 5 distinct states: Grey (Not Visited), Red (Visited but Not Answered), Green (Answered), Purple (Marked for Review), and Purple with a green dot (Answered and Marked for Review, which will be evaluated).',
    },
    {
      category: 'Examination Experience',
      question: 'What happens if a student\'s browser closes or the network disconnects?',
      answer: 'The examination player continuously autosaves responses both locally in browser state and syncs them to the backend server. Upon reloading the page or reconnecting, the student resumes with their chosen answers and remaining exam time preserved.',
    },
    {
      category: 'Question Bank & Scoring',
      question: 'Does the platform support negative marking and numerical value questions?',
      answer: 'Yes. Each question can have custom positive marks (e.g., +4) and negative marking penalties (e.g., -1). Numerical questions allow decimal values without multiple-choice guessing.',
    },
    {
      category: 'Question Bank & Scoring',
      question: 'Can questions and choices be randomized for each student?',
      answer: 'Yes. Exam managers can toggle question shuffling and option shuffling per examination to reduce peer cheating in adjacent computer lab terminals.',
    },
    {
      category: 'Institution Administration',
      question: 'How do new institutions onboard onto Navark CBT?',
      answer: 'Administrators can submit an onboarding request through the Registration page. Once reviewed by Platform Super Admins, the institution code and primary administrative credentials are provisioned.',
    },
  ];

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.answer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      f.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleAccordion = (idx: number) => {
    if (openIndices.includes(idx)) {
      setOpenIndices(openIndices.filter((i) => i !== idx));
    } else {
      setOpenIndices([...openIndices, idx]);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-3">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-[#481D1A]">
            Frequently Asked Questions
          </h1>
          <p className="text-sm text-muted-foreground">
            Everything you need to know about navigating, taking exams, and managing institutions on Navark CBT.
          </p>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="h-4 w-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search questions by keyword, topic, or category..."
            className="pl-9 h-10 bg-white"
          />
        </div>

        {/* FAQs List */}
        <div className="space-y-3 pt-4">
          {filteredFaqs.length === 0 ? (
            <p className="text-center text-xs text-muted-foreground py-8">
              No matching questions found for "{searchTerm}".
            </p>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isOpen = openIndices.includes(idx);
              return (
                <Card key={idx} className="border-[#E7DCD3] bg-white overflow-hidden">
                  <button
                    onClick={() => toggleAccordion(idx)}
                    className="w-full text-left p-4 flex items-center justify-between hover:bg-muted/30 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#481D1A]/70 block mb-1">
                        {faq.category}
                      </span>
                      <h3 className="text-sm font-bold text-[#481D1A]">{faq.question}</h3>
                    </div>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 ml-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 ml-4" />
                    )}
                  </button>
                  {isOpen && (
                    <CardContent className="px-4 pb-4 pt-1 text-xs text-muted-foreground leading-relaxed border-t border-[#E7DCD3]/60 bg-[#FFFBF5]/40">
                      {faq.answer}
                    </CardContent>
                  )}
                </Card>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

