import { useState } from 'react';
import { format } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { MoreHorizontal, Eye, Trash2, CheckCircle, Clock, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Lead {
  id: string;
  name: string;
  email: string;
  website: string | null;
  inquiry_type: string;
  message: string;
  status: string;
  created_at: string;
}

interface LeadsTableProps {
  leads: Lead[];
  onStatusChange: (id: string, status: string) => void;
  onDelete: (id: string) => void;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle }> = {
  new: { label: 'New', variant: 'default', icon: Clock },
  contacted: { label: 'Contacted', variant: 'secondary', icon: CheckCircle },
  qualified: { label: 'Qualified', variant: 'outline', icon: CheckCircle },
  closed: { label: 'Closed', variant: 'destructive', icon: XCircle },
};

const LeadsTable = ({ leads, onStatusChange, onDelete }: LeadsTableProps) => {
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);

  return (
    <>
      <div className="border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leads.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No leads found
                </TableCell>
              </TableRow>
            ) : (
              leads.map((lead) => {
                const status = statusConfig[lead.status] || statusConfig.new;
                const StatusIcon = status.icon;
                
                return (
                  <TableRow key={lead.id} className="hover:bg-muted/30">
                    <TableCell className="font-medium">{lead.name}</TableCell>
                    <TableCell>{lead.email}</TableCell>
                    <TableCell className="capitalize">{lead.inquiry_type}</TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {format(new Date(lead.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => setSelectedLead(lead)}>
                            <Eye className="h-4 w-4 mr-2" />
                            View Details
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(lead.id, 'contacted')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Contacted
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(lead.id, 'qualified')}>
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Mark Qualified
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onStatusChange(lead.id, 'closed')}>
                            <XCircle className="h-4 w-4 mr-2" />
                            Mark Closed
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => onDelete(lead.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Lead Details Dialog */}
      <Dialog open={!!selectedLead} onOpenChange={() => setSelectedLead(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Lead Details</DialogTitle>
            <DialogDescription>
              Submitted {selectedLead && format(new Date(selectedLead.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
            </DialogDescription>
          </DialogHeader>
          {selectedLead && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Name</p>
                  <p className="font-medium">{selectedLead.name}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{selectedLead.email}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Inquiry Type</p>
                  <p className="font-medium capitalize">{selectedLead.inquiry_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Website</p>
                  <p className="font-medium">{selectedLead.website || 'N/A'}</p>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Message</p>
                <div className="bg-muted/50 p-4">
                  <p className="text-sm">{selectedLead.message}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LeadsTable;
