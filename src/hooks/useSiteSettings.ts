import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface GeneralSettings {
  siteName: string;
  siteDescription: string;
  supportEmail: string;
  calendlyUrl: string;
}

interface NotificationSettings {
  emailNotifications: boolean;
  newLeadAlerts: boolean;
  weeklyDigest: boolean;
  slackIntegration: boolean;
}

interface FeatureSettings {
  enableImageGenerator: boolean;
  enableBrandVoice: boolean;
  enableCampaigns: boolean;
  enableSocialPublisher: boolean;
}

interface SiteSettings {
  general: GeneralSettings;
  notifications: NotificationSettings;
  features: FeatureSettings;
}

const defaultSettings: SiteSettings = {
  general: {
    siteName: 'RELAYA',
    siteDescription: 'AI-Powered PR & Media Outreach Platform',
    supportEmail: '',
    calendlyUrl: 'https://calendly.com/your-username/strategy-call'
  },
  notifications: {
    emailNotifications: true,
    newLeadAlerts: true,
    weeklyDigest: false,
    slackIntegration: false
  },
  features: {
    enableImageGenerator: true,
    enableBrandVoice: true,
    enableCampaigns: true,
    enableSocialPublisher: true
  }
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('site_settings')
        .select('key, value');

      if (error) throw error;

      const fetchedSettings: Partial<SiteSettings> = {};
      data?.forEach((row) => {
        if (row.key === 'general') fetchedSettings.general = row.value as unknown as GeneralSettings;
        if (row.key === 'notifications') fetchedSettings.notifications = row.value as unknown as NotificationSettings;
        if (row.key === 'features') fetchedSettings.features = row.value as unknown as FeatureSettings;
      });

      setSettings({
        ...defaultSettings,
        ...fetchedSettings
      });
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const updateSettings = async <K extends keyof SiteSettings>(
    key: K, 
    value: SiteSettings[K]
  ): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('site_settings')
        .update({ value: JSON.parse(JSON.stringify(value)) })
        .eq('key', key);

      if (error) throw error;

      setSettings(prev => ({
        ...prev,
        [key]: value
      }));

      // Log the activity
      await supabase.from('activity_logs').insert({
        action: 'update',
        entity_type: 'settings',
        details: { setting_name: key }
      });

      toast({ title: 'Settings saved successfully' });
      return true;
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save settings',
        variant: 'destructive'
      });
      return false;
    }
  };

  return {
    settings,
    loading,
    updateSettings,
    refreshSettings: fetchSettings
  };
};
