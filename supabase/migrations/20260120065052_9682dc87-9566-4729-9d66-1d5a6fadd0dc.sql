-- Create storage bucket for generated images
INSERT INTO storage.buckets (id, name, public)
VALUES ('generated-images', 'generated-images', true);

-- Create table to track saved images
CREATE TABLE public.generated_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  prompt TEXT NOT NULL,
  image_url TEXT NOT NULL,
  model TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.generated_images ENABLE ROW LEVEL SECURITY;

-- Allow anyone to view images (public gallery)
CREATE POLICY "Anyone can view generated images"
ON public.generated_images
FOR SELECT
USING (true);

-- Allow anyone to insert images (public gallery)
CREATE POLICY "Anyone can save generated images"
ON public.generated_images
FOR INSERT
WITH CHECK (true);

-- Allow anyone to delete images (public gallery)
CREATE POLICY "Anyone can delete generated images"
ON public.generated_images
FOR DELETE
USING (true);

-- Storage policies for the bucket
CREATE POLICY "Anyone can upload images"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'generated-images');

CREATE POLICY "Anyone can view images"
ON storage.objects
FOR SELECT
USING (bucket_id = 'generated-images');

CREATE POLICY "Anyone can delete images"
ON storage.objects
FOR DELETE
USING (bucket_id = 'generated-images');