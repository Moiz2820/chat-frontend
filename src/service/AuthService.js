// Save token after successful login
const login = async (credentials) => {
    try {
      const response = await apiClient.post('/login', credentials);
      const token = response.data.token;
      localStorage.setItem('authToken', token);
      // Optionally, redirect to a protected route
      window.location = '/dashboard';
    } catch (error) {
      console.error('Login error:', error);
    }
  };
  
  // Logout and remove token
  const logout = () => {
    localStorage.removeItem('authToken');
    window.location = '/login';
  };
  