import React, { useEffect, useRef, useState } from 'react';
import { Button, Alert, message, Modal } from 'antd';
import Hls from 'hls.js';
import { useUser } from '../contexts/UserContext';
import { startRecording, stopRecording, takeSnapshot } from '../api/api';

const LiveVideo = ({ selectedDevice }) => {
  const { username } = useUser();
  const videoRef = useRef(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingFile, setRecordingFile] = useState('');
  const [recordingStartTime, setRecordingStartTime] = useState(null);
  const [recordingId, setRecordingId] = useState(null);
  const [isSnapshotModalVisible, setIsSnapshotModalVisible] = useState(false);
  const [currentSnapshot, setCurrentSnapshot] = useState('');

  useEffect(() => {
    if (selectedDevice) {
      console.log(selectedDevice);
      const hlsUrl = `/api/video/stream/${selectedDevice.id}/index.m3u8`;
      const video = videoRef.current;
      if (Hls.isSupported()) {
        const hls = new Hls();
        hls.loadSource(hlsUrl);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          video.play();
        });
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = hlsUrl;
        video.addEventListener('loadedmetadata', () => {
          video.play();
        });
      } else {
        message.error('HLS is not supported in this browser.');
      }
    }
  }, [selectedDevice]);

  useEffect(() => {
    let timer;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingStartTime((prevTime) => prevTime + 1);
      }, 1000);
    } else {
      clearInterval(timer);
      setRecordingStartTime(null);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const handleStartRecording = async () => {
    try {
      const timestamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15);
      const recordingFileName = `${selectedDevice.name}_${username}_${timestamp}.mkv`;
      const response = await startRecording({
        rtsp_url: selectedDevice.rtsp_url,
        device_name: selectedDevice.name,
        username: username,
        segment_time: 60
      });
      if (response.data.status === 'success') {
        setIsRecording(true);
        setRecordingFile(recordingFileName);
        setRecordingId(response.data.recording_id);
        setRecordingStartTime(0);
        message.success('开始录像成功');
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('开始录像失败');
    }
  };

  const handleStopRecording = async () => {
    try {
      const response = await stopRecording(recordingId);
      if (response.data.status === 'success') {
        setIsRecording(false);
        setRecordingId(null);
        message.success('停止录像成功');
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('停止录像失败');
    }
  };

  const handleTakeSnapshot = async () => {
    try {
      const response = await takeSnapshot({
        rtsp_url: selectedDevice.rtsp_url,
        device_name: selectedDevice.name,
        username: username
      });
      if (response.data.status === 'success') {
        message.success('快照已拍摄');
        setCurrentSnapshot(response.data.snapshot_url);
        setIsSnapshotModalVisible(true);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('快照拍摄失败');
    }
  };

  if (!selectedDevice) {
    return <Alert message="请选择一个设备以查看实时视频" type="info" showIcon />;
  }

  return (
    <div>
      <h2>{selectedDevice.name} 实时视频</h2>
      <video ref={videoRef} controls width="100%" style={{ maxHeight: '70vh' }}>
        您的浏览器不支持视频标签。
      </video>
      <div style={{ marginTop: '10px' }}>
        <Button onClick={handleStartRecording} disabled={isRecording}>开始录像</Button>
        <Button onClick={handleStopRecording} disabled={!isRecording} style={{ marginLeft: '10px' }}>停止录像</Button>
        <Button onClick={handleTakeSnapshot} style={{ marginLeft: '10px' }}>拍摄快照</Button>
      </div>
      {isRecording && (
        <div style={{ marginTop: '10px' }}>
          <p>当前录像文件: {recordingFile}</p>
          <p>当前录像时长: {recordingStartTime} 秒</p>
        </div>
      )}
      <Modal
        title="快照预览"
        visible={isSnapshotModalVisible}
        onCancel={() => setIsSnapshotModalVisible(false)}
        footer={null}
      >
        <img src={currentSnapshot} alt="快照" style={{ width: '100%' }} />
      </Modal>
    </div>
  );
};

export default LiveVideo;