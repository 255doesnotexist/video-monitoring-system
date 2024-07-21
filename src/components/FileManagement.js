import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, message, Modal } from 'antd';
import { SyncOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { fetchSnapshots, fetchRecords } from '../api/api';

const FileManagement = () => {
  const [snapshots, setSnapshots] = useState([]);
  const [records, setRecords] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const loadSnapshots = useCallback(async () => {
    try {
      const response = await fetchSnapshots();
      if (response.data.status === 'success') {
        setSnapshots(response.data.snapshots.map(snapshot => ({
          ...snapshot,
          key: snapshot,
          name: snapshot
        })));
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('获取快照列表失败');
    }
  }, []);

  const loadRecords = useCallback(async () => {
    try {
      const response = await fetchRecords();
      if (response.data.status === 'success') {
        setRecords(response.data.records.map(record => ({
          ...record,
          key: record,
          name: record
        })));
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      message.error('获取录像列表失败');
    }
  }, []);

  useEffect(() => {
    loadSnapshots();
    loadRecords();
  }, [loadSnapshots, loadRecords]);

  const handlePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  const snapshotColumns = [
    { title: '快照名称', dataIndex: 'name', key: 'name' },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <><Button
                    icon={<EyeOutlined />}
                    onClick={() => handlePreview(`/api/video/download_snapshot?snapshot_file=${encodeURIComponent(record.name)}`)}
                >
                    预览
                </Button><a 
                    href={`/api/video/download_snapshot?snapshot_file=${encodeURIComponent(record.name)}`} 
                    download
                    >
                    <Button icon={<DownloadOutlined />}>下载</Button>
                    </a></>
      ),
    },
  ];

  const recordColumns = [
    { title: '录像名称', dataIndex: 'name', key: 'name' },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <a href={`/api/video/playback?video_file=${encodeURIComponent(record.name)}`} 
                    download
                    >
                    <Button icon={<DownloadOutlined />}>下载</Button>
                    </a>
      ),
    },
  ];

  return (
    <>
      <h2>文件管理</h2>
      <div>
        <h3>快照文件</h3>
        <Button icon={<SyncOutlined />} onClick={loadSnapshots} style={{ marginBottom: '10px' }}>刷新</Button>
        <Table dataSource={snapshots} columns={snapshotColumns} />
        <h3>录像文件</h3>
        <Button icon={<SyncOutlined />} onClick={loadRecords} style={{ marginBottom: '10px' }}>刷新</Button>
        <Table dataSource={records} columns={recordColumns} />
      </div>
      <Modal
        visible={previewVisible}
        title="快照预览"
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="快照" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </>
  );
};

export default FileManagement;