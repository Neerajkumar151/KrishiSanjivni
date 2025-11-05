import React, { useEffect, useState } from 'react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { ImageUpload } from '@/components/ui/image-upload';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Search, Edit } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface Tool {
  id: string;
  name: string;
  description: string | null;
  category: string;
  price_per_day: number;
  price_per_month: number;
  price_per_season: number;
  availability: boolean;
  location: string | null;
  image_url: string | null;
}

export const AdminTools: React.FC = () => {
  const { loading: authLoading } = useAdminCheck();
  const { user } = useAuth();
  const [tools, setTools] = useState<Tool[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
  const { toast } = useToast();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    image_url: '',
    price_per_day: '',
    price_per_month: '',
    price_per_season: '',
    location: ''
  });

  useEffect(() => {
    fetchTools();
  }, []);

  const fetchTools = async () => {
    const { data, error } = await supabase
      .from('tools')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching tools:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch tools',
        variant: 'destructive'
      });
      return;
    }

    setTools(data || []);
  };

  const handleAddTool = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast({
        title: 'Error',
        description: 'You must be logged in to add tools',
        variant: 'destructive'
      });
      return;
    }

    const { error } = await supabase
      .from('tools')
      .insert({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        image_url: formData.image_url || null,
        price_per_day: parseFloat(formData.price_per_day),
        price_per_month: parseFloat(formData.price_per_month),
        price_per_season: parseFloat(formData.price_per_season),
        location: formData.location || null,
        owner_id: user.id,
        availability: true
      });

    if (error) {
      console.error('Error adding tool:', error);
      toast({
        title: 'Error',
        description: 'Failed to add tool: ' + error.message,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Tool added successfully'
    });

    // Reset form
    setFormData({
      name: '',
      description: '',
      category: '',
      image_url: '',
      price_per_day: '',
      price_per_month: '',
      price_per_season: '',
      location: ''
    });
    setIsAddDialogOpen(false);
    fetchTools();
  };

  const toggleAvailability = async (toolId: string, currentAvailability: boolean) => {
    const { error } = await supabase
      .from('tools')
      .update({ availability: !currentAvailability })
      .eq('id', toolId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update availability',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Tool availability updated'
    });

    fetchTools();
  };

  const handleEditTool = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingTool) return;

    const { error } = await supabase
      .from('tools')
      .update({
        name: formData.name,
        description: formData.description,
        category: formData.category,
        image_url: formData.image_url || null,
        price_per_day: parseFloat(formData.price_per_day),
        price_per_month: parseFloat(formData.price_per_month),
        price_per_season: parseFloat(formData.price_per_season),
        location: formData.location || null
      })
      .eq('id', editingTool.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update tool: ' + error.message,
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Tool updated successfully'
    });

    setIsEditDialogOpen(false);
    setEditingTool(null);
    fetchTools();
  };

  const openEditDialog = (tool: Tool) => {
    setEditingTool(tool);
    setFormData({
      name: tool.name,
      description: tool.description || '',
      category: tool.category,
      image_url: tool.image_url || '',
      price_per_day: tool.price_per_day.toString(),
      price_per_month: tool.price_per_month.toString(),
      price_per_season: tool.price_per_season.toString(),
      location: tool.location || ''
    });
    setIsEditDialogOpen(true);
  };

  const deleteTool = async (toolId: string) => {
    if (!confirm('Are you sure you want to delete this tool?')) return;

    const { error } = await supabase
      .from('tools')
      .delete()
      .eq('id', toolId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete tool',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Success',
      description: 'Tool deleted successfully'
    });

    fetchTools();
  };

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (authLoading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-bold mb-2">Manage Tools</h1>
          <p className="text-muted-foreground">View and manage all farming tools ({tools.length} total)</p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Tool
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Add New Tool</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddTool} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Tool Name *</Label>
                  <Input
                    id="name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Tractor - Mahindra 575"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Input
                    id="category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Tractor, Plough"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the tool"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  bucket="tool-images"
                  label="Tool Image"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="price_per_day">Price per Day (₹) *</Label>
                  <Input
                    id="price_per_day"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price_per_day}
                    onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_per_month">Price per Month (₹) *</Label>
                  <Input
                    id="price_per_month"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price_per_month}
                    onChange={(e) => setFormData({ ...formData, price_per_month: e.target.value })}
                    placeholder="12000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price_per_season">Price per Season (₹) *</Label>
                  <Input
                    id="price_per_season"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price_per_season}
                    onChange={(e) => setFormData({ ...formData, price_per_season: e.target.value })}
                    placeholder="30000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Punjab, Ludhiana"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Add Tool</Button>
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Tool Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Tool</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleEditTool} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-name">Tool Name *</Label>
                  <Input
                    id="edit-name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Tractor - Mahindra 575"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-category">Category *</Label>
                  <Input
                    id="edit-category"
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="e.g., Tractor, Plough"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Description</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Detailed description of the tool"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <ImageUpload
                  value={formData.image_url}
                  onChange={(url) => setFormData({ ...formData, image_url: url })}
                  bucket="tool-images"
                  label="Tool Image"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-price_per_day">Price per Day (₹) *</Label>
                  <Input
                    id="edit-price_per_day"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price_per_day}
                    onChange={(e) => setFormData({ ...formData, price_per_day: e.target.value })}
                    placeholder="500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price_per_month">Price per Month (₹) *</Label>
                  <Input
                    id="edit-price_per_month"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price_per_month}
                    onChange={(e) => setFormData({ ...formData, price_per_month: e.target.value })}
                    placeholder="12000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price_per_season">Price per Season (₹) *</Label>
                  <Input
                    id="edit-price_per_season"
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.price_per_season}
                    onChange={(e) => setFormData({ ...formData, price_per_season: e.target.value })}
                    placeholder="30000"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Punjab, Ludhiana"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button type="submit" className="flex-1">Update Tool</Button>
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {filteredTools.length === 0 ? (
        <div className="text-center py-12 border rounded-lg">
          <p className="text-muted-foreground text-lg">No tools found. Add your first tool!</p>
        </div>
      ) : (
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price/Day (₹)</TableHead>
                <TableHead>Price/Month (₹)</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTools.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>
                    <img
                      src={tool.image_url || '/placeholder.svg'}
                      alt={tool.name}
                      className="w-16 h-16 object-cover rounded"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{tool.name}</TableCell>
                  <TableCell>{tool.category}</TableCell>
                  <TableCell>₹{tool.price_per_day.toLocaleString('en-IN')}</TableCell>
                  <TableCell>₹{tool.price_per_month.toLocaleString('en-IN')}</TableCell>
                  <TableCell>{tool.location || 'N/A'}</TableCell>
                  <TableCell>
                    <Switch
                      checked={tool.availability}
                      onCheckedChange={() => toggleAvailability(tool.id, tool.availability)}
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openEditDialog(tool)}
                      >
                        <Edit className="h-4 w-4 text-primary" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteTool(tool.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
