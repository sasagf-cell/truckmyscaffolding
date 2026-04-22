
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CreditCard, Download, ExternalLink, Loader2, Receipt } from 'lucide-react';
import { useStripe } from '@/hooks/useStripe.js';
import { format } from 'date-fns';

const BillingSettingsTab = () => {
  const navigate = useNavigate();
  const { getCurrentPlan, getInvoices, openCustomerPortal } = useStripe();
  
  const [loading, setLoading] = useState(true);
  const [planData, setPlanData] = useState(null);
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [plan, invs] = await Promise.all([
        getCurrentPlan(),
        getInvoices()
      ]);
      
      if (plan) setPlanData(plan);
      if (invs) setInvoices(invs);
      
      setLoading(false);
    };
    fetchData();
  }, [getCurrentPlan, getInvoices]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <Card>
        <CardHeader>
          <CardTitle>Current Plan</CardTitle>
          <CardDescription>Manage your subscription and billing cycle.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-muted/30 p-6 rounded-xl border">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold capitalize">{planData?.planName || 'Free'} Plan</h3>
                {planData?.stripeCustomerId && (
                  <Badge variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 border-0">Active</Badge>
                )}
              </div>
              <p className="text-muted-foreground font-medium">
                {planData?.price > 0 ? `€${planData.price} / ${planData.billingCycle}` : 'No active paid subscription.'}
              </p>
              {planData?.renewalDate && (
                <p className="text-sm text-muted-foreground mt-2">
                  Renews on {format(new Date(planData.renewalDate), 'MMMM dd, yyyy')}
                </p>
              )}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              {planData?.stripeCustomerId ? (
                <Button variant="outline" className="w-full sm:w-auto" onClick={openCustomerPortal}>
                  Manage Subscription
                  <ExternalLink className="w-4 h-4 ml-2" />
                </Button>
              ) : null}
              
              {(!planData?.planName || planData?.planName === 'Free' || planData?.planName === 'Starter') && (
                <Button className="w-full sm:w-auto" onClick={() => navigate('/pricing')}>
                  Upgrade Plan
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {planData?.stripeCustomerId && (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Update your billing details securely via Stripe.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-xl bg-card">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-8 bg-muted rounded flex items-center justify-center border">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium">Managed via Stripe</p>
                    <p className="text-sm text-muted-foreground">Click update to change your default payment method</p>
                  </div>
                </div>
                <Button variant="ghost" size="sm" onClick={openCustomerPortal}>Update</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>View and download past invoices.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-xl overflow-hidden">
                <table className="w-full text-sm text-left">
                  <thead className="bg-muted/50 text-muted-foreground">
                    <tr>
                      <th className="px-4 py-3 font-medium">Date</th>
                      <th className="px-4 py-3 font-medium">Description</th>
                      <th className="px-4 py-3 font-medium">Amount</th>
                      <th className="px-4 py-3 font-medium">Status</th>
                      <th className="px-4 py-3 font-medium text-right">Invoice</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoices.length > 0 ? (
                      invoices.map((invoice) => (
                        <tr key={invoice.id} className="hover:bg-muted/30 transition-colors">
                          <td className="px-4 py-3">{format(new Date(invoice.created * 1000), 'MMM dd, yyyy')}</td>
                          <td className="px-4 py-3">{invoice.lines?.data[0]?.description || 'Subscription'}</td>
                          <td className="px-4 py-3 font-medium tabular-nums">€{(invoice.amount_paid / 100).toFixed(2)}</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={
                              invoice.status === 'paid' 
                                ? 'bg-success/10 text-success border-success/20' 
                                : 'bg-warning/10 text-warning border-warning/20'
                            }>
                              {invoice.status}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-right">
                            {invoice.invoice_pdf ? (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => window.open(invoice.invoice_pdf, '_blank')}>
                                <Download className="w-4 h-4" />
                              </Button>
                            ) : (
                              <span className="text-muted-foreground text-xs">N/A</span>
                            )}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Receipt className="w-8 h-8 text-muted-foreground/50" />
                            <p>No invoices found.</p>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default BillingSettingsTab;
