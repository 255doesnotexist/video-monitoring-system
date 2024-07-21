// api.js

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  withCredentials: true
});

export const login = (username, password) => api.post('/login', { username, password });
export const logout = () => api.post('/logout');

export const fetchDevices = (username) => api.get(`/user/devices?username=${username}`);
export const fetchDeviceDetails = (username, deviceId) => api.get(`/device/details?username=${username}&device_id=${deviceId}`);
export const addDevice = (username, deviceData) => api.post('/device/add', { username, ...deviceData });
export const updateDevice = (username, deviceId, deviceData) => api.post('/device/update', { username, device_id: deviceId, ...deviceData });
export const deleteDevice = (username, deviceId) => api.post('/device/delete', { username, device_id: deviceId });
export const checkDeviceOnline = (rtspUrl) => api.get(`/device/check_online?rtsp_url=${encodeURIComponent(rtspUrl)}`);

export const startRecording = (data) => api.post('/video/record/start', data);
export const stopRecording = (recordingId) => api.post('/video/record/stop', { recording_id: recordingId });
export const takeSnapshot = (data) => api.post('/video/snapshot', data);

export const fetchSnapshots = () => api.get('/video/snapshots');
export const fetchRecords = () => api.get('/video/records');

export default api;