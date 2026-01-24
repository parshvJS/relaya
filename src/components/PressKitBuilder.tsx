import { useState } from 'react';
import { FileText, Download, Building2, User, Globe, Image, Loader2, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { jsPDF } from 'jspdf';

interface PressKitData {
  companyName: string;
  tagline: string;
  boilerplate: string;
  foundedYear: string;
  headquarters: string;
  website: string;
  industry: string;
  employees: string;
  funding: string;
  executiveName: string;
  executiveTitle: string;
  executiveBio: string;
  keyProducts: string;
  achievements: string;
  mediaContact: string;
  mediaEmail: string;
  mediaPhone: string;
}

const PressKitBuilder = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedKit, setGeneratedKit] = useState<string | null>(null);
  const [data, setData] = useState<PressKitData>({
    companyName: '',
    tagline: '',
    boilerplate: '',
    foundedYear: '',
    headquarters: '',
    website: '',
    industry: '',
    employees: '',
    funding: '',
    executiveName: '',
    executiveTitle: '',
    executiveBio: '',
    keyProducts: '',
    achievements: '',
    mediaContact: '',
    mediaEmail: '',
    mediaPhone: '',
  });

  const updateField = (field: keyof PressKitData, value: string) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const generatePressKit = async () => {
    if (!data.companyName || !data.boilerplate) {
      toast.error('Company name and boilerplate are required');
      return;
    }

    setIsGenerating(true);
    try {
      const { data: response, error } = await supabase.functions.invoke('generate-press-kit', {
        body: { pressKitData: data }
      });

      if (error) throw error;

      setGeneratedKit(response.content);
      toast.success('Press kit generated successfully');
    } catch (error) {
      console.error('Error generating press kit:', error);
      toast.error('Failed to generate press kit');
    } finally {
      setIsGenerating(false);
    }
  };

  const exportToPDF = () => {
    if (!generatedKit) return;

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - margin * 2;

    // Header
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text(data.companyName, margin, margin + 10);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(data.tagline || 'Press Kit', margin, margin + 20);

    doc.setFontSize(9);
    doc.setTextColor(150, 150, 150);
    doc.text(`Generated: ${new Date().toLocaleDateString()}`, margin, margin + 28);

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, margin + 34, pageWidth - margin, margin + 34);

    // Content
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const lines = doc.splitTextToSize(generatedKit, maxWidth);
    let y = margin + 44;
    const lineHeight = 5;

    for (let i = 0; i < lines.length; i++) {
      if (y + lineHeight > pageHeight - margin) {
        doc.addPage();
        y = margin;
      }
      doc.text(lines[i], margin, y);
      y += lineHeight;
    }

    // Footer
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(128, 128, 128);
      doc.text(
        `${data.companyName} Press Kit | Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }

    const date = new Date().toISOString().split('T')[0];
    doc.save(`${data.companyName.toLowerCase().replace(/\s+/g, '-')}-press-kit-${date}.pdf`);
    toast.success('Press kit exported to PDF');
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" />
            Press Kit Builder
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Generate a comprehensive media kit with company information, executive bios, and key facts
          </p>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="company" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="company" className="flex items-center gap-1.5 text-xs">
                <Building2 className="w-3.5 h-3.5" />
                Company
              </TabsTrigger>
              <TabsTrigger value="executive" className="flex items-center gap-1.5 text-xs">
                <User className="w-3.5 h-3.5" />
                Executive
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-1.5 text-xs">
                <Globe className="w-3.5 h-3.5" />
                Products
              </TabsTrigger>
              <TabsTrigger value="media" className="flex items-center gap-1.5 text-xs">
                <Image className="w-3.5 h-3.5" />
                Media Contact
              </TabsTrigger>
            </TabsList>

            <TabsContent value="company" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Company Name *</Label>
                  <Input
                    id="companyName"
                    value={data.companyName}
                    onChange={(e) => updateField('companyName', e.target.value)}
                    placeholder="Acme Corporation"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={data.tagline}
                    onChange={(e) => updateField('tagline', e.target.value)}
                    placeholder="Innovating the future"
                    className="input-modern"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="boilerplate">Company Boilerplate *</Label>
                <Textarea
                  id="boilerplate"
                  value={data.boilerplate}
                  onChange={(e) => updateField('boilerplate', e.target.value)}
                  placeholder="A 2-3 sentence description of your company..."
                  className="input-modern min-h-[100px]"
                />
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="foundedYear">Founded</Label>
                  <Input
                    id="foundedYear"
                    value={data.foundedYear}
                    onChange={(e) => updateField('foundedYear', e.target.value)}
                    placeholder="2020"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headquarters">Headquarters</Label>
                  <Input
                    id="headquarters"
                    value={data.headquarters}
                    onChange={(e) => updateField('headquarters', e.target.value)}
                    placeholder="San Francisco, CA"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employees">Employees</Label>
                  <Input
                    id="employees"
                    value={data.employees}
                    onChange={(e) => updateField('employees', e.target.value)}
                    placeholder="50-100"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="funding">Funding</Label>
                  <Input
                    id="funding"
                    value={data.funding}
                    onChange={(e) => updateField('funding', e.target.value)}
                    placeholder="$10M Series A"
                    className="input-modern"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry</Label>
                  <Input
                    id="industry"
                    value={data.industry}
                    onChange={(e) => updateField('industry', e.target.value)}
                    placeholder="Enterprise Software"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <Input
                    id="website"
                    value={data.website}
                    onChange={(e) => updateField('website', e.target.value)}
                    placeholder="https://example.com"
                    className="input-modern"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="executive" className="space-y-4 mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="executiveName">Executive Name</Label>
                  <Input
                    id="executiveName"
                    value={data.executiveName}
                    onChange={(e) => updateField('executiveName', e.target.value)}
                    placeholder="Jane Smith"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="executiveTitle">Title</Label>
                  <Input
                    id="executiveTitle"
                    value={data.executiveTitle}
                    onChange={(e) => updateField('executiveTitle', e.target.value)}
                    placeholder="Chief Executive Officer"
                    className="input-modern"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="executiveBio">Executive Bio</Label>
                <Textarea
                  id="executiveBio"
                  value={data.executiveBio}
                  onChange={(e) => updateField('executiveBio', e.target.value)}
                  placeholder="Professional background and achievements..."
                  className="input-modern min-h-[120px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="keyProducts">Key Products/Services</Label>
                <Textarea
                  id="keyProducts"
                  value={data.keyProducts}
                  onChange={(e) => updateField('keyProducts', e.target.value)}
                  placeholder="Describe your main products or services..."
                  className="input-modern min-h-[120px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="achievements">Key Achievements & Milestones</Label>
                <Textarea
                  id="achievements"
                  value={data.achievements}
                  onChange={(e) => updateField('achievements', e.target.value)}
                  placeholder="Notable achievements, awards, milestones..."
                  className="input-modern min-h-[120px]"
                />
              </div>
            </TabsContent>

            <TabsContent value="media" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="mediaContact">Media Contact Name</Label>
                <Input
                  id="mediaContact"
                  value={data.mediaContact}
                  onChange={(e) => updateField('mediaContact', e.target.value)}
                  placeholder="John Doe, PR Manager"
                  className="input-modern"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="mediaEmail">Email</Label>
                  <Input
                    id="mediaEmail"
                    value={data.mediaEmail}
                    onChange={(e) => updateField('mediaEmail', e.target.value)}
                    placeholder="press@example.com"
                    className="input-modern"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="mediaPhone">Phone</Label>
                  <Input
                    id="mediaPhone"
                    value={data.mediaPhone}
                    onChange={(e) => updateField('mediaPhone', e.target.value)}
                    placeholder="+1 (555) 123-4567"
                    className="input-modern"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex gap-3 mt-6">
            <Button
              onClick={generatePressKit}
              disabled={isGenerating || !data.companyName || !data.boilerplate}
              className="btn-primary flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Press Kit...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  Generate Press Kit
                </>
              )}
            </Button>
            {generatedKit && (
              <Button onClick={exportToPDF} variant="outline" className="btn-secondary">
                <Download className="w-4 h-4" />
                Export PDF
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {generatedKit && (
        <Card className="border-border/50 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              Generated Press Kit
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-muted/30 rounded-lg p-6 prose prose-sm max-w-none">
              <pre className="whitespace-pre-wrap font-sans text-sm text-foreground leading-relaxed">
                {generatedKit}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PressKitBuilder;
