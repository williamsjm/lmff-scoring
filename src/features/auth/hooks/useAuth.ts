import { useState } from 'react';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { auth } from '../../../app/firebase';
import { useAuthContext } from '../context/AuthContext';
import { message } from 'antd';

export const useAuth = () => {
  const { user, firebaseUser, loading, isAdmin } = useAuthContext();
  const [loginLoading, setLoginLoading] = useState(false);

  const login = async (email: string, password: string) => {
    setLoginLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      message.success('Inicio de sesion exitoso');
    } catch (error: unknown) {
      const errorMessages: Record<string, string> = {
        'auth/user-not-found': 'Usuario no encontrado',
        'auth/wrong-password': 'Contrasena incorrecta',
        'auth/invalid-email': 'Email invalido',
        'auth/too-many-requests': 'Demasiados intentos. Intenta mas tarde.',
        'auth/invalid-credential': 'Credenciales invalidas',
      };
      const code = (error as { code?: string }).code || '';
      message.error(errorMessages[code] || 'Error al iniciar sesion');
      throw error;
    } finally {
      setLoginLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      message.success('Sesion cerrada');
    } catch {
      message.error('Error al cerrar sesion');
    }
  };

  return { user, firebaseUser, loading, isAdmin, login, logout, loginLoading };
};
