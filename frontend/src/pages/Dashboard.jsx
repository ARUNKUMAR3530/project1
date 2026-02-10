import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const response = await api.get('/api/complaints/my');
      setComplaints(response.data);
    } catch (error) {
      console.error("Error fetching complaints", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
        case 'PENDING': return 'text-yellow-600';
        case 'IN_PROGRESS': return 'text-blue-600';
        case 'COMPLETED': return 'text-green-600';
        case 'REJECTED': return 'text-red-600';
        default: return 'text-gray-600';
    }
  };

  if (loading) return <div className="text-center mt-10">Loading...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">My Complaints</h1>

      {complaints.length === 0 ? (
        <div className="text-center text-gray-500">
            <p>No complaints found.</p>
            <Link to="/lodge-complaint" className="text-blue-500 hover:underline">Lodge a new complaint</Link>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded shadow">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-4">ID</th>
                <th className="p-4">Title</th>
                <th className="p-4">Category</th>
                <th className="p-4">Date</th>
                <th className="p-4">Status</th>
                <th className="p-4">Department</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map(complaint => (
                <tr key={complaint.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">#{complaint.id}</td>
                  <td className="p-4 font-medium">{complaint.title}</td>
                  <td className="p-4 badge">{complaint.category}</td>
                  <td className="p-4">{new Date(complaint.createdAt).toLocaleDateString()}</td>
                  <td className={`p-4 font-bold ${getStatusColor(complaint.status)}`}>{complaint.status}</td>
                  <td className="p-4">{complaint.assignedDepartment?.name || 'Unassigned'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
