
import React, { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Story } from '@/types';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2, ExternalLink } from 'lucide-react';
import ConversationView from './ConversationView';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface StoryCardProps {
  story: Story;
  onDelete: (id: string) => void;
}

const StoryCard: React.FC<StoryCardProps> = ({ story, onDelete }) => {
  const [isConversationOpen, setIsConversationOpen] = useState(false);
  const navigate = useNavigate();
  const isMobile = useIsMobile();
  
  const truncate = (text: string, length = 100) => {
    if (!text) return '';
    
    // Use a shorter length on mobile
    const mobileLength = 60;
    const finalLength = isMobile ? mobileLength : length;
    
    if (text.length <= finalLength) return text;
    return text.substring(0, finalLength) + '...';
  };

  const hasConversation = Boolean(
    (story.conversation && (story.conversation.messages?.length > 0 || story.conversation.audioUrl)) ||
    story.elevenLabsConversationId
  );

  const handleViewConversation = () => {
    if (!hasConversation) {
      toast.info("No conversation available. Practice with this story first to create a conversation.");
      return;
    }
    setIsConversationOpen(true);
  };

  const handlePractice = () => {
    navigate(`/practice?storyId=${story.id}`);
  };

  return (
    <Card className="animate-fade-in h-full flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start flex-wrap gap-2">
          <CardTitle className="text-lg break-words">{story.title}</CardTitle>
          <Badge variant="outline" className="bg-accent text-accent-foreground shrink-0">
            {story.principle}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground flex-grow">
        <p>{truncate(story.situation)}</p>
        <div className="mt-2 text-xs text-muted-foreground">
          Updated {formatDistanceToNow(new Date(story.updatedAt), { addSuffix: true })}
        </div>
        {hasConversation && (
          <div className="mt-2 text-xs">
            <Badge variant="secondary" className="bg-primary/10">
              <MessageSquare size={12} className="mr-1" /> 
              {story.elevenLabsConversationId ? "ElevenLabs Conversation" : "Has conversation"}
            </Badge>
          </div>
        )}
      </CardContent>
      <CardFooter className={`flex ${isMobile ? 'flex-col gap-2' : 'justify-between'} pt-0`}>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => onDelete(story.id)}
          className={isMobile ? 'w-full justify-center' : ''}
        >
          <Trash2 size={16} className="mr-1" /> Delete
        </Button>
        <div className={`flex gap-2 ${isMobile ? 'w-full' : ''}`}>
          <Button 
            variant="outline"
            size="sm"
            onClick={handlePractice}
            className={isMobile ? 'flex-1 justify-center' : ''}
          >
            <ExternalLink size={16} className="mr-1" /> 
            Practice
          </Button>
          <Button 
            variant={hasConversation ? "default" : "outline"}
            size="sm"
            onClick={handleViewConversation}
            className={isMobile ? 'flex-1 justify-center' : ''}
          >
            <MessageSquare size={16} className="mr-1" /> 
            {isMobile ? '' : 'View Conversation'}
          </Button>
        </div>
      </CardFooter>
      
      <ConversationView 
        storyId={story.id}
        open={isConversationOpen}
        onOpenChange={setIsConversationOpen}
      />
    </Card>
  );
};

export default StoryCard;
