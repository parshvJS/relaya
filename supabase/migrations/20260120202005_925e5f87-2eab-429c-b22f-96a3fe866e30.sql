-- Fix: Restrict image deletion to admins only
-- This prevents malicious actors from deleting all images in the public gallery

-- Drop the overly permissive delete policy
DROP POLICY IF EXISTS "Anyone can delete generated images" ON public.generated_images;

-- Create a new policy allowing only admins to delete images
CREATE POLICY "Admins can delete generated images"
ON public.generated_images
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));