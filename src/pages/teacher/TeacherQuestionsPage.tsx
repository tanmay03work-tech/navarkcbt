import React, { useState, useEffect } from 'react';
import { PageHeader } from '@/components/common/PageHeader';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Plus, Eye, Edit, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { questionService } from '@/services/question.service';
import { Question } from '@/types';

export const TeacherQuestionsPage: React.FC = () => {
  const { institution, user } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState('');

  const loadQuestions = async () => {
    if (!institution) return;
    const qList = await questionService.getQuestions(institution.id);
    setQuestions(qList);
  };

  useEffect(() => {
    loadQuestions();
  }, [institution]);

  const handleDelete = async (id: string) => {
    if (window.confirm('Delete this question from repository?')) {
      await questionService.deleteQuestion(id);
      loadQuestions();
    }
  };

  const filtered = questions.filter(
    q =>
      q.text.toLowerCase().includes(search.toLowerCase()) ||
      q.topic.toLowerCase().includes(search.toLowerCase()) ||
      q.subjectName.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Teacher Question Bank"
        description="Problems authored by you and shared within your institution repository."
        breadcrumbs={[
          { label: 'Faculty Portal', href: '/teacher' },
          { label: 'Question Bank' },
        ]}
      >
        <div className="flex items-center gap-2">
          <Link to="/teacher/questions/import">
            <Button variant="outline" className="border-[#481D1A] text-[#481D1A] text-xs gap-1.5 shadow-sm font-semibold">
              <span>Ingest Word DOCX</span>
            </Button>
          </Link>
          <Link to="/teacher/questions/new">
            <Button className="bg-[#481D1A] text-white hover:bg-[#351412] text-xs gap-1.5 shadow-sm font-semibold">
              <Plus className="h-4 w-4" />
              <span>Draft New Question</span>
            </Button>
          </Link>
        </div>
      </PageHeader>

      <Card className="border-[#E7DCD3] bg-white">
        <CardContent className="p-4 space-y-4">
          <div className="relative w-full sm:w-80">
            <Search className="h-4 w-4 absolute left-3 top-2.5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by topic or question text..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <div className="space-y-3">
            {filtered.map((q, idx) => (
              <div
                key={q.id}
                className="p-4 rounded-xl border border-[#E7DCD3] bg-[#FFFBF5]/40 hover:bg-[#FFFBF5] transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-[#481D1A]">#{idx + 1}</span>
                    <Badge variant="outline" className="text-[10px] bg-white font-semibold">{q.subjectName}</Badge>
                    <Badge variant="secondary" className="text-[10px]">{q.topic}</Badge>
                    <Badge variant="outline" className="text-[10px]">{q.difficulty}</Badge>
                    <span className="text-muted-foreground text-[10px]">
                      +{q.positiveMarks}/-{q.negativeMarks} marks
                    </span>
                  </div>
                  <p className="font-medium text-foreground line-clamp-2">{q.text}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link to={`/institution/questions/${q.id}`}>
                    <Button variant="outline" size="sm" className="h-8 text-xs gap-1 border-[#481D1A]/30">
                      <Eye className="h-3.5 w-3.5" />
                      <span>Preview</span>
                    </Button>
                  </Link>
                  <Link to={`/teacher/questions/${q.id}/edit`}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-[#481D1A]">
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(q.id)}
                    className="h-8 w-8 text-muted-foreground hover:text-rose-600"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

