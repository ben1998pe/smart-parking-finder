import { DefaultTheme } from 'react-native-paper';

export const theme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#2196F3',
    primaryDark: '#1976D2',
    primaryLight: '#BBDEFB',
    accent: '#FF5722',
    background: '#F5F5F5',
    surface: '#FFFFFF',
    text: '#212121',
    textSecondary: '#757575',
    textLight: '#FFFFFF',
    border: '#E0E0E0',
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
    parking: {
      available: '#4CAF50',
      occupied: '#F44336',
      reserved: '#FF9800',
      maintenance: '#9E9E9E'
    },
    status: {
      open: '#4CAF50',
      closed: '#F44336',
      busy: '#FF9800',
      quiet: '#2196F3'
    }
  },
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48
  },
  borderRadius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    round: 50
  },
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28
    },
    h4: {
      fontSize: 18,
      fontWeight: '600',
      lineHeight: 24
    },
    body1: {
      fontSize: 16,
      lineHeight: 24
    },
    body2: {
      fontSize: 14,
      lineHeight: 20
    },
    caption: {
      fontSize: 12,
      lineHeight: 16
    },
    button: {
      fontSize: 16,
      fontWeight: '600',
      textTransform: 'uppercase'
    }
  },
  shadows: {
    small: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.15,
      shadowRadius: 6.27,
      elevation: 10,
    },
    large: {
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 8,
      },
      shadowOpacity: 0.2,
      shadowRadius: 10.32,
      elevation: 16,
    }
  }
}; 