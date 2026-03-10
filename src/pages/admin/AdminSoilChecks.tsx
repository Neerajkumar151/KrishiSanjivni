import React, { useEffect, useState } from 'react';
import { useAdminCheck } from '@/hooks/useAdminCheck';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Eye, Edit, Check, X } from 'lucide-react';

interface SoilCheck {
    id: string;
    user_id: string;
    location: string | null;
    farm_area_acres: number | null;
    primary_crop: string | null;
    soil_type: string | null;
    ph_level: number | null;
    nitrogen_level: string | null;
    phosphorus_level: string | null;
    potassium_level: string | null;
    organic_matter_percent: number | null;
    moisture_percent: number | null;
    sample_count: number | null;
    contact_phone: string | null;
    notes: string | null;
    recommendations: string | null; // Crucial field added by Admin
    status: string;
    created_at: string;
}

export const AdminSoilChecks: React.FC = () => {
    const { loading: authLoading } = useAdminCheck();
    const [soilChecks, setSoilChecks] = useState<SoilCheck[]>([]);
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [selectedCheck, setSelectedCheck] = useState<SoilCheck | null>(null);
    const [editFormData, setEditFormData] = useState<Partial<SoilCheck>>({});
    const { toast } = useToast();

    useEffect(() => {
        fetchSoilChecks();
    }, []);

    const fetchSoilChecks = async () => {
        const { data, error } = await supabase
            .from('soil_checks')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch soil checks',
                variant: 'destructive'
            });
            return;
        }

        setSoilChecks(data || []);
    };

    const updateStatus = async (id: string, newStatus: string) => {
        const { error } = await supabase
            .from('soil_checks')
            .update({ status: newStatus })
            .eq('id', id);

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to update status',
                variant: 'destructive'
            });
            return;
        }

        toast({
            title: 'Success',
            description: 'Status updated successfully'
        });

        fetchSoilChecks(); // Refresh data after update
    };

    const handleView = (check: SoilCheck) => {
        setSelectedCheck(check);
        setIsViewDialogOpen(true);
    };

    const handleEdit = (check: SoilCheck) => {
        setSelectedCheck(check);
        // Load all fields into the edit form, including current recommendations
        setEditFormData({
            location: check.location,
            farm_area_acres: check.farm_area_acres,
            primary_crop: check.primary_crop,
            soil_type: check.soil_type,
            ph_level: check.ph_level,
            nitrogen_level: check.nitrogen_level,
            phosphorus_level: check.phosphorus_level,
            potassium_level: check.potassium_level,
            organic_matter_percent: check.organic_matter_percent,
            moisture_percent: check.moisture_percent,
            sample_count: check.sample_count,
            contact_phone: check.contact_phone,
            notes: check.notes,
            recommendations: check.recommendations, // Key field for admin input
            status: check.status
        });
        setIsEditDialogOpen(true);
    };

    const handleSaveEdit = async () => {
        if (!selectedCheck) return;

        // Save the updated form data back to the database
        const { error } = await supabase
            .from('soil_checks')
            .update(editFormData)
            .eq('id', selectedCheck.id);

        if (error) {
            toast({
                title: 'Error',
                description: 'Failed to update soil check',
                variant: 'destructive'
            });
            return;
        }

        toast({
            title: 'Success',
            description: 'Soil check updated successfully'
        });

        setIsEditDialogOpen(false);
        fetchSoilChecks(); // Refresh data
    };

    const handleAccept = async (id: string) => {
        await updateStatus(id, 'accepted');
    };

    const handleReject = async (id: string) => {
        await updateStatus(id, 'rejected');
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-500 hover:bg-yellow-600';
            case 'accepted': return 'bg-blue-500 hover:bg-blue-600';
            case 'completed': return 'bg-green-500 hover:bg-green-600';
            case 'rejected': return 'bg-red-500 hover:bg-red-600';
            default: return 'bg-gray-500';
        }
    };

    if (authLoading) {
        return <div className="flex items-center justify-center h-screen">Loading...</div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold mb-1">Soil Check Requests</h1>
                    <p className="text-xs md:text-sm text-muted-foreground">Manage all soil analysis requests ({soilChecks.length} total)</p>
                </div>
            </div>

            {soilChecks.length === 0 ? (
                <div className="text-center py-12 border rounded-lg">
                    <p className="text-muted-foreground text-lg">No soil check requests yet</p>
                </div>
            ) : (
                <div className="border rounded-lg">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Location</TableHead>
                                <TableHead>Crop</TableHead>
                                <TableHead>Area (acres)</TableHead>
                                <TableHead>Contact</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {soilChecks.map((check) => (
                                <TableRow key={check.id}>
                                    <TableCell>
                                        {new Date(check.created_at).toLocaleDateString('en-IN')}
                                    </TableCell>
                                    <TableCell>{check.location || 'N/A'}</TableCell>
                                    <TableCell>{check.primary_crop || 'N/A'}</TableCell>
                                    <TableCell>{check.farm_area_acres || 'N/A'}</TableCell>
                                    <TableCell>{check.contact_phone || 'N/A'}</TableCell>
                                    <TableCell>
                                        <Badge className={getStatusColor(check.status)}>
                                            {check.status}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleView(check)}
                                                title="View Details"
                                            >
                                                <Eye className="h-4 w-4 text-blue-500 hover:text-blue-700" />
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => handleEdit(check)}
                                                title="Edit/Add Recommendations"
                                            >
                                                <Edit className="h-4 w-4 text-orange-500 hover:text-orange-700" />
                                            </Button>
                                            {check.status === 'pending' && (
                                                <>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleAccept(check.id)}
                                                        className="text-green-600 hover:text-green-700"
                                                        title="Accept"
                                                    >
                                                        <Check className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleReject(check.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                        title="Reject"
                                                    >
                                                        <X className="h-4 w-4" />
                                                    </Button>
                                                </>
                                            )}
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}

            {/* View Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Soil Check Details</DialogTitle>
                    </DialogHeader>
                    {selectedCheck && (
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className='border-r pr-4'>
                                <h3 className='text-lg font-bold mb-3 border-b pb-1'>Request Details</h3>
                                <div><Label className="font-semibold">User ID:</Label> <p>{selectedCheck.user_id}</p></div>
                                <div><Label className="font-semibold">Submitted Date:</Label> <p>{new Date(selectedCheck.created_at).toLocaleString('en-IN')}</p></div>
                                <div><Label className="font-semibold">Contact Phone:</Label> <p>{selectedCheck.contact_phone || 'N/A'}</p></div>
                                <div><Label className="font-semibold">Farm Area (acres):</Label> <p>{selectedCheck.farm_area_acres || 'N/A'}</p></div>
                                <div><Label className="font-semibold">Location:</Label> <p>{selectedCheck.location || 'N/A'}</p></div>
                                <div><Label className="font-semibold">Primary Crop:</Label> <p>{selectedCheck.primary_crop || 'N/A'}</p></div>
                                <div><Label className="font-semibold">Soil Type:</Label> <p>{selectedCheck.soil_type || 'N/A'}</p></div>
                                <div><Label className="font-semibold">Sample Count:</Label> <p>{selectedCheck.sample_count || 'N/A'}</p></div>
                                <div className='mt-2'><Label className="font-semibold">Current Status:</Label> <Badge className={getStatusColor(selectedCheck.status)}>{selectedCheck.status}</Badge></div>
                            </div>

                            <div className='pl-4'>
                                <h3 className='text-lg font-bold mb-3 border-b pb-1'>Analysis Data</h3>
                                <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                                    <div><Label className="font-semibold">pH Level:</Label> <p>{selectedCheck.ph_level || 'N/A'}</p></div>
                                    <div><Label className="font-semibold">Moisture %:</Label> <p>{selectedCheck.moisture_percent || 'N/A'}</p></div>
                                    <div><Label className="font-semibold">Nitrogen Level:</Label> <p>{selectedCheck.nitrogen_level || 'N/A'}</p></div>
                                    <div><Label className="font-semibold">Phosphorus Level:</Label> <p>{selectedCheck.phosphorus_level || 'N/A'}</p></div>
                                    <div><Label className="font-semibold">Potassium Level:</Label> <p>{selectedCheck.potassium_level || 'N/A'}</p></div>
                                    <div><Label className="font-semibold">Organic Matter %:</Label> <p>{selectedCheck.organic_matter_percent || 'N/A'}</p></div>
                                </div>
                                <div className="mt-4">
                                    <Label className="font-semibold">Notes from User:</Label>
                                    <p className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">{selectedCheck.notes || 'N/A'}</p>
                                </div>
                                <div className="mt-4">
                                    <Label className="font-semibold text-blue-600">Recommendations (Admin Input):</Label>
                                    <p className="whitespace-pre-wrap text-sm font-medium bg-blue-50 p-2 rounded">{selectedCheck.recommendations || 'Not provided yet'}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Edit Dialog */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>Edit Soil Check & Add Recommendations</DialogTitle>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="edit-location">Location</Label>
                            <Input
                                id="edit-location"
                                value={editFormData.location || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, location: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-farm-area">Farm Area (acres)</Label>
                            <Input
                                id="edit-farm-area"
                                type="number"
                                value={editFormData.farm_area_acres || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, farm_area_acres: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-crop">Primary Crop</Label>
                            <Input
                                id="edit-crop"
                                value={editFormData.primary_crop || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, primary_crop: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-soil-type">Soil Type</Label>
                            <Select
                                value={editFormData.soil_type || ''}
                                onValueChange={(value) => setEditFormData({ ...editFormData, soil_type: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Clay">Clay</SelectItem>
                                    <SelectItem value="Sandy">Sandy</SelectItem>
                                    <SelectItem value="Loamy">Loamy</SelectItem>
                                    <SelectItem value="Silty">Silty</SelectItem>
                                    <SelectItem value="Peaty">Peaty</SelectItem>
                                    <SelectItem value="Chalky">Chalky</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-ph">pH Level</Label>
                            <Input
                                id="edit-ph"
                                type="number"
                                step="0.1"
                                value={editFormData.ph_level || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, ph_level: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-nitrogen">Nitrogen Level</Label>
                            <Select
                                value={editFormData.nitrogen_level || ''}
                                onValueChange={(value) => setEditFormData({ ...editFormData, nitrogen_level: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-phosphorus">Phosphorus Level</Label>
                            <Select
                                value={editFormData.phosphorus_level || ''}
                                onValueChange={(value) => setEditFormData({ ...editFormData, phosphorus_level: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-potassium">Potassium Level</Label>
                            <Select
                                value={editFormData.potassium_level || ''}
                                onValueChange={(value) => setEditFormData({ ...editFormData, potassium_level: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Low">Low</SelectItem>
                                    <SelectItem value="Medium">Medium</SelectItem>
                                    <SelectItem value="High">High</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-organic">Organic Matter %</Label>
                            <Input
                                id="edit-organic"
                                type="number"
                                step="0.1"
                                value={editFormData.organic_matter_percent || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, organic_matter_percent: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-moisture">Moisture %</Label>
                            <Input
                                id="edit-moisture"
                                type="number"
                                step="0.1"
                                value={editFormData.moisture_percent || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, moisture_percent: parseFloat(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-sample">Sample Count</Label>
                            <Input
                                id="edit-sample"
                                type="number"
                                value={editFormData.sample_count || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, sample_count: parseInt(e.target.value) })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-phone">Contact Phone</Label>
                            <Input
                                id="edit-phone"
                                value={editFormData.contact_phone || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, contact_phone: e.target.value })}
                            />
                        </div>
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="edit-notes">Notes</Label>
                            <Textarea
                                id="edit-notes"
                                rows={3}
                                value={editFormData.notes || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, notes: e.target.value })}
                            />
                        </div>
                        {/* CRUCIAL ADMIN FIELD */}
                        <div className="col-span-2 space-y-2">
                            <Label htmlFor="edit-recommendations">Recommendations (Admin Analysis)</Label>
                            <Textarea
                                id="edit-recommendations"
                                rows={4}
                                value={editFormData.recommendations || ''}
                                onChange={(e) => setEditFormData({ ...editFormData, recommendations: e.target.value })}
                                placeholder="Add your expert analysis and tailored recommendations here..."
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="edit-status">Status</Label>
                            <Select
                                value={editFormData.status || ''}
                                onValueChange={(value) => setEditFormData({ ...editFormData, status: value })}
                            >
                                <SelectTrigger>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="pending">Pending</SelectItem>
                                    <SelectItem value="accepted">Accepted</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="rejected">Rejected</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <Button onClick={handleSaveEdit} className="flex-1">
                            Save Changes & Update
                        </Button>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            Cancel
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};
