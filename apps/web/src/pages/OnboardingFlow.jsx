import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { MessageSquare, Send, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext.jsx';
import pb from '@/lib/pocketbaseClient';
import { toast } from 'sonner';

const OnboardingFlow = () => {
  const [step, setStep] = useState(1);
  const [projectName, setProjectName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [subcontractorEmail, setSubcontractorEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleProjectSubmit = () => {
    if (!projectName.trim()) {
      toast.error('Please enter a project name');
      return;
    }
    setStep(2);
  };

  const handleCompanySubmit = () => {
    if (!companyName.trim()) {
      toast.error('Please enter a company name');
      return;
    }
    setStep(3);
  };

  const handleSubcontractorSubmit = async () => {
    setLoading(true);
    try {
      const project = await pb.collection('projects').create({
        user_id: currentUser.id,
        name: projectName,
        location: companyName,
        description: '',
        scaffold_prefix: 'GER'
      }, { $autoCancel: false });

      if (subcontractorEmail.trim()) {
        await pb.collection('subcontractors').create({
          project_id: project.id,
          company_name: 'Subcontractor',
          contact_person: '',
          email: subcontractorEmail,
          status: 'pending_invite',
          invite_token: crypto.randomUUID()
        }, { $autoCancel: false });
      }

      setStep(4);
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    setLoading(true);
    try {
      await pb.collection('projects').create({
        user_id: currentUser.id,
        name: projectName,
        location: companyName,
        description: '',
        scaffold_prefix: 'GER'
      }, { $autoCancel: false });

      setStep(4);
    } catch (error) {
      toast.error('Failed to create project');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    navigate('/dashboard');
  };

  return (
    <>
      <Helmet>
        <title>Welcome - TrackMyScaffolding</title>
      </Helmet>

      <div className="min-h-screen bg-muted flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="card">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <MessageSquare className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Welcome to TrackMyScaffolding</h2>
                <p className="text-sm text-muted-foreground">Let's get you set up</p>
              </div>
            </div>

            <div className="space-y-6">
              {step === 1 && (
                <div className="space-y-4">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-primary font-medium">What's the name of your construction site?</p>
                  </div>
                  <input
                    type="text"
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="e.g., Berlin Central Station Renovation"
                    className="input-field text-foreground"
                    onKeyPress={(e) => e.key === 'Enter' && handleProjectSubmit()}
                  />
                  <button onClick={handleProjectSubmit} className="btn-primary w-full">
                    Continue
                  </button>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-muted-foreground">Construction site: {projectName}</p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-primary font-medium">Which company are you working for?</p>
                  </div>
                  <input
                    type="text"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    placeholder="e.g., Meridian Construction GmbH"
                    className="input-field text-foreground"
                    onKeyPress={(e) => e.key === 'Enter' && handleCompanySubmit()}
                  />
                  <button onClick={handleCompanySubmit} className="btn-primary w-full">
                    Continue
                  </button>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <div className="bg-muted rounded-lg p-4">
                    <p className="text-muted-foreground">Construction site: {projectName}</p>
                    <p className="text-muted-foreground">Company: {companyName}</p>
                  </div>
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-primary font-medium">Add your first subcontractor</p>
                    <p className="text-sm text-primary/80 mt-1">We'll send them an invite email</p>
                  </div>
                  <input
                    type="email"
                    value={subcontractorEmail}
                    onChange={(e) => setSubcontractorEmail(e.target.value)}
                    placeholder="subcontractor@company.com"
                    className="input-field text-foreground"
                  />
                  <div className="flex gap-3">
                    <button
                      onClick={handleSubcontractorSubmit}
                      disabled={loading || !subcontractorEmail.trim()}
                      className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {loading ? 'Creating...' : 'Send invite'}
                    </button>
                    <button onClick={handleSkip} disabled={loading} className="btn-outline">
                      Skip
                    </button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="bg-primary/10 rounded-lg p-4">
                    <p className="text-primary font-medium text-lg">You're all set!</p>
                    <p className="text-sm text-primary/80 mt-1">Here's what you can do next:</p>
                  </div>
                  <div className="space-y-3">
                    <button
                      onClick={handleFinish}
                      className="w-full text-left p-4 border border-border rounded-lg hover:bg-muted transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Go to dashboard</p>
                          <p className="text-sm text-muted-foreground">Start managing your scaffolds</p>
                        </div>
                        <ArrowRight className="w-5 h-5 text-muted-foreground" />
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OnboardingFlow;
