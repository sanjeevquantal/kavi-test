
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import Layout from '@/components/Layout';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { User } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

const Profile = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const isMobile = useIsMobile();

  // If no user is authenticated, redirect to auth page
  useEffect(() => {
    if (!user) {
      navigate('/auth');
    }
  }, [user, navigate]);
  
  const form = useForm({
    defaultValues: {
      username: profile?.username || '',
      full_name: profile?.full_name || '',
    },
  });

  // Update form values when profile loads
  React.useEffect(() => {
    if (profile) {
      form.reset({
        username: profile.username || '',
        full_name: profile.full_name || '',
      });
    }
  }, [profile, form]);

  const onSubmit = async (data: any) => {
    if (!user) {
      return;
    }
    
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          username: data.username,
          full_name: data.full_name,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) throw error;
      
      toast.success('Profile updated successfully');
      refreshProfile();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error("Sign out error:", error);
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="text-center py-10">
          <h1 className="text-2xl font-bold mb-4">You must be logged in</h1>
          <p className="text-muted-foreground mb-4">
            Please sign in to view your profile.
          </p>
          <Button onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
        
        <div className="mb-8">
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>Your basic account details</CardDescription>
                </div>
                <div className="h-14 w-14 rounded-full bg-primary/10 flex items-center justify-center">
                  <User size={24} className="text-primary" />
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className={`grid ${isMobile ? 'grid-cols-1 gap-3' : 'grid-cols-2 gap-4'}`}>
                <div>
                  <div className="text-sm font-medium mb-1">Email</div>
                  <div className="text-muted-foreground break-all">
                    {user.email || 'No email available'}
                  </div>
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">User ID</div>
                  <div className="text-muted-foreground text-xs break-all">
                    {user.id || 'Unknown'}
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => navigate('/')}>
              Back to Home
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleSignOut}
              disabled={loading}
            >
              {loading ? 'Signing Out...' : 'Sign Out'}
            </Button>
          </CardFooter>
          </Card>
        </div>

        {/* <Card>
          <CardHeader>
            <CardTitle>Edit Profile</CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="Username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={loading}>
                  {loading ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </Form>
          </CardContent>
          
        </Card> */}
      </div>
    </Layout>
  );
};

export default Profile;
