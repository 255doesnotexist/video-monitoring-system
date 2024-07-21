import React, { useState, useEffect } from 'react';
import { Layout, Menu, Button, message } from 'antd';
import { UserOutlined, VideoCameraOutlined, FileOutlined } from '@ant-design/icons';
import { UserProvider, useUser } from './contexts/UserContext';
import Login from './components/Login';
import DeviceList from './components/DeviceList';
import LiveVideo from './components/LiveVideo';
import FileManagement from './components/FileManagement';
import { logout } from './api/api';
import logo from './logo.jpg';

const { Header, Content, Sider } = Layout;

const MainApp = () => {
  const { username, logout: userLogout } = useUser();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState('1');
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      setIsLoggedIn(false);
      userLogout();
      message.success('登出成功');
    } catch (error) {
      console.error('Logout failed', error);
      message.error('登出失败');
    }
  };

  const handleMenuClick = (e) => {
    setSelectedMenu(e.key);
    setIsDrawerVisible(false);
  };

  const handleDeviceSelect = (device) => {
    setSelectedDevice(device);
    setSelectedMenu('2'); // 自动切换到实时视频页面
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case '1':
        return <DeviceList onDeviceSelect={handleDeviceSelect} />;
      case '2':
        return <LiveVideo selectedDevice={selectedDevice} />;
      case '3':
        return <FileManagement />;
      default:
        return <div>请选择一个菜单项</div>;
    }
  };

  if (!isLoggedIn) {
    return <Login setIsLoggedIn={setIsLoggedIn} />;
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ background: '#fff', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ marginLeft: '16px', display: 'flex', alignItems: 'center' }}>
          <img 
            src={logo} 
            alt="Logo" 
            style={{ height: '40px', marginRight: '16px' }} 
          />
          <span>视频监控系统</span>
        </div>
        <Button onClick={handleLogout} style={{ marginRight: '16px' }}>登出</Button>
      </Header>
      <Layout>
        <Sider
          breakpoint="lg"
          collapsedWidth="0"
          onBreakpoint={(broken) => {
            setIsDrawerVisible(broken);
          }}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
          }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedMenu]}
            style={{ height: '100%', borderRight: 0 }}
            onClick={handleMenuClick}
          >
            <Menu.Item key="1" icon={<UserOutlined />}>设备管理</Menu.Item>
            <Menu.Item key="2" icon={<VideoCameraOutlined />}>实时视频</Menu.Item>
            <Menu.Item key="3" icon={<FileOutlined />}>文件管理</Menu.Item>
          </Menu>
        </Sider>
        <Layout style={{ marginLeft: 200 }}>
          <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
            <div style={{ padding: 24, background: '#fff', textAlign: 'center' }}>
              {renderContent()}
            </div>
          </Content>
        </Layout>
      </Layout>
    </Layout>
  );
};

const App = () => (
  <UserProvider>
    <MainApp />
  </UserProvider>
);

export default App;