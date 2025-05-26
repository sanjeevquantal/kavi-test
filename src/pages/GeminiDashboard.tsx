
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import Layout from '@/components/Layout';
import { supabase } from '@/integrations/supabase/client';

const GeminiDashboard = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [newSummary, setNewSummary] = useState('');
  const [summaries, setSummaries] = useState<string[]>([]);
  const [cumulativeSummary, setCumulativeSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [envApiKey, setEnvApiKey] = useState('');

  useEffect(() => {
    // Check if we can fetch the environment variable (frontend only)
    const geminiKey = import.meta.env.GEMINI_API_KEY || '';
    setEnvApiKey(geminiKey ? 'Set in environment' : 'Not set in frontend environment');

    // Fetch existing cumulative summary
    fetchCumulativeSummary();
  }, [user]);

  const fetchCumulativeSummary = async () => {
    if (!user) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('gemini-memory', {
        body: {
          action: 'retrieve',
          userId: user.id
        }
      });

      if (error) {
        console.error('Error fetching cumulative summary:', error);
        toast({
          title: 'Error',
          description: `Failed to fetch cumulative summary: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      if (data.exists) {
        setCumulativeSummary(data.cumulativeSummary);
        toast({
          title: 'Success',
          description: 'Fetched existing cumulative summary',
        });
      } else {
        setCumulativeSummary('');
        toast({
          title: 'Info',
          description: 'No cumulative summary exists yet',
        });
      }
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: `Failed to fetch: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddSummary = () => {
    if (newSummary.trim()) {
      setSummaries([...summaries, newSummary.trim()]);
      setNewSummary('');
    }
  };

  const handleGenerateCumulative = async () => {
    if (summaries.length === 0) {
      toast({
        title: 'Error',
        description: 'Please add at least one summary',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('gemini-memory', {
        body: {
          action: 'generate',
          userId: user?.id,
          summaries: summaries.map((summary, index) => ({ id: index, summary }))
        }
      });

      if (error) {
        console.error('Error generating cumulative summary:', error);
        toast({
          title: 'Error',
          description: `Failed to generate: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      setCumulativeSummary(data.cumulativeSummary);
      toast({
        title: 'Success',
        description: 'Generated cumulative summary successfully',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: `Failed to generate: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateCumulative = async () => {
    if (!newSummary.trim()) {
      toast({
        title: 'Error',
        description: 'Please add a summary to update with',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase.functions.invoke('gemini-memory', {
        body: {
          action: 'update',
          userId: user?.id,
          newSummary: newSummary.trim()
        }
      });

      if (error) {
        console.error('Error updating cumulative summary:', error);
        toast({
          title: 'Error',
          description: `Failed to update: ${error.message}`,
          variant: 'destructive',
        });
        return;
      }

      setCumulativeSummary(data.cumulativeSummary);
      setNewSummary('');
      toast({
        title: 'Success',
        description: 'Updated cumulative summary successfully',
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: `Failed to update: ${error.message}`,
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updateApiKey = async () => {
    if (!apiKey.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter an API key',
        variant: 'destructive',
      });
      return;
    }

    // This is just for testing in development
    // In production, you would set this via Supabase secrets
    localStorage.setItem('GEMINI_API_KEY', apiKey.trim());
    toast({
      title: 'Success',
      description: 'API key saved to local storage (for testing only)',
    });
  };

  if (!user) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-[70vh]">
          <Card className="w-full max-w-lg">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please sign in to access the Gemini Dashboard.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container mx-auto py-8">
        <h1 className="text-3xl font-bold mb-6">Gemini Memory Dashboard</h1>
        
        <div className="grid gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Environment Status</CardTitle>
              <CardDescription>Check the status of your Gemini API key</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Frontend Environment:</p>
                  <p className="text-sm">{envApiKey}</p>
                </div>
                <div className="flex gap-4">
                  <Input
                    placeholder="Enter Gemini API key for testing"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="flex-1"
                    type="password"
                  />
                  <Button onClick={updateApiKey}>Save (Testing Only)</Button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Existing Cumulative Summary</CardTitle>
              <CardDescription>Current cumulative summary stored in the database</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={cumulativeSummary} 
                readOnly 
                className="min-h-[150px]" 
                placeholder="No cumulative summary stored yet"
              />
            </CardContent>
            <CardFooter>
              <Button onClick={fetchCumulativeSummary} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Refresh Summary'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add New Summary</CardTitle>
              <CardDescription>Add a new summary to work with</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                value={newSummary}
                onChange={(e) => setNewSummary(e.target.value)}
                placeholder="Enter a new summary here..."
                className="min-h-[150px]"
              />
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button onClick={handleAddSummary}>Add to List</Button>
              <Button onClick={handleUpdateCumulative} disabled={isLoading || !newSummary.trim()}>
                {isLoading ? 'Processing...' : 'Update Cumulative with This'}
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary List ({summaries.length})</CardTitle>
              <CardDescription>Summaries added for generating a cumulative summary</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {summaries.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No summaries added yet</p>
                ) : (
                  summaries.map((summary, index) => (
                    <div key={index} className="border rounded-lg p-3">
                      <p className="text-sm">{summary}</p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleGenerateCumulative} 
                disabled={isLoading || summaries.length === 0}
              >
                {isLoading ? 'Generating...' : 'Generate Cumulative Summary'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default GeminiDashboard;
