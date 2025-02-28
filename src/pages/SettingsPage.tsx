
import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import WebLayout from '@/components/WebLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { 
  User, 
  Mail, 
  Save, 
  LogOut, 
  Image, 
  Loader2,
  Bell,
  Globe,
  DollarSign
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useNavigate } from 'react-router-dom';
import { AuthGuard } from '@/components/AuthGuard';

const SettingsPage = () => {
  const { user, profile, signOut, updateProfile } = useAuth();
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('en');
  const navigate = useNavigate();
  
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      await updateProfile({ fullName });
      toast.success('Profile updated successfully!');
    } catch (error) {
      console.error('Update profile error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/auth');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };
  
  return (
    <AuthGuard>
      <WebLayout title="Account Settings">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Account</CardTitle>
                  <CardDescription>Manage your personal details</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col items-center py-6">
                  <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                    {profile?.avatar_url ? (
                      <img 
                        src={profile.avatar_url} 
                        alt="Profile" 
                        className="w-full h-full rounded-full object-cover"
                      />
                    ) : (
                      <User size={40} className="text-gray-500" />
                    )}
                  </div>
                  <h3 className="font-medium text-lg">{profile?.full_name || 'User'}</h3>
                  <p className="text-gray-500 text-sm mt-1">{user?.email}</p>
                </CardContent>
                <CardFooter className="flex flex-col items-stretch gap-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Image size={16} className="mr-2" />
                    Change Profile Photo
                  </Button>
                  <Button 
                    variant="destructive" 
                    className="w-full justify-start"
                    onClick={handleSignOut}
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="md:col-span-2">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <form onSubmit={handleUpdateProfile}>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name</Label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="fullName"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          className="pl-10"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                        <Input
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="pl-10 bg-gray-50"
                        />
                      </div>
                      <p className="text-xs text-gray-500">Email cannot be changed</p>
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={16} className="mr-2" />
                          Save Changes
                        </>
                      )}
                    </Button>
                  </CardFooter>
                </form>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Preferences</CardTitle>
                  <CardDescription>Manage your app preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="email-notifications">Email Notifications</Label>
                      <p className="text-sm text-gray-500">
                        Receive emails about your trips and special offers
                      </p>
                    </div>
                    <Switch
                      id="email-notifications"
                      checked={emailNotifications}
                      onCheckedChange={setEmailNotifications}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="currency">Currency</Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Select value={currency} onValueChange={setCurrency}>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select currency" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (€)</SelectItem>
                          <SelectItem value="GBP">GBP (£)</SelectItem>
                          <SelectItem value="JPY">JPY (¥)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="language">Language</Label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="pl-10">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="en">English</SelectItem>
                          <SelectItem value="es">Spanish</SelectItem>
                          <SelectItem value="fr">French</SelectItem>
                          <SelectItem value="de">German</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>
                    <Save size={16} className="mr-2" />
                    Save Preferences
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </WebLayout>
    </AuthGuard>
  );
};

export default SettingsPage;
