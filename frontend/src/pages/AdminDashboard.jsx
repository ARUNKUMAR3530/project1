import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { toast } from 'react-toastify';
import L from 'leaflet';

// Fix leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const AdminDashboard = () => {
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'map'
    const [selectedComplaint, setSelectedComplaint] = useState(null);
    const [remark, setRemark] = useState('');

    useEffect(() => {
        fetchComplaints();
    }, []);

    const fetchComplaints = async () => {
        try {
            const response = await api.get('/api/admin/complaints');
            setComplaints(response.data);
        } catch (error) {
            toast.error("Error fetching complaints");
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id, newStatus) => {
        try {
            await api.put(`/api/admin/complaints/${id}/status`, {
                status: newStatus,
                remarks: remark
            });
            toast.success("Status updated");
            setRemark('');
            setSelectedComplaint(null);
            fetchComplaints(); // Refresh
        } catch (error) {
            toast.error("Failed to update status");
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800';
            case 'COMPLETED': return 'bg-green-100 text-green-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="p-8 text-center">Loading Admin Dashboard...</div>;

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold">Admin Dashboard</h1>
                <div className="space-x-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`px-4 py-2 rounded ${viewMode === 'list' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        List View
                    </button>
                    <button
                        onClick={() => setViewMode('map')}
                        className={`px-4 py-2 rounded ${viewMode === 'map' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                    >
                        Map View
                    </button>
                </div>
            </div>

            {viewMode === 'list' ? (
                 <div className="overflow-x-auto bg-white rounded shadow">
                 <table className="w-full text-left border-collapse">
                   <thead>
                     <tr className="bg-gray-100 border-b">
                       <th className="p-4">ID</th>
                       <th className="p-4">Title</th>
                       <th className="p-4">Category</th>
                       <th className="p-4">User</th>
                       <th className="p-4">Status</th>
                       <th className="p-4">Actions</th>
                     </tr>
                   </thead>
                   <tbody>
                     {complaints.map(complaint => (
                       <tr key={complaint.id} className="border-b hover:bg-gray-50">
                         <td className="p-4">#{complaint.id}</td>
                         <td className="p-4">{complaint.title}</td>
                         <td className="p-4">{complaint.category}</td>
                         <td className="p-4">{complaint.user?.username}</td>
                         <td className="p-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${getStatusColor(complaint.status)}`}>
                                {complaint.status}
                            </span>
                         </td>
                         <td className="p-4">
                             <button
                                onClick={() => setSelectedComplaint(complaint)}
                                className="text-blue-600 hover:underline"
                             >
                                Manage
                             </button>
                         </td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
               </div>
            ) : (
                <div className="h-[600px] border rounded shadow">
                    <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                         <TileLayer
                             url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                         />
                         {complaints.map(complaint => (
                             complaint.latitude && complaint.longitude && (
                                 <Marker key={complaint.id} position={[complaint.latitude, complaint.longitude]}>
                                     <Popup>
                                         <div className="w-48">
                                             <h3 className="font-bold">{complaint.title}</h3>
                                             <p className="text-xs text-gray-500">{complaint.category}</p>
                                             <p className="mt-1">Status: {complaint.status}</p>
                                             <button
                                                 onClick={() => setSelectedComplaint(complaint)}
                                                 className="mt-2 text-blue-500 text-sm underline"
                                             >
                                                 View Details
                                             </button>
                                         </div>
                                     </Popup>
                                 </Marker>
                             )
                         ))}
                    </MapContainer>
                </div>
            )}

            {/* Modal for updating status */}
            {selectedComplaint && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg p-6 max-w-lg w-full">
                        <h2 className="text-xl font-bold mb-4">Manage Complaint #{selectedComplaint.id}</h2>

                        <div className="mb-4 space-y-2">
                             <p><strong>Title:</strong> {selectedComplaint.title}</p>
                             <p><strong>Description:</strong> {selectedComplaint.description}</p>
                             <p><strong>Category:</strong> {selectedComplaint.category}</p>
                             <p><strong>Current Status:</strong> {selectedComplaint.status}</p>
                             {selectedComplaint.imageUrl && (
                                 <div className="mt-2">
                                     <p className="font-bold mb-1">Attached Photo:</p>
                                     <img src={selectedComplaint.imageUrl} alt="Complaint" className="w-full h-48 object-contain bg-gray-100 rounded" />
                                 </div>
                             )}
                        </div>

                        <div className="border-t pt-4">
                            <label className="block mb-2 font-medium">Update Status:</label>
                            <div className="flex gap-2 mb-4">
                                {['PENDING', 'IN_PROGRESS', 'COMPLETED', 'REJECTED'].map(status => (
                                    <button
                                        key={status}
                                        onClick={() => handleStatusUpdate(selectedComplaint.id, status)}
                                        className={`px-3 py-1 text-xs rounded border ${selectedComplaint.status === status ? 'bg-gray-200' : 'hover:bg-gray-100'}`}
                                    >
                                        {status}
                                    </button>
                                ))}
                            </div>

                            <label className="block mb-2 font-medium">Add Remarks:</label>
                            <textarea
                                className="w-full border rounded p-2 mb-4"
                                rows="3"
                                value={remark}
                                onChange={(e) => setRemark(e.target.value)}
                                placeholder="Add comments before updating status..."
                            ></textarea>
                        </div>

                        <div className="flex justify-end gap-2">
                            <button
                                onClick={() => setSelectedComplaint(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;
