
import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import { useSettings } from '@/hooks/useSettings.js';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, User } from 'lucide-react';
import pb from '@/lib/pocketbaseClient';

const ProfileSettingsTab = () => {
  const { currentUser } = useAuth();
  const { getUserProfile, updateUserProfile, updateUserAvatar, loading } = useSettings();
  
  const [profile, setProfile] = useState({
    full_name: '',
    phone: '',
    company_name: '',
    email: ''
  });
  const [avatarUrl, setAvatarUrl] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (currentUser?.id) {
        const data = await getUserProfile(currentUser.id);
        if (data) {
          setProfile({
            full_name: data.full_name || '',
            phone: data.phone || '',
            company_name: data.company || data.company_name || '',
            email: data.email || ''
          });
          if (data.avatar) {
            setAvatarUrl(pb.files.getUrl(data, data.avatar));
          }
        }
      }
    };
    loadProfile();
  }, [currentUser, getUserProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    await updateUserProfile({
      fullName: profile.full_name,
      phone: profile.phone,
      company: profile.company_name
    });
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    const newAvatarUrl = await updateUserAvatar(file);
    if (newAvatarUrl) {
      setAvatarUrl(newAvatarUrl);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
          <CardDescription>Update your personal details and public profile.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-8 mb-8 items-start">
            <div className="flex flex-col items-center gap-4">
              <div className="w-24 h-24 rounded-xl bg-muted flex items-center justify-center overflow-hidden border shadow-sm">
                {avatarUrl ? (
                  <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <User className="w-10 h-10 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col items-center gap-2">
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleAvatarChange}
                />
                <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={loading}>
                  <Upload className="w-4 h-4 mr-2" />
                  Change Avatar
                </Button>
                <p className="text-xs text-muted-foreground">JPG, PNG or WebP. Max 5MB.</p>
              </div>
            </div>

            <form onSubmit={handleSave} className="flex-1 space-y-4 w-full">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input 
                    id="full_name" 
                    name="full_name" 
                    value={profile.full_name} 
                    onChange={handleChange} 
                    placeholder="John Doe"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="email">Email Address</Label>
                  <Input 
                    id="email" 
                    name="email" 
                    value={profile.email} 
                    disabled 
                    className="bg-muted/50 text-muted-foreground"
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed here.</p>
                </div>
                <div className="form-group">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    name="phone" 
                    value={profile.phone} 
                    onChange={handleChange} 
                    placeholder="+1 (555) 000-0000"
                  />
                </div>
                <div className="form-group">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input 
                    id="company_name" 
                    name="company_name" 
                    value={profile.company_name} 
                    onChange={handleChange} 
                    placeholder="Acme Scaffolding Ltd."
                  />
                </div>
              </div>
              
              <div className="pt-4 flex justify-end">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Save Changes
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfileSettingsTab;
