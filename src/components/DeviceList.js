import React, { useState, useEffect, useCallback } from 'react';
import { Table, Button, Space, Modal, Form, Input, Popconfirm, message } from 'antd';
import { SyncOutlined, PlusOutlined } from '@ant-design/icons';
import { useUser } from '../contexts/UserContext';
import { fetchDevices, addDevice, updateDevice, deleteDevice, fetchDeviceDetails, checkDeviceOnline } from '../api/api';

const DeviceList = ({ onDeviceSelect }) => {
  const { username } = useUser();
  const [devices, setDevices] = useState([]);
  const [isSettingsModalVisible, setIsSettingsModalVisible] = useState(false);
  const [isAddDeviceModalVisible, setIsAddDeviceModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState(null);

  const loadDevices = useCallback(async () => {
    try {
      const response = await fetchDevices(username);
      const devicesWithDetails = await Promise.all(
        response.data.map(async (device) => {
          const detailsResponse = await fetchDeviceDetails(username, device);
          const isOnline = await checkDeviceOnline(detailsResponse.data.rtsp_url);
          return { id: device, ...detailsResponse.data, isOnline };
        })
      );
      setDevices(devicesWithDetails);
    } catch (error) {
      message.error('获取设备列表失败');
    }
  }, [username]);

  useEffect(() => {
    if (username) {
      loadDevices();
    }
  }, [loadDevices, username]);

  useEffect(() => {
    const interval = setInterval(() => {
      loadDevices();
    }, 30000); // 每30秒更新一次设备状态
    return () => clearInterval(interval);
  }, [loadDevices]);

  const handleSettingsClick = (device) => {
    setSelectedDevice(device);
    setIsSettingsModalVisible(true);
  };

  const handleSettingsUpdate = async (values) => {
    try {
      await updateDevice(username, selectedDevice.id, values);
      message.success('设备配置更新成功');
      setIsSettingsModalVisible(false);
      loadDevices();
    } catch (error) {
      message.error('更新设备配置失败');
    }
  };

  const handleAddDevice = async (values) => {
    try {
      await addDevice(username, values);
      message.success('添加设备成功');
      setIsAddDeviceModalVisible(false);
      loadDevices();
    } catch (error) {
      message.error('添加设备失败');
    }
  };

  const handleDeleteDevice = async (deviceId) => {
    try {
      await deleteDevice(username, deviceId);
      message.success('删除设备成功');
      loadDevices();
    } catch (error) {
      message.error('删除设备失败');
    }
  };

  const columns = [
    { title: '设备ID', dataIndex: 'id', key: 'id' },
    { title: '设备名称', dataIndex: 'name', key: 'name' },
    { title: 'RTSP URL', dataIndex: 'rtsp_url', key: 'rtsp_url' },
    { 
      title: '设备状态', 
      dataIndex: 'isOnline', 
      key: 'isOnline',
      render: (isOnline) => isOnline ? '在线' : '离线'
    },
    {
      title: '操作',
      key: 'action',
      render: (text, record) => (
        <Space>
          <Button onClick={() => onDeviceSelect(record)}>选择</Button>
          <Button onClick={() => handleSettingsClick(record)}>配置设备</Button>
          <Popconfirm title="确定删除这个设备吗?" onConfirm={() => handleDeleteDevice(record.id)}>
            <Button type="danger">删除设备</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <>
      <h2>设备列表</h2>
      <Button icon={<SyncOutlined />} onClick={loadDevices} style={{ marginBottom: '10px', marginRight: '10px' }}>刷新</Button>
      <Button icon={<PlusOutlined />} onClick={() => setIsAddDeviceModalVisible(true)} style={{ marginBottom: '10px' }}>添加设备</Button>
      <Table dataSource={devices} columns={columns} />

      <Modal
        title="修改设备配置"
        visible={isSettingsModalVisible}
        onCancel={() => setIsSettingsModalVisible(false)}
        footer={null}
      >
        <Form initialValues={selectedDevice} onFinish={handleSettingsUpdate}>
          <Form.Item name="rtsp_url" label="RTSP URL" rules={[{ required: true, message: '请输入RTSP URL!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="设备名称" rules={[{ required: true, message: '请输入设备名称!' }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">更新配置</Button>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="添加设备"
        visible={isAddDeviceModalVisible}
        onCancel={() => setIsAddDeviceModalVisible(false)}
        footer={null}
      >
        <Form onFinish={handleAddDevice}>
          <Form.Item name="id" label="设备ID" rules={[{ required: true, message: '请输入设备ID!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="name" label="设备名称" rules={[{ required: true, message: '请输入设备名称!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="rtsp_url" label="RTSP URL" rules={[{ required: true, message: '请输入RTSP URL!' }]}>
            <Input />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit">添加设备</Button>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default DeviceList;