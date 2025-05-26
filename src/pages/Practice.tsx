
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import { useStories } from '@/contexts/StoryContext';
import PracticeMode from '@/components/PracticeMode';

const Practice = () => {
  const { id } = useParams<{ id: string }>();
  const { getStoryById } = useStories();
  const navigate = useNavigate();

  const story = getStoryById(id || '');

  if (!story) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Story Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The story you're trying to practice doesn't exist.
          </p>
          <button
            onClick={() => navigate('/')}
            className="text-primary hover:underline"
          >
            Go back to Home
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Practice Mode</h1>
        <p className="text-muted-foreground">
          Practice answering interview questions using your STAR story.
        </p>
      </div>

      <PracticeMode 
        story={story} 
        onFinish={() => navigate('/')} 
      />
    </Layout>
  );
};

export default Practice;
