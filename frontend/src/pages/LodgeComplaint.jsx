import React, { useState, useRef, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
            setPosition(e.latlng);
        },
    });

    return position === null ? null : (
        <Marker position={position}></Marker>
    );
};

const LodgeComplaint = () => {
    const navigate = useNavigate();
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [stream, setStream] = useState(null);
    const [image, setImage] = useState(null);
    const [position, setPosition] = useState(null);
    const [loadingLocation, setLoadingLocation] = useState(false);

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: 'ROAD'
    });

    const startCamera = async () => {
        try {
            const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
            setStream(mediaStream);
            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
            }
        } catch (err) {
            toast.error("Could not access camera");
        }
    };

    const capturePhoto = () => {
        if (!videoRef.current || !canvasRef.current || !position) {
            toast.error("Please ensure camera is on and location is fetched");
            return;
        }

        const context = canvasRef.current.getContext('2d');
        const width = videoRef.current.videoWidth;
        const height = videoRef.current.videoHeight;

        canvasRef.current.width = width;
        canvasRef.current.height = height;

        // Draw video frame
        context.drawImage(videoRef.current, 0, 0, width, height);

        // Add Watermark
        const date = new Date().toLocaleString();
        const locText = `Lat: ${position.lat.toFixed(6)}, Lng: ${position.lng.toFixed(6)}`;

        context.font = "20px Arial";
        context.fillStyle = "white";
        context.shadowColor="black";
        context.shadowBlur=7;
        context.lineWidth=3;

        // Bottom Right
        context.fillText(date, width - 250, height - 50);
        context.fillText(locText, width - 350, height - 20);

        // Stop stream
        if(stream) {
            stream.getTracks().forEach(track => track.stop());
            setStream(null);
        }

        // Convert to Blob/File (Mocking file upload for now as string URL or base64)
        // In real app, you'd upload this blob to backend/S3
        const dataUrl = canvasRef.current.toDataURL('image/png');
        setImage(dataUrl);
    };

    const getLocation = () => {
        setLoadingLocation(true);
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((pos) => {
                setPosition({
                    lat: pos.coords.latitude,
                    lng: pos.coords.longitude
                });
                setLoadingLocation(false);
            }, (err) => {
                toast.error("Error getting location: " + err.message);
                setLoadingLocation(false);
            });
        } else {
            toast.error("Geolocation not supported");
            setLoadingLocation(false);
        }
    };

    useEffect(() => {
        // Init location on load
        getLocation();
        return () => {
             if(stream) stream.getTracks().forEach(track => track.stop());
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!position) {
            toast.error("Location is required");
            return;
        }

        try {
            const payload = {
                ...formData,
                latitude: position.lat,
                longitude: position.lng,
                imageUrl: image // Sending base64 for simplicity in this MVP
            };

            await api.post('/api/complaints', payload);
            toast.success("Complaint lodged successfully!");
            navigate('/dashboard');
        } catch (error) {
            toast.error("Failed to lodge complaint");
        }
    };

    return (
        <div className="max-w-4xl mx-auto bg-white p-8 rounded shadow">
            <h1 className="text-2xl font-bold mb-6">Lodge a Complaint</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Form Section */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-medium">Title</label>
                        <input type="text" className="w-full p-2 border rounded" required
                            value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})}
                        />
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Category</label>
                        <select className="w-full p-2 border rounded"
                            value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}
                        >
                            <option value="ROAD">Road</option>
                            <option value="GARBAGE">Garbage</option>
                            <option value="WATER">Water</option>
                            <option value="ELECTRICITY">Electricity</option>
                        </select>
                    </div>
                    <div>
                        <label className="block mb-1 font-medium">Description</label>
                        <textarea className="w-full p-2 border rounded" rows="4" required
                            value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>

                    <div className="bg-gray-50 p-4 rounded border">
                         <label className="block mb-2 font-medium">Location (Auto-detected)</label>
                         {loadingLocation ? <p>Fetching location...</p> :
                            position ? <p className="text-sm text-green-600">✓ {position.lat.toFixed(6)}, {position.lng.toFixed(6)}</p> :
                            <button type="button" onClick={getLocation} className="text-blue-500">Retry Location</button>
                         }
                    </div>

                    <button type="submit" disabled={!position} className="w-full bg-blue-600 text-white p-3 rounded hover:bg-blue-700 disabled:bg-gray-400">
                        Submit Complaint
                    </button>
                </form>

                {/* Media Section */}
                <div className="space-y-4">
                    <div className="border rounded h-64 bg-gray-100 flex items-center justify-center overflow-hidden relative">
                        {image ? (
                            <img src={image} alt="Captured" className="w-full h-full object-cover" />
                        ) : stream ? (
                             <video ref={videoRef} autoPlay className="w-full h-full object-cover"></video>
                        ) : (
                            <div className="text-center">
                                <p className="mb-2 text-gray-500">No Image Captured</p>
                                <button type="button" onClick={startCamera} className="bg-gray-200 px-4 py-2 rounded">Start Camera</button>
                            </div>
                        )}
                        {stream && !image && (
                            <button type="button" onClick={capturePhoto} className="absolute bottom-4 bg-red-500 text-white px-4 py-2 rounded-full shadow">
                                Capture
                            </button>
                        )}
                         {image && (
                            <button type="button" onClick={() => setImage(null)} className="absolute top-2 right-2 bg-white p-1 rounded-full shadow text-sm">
                                ✕ Retake
                            </button>
                        )}
                        <canvas ref={canvasRef} className="hidden"></canvas>
                    </div>

                    <div className="h-64 border rounded">
                         {position ? (
                             <MapContainer center={[position.lat, position.lng]} zoom={13} style={{ height: '100%', width: '100%' }}>
                                <TileLayer
                                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                />
                                <LocationMarker position={position} setPosition={setPosition} />
                             </MapContainer>
                         ) : (
                             <div className="flex items-center justify-center h-full text-gray-500">Map Loading...</div>
                         )}
                    </div>
                    <p className="text-xs text-gray-500 text-center">Click on map to adjust pin manually</p>
                </div>
            </div>
        </div>
    );
};

export default LodgeComplaint;
