
import Cookies from 'js-cookie';
import jwtDecode from 'jwt-decode';

const TOKEN_KEY = 'wms_token';


export const setToken = (token: string) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    Cookies.set('token', token);
  } catch (e) {
    // storage may be unavailable; fall back to nothing
    console.warn('Failed to set token in localStorage', e);
  }
};

export const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY) || undefined;
  } catch (e) {
    return undefined;
  }
};


export const removeToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    Cookies.remove('token');
  } catch (e) {
    // ignore
  }
};

export const isTokenValid = () => {
  const token = getToken();
  if (!token) return false;

  try {
    const decoded: any = jwtDecode(token);
    return decoded.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const getUserFromToken = () => {
  const token = getToken();
  if (!token) return null;

  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
};
