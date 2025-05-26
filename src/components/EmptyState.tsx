
import React from 'react';
import { BookOpen, FilePlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';

interface EmptyStateProps {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  icon?: 'book' | 'file';
}

const EmptyState: React.FC<EmptyStateProps> = ({
  title,
  description,
  buttonText,
  buttonLink,
  icon = 'book',
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center animate-fade-in">
      <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center mb-6">
        {icon === 'book' ? (
          <BookOpen size={32} className="text-accent-foreground" />
        ) : (
          <FilePlus size={32} className="text-accent-foreground" />
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md">{description}</p>
      <Link to={buttonLink}>
        <Button>{buttonText}</Button>
      </Link>
    </div>
  );
};

export default EmptyState;
