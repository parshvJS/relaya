import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdmin } from '@/hooks/useAdmin';
import ImageEditor from '@/components/ImageEditor';
import { 
  Images, 
  Trash2, 
  Download,
  Copy,
  RefreshCw,
  ImageOff,
  Pencil
} from 'lucide-react';

interface GeneratedImage {
  id: string;
  prompt: string;
  image_url: string;
  model: string | null;
  created_at: string;
}

const ImageGallery = () => {
  const { isAdmin } = useAdmin();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingImage, setEditingImage] = useState<GeneratedImage | null>(null);

  const fetchImages = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('generated_images')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setImages(data || []);
    } catch (error) {
      console.error('Error fetching images:', error);
      toast({
        title: "Failed to load gallery",
        description: "Unable to fetch saved images.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('generated_images')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setImages(images.filter(img => img.id !== id));
      toast({
        title: "Image deleted",
        description: "The image has been removed from your gallery.",
      });
    } catch (error) {
      console.error('Error deleting image:', error);
      toast({
        title: "Delete failed",
        description: "Unable to delete the image.",
        variant: "destructive",
      });
    }
  };

  const downloadImage = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${prompt.substring(0, 30).replace(/\s+/g, '-')}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download started",
        description: "Your image is being downloaded.",
      });
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Unable to download the image.",
        variant: "destructive",
      });
    }
  };

  const copyDescription = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied",
      description: "Description copied to clipboard.",
    });
  };

  return (
    <Card className="border-border/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <Images className="w-5 h-5 text-white" />
            </div>
            <div>
              <CardTitle>Image Gallery</CardTitle>
              <CardDescription>
                Your saved AI-generated images for PR materials
              </CardDescription>
            </div>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={fetchImages}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="space-y-2">
                <Skeleton className="aspect-square rounded-lg" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            ))}
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <ImageOff className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium text-lg mb-1">No saved images yet</h3>
            <p className="text-sm text-muted-foreground max-w-xs">
              Generate images using the AI Image Generator and save them to your gallery for later use.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {images.map((image) => (
              <Card key={image.id} className="overflow-hidden group animate-fade-in">
                <div className="relative aspect-square bg-muted">
                  <img
                    src={image.image_url}
                    alt={image.prompt}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => setEditingImage(image)}
                      title="Edit image"
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => downloadImage(image.image_url, image.prompt)}
                    >
                      <Download className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => copyDescription(image.prompt)}
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    {isAdmin && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDelete(image.id)}
                        title="Admin only: Delete image"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </div>
                <CardContent className="p-3 space-y-1">
                  <p className="text-sm font-medium line-clamp-2">{image.prompt}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{image.model || 'Unknown model'}</span>
                    <span>{new Date(image.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </CardContent>

      {/* Image Editor Modal */}
      {editingImage && (
        <ImageEditor
          imageUrl={editingImage.image_url}
          onClose={() => setEditingImage(null)}
          onSave={async (editedImageUrl) => {
            try {
              // Update the image in the database
              const { error } = await supabase
                .from('generated_images')
                .update({ image_url: editedImageUrl })
                .eq('id', editingImage.id);

              if (error) throw error;

              // Update local state
              setImages(images.map(img => 
                img.id === editingImage.id 
                  ? { ...img, image_url: editedImageUrl }
                  : img
              ));

              toast({
                title: "Image saved",
                description: "Your edited image has been saved.",
              });

              setEditingImage(null);
            } catch (error) {
              console.error('Error saving edited image:', error);
              toast({
                title: "Save failed",
                description: "Unable to save the edited image.",
                variant: "destructive",
              });
            }
          }}
        />
      )}
    </Card>
  );
};

export default ImageGallery;
