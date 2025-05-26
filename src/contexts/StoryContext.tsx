
import React, { createContext, useContext, useState, useEffect } from 'react';
import { Story } from '@/types';
import { v4 as uuidv4 } from 'uuid';

interface StoryContextType {
  stories: Story[];
  addStory: (story: Story) => void;
  updateStory: (id: string, updatedStory: Story) => void;
  deleteStory: (id: string) => void;
  getStoryById: (id: string) => Story | undefined;
  saveConversation: (storyId: string, messages: any[], audioUrl: string, conversationId?: string) => void;
}

const StoryContext = createContext<StoryContextType | undefined>(undefined);

// Sample stories to populate the UI initially
const initialStories: Story[] = [
  {
    id: uuidv4(),
    title: "Implementing Agile Methodology",
    principle: "Learn and Be Curious",
    situation: "Our team was struggling with project deadlines and quality issues with our traditional waterfall approach.",
    task: "As the tech lead, I needed to find a more efficient development process to improve productivity and code quality.",
    action: "I researched various methodologies, took a certification in Agile/Scrum, and presented a transition plan to management. I then led training sessions for the team and implemented daily stand-ups, sprint planning, and retrospectives.",
    result: "Within three months, our on-time delivery improved by 40%, and bug reports decreased by 25%. The team reported higher job satisfaction, and we received recognition from upper management for the transformation.",
    createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days ago
    updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
  },
  {
    id: uuidv4(),
    title: "Cost Optimization Initiative",
    principle: "Frugality",
    situation: "Our cloud infrastructure costs were increasing by 15% quarter over quarter, putting pressure on the department budget.",
    task: "I was tasked with reducing cloud costs without impacting system performance or reliability.",
    action: "I conducted a thorough audit of our cloud resources, identified unused instances, and implemented auto-scaling policies. I also created a tagging strategy to track resource usage by project and negotiated better pricing with our cloud provider.",
    result: "We reduced our cloud spending by 30% in the first quarter while maintaining the same performance levels. I documented the process and created a cost optimization playbook that was adopted by other teams in the organization.",
    createdAt: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(), // 60 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
  },
  {
    id: uuidv4(),
    title: "Cross-Functional Communication Breakdown",
    principle: "Earn Trust",
    situation: "A critical product launch was at risk due to poor communication between engineering and marketing departments.",
    task: "As product manager, I needed to bridge the gap between teams and get the project back on track.",
    action: "I established a joint task force with representatives from both teams, created a shared project dashboard for visibility, and facilitated weekly sync meetings with clear agendas and action items. I also instituted a 'no blame' culture to encourage open communication.",
    result: "We successfully launched the product on time with all key features. More importantly, we established a communication framework that was adopted for future cross-functional projects, reducing similar issues by 70%.",
    createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(), // 45 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
  },
  {
    id: uuidv4(),
    title: "New Market Expansion Strategy",
    principle: "Think Big",
    situation: "Our company had plateaued in our primary market and needed to find new growth opportunities.",
    task: "As part of the strategy team, I was asked to identify and evaluate potential new markets for our product.",
    action: "I led a comprehensive market research initiative, analyzing consumer trends, competitive landscape, and regulatory environments across multiple regions. I built financial models to forecast ROI for each opportunity and presented the findings to the executive team.",
    result: "Based on my analysis, we entered two new markets that generated $2.5M in revenue in the first year, exceeding projections by 30%. The expansion framework I developed became the standard process for evaluating all future market opportunities.",
    createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(), // 15 days ago
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
  }
];

export const StoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stories, setStories] = useState<Story[]>(() => {
    const savedStories = localStorage.getItem('interview-stories');
    // If there are no saved stories, use the initial dummy stories
    return savedStories && JSON.parse(savedStories).length > 0 
      ? JSON.parse(savedStories) 
      : initialStories;
  });

  useEffect(() => {
    localStorage.setItem('interview-stories', JSON.stringify(stories));
  }, [stories]);

  const addStory = (story: Story) => {
    setStories((prevStories) => [...prevStories, story]);
  };

  const updateStory = (id: string, updatedStory: Story) => {
    setStories((prevStories) =>
      prevStories.map((story) => (story.id === id ? updatedStory : story))
    );
  };

  const deleteStory = (id: string) => {
    setStories((prevStories) => prevStories.filter((story) => story.id !== id));
  };

  const getStoryById = (id: string) => {
    return stories.find((story) => story.id === id);
  };

  const saveConversation = (
    storyId: string, 
    messages: any[], 
    audioUrl: string, 
    conversationId?: string
  ) => {
    const story = stories.find((s) => s.id === storyId);
    if (story) {
      const updatedStory = {
        ...story,
        elevenLabsConversationId: conversationId || story.elevenLabsConversationId,
        conversation: {
          messages,
          audioUrl,
          timestamp: new Date().toISOString()
        },
        updatedAt: new Date().toISOString()
      };
      updateStory(storyId, updatedStory ,);
    }
  };

  return (
    <StoryContext.Provider
      value={{ stories, addStory, updateStory, deleteStory, getStoryById, saveConversation }}
    >
      {children}
    </StoryContext.Provider>
  );
};

export const useStories = () => {
  const context = useContext(StoryContext);
  if (context === undefined) {
    throw new Error('useStories must be used within a StoryProvider');
  }
  return context;
};
