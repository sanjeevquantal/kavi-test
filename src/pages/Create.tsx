
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '@/components/Layout';
import StoryForm from '@/components/StoryForm';
import { Story } from '@/types';
import { useStories } from '@/contexts/StoryContext';
import { toast } from '@/components/ui/use-toast';

const Create = () => {
  const { addStory } = useStories();
  const navigate = useNavigate();

  const handleSubmit = (story: Story) => {
    addStory(story);
    toast({
      title: "Story created",
      description: "Your interview story has been saved successfully.",
    });
    navigate('/');
  };

  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Create a New Story</h1>
        <p className="text-muted-foreground">
          Use the STAR format to craft a compelling interview story.
        </p>
      </div>

      <StoryForm onSubmit={handleSubmit} buttonText="Save Story" />
    </Layout>
  );
};

export default Create;
