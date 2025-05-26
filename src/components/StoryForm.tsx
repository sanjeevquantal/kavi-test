
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LEADERSHIP_PRINCIPLES, Story } from '@/types';
import { BookOpen, Lightbulb, RotateCw, Sparkles } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { v4 as uuidv4 } from 'uuid';

interface StoryFormProps {
  initialStory?: Story;
  onSubmit: (story: Story) => void;
  buttonText?: string;
}

const StoryForm: React.FC<StoryFormProps> = ({ 
  initialStory, 
  onSubmit, 
  buttonText = "Save Story"
}) => {
  const [story, setStory] = useState<Story>(
    initialStory || {
      id: uuidv4(),
      title: '',
      principle: '',
      situation: '',
      task: '',
      action: '',
      result: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  );

  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setStory((prev) => ({ ...prev, [name]: value }));
  };

  const handlePrincipleChange = (value: string) => {
    setStory((prev) => ({ ...prev, principle: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...story,
      updatedAt: new Date().toISOString(),
    });
  };

  const generateWithAi = (section?: 'all' | 'situation' | 'task' | 'action' | 'result') => {
    setIsAiGenerating(true);
    
    // Simulate AI response with timeout
    setTimeout(() => {
      if (section === 'all' || !section) {
        // In a real app, this would call an AI API
        const aiStory = {
          ...story,
          situation: story.situation || "I was leading a cross-functional team responsible for launching a new product feature with a tight deadline of 2 weeks.",
          task: story.task || "My task was to coordinate all team members, ensure we met our quality standards, and deliver within the deadline despite limited resources.",
          action: story.action || "I first broke down the project into smaller tasks and assigned clear responsibilities. I established daily stand-ups to quickly address blockers, created a shared dashboard to track progress, and personally stepped in to help with coding when we fell behind schedule.",
          result: story.result || "We successfully launched the feature on time with zero critical bugs. User adoption exceeded expectations by 35%, and our team process was adopted as a best practice across other teams in the organization."
        };
        setStory(aiStory);
      } else {
        // Generate just one section
        const sectionExamples: Record<string, string> = {
          situation: "I was leading a cross-functional team responsible for launching a new product feature with a tight deadline of 2 weeks.",
          task: "My task was to coordinate all team members, ensure we met our quality standards, and deliver within the deadline despite limited resources.",
          action: "I first broke down the project into smaller tasks and assigned clear responsibilities. I established daily stand-ups to quickly address blockers, created a shared dashboard to track progress, and personally stepped in to help with coding when we fell behind schedule.",
          result: "We successfully launched the feature on time with zero critical bugs. User adoption exceeded expectations by 35%, and our team process was adopted as a best practice across other teams in the organization."
        };
        
        setStory(prev => ({
          ...prev,
          [section]: sectionExamples[section]
        }));
      }
      
      setIsAiGenerating(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto animate-fade-in">
      <div className="space-y-2">
        <Label htmlFor="title">Story Title</Label>
        <Input
          id="title"
          name="title"
          value={story.title}
          onChange={handleChange}
          placeholder="E.g., Leading the Product Launch"
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="principle">Leadership Principle</Label>
        <Select 
          value={story.principle} 
          onValueChange={handlePrincipleChange}
          required
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a leadership principle" />
          </SelectTrigger>
          <SelectContent>
            {LEADERSHIP_PRINCIPLES.map((principle) => (
              <SelectItem key={principle.name} value={principle.name}>
                {principle.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {story.principle && (
          <p className="text-sm text-muted-foreground mt-1">
            {LEADERSHIP_PRINCIPLES.find(p => p.name === story.principle)?.description}
          </p>
        )}
      </div>

      <div className="bg-secondary/50 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center">
            <BookOpen size={18} className="mr-2 text-primary" />
            <h3 className="font-medium">STAR Format</h3>
          </div>
          <Button 
            type="button" 
            variant="outline" 
            size="sm"
            onClick={() => generateWithAi('all')}
            disabled={isAiGenerating}
          >
            {isAiGenerating ? (
              <>
                <RotateCw size={16} className="mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles size={16} className="mr-2" />
                Generate All
              </>
            )}
          </Button>
        </div>

        {['situation', 'task', 'action', 'result'].map((section) => (
          <div className="star-section" key={section}>
            <div className="flex justify-between items-start mb-2">
              <Label htmlFor={section} className="capitalize font-medium">
                {section}
              </Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => generateWithAi(section as any)}
                disabled={isAiGenerating}
                className="h-6 text-xs"
              >
                <Lightbulb size={14} className="mr-1" />
                Suggest
              </Button>
            </div>
            <Textarea
              id={section}
              name={section}
              value={(story as any)[section]}
              onChange={handleChange}
              placeholder={`Describe the ${section}...`}
              rows={3}
              required
            />
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full">{buttonText}</Button>
    </form>
  );
};

export default StoryForm;
