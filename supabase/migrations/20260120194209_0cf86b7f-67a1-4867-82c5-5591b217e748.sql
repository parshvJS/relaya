-- Create site settings table for admin-configurable settings
CREATE TABLE public.site_settings (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    key text NOT NULL UNIQUE,
    value jsonb NOT NULL DEFAULT '{}',
    description text,
    updated_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_by uuid REFERENCES auth.users(id)
);

-- Enable RLS
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Anyone can read site settings (for frontend display)
CREATE POLICY "Anyone can view site settings"
ON public.site_settings
FOR SELECT
USING (true);

-- Only admins can update settings
CREATE POLICY "Admins can update site settings"
ON public.site_settings
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can insert settings
CREATE POLICY "Admins can insert site settings"
ON public.site_settings
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete settings
CREATE POLICY "Admins can delete site settings"
ON public.site_settings
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_site_settings_updated_at
BEFORE UPDATE ON public.site_settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default settings
INSERT INTO public.site_settings (key, value, description) VALUES
    ('general', '{"siteName": "RELAYA", "siteDescription": "AI-Powered PR & Media Outreach Platform", "supportEmail": "support@relaya.com", "calendlyUrl": "https://calendly.com/your-username/strategy-call"}', 'General site configuration'),
    ('notifications', '{"emailNotifications": true, "newLeadAlerts": true, "weeklyDigest": false, "slackIntegration": false}', 'Notification preferences'),
    ('features', '{"enableImageGenerator": true, "enableBrandVoice": true, "enableCampaigns": true, "enableSocialPublisher": true}', 'Feature toggles');

-- Create activity log table for tracking admin actions
CREATE TABLE public.activity_logs (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id uuid REFERENCES auth.users(id),
    action text NOT NULL,
    entity_type text NOT NULL,
    entity_id text,
    details jsonb DEFAULT '{}',
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Only admins can view activity logs
CREATE POLICY "Admins can view activity logs"
ON public.activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- System can insert activity logs (using service role in edge functions)
CREATE POLICY "Anyone can insert activity logs"
ON public.activity_logs
FOR INSERT
WITH CHECK (true);

-- Enable realtime for activity logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;