import { useState, useEffect } from 'react';
import { Save, Globe, Mail, Bell, Shield, Zap, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSiteSettings } from '@/hooks/useSiteSettings';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const AdminSettings = () => {
  const { settings, loading, updateSettings, refreshSettings } = useSiteSettings();
  
  const [generalSettings, setGeneralSettings] = useState(settings.general);
  const [notificationSettings, setNotificationSettings] = useState(settings.notifications);
  const [featureSettings, setFeatureSettings] = useState(settings.features);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setGeneralSettings(settings.general);
    setNotificationSettings(settings.notifications);
    setFeatureSettings(settings.features);
  }, [settings]);

  const handleSaveGeneral = async () => {
    setSaving(true);
    await updateSettings('general', generalSettings);
    setSaving(false);
  };

  const handleSaveNotifications = async () => {
    setSaving(true);
    await updateSettings('notifications', notificationSettings);
    setSaving(false);
  };

  const handleSaveFeatures = async () => {
    setSaving(true);
    await updateSettings('features', featureSettings);
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-64" />
        </div>
        <Skeleton className="h-12 w-full max-w-md" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">Manage your site configuration and preferences</p>
        </div>
        <Button variant="outline" size="icon" onClick={refreshSettings}>
          <RefreshCw className="h-4 w-4" />
        </Button>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="general" className="gap-2">
            <Globe className="h-4 w-4" />
            General
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="features" className="gap-2">
            <Zap className="h-4 w-4" />
            Features
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">General Settings</h2>
              <Badge variant="outline" className="text-xs">Saved to database</Badge>
            </div>
            
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="siteName">Site Name</Label>
                <Input
                  id="siteName"
                  value={generalSettings.siteName}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, siteName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="supportEmail">Support Email</Label>
                <Input
                  id="supportEmail"
                  type="email"
                  value={generalSettings.supportEmail}
                  onChange={(e) => setGeneralSettings({ ...generalSettings, supportEmail: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="siteDescription">Site Description</Label>
              <Textarea
                id="siteDescription"
                value={generalSettings.siteDescription}
                onChange={(e) => setGeneralSettings({ ...generalSettings, siteDescription: e.target.value })}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="calendlyUrl">Calendly URL</Label>
              <Input
                id="calendlyUrl"
                value={generalSettings.calendlyUrl}
                onChange={(e) => setGeneralSettings({ ...generalSettings, calendlyUrl: e.target.value })}
                placeholder="https://calendly.com/your-username/meeting"
              />
              <p className="text-sm text-muted-foreground">
                This URL is used for the "Book a Strategy Call" feature
              </p>
            </div>

            <Button onClick={handleSaveGeneral} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Notification Preferences</h2>
              <Badge variant="outline" className="text-xs">Saved to database</Badge>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Email Notifications</p>
                  <p className="text-sm text-muted-foreground">Receive email updates about your account</p>
                </div>
                <Switch
                  checked={notificationSettings.emailNotifications}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, emailNotifications: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">New Lead Alerts</p>
                  <p className="text-sm text-muted-foreground">Get notified when a new lead is submitted</p>
                </div>
                <Switch
                  checked={notificationSettings.newLeadAlerts}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, newLeadAlerts: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Weekly Digest</p>
                  <p className="text-sm text-muted-foreground">Receive a weekly summary of activity</p>
                </div>
                <Switch
                  checked={notificationSettings.weeklyDigest}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, weeklyDigest: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Slack Integration</p>
                  <p className="text-sm text-muted-foreground">Send notifications to a Slack channel</p>
                </div>
                <Switch
                  checked={notificationSettings.slackIntegration}
                  onCheckedChange={(checked) => setNotificationSettings({ ...notificationSettings, slackIntegration: checked })}
                />
              </div>
            </div>

            <Button onClick={handleSaveNotifications} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </TabsContent>

        {/* Feature Settings */}
        <TabsContent value="features">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-semibold">Feature Toggles</h2>
              <Badge variant="outline" className="text-xs">Saved to database</Badge>
            </div>
            
            <p className="text-sm text-muted-foreground">
              Enable or disable features across the platform
            </p>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Image Generator</p>
                  <p className="text-sm text-muted-foreground">AI-powered image generation tool</p>
                </div>
                <Switch
                  checked={featureSettings.enableImageGenerator}
                  onCheckedChange={(checked) => setFeatureSettings({ ...featureSettings, enableImageGenerator: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Brand Voice Trainer</p>
                  <p className="text-sm text-muted-foreground">Brand voice analysis and training</p>
                </div>
                <Switch
                  checked={featureSettings.enableBrandVoice}
                  onCheckedChange={(checked) => setFeatureSettings({ ...featureSettings, enableBrandVoice: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Campaign Planner</p>
                  <p className="text-sm text-muted-foreground">PR campaign planning tools</p>
                </div>
                <Switch
                  checked={featureSettings.enableCampaigns}
                  onCheckedChange={(checked) => setFeatureSettings({ ...featureSettings, enableCampaigns: checked })}
                />
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                <div>
                  <p className="font-medium">Social Media Publisher</p>
                  <p className="text-sm text-muted-foreground">Social content distribution</p>
                </div>
                <Switch
                  checked={featureSettings.enableSocialPublisher}
                  onCheckedChange={(checked) => setFeatureSettings({ ...featureSettings, enableSocialPublisher: checked })}
                />
              </div>
            </div>

            <Button onClick={handleSaveFeatures} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Saving...' : 'Save Features'}
            </Button>
          </div>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security">
          <div className="bg-card rounded-xl border border-border p-6 space-y-6">
            <h2 className="text-lg font-semibold">Security Settings</h2>
            
            <div className="space-y-6">
              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2">Two-Factor Authentication</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add an extra layer of security to your account
                </p>
                <Button variant="outline">Enable 2FA</Button>
              </div>

              <div className="p-4 rounded-lg bg-muted/50">
                <h3 className="font-medium mb-2">Active Sessions</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Manage your active sessions across devices
                </p>
                <Button variant="outline">View Sessions</Button>
              </div>

              <div className="p-4 rounded-lg border border-destructive/20 bg-destructive/5">
                <h3 className="font-medium mb-2 text-destructive">Danger Zone</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Permanently delete your account and all associated data
                </p>
                <Button variant="destructive">Delete Account</Button>
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;
