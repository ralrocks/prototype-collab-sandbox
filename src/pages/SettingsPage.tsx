
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
import PerplexityApiKeyForm from '@/components/PerplexityApiKeyForm';
import { Switch } from '@/components/ui/switch';

const SettingsPage = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const { hasPerplexityApiKey } = useApiKey();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(true);
  
  // Update fullName when profile changes
  useEffect(() => {
    if (profile?.full_name) {
      setFullName(profile.full_name);
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
                    Manage your external API keys
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Perplexity API</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Used for real-time flight search, hotel recommendations, and travel information.
                      </p>
                      
                      {user?.email === 'admin@example.com' && (
                        <div className="flex items-center space-x-2 mb-4">
                          <Switch
                            id="api-mode"
                            checked={isAdminMode}
                            onCheckedChange={setIsAdminMode}
                          />
                          <Label htmlFor="api-mode">Show Admin Controls</Label>
                        </div>
                      )}
                      
                      <PerplexityApiKeyForm isAdminMode={isAdminMode} />
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
