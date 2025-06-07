import React, { useState, useContext, createContext, useEffect, ReactNode } from 'react';
import { 
  Layout, 
  Card, 
  Form, 
  Input, 
  Button, 
  List, 
  Avatar, 
  Space, 
  Typography, 
  Badge, 
  Divider,
  message,
  Spin,
  Empty,
  Popconfirm
} from 'antd';
import { 
  UserOutlined, 
  UsergroupAddOutlined, 
  UserAddOutlined, 
  CheckOutlined, 
  CloseOutlined, 
  LogoutOutlined,
  MailOutlined,
  LockOutlined,
  DeleteOutlined
} from '@ant-design/icons';

const { Header, Content } = Layout;
const { Title, Text } = Typography;

// Types
interface ApiResponse<T = any> {
  status: 'SUCCESS' | 'FAILURE';
  data: T;
}

interface AuthContextType {
  isLoggedIn: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// Auth Context
const AuthContext = createContext<AuthContextType | null>(null);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Use in-memory storage instead of localStorage
    const savedToken = sessionStorage.getItem('authToken');
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, []);

  const login = (newToken: string) => {
    setToken(newToken);
    setIsLoggedIn(true);
    sessionStorage.setItem('authToken', newToken);
  };

  const logout = () => {
    setToken(null);
    setIsLoggedIn(false);
    sessionStorage.removeItem('authToken');
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// API Functions
const API_BASE = 'http://localhost:80';

const apiCall = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });
  return response.json();
};

const authenticatedApiCall = async (endpoint: string, token: string, options: RequestInit = {}) => {
  return apiCall(endpoint, {
    ...options,
    headers: {
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
};

// Components
const LoginPage: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (values: { username: string; password: string }) => {
    setLoading(true);

    try {
      const response: ApiResponse<{ token: string }> = await apiCall('/api/v1/auth/user/login', {
        method: 'POST',
        body: JSON.stringify(values),
      });
      if (response.status === 'SUCCESS') {
        login(response.data.token);
        message.success('Успішний вхід!');
        onSuccess();
      } else {
        message.error('Помилка входу');
      }
    } catch (err: any) {
      message.error('Помилка підключення');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar 
            size={64} 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#1890ff', marginBottom: 16 }}
          />
          <Title level={2} style={{ margin: 0 }}>Вхід</Title>
          <Text type="secondary">Увійдіть до свого акаунта</Text>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label="Ім'я користувача"
            rules={[{ required: true, message: "Введіть ім'я користувача!" }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Введіть ім'я користувача"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[{ required: true, message: 'Введіть пароль!' }]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Введіть пароль"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
            >
              Увійти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

const RegisterPage: React.FC<{ onSuccess: () => void }> = ({ onSuccess }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: any) => {
    setLoading(true);

    try {
      const response: ApiResponse = await apiCall('/api/v1/auth/user/register', {
        method: 'POST',
        body: JSON.stringify(values),
      });

      if (response.status === 'SUCCESS') {
        message.success('Реєстрація успішна!');
        onSuccess();
      } else {
        message.error(response.data || 'Помилка реєстрації');
      }
    } catch (err) {
      message.error("Помилка з'єднання з сервером");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      <Card 
        style={{ 
          width: '100%', 
          maxWidth: 400,
          boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <Avatar 
            size={64} 
            icon={<UserAddOutlined />} 
            style={{ backgroundColor: '#52c41a', marginBottom: 16 }}
          />
          <Title level={2} style={{ margin: 0 }}>Реєстрація</Title>
          <Text type="secondary">Створіть новий акаунт</Text>
        </div>

        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="username"
            label="Ім'я користувача"
            rules={[
              { required: true, message: "Введіть ім'я користувача!" },
              { min: 3, max: 30, message: 'Від 3 до 30 символів' }
            ]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="3-30 символів"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Введіть email!' },
              { type: 'email', message: 'Некоректний email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Введіть email"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Пароль"
            rules={[
              { required: true, message: 'Введіть пароль!' },
              { min: 8, max: 80, message: 'Від 8 до 80 символів' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="8-80 символів"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="Підтвердіть пароль"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Підтвердіть пароль!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Паролі не збігаються!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Повторіть пароль"
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              block
              size="large"
            >
              Зареєструватися
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

interface Friend {
  username: string;
  email?: string;
}

const FriendsPanel: React.FC = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    loadFriends();
  }, []);

  const loadFriends = async () => {
    if (!token) return;
    
    try {
      const response: ApiResponse<Friend[]> = await authenticatedApiCall('/api/v1/friendship/friends', token);
      if (response.status === 'SUCCESS') {
        setFriends(response.data || []);
      }
    } catch (err) {
      message.error('Помилка завантаження друзів');
    } finally {
      setLoading(false);
    }
  };

  const removeFriend = async (friendId: string) => {
    if (!token) return;
    
    try {
      const response = await authenticatedApiCall(`/api/v1/friendship/delete/${friendId}`, token, {
        method: 'DELETE'
      });
      if (response.status === 'SUCCESS') {
        setFriends(prev => prev.filter(f => f.username !== friendId));
        message.success('Друга видалено');
      }
    } catch (err) {
      message.error('Помилка видалення друга');
    }
  };

  return (
    <Card 
      title={
        <Space>
          <UsergroupAddOutlined />
          <span>Мої друзі</span>
          <Badge count={friends.length} showZero />
        </Space>
      }
    >
      <Spin spinning={loading}>
        {friends.length === 0 ? (
          <Empty 
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="У вас поки немає друзів"
          />
        ) : (
          <List
            dataSource={friends}
            renderItem={(friend) => (
              <List.Item
                actions={[
                  <Popconfirm
                    title="Видалити з друзів?"
                    onConfirm={() => removeFriend(friend.username)}
                    okText="Так"
                    cancelText="Ні"
                  >
                    <Button 
                      type="text" 
                      danger 
                      icon={<DeleteOutlined />}
                      size="small"
                    />
                  </Popconfirm>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} />}
                  title={friend.username}
                  description={friend.email}
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Card>
  );
};

interface FriendRequest {
  senderName: string;
  // Add other properties if your FriendRequest object has them
}

const FriendRequestsPanel: React.FC = () => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [sendingRequest, setSendingRequest] = useState(false);
  const { token } = useAuth();

  useEffect(() => {
    loadRequests();
  }, []);

  const loadRequests = async () => {
    if (!token) return;

    try {
      const response: ApiResponse<FriendRequest[]> = await authenticatedApiCall('/api/v1/friendship/requests', token);

      if (response.status === 'SUCCESS') {
        setRequests(response.data as FriendRequest[] || []);
      } else {
        message.error(response.data ? String(response.data) : 'Помилка завантаження запитів');
      }
    } catch (err) {
      message.error('Помилка завантаження запитів');
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async (values: { username: string }) => {
    if (!token) return;

    setSendingRequest(true);
    try {
      const response: ApiResponse<string> = await authenticatedApiCall(`/api/v1/friendship/request/${values.username}`, token, {
        method: 'POST'
      });
      if (response.status === 'SUCCESS') {
        form.resetFields();
        message.success('Запит надіслано');
      } else {
        message.error(response.data || 'Помилка надсилання запиту');
      }
    } catch (err) {
      message.error('Помилка надсилання запиту');
    } finally {
      setSendingRequest(false);
    }
  };

  const acceptRequest = async (sender: string) => {
    if (!token) return;

    try {
      const response: ApiResponse<any> = await authenticatedApiCall(`/api/v1/friendship/accept/${sender}`, token, {
        method: 'PUT'
      });
      if (response.status === 'SUCCESS') {
        setRequests(prev => prev.filter(r => r.senderName !== sender));
        message.success('Запит прийнято');
      } else {
         message.error(response.data ? String(response.data) : 'Помилка прийняття запиту');
      }
    } catch (err) {
      message.error('Помилка прийняття запиту');
    }
  };

  const declineRequest = async (sender: string) => {
    if (!token) return;

    try {
      const response: ApiResponse<any> = await authenticatedApiCall(`/api/v1/friendship/decline/${sender}`, token, {
        method: 'PUT'
      });
      if (response.status === 'SUCCESS') {
        setRequests(prev => prev.filter(r => r.senderName !== sender));
        message.success('Запит відхилено');
      } else {
          message.error(response.data ? String(response.data) : 'Помилка відхилення запиту');
      }
    } catch (err) {
      message.error('Помилка відхилення запиту');
    }
  };

  return (
    <Card
      title={
        <Space>
          <UserAddOutlined />
          <span>Запити в друзі</span>
          {requests.length > 0 && <Badge count={requests.length} />}
        </Space>
      }
    >
      <Form
        form={form}
        onFinish={sendFriendRequest}
        layout="inline"
        style={{ marginBottom: 16 }}
      >
        <Form.Item
          name="username"
          rules={[{ required: true, message: "Введіть ім'я користувача!" }]}
          style={{ flex: 1 }}
        >
          <Input placeholder="Ім'я користувача" />
        </Form.Item>
        <Form.Item>
          <Button
            type="primary"
            htmlType="submit"
            loading={sendingRequest}
            icon={<UserAddOutlined />}
          >
            Надіслати запит
          </Button>
        </Form.Item>
      </Form>

      <Divider />

      <Spin spinning={loading}>
        {requests.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="Немає вхідних запитів"
          />
        ) : (
          <List
            dataSource={requests}
            renderItem={(request) => (
              <List.Item
                actions={[
                  <Button
                    type="primary"
                    icon={<CheckOutlined />}
                    onClick={() => acceptRequest(request.senderName)}
                    size="small"
                  >
                    Прийняти
                  </Button>,
                  <Button
                    danger
                    icon={<CloseOutlined />}
                    onClick={() => declineRequest(request.senderName)}
                    size="small"
                  >
                    Відхилити
                  </Button>
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar icon={<UserOutlined />} style={{ backgroundColor: '#faad14' }} />}
                  title={request.senderName}
                  description="хоче додати вас у друзі"
                />
              </List.Item>
            )}
          />
        )}
      </Spin>
    </Card>
  );
};

const Dashboard: React.FC = () => {
  const { logout } = useAuth();

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        background: '#fff',
        borderBottom: '1px solid #f0f0f0',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Title level={3} style={{ margin: 0, color: '#1890ff' }}>
          Панель друзів
        </Title>
        <Button 
          type="text" 
          icon={<LogoutOutlined />}
          onClick={logout}
          style={{ color: '#666' }}
        >
          Вийти
        </Button>
      </Header>

      <Content style={{ 
        padding: '24px',
        background: '#f0f2f5'
      }}>
        <div style={{ 
          maxWidth: 1200, 
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))',
          gap: '24px'
        }}>
          <FriendRequestsPanel />
          <FriendsPanel />
        </div>
      </Content>
    </Layout>
  );
};

const App: React.FC = () => {
  const [currentView, setCurrentView] = useState<'login' | 'register' | 'dashboard'>('login');
  
  return (
    <AuthProvider>
      <AppContent currentView={currentView} setCurrentView={setCurrentView} />
    </AuthProvider>
  );
};

const AppContent: React.FC<{
  currentView: 'login' | 'register' | 'dashboard';
  setCurrentView: (view: 'login' | 'register' | 'dashboard') => void;
}> = ({ currentView, setCurrentView }) => {
  const { isLoggedIn } = useAuth();

  if (isLoggedIn) {
    return <Dashboard />;
  }

  return (
    <div>
      {currentView === 'login' && (
        <div>
          <LoginPage onSuccess={() => setCurrentView('dashboard')} />
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center'
          }}>
            <Button 
              type="link" 
              onClick={() => setCurrentView('register')}
              style={{ color: '#fff' }}
            >
              Немає акаунта? Зареєструватися
            </Button>
          </div>
        </div>
      )}
      
      {currentView === 'register' && (
        <div>
          <RegisterPage onSuccess={() => setCurrentView('login')} />
          <div style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            textAlign: 'center'
          }}>
            <Button 
              type="link" 
              onClick={() => setCurrentView('login')}
              style={{ color: '#fff' }}
            >
              Вже є акаунт? Увійти
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;