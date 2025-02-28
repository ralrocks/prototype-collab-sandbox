
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useApiKey } from '@/contexts/ApiKeyContext';
import WebLayout from '@/components/WebLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { AuthGuard } from '@/components/AuthGuard';

const SettingsPage = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { hasPerplexityApiKey } = useApiKey();
  const [fullName, setFullName] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  
  console.log('Settings page loaded with profile:', profile);
  
  // Update fullName when profile changes
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
      console.log('Updated fullName from profile:', profile.full_name);
    }
  }, [profile]);
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    
    try {
      await updateProfile({ fullName });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsUpdating(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      console.log('Attempting to sign out...');
      await signOut();
      toast.success('Signed out successfully');
    } catch (error) {
      console.error('Sign out error:', error);
      toast.error('Failed to sign out');
    }
  };
  
  return (
    <AuthGuard>
      <WebLayout title="Settings">
        <div className="container mx-auto py-6 max-w-3xl">
          <Tabs defaultValue="account" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="api-keys">API Keys</TabsTrigger>
            </TabsList>
            
            <TabsContent value="account" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Information</CardTitle>
                  <CardDescription>
                    Update your account settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleUpdateProfile} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        value={user?.email || ''}
                        disabled
                        className="bg-gray-100"
                      />
                      <p className="text-sm text-gray-500">
                        Your email address cannot be changed
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                      />
                    </div>
                    
                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleSignOut}
                      >
                        Sign Out
                      </Button>
                      
                      <Button
                        type="submit"
                        disabled={isUpdating}
                      >
                        {isUpdating ? 'Saving...' : 'Save Changes'}
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="api-keys" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>API Keys</CardTitle>
                  <CardDescription>
                    API Keys are managed centrally for all users
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Perplexity API</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        This app uses a centralized API key for all users. You don't need to provide your own key.
                      </p>
                      
                      <div className="bg-green-50 p-4 rounded-md border border-green-200">
                        <p className="text-green-800 font-medium">API Key Status: {hasPerplexityApiKey ? 'Active' : 'Loading...'}</p>
                        <p className="text-green-700 text-sm mt-1">All features are available and working properly.</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </WebLayout>
    </AuthGuard>
  );
};

export default SettingsPage;
