import { useState, useEffect, useRef } from 'react';
import { Calendar, Plus, Trash2, Edit2, CheckCircle, Clock, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import AIApiClient, { SSEEvent } from '@/lib/aiApiClient';

interface Campaign {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planning' | 'active' | 'completed' | 'paused';
  type: string;
  objectives: string;
  targetAudience: string;
  channels: string[];
  tasks: CampaignTask[];
}

interface CampaignTask {
  id: string;
  title: string;
  dueDate: string;
  status: 'pending' | 'in-progress' | 'completed';
  assignee?: string;
}

const CampaignPlanner = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStatus, setLoadingStatus] = useState<string>('');
  const [generatedTasksText, setGeneratedTasksText] = useState<string>('');
  const outputRef = useRef<string>('');
  const [newCampaign, setNewCampaign] = useState<Partial<Campaign>>({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    status: 'planning',
    type: 'product-launch',
    objectives: '',
    targetAudience: '',
    channels: [],
    tasks: [],
  });

  // Initialize AI client
  useEffect(() => {
    const init = async () => {
      try {
        await AIApiClient.initialize();
      } catch (error) {
        console.error('Failed to initialize AI client:', error);
      }
    };
    init();
  }, []);

  const campaignTypes = [
    { value: 'product-launch', label: 'Product Launch' },
    { value: 'brand-awareness', label: 'Brand Awareness' },
    { value: 'crisis-management', label: 'Crisis Management' },
    { value: 'thought-leadership', label: 'Thought Leadership' },
    { value: 'event-promotion', label: 'Event Promotion' },
    { value: 'partnership', label: 'Partnership Announcement' },
  ];

  const channelOptions = [
    'Press Release',
    'Social Media',
    'Email Marketing',
    'Blog Post',
    'Media Outreach',
    'Paid Advertising',
    'Events',
    'Influencer Partnership',
  ];

  const getStatusColor = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500/10 text-green-600 border-green-500/20';
      case 'completed': return 'bg-primary/10 text-primary border-primary/20';
      case 'paused': return 'bg-amber-500/10 text-amber-600 border-amber-500/20';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getStatusIcon = (status: Campaign['status']) => {
    switch (status) {
      case 'active': return <Clock className="w-3.5 h-3.5" />;
      case 'completed': return <CheckCircle className="w-3.5 h-3.5" />;
      case 'paused': return <AlertCircle className="w-3.5 h-3.5" />;
      default: return <Calendar className="w-3.5 h-3.5" />;
    }
  };

  const generateTasks = async () => {
    if (!newCampaign.name || !newCampaign.type || !newCampaign.startDate || !newCampaign.endDate) {
      toast.error('Please fill in campaign name, type, and dates first');
      return;
    }

    setIsGenerating(true);
    setGeneratedTasksText('');
    outputRef.current = '';

    try {
      const prompt = `Generate a comprehensive PR campaign plan with detailed tasks for:

Campaign Name: ${newCampaign.name}
Campaign Type: ${newCampaign.type}
Start Date: ${newCampaign.startDate}
End Date: ${newCampaign.endDate}
${newCampaign.objectives ? `Objectives: ${newCampaign.objectives}` : ''}
${newCampaign.targetAudience ? `Target Audience: ${newCampaign.targetAudience}` : ''}
${newCampaign.channels && newCampaign.channels.length > 0 ? `Channels: ${newCampaign.channels.join(', ')}` : ''}
${newCampaign.description ? `Description: ${newCampaign.description}` : ''}

Please generate:
1. Detailed task breakdown with specific actionable items
2. Timeline and milestone schedule
3. Resource requirements and team assignments
4. Success metrics and KPIs
5. Risk assessment and contingency plans
6. Budget considerations
7. Communication strategy across channels
8. Content calendar and deliverables

Format the output as a structured campaign plan with clear sections and actionable tasks.`;

      setLoadingStatus('Creating campaign planning session...');
      const session = await AIApiClient.createSession(prompt);

      setLoadingStatus('Generating campaign tasks and strategy...');

      await AIApiClient.startChat(
        { prompt, sessionId: session.sessionid },
        (event: SSEEvent) => {
          if (event.type === 'loadingStatus') {
            setLoadingStatus(event.status || '');
          } else if (event.type === 'finalResponse') {
            if (event.content) {
              outputRef.current += event.content;
              setGeneratedTasksText(outputRef.current);
            }
          }
        },
        () => {
          setIsGenerating(false);
          setLoadingStatus('');
          toast.success('Campaign plan generated successfully');
        },
        (error) => {
          setIsGenerating(false);
          setLoadingStatus('');
          toast.error('Failed to generate campaign tasks');
          console.error('Error generating tasks:', error);
        }
      );
    } catch (error) {
      console.error('Error generating tasks:', error);
      toast.error('Failed to generate campaign tasks');
      setIsGenerating(false);
      setLoadingStatus('');
    }
  };

  const saveCampaign = () => {
    if (!newCampaign.name || !newCampaign.startDate) {
      toast.error('Campaign name and start date are required');
      return;
    }

    const campaign: Campaign = {
      id: Date.now().toString(),
      name: newCampaign.name || '',
      description: newCampaign.description || '',
      startDate: newCampaign.startDate || '',
      endDate: newCampaign.endDate || '',
      status: newCampaign.status as Campaign['status'] || 'planning',
      type: newCampaign.type || 'product-launch',
      objectives: newCampaign.objectives || '',
      targetAudience: newCampaign.targetAudience || '',
      channels: newCampaign.channels || [],
      tasks: newCampaign.tasks || [],
    };

    setCampaigns(prev => [...prev, campaign]);
    setNewCampaign({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      status: 'planning',
      type: 'product-launch',
      objectives: '',
      targetAudience: '',
      channels: [],
      tasks: [],
    });
    setIsDialogOpen(false);
    toast.success('Campaign created successfully');
  };

  const deleteCampaign = (id: string) => {
    setCampaigns(prev => prev.filter(c => c.id !== id));
    toast.success('Campaign deleted');
  };

  const updateTaskStatus = (campaignId: string, taskId: string, status: CampaignTask['status']) => {
    setCampaigns(prev => prev.map(campaign => {
      if (campaign.id === campaignId) {
        return {
          ...campaign,
          tasks: campaign.tasks.map(task => 
            task.id === taskId ? { ...task, status } : task
          )
        };
      }
      return campaign;
    }));
  };

  const toggleChannel = (channel: string) => {
    setNewCampaign(prev => ({
      ...prev,
      channels: prev.channels?.includes(channel)
        ? prev.channels.filter(c => c !== channel)
        : [...(prev.channels || []), channel]
    }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-foreground">Campaign Planner</h3>
          <p className="text-sm text-muted-foreground">Plan and manage your PR campaigns with AI-powered task generation</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="btn-primary">
              <Plus className="w-4 h-4" />
              New Campaign
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Campaign</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="campaignName">Campaign Name *</Label>
                  <Input
                    id="campaignName"
                    value={newCampaign.name}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Q1 Product Launch"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="campaignType">Campaign Type</Label>
                  <Select
                    value={newCampaign.type}
                    onValueChange={(value) => setNewCampaign(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="input-modern">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {campaignTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={newCampaign.description}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief overview of the campaign..."
                  className="input-modern"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={newCampaign.startDate}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, startDate: e.target.value }))}
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">End Date</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={newCampaign.endDate}
                    onChange={(e) => setNewCampaign(prev => ({ ...prev, endDate: e.target.value }))}
                    className="input-modern"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="objectives">Campaign Objectives</Label>
                <Textarea
                  id="objectives"
                  value={newCampaign.objectives}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, objectives: e.target.value }))}
                  placeholder="What do you want to achieve with this campaign?"
                  className="input-modern"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="targetAudience">Target Audience</Label>
                <Input
                  id="targetAudience"
                  value={newCampaign.targetAudience}
                  onChange={(e) => setNewCampaign(prev => ({ ...prev, targetAudience: e.target.value }))}
                  placeholder="Enterprise CTOs, Tech Media, Investors"
                  className="input-modern"
                />
              </div>

              <div className="space-y-2">
                <Label>Distribution Channels</Label>
                <div className="flex flex-wrap gap-2">
                  {channelOptions.map(channel => (
                    <button
                      key={channel}
                      type="button"
                      onClick={() => toggleChannel(channel)}
                      className={`px-3 py-1.5 text-xs rounded-full border transition-all ${
                        newCampaign.channels?.includes(channel)
                          ? 'bg-primary text-primary-foreground border-primary'
                          : 'bg-background text-foreground border-border hover:border-primary/50'
                      }`}
                    >
                      {channel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex items-center justify-between mb-3">
                  <Label>Campaign Tasks & Strategy</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={generateTasks}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        Auto-Generate Plan
                      </>
                    )}
                  </Button>
                </div>

                {/* Loading Status */}
                {isGenerating && (
                  <div className="space-y-3 mb-4">
                    {loadingStatus && (
                      <div className="p-3 rounded-lg border border-border bg-muted/30">
                        <div className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          <span className="text-sm font-medium">{loadingStatus}</span>
                        </div>
                      </div>
                    )}
                    <div className="p-3 rounded-lg border border-amber-500/20 bg-amber-500/5">
                      <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400">
                        <Clock className="w-4 h-4" />
                        <span className="text-xs font-medium">
                          Processing time: 10-15 minutes for comprehensive campaign plan
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Generated Campaign Plan */}
                {generatedTasksText && !isGenerating ? (
                  <div className="bg-muted/30 rounded-lg p-4 max-h-[300px] overflow-y-auto">
                    <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                      {generatedTasksText}
                    </pre>
                  </div>
                ) : !isGenerating && !generatedTasksText ? (
                  <p className="text-sm text-muted-foreground italic">
                    Click "Auto-Generate Plan" to create a comprehensive campaign strategy
                  </p>
                ) : null}
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={saveCampaign} className="btn-primary">
                  Create Campaign
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {campaigns.length === 0 ? (
        <Card className="border-dashed border-2 border-border">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No Campaigns Yet</h4>
            <p className="text-sm text-muted-foreground text-center max-w-md">
              Create your first PR campaign to start planning and tracking your communications initiatives
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {campaigns.map(campaign => (
            <Card key={campaign.id} className="border-border/50 hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{campaign.name}</CardTitle>
                    <p className="text-xs text-muted-foreground mt-1">
                      {campaignTypes.find(t => t.value === campaign.type)?.label}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border ${getStatusColor(campaign.status)}`}>
                      {getStatusIcon(campaign.status)}
                      {campaign.status}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteCampaign(campaign.id)}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {campaign.startDate} - {campaign.endDate || 'Ongoing'}
                  </span>
                </div>

                {campaign.description && (
                  <p className="text-sm text-muted-foreground line-clamp-2">{campaign.description}</p>
                )}

                {campaign.channels.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {campaign.channels.slice(0, 3).map(channel => (
                      <span key={channel} className="px-2 py-0.5 text-xs bg-muted rounded-full text-muted-foreground">
                        {channel}
                      </span>
                    ))}
                    {campaign.channels.length > 3 && (
                      <span className="px-2 py-0.5 text-xs bg-muted rounded-full text-muted-foreground">
                        +{campaign.channels.length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {campaign.tasks.length > 0 && (
                  <div className="border-t border-border/50 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-foreground">Tasks</span>
                      <span className="text-xs text-muted-foreground">
                        {campaign.tasks.filter(t => t.status === 'completed').length}/{campaign.tasks.length} complete
                      </span>
                    </div>
                    <div className="space-y-1.5">
                      {campaign.tasks.slice(0, 3).map(task => (
                        <div key={task.id} className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateTaskStatus(
                                campaign.id, 
                                task.id, 
                                task.status === 'completed' ? 'pending' : 'completed'
                              )}
                              className={`w-4 h-4 rounded border transition-colors ${
                                task.status === 'completed' 
                                  ? 'bg-green-500 border-green-500' 
                                  : 'border-border hover:border-primary'
                              }`}
                            >
                              {task.status === 'completed' && (
                                <CheckCircle className="w-4 h-4 text-white" />
                              )}
                            </button>
                            <span className={`text-xs ${task.status === 'completed' ? 'text-muted-foreground line-through' : 'text-foreground'}`}>
                              {task.title}
                            </span>
                          </div>
                          <span className="text-xs text-muted-foreground">{task.dueDate}</span>
                        </div>
                      ))}
                      {campaign.tasks.length > 3 && (
                        <button 
                          onClick={() => setSelectedCampaign(campaign)}
                          className="text-xs text-primary hover:underline"
                        >
                          View all {campaign.tasks.length} tasks
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CampaignPlanner;
