import React from 'react';
import { Form, Input, Button, Card, Space, Typography, message } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { useUser } from '../contexts/UserContext';
import { login as apiLogin } from '../api/api';

const { Title } = Typography;

const Login = ({ setIsLoggedIn }) => {
    const { login: userLogin } = useUser();

    const handleLogin = async (values) => {
      try {
        const response = await apiLogin(values.username, values.password);
        if (response.data.status === 'success') {
          console.log('Login response:', response.data);
          console.log('Usernames:', values);
          userLogin(values.username);
          setIsLoggedIn(true);
          message.success('登录成功');
        } else {
          message.error(response.data.message || '登录失败');
        }
      } catch (error) {
        console.error('Login error:', error);
        message.error(error.response?.data?.message || '登录失败，请稍后重试');
      }
    };

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100vh',  // 让容器占满整个视口高度
      background: '#f0f2f5',  // 可选：设置背景颜色
    }}>
      <Card style={{ width: 350, boxShadow: '0 4px 8px rgba(0,0,0,0.1)' }}>
        <Space direction="vertical" size="large" style={{ width: '100%', textAlign: 'center' }}>
          <Title level={2}>视频监控系统</Title>
          <Form name="login" initialValues={{ remember: true }} onFinish={handleLogin}>
            <Form.Item name="username" rules={[{ required: true, message: '请输入用户名!' }]}>
              <Input prefix={<UserOutlined />} placeholder="用户名" />
            </Form.Item>
            <Form.Item name="password" rules={[{ required: true, message: '请输入密码!' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="密码" />
            </Form.Item>
            <Form.Item>
              <Button type="primary" htmlType="submit" style={{ width: '100%' }}>
                登录
              </Button>
            </Form.Item>
          </Form>
        </Space>
      </Card>
    </div>
  );
};

export default Login;