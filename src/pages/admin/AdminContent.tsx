import { useState } from 'react';
import { 
  FileText, 
  Layers, 
  Image, 
  Globe, 
  Plus, 
  Edit, 
  Trash2,
  Eye,
  ExternalLink,
  Search
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { PR_SERVICES, CAPABILITY_LAYERS } from '@/data/prServices';

const AdminContent = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<typeof PR_SERVICES[0] | null>(null);
  const { toast } = useToast();

  const filteredServices = PR_SERVICES.filter(service => {
    const matchesSearch = service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      service.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLayer = selectedLayer === null || service.layerNumber === selectedLayer;
    return matchesSearch && matchesLayer;
  });

  const handleEditService = (service: typeof PR_SERVICES[0]) => {
    setSelectedService(service);
    setEditDialogOpen(true);
  };

  const handleSaveService = () => {
    toast({ 
      title: 'Service Updated',
      description: 'Note: Services are defined in code. Database persistence coming soon.'
    });
    setEditDialogOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Content Management</h1>
          <p className="text-muted-foreground">Manage services, layers, and site content</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Add New
        </Button>
      </div>

      {/* Content Tabs */}
      <Tabs defaultValue="services" className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="services" className="gap-2">
            <FileText className="h-4 w-4" />
            Services ({PR_SERVICES.length})
          </TabsTrigger>
          <TabsTrigger value="layers" className="gap-2">
            <Layers className="h-4 w-4" />
            Layers ({CAPABILITY_LAYERS.length})
          </TabsTrigger>
          <TabsTrigger value="pages" className="gap-2">
            <Globe className="h-4 w-4" />
            Pages
          </TabsTrigger>
          <TabsTrigger value="media" className="gap-2">
            <Image className="h-4 w-4" />
            Media
          </TabsTrigger>
        </TabsList>

        {/* Services Tab */}
        <TabsContent value="services">
          <div className="bg-card rounded-xl border border-border p-6 space-y-4">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                <Button
                  variant={selectedLayer === null ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedLayer(null)}
                >
                  All
                </Button>
                {CAPABILITY_LAYERS.slice(0, 5).map((layer) => (
                  <Button
                    key={layer.id}
                    variant={selectedLayer === layer.id ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setSelectedLayer(selectedLayer === layer.id ? null : layer.id)}
                  >
                    L{layer.id}
                  </Button>
                ))}
              </div>
            </div>

            {/* Services Table */}
            <div className="rounded-lg border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Service</TableHead>
                    <TableHead>Layer</TableHead>
                    <TableHead>Inputs</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="w-[100px]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredServices.slice(0, 20).map((service) => (
                    <TableRow key={service.id} className="hover:bg-muted/30">
                      <TableCell>
                        <div>
                          <p className="font-medium">{service.shortName || service.name}</p>
                          <p className="text-xs text-muted-foreground line-clamp-1">
                            {service.description}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          Layer {service.layerNumber}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {service.inputs?.length || 0} fields
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="default" className="text-xs">
                          Active
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditService(service)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                          >
                            <a href={`/#services`} target="_blank" rel="noopener noreferrer">
                              <Eye className="h-4 w-4" />
                            </a>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            
            {filteredServices.length > 20 && (
              <p className="text-sm text-muted-foreground text-center">
                Showing 20 of {filteredServices.length} services
              </p>
            )}
          </div>
        </TabsContent>

        {/* Layers Tab */}
        <TabsContent value="layers">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {CAPABILITY_LAYERS.map((layer) => {
                const layerServices = PR_SERVICES.filter(s => s.layerNumber === layer.id);
                return (
                  <div 
                    key={layer.id}
                    className="p-4 rounded-lg border border-border bg-muted/30 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 rounded-lg ${layer.color} text-white flex items-center justify-center font-bold`}>
                        {layer.id}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground truncate">{layer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {layerServices.length} services
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline" className="text-xs">
                        Active
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </TabsContent>

        {/* Pages Tab */}
        <TabsContent value="pages">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="space-y-4">
              {[
                { name: 'Home', path: '/', status: 'Published' },
                { name: 'About', path: '/about', status: 'Published' },
                { name: 'Dashboard', path: '/dashboard', status: 'Protected' },
                { name: 'Authentication', path: '/auth', status: 'Published' },
                { name: 'Profile', path: '/profile', status: 'Protected' },
                { name: 'Outreach Autopilot', path: '/outreach-autopilot', status: 'Published' }
              ].map((page) => (
                <div 
                  key={page.path}
                  className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium text-foreground">{page.name}</p>
                      <p className="text-sm text-muted-foreground">{page.path}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={page.status === 'Protected' ? 'secondary' : 'default'}>
                      {page.status}
                    </Badge>
                    <Button variant="ghost" size="icon" asChild>
                      <a href={page.path} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>

        {/* Media Tab */}
        <TabsContent value="media">
          <div className="bg-card rounded-xl border border-border p-6">
            <div className="text-center py-12">
              <Image className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium text-foreground mb-2">Media Library</h3>
              <p className="text-muted-foreground mb-4">
                Generated images and uploaded assets will appear here
              </p>
              <Button asChild>
                <a href="/#tools">Go to Image Generator</a>
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Service Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>
              Update service details and configuration
            </DialogDescription>
          </DialogHeader>
          {selectedService && (
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Service Name</Label>
                <Input defaultValue={selectedService.name} />
              </div>
              <div className="space-y-2">
                <Label>Short Name</Label>
                <Input defaultValue={selectedService.shortName} />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea defaultValue={selectedService.description} rows={3} />
              </div>
              <div className="space-y-2">
                <Label>Layer</Label>
                <Input defaultValue={`Layer ${selectedService.layerNumber}: ${selectedService.layer}`} disabled />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveService}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminContent;
