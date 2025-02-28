
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
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
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isUpdating, setIsUpdating] = useState(false);
  const [useCentralizedKey, setUseCentralizedKey] = useState(true);
  
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
                        onClick={() => signOut()}
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
                        <a 
                          href="https://docs.perplexity.ai/docs/getting-started" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:text-blue-700 ml-1"
                        >
                          Get your API key here
                        </a>
                      </p>
                      
                      <div className="flex items-center space-x-2 mb-4">
                        <Switch
                          id="api-mode"
                          checked={useCentralizedKey}
                          onCheckedChange={setUseCentralizedKey}
                        />
                        <Label htmlFor="api-mode">Use centralized API key (for all users)</Label>
                      </div>
                      
                      <PerplexityApiKeyForm isAdminMode={useCentralizedKey} />
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
