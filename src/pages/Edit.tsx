
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '@/components/Layout';
import StoryForm from '@/components/StoryForm';
import { useStories } from '@/contexts/StoryContext';
import { toast } from '@/components/ui/use-toast';

const Edit = () => {
  const { id } = useParams<{ id: string }>();
  const { getStoryById, updateStory } = useStories();
  const navigate = useNavigate();

  const story = getStoryById(id || '');

  if (!story) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">Story Not Found</h1>
          <p className="text-muted-foreground mb-4">
            The story you're trying to edit doesn't exist.
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

  const handleSubmit = (updatedStory: any) => {
    updateStory(story.id, updatedStory);
    toast({
      title: "Story updated",
      description: "Your changes have been saved successfully.",
    });
    navigate('/');
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Edit Story</h1>
        <p className="text-muted-foreground">
          Update your STAR format interview story.
        </p>
      </div>

      <StoryForm initialStory={story} onSubmit={handleSubmit} buttonText="Update Story" />
    </Layout>
  );
};

export default Edit;
