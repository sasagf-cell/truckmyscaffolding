
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import apiServerClient from '@/lib/apiServerClient.js';
import pb from '@/lib/pocketbaseClient';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';

const SubcontractorSignupPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  
  const [isValidating, setIsValidating] = useState(true);
  const [inviteData, setInviteData] = useState(null);
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm();
  const password = watch('password');

  useEffect(() => {
    const validateToken = async () => {
      if (!token) {
        setError('No invitation token provided.');
        setIsValidating(false);
        return;
      }

      try {
        const res = await apiServerClient.fetch(`/subcontractors/validate-token/${token}`);
        const data = await res.json();
        
        if (data.valid) {
          setInviteData(data);
        } else {
          setError(data.error || 'Invite link is invalid or has expired.');
        }
      } catch (err) {
        setError('Invite link is invalid or has expired.');
      } finally {
        setIsValidating(false);
      }
    };

    validateToken();
  }, [token]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const res = await apiServerClient.fetch('/subcontractors/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          full_name: data.full_name,
          password: data.password
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to join project');
      }

      // Auto-login after successful join
      try {
        await pb.collection('users').authWithPassword(inviteData.email, data.password);
        setSuccess(true);
        setTimeout(() => navigate('/dashboard'), 1500);
      } catch {
        // Login failed — fallback to manual login
        setSuccess(true);
        setTimeout(() => navigate('/login'), 2000);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isValidating) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Validating invitation...</p>
        </div>
      </div>
    );
  }

  if (error && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md border-destructive/20 shadow-lg">
          <CardHeader className="text-center pb-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
              <AlertCircle className="w-6 h-6 text-destructive" />
            </div>
            <CardTitle className="text-xl">Invalid Invitation</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground">{error}</p>
            <p className="text-sm mt-4">Please contact your project coordinator for a new invitation link.</p>
          </CardContent>
          <CardFooter>
            <Button className="w-full" onClick={() => navigate('/')}>Return to Home</Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
        <Card className="w-full max-w-md border-success/20 shadow-lg">
          <CardContent className="text-center pt-10 pb-8">
            <div className="mx-auto w-16 h-16 rounded-full bg-success/10 flex items-center justify-center mb-6">
              <CheckCircle2 className="w-8 h-8 text-success" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Welcome Aboard!</h2>
            <p className="text-muted-foreground">You have successfully joined the project.</p>
            <p className="text-sm mt-6 text-muted-foreground animate-pulse">Redirecting to login...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4 py-12">
      <Card className="w-full max-w-lg shadow-xl">
        <CardHeader className="space-y-1 text-center pb-6 border-b">
          <CardTitle className="text-2xl font-bold">Join Project Team</CardTitle>
          <CardDescription>
            You've been invited by {inviteData.coordinator.full_name} to join <span className="font-semibold text-foreground">{inviteData.project.name}</span>
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-muted/50 p-4 rounded-lg mb-6 border">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Your Role</p>
                <p className="font-medium">{inviteData.role}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">Email</p>
                <p className="font-medium truncate">{inviteData.email}</p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input 
                id="full_name" 
                {...register('full_name', { required: 'Full name is required' })} 
                placeholder="John Doe"
              />
              {errors.full_name && <p className="text-xs text-destructive">{errors.full_name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Create Password</Label>
              <Input 
                id="password" 
                type="password" 
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 8, message: 'Password must be at least 8 characters' }
                })} 
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirm_password">Confirm Password</Label>
              <Input 
                id="confirm_password" 
                type="password" 
                {...register('confirm_password', { 
                  required: 'Please confirm your password',
                  validate: value => value === password || 'Passwords do not match'
                })} 
              />
              {errors.confirm_password && <p className="text-xs text-destructive">{errors.confirm_password.message}</p>}
            </div>

            <Button type="submit" className="w-full mt-6" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Accept & Join
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default SubcontractorSignupPage;
