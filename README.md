# 🚗 Smart Parking Finder

Una aplicación móvil inteligente para encontrar estacionamientos disponibles en tiempo real.

## ✨ Características

- 📍 Geolocalización en tiempo real
- 🗺️ Mapa interactivo con estacionamientos
- 📊 Estado de ocupación en tiempo real
- 🔔 Notificaciones push de disponibilidad
- ⭐ Sistema de reseñas y calificaciones
- 👤 Autenticación de usuarios
- 💳 Sistema de reservas (opcional)

## 🛠️ Tecnologías

### Backend
- **Node.js** - Runtime de JavaScript
- **Express.js** - Framework web
- **MongoDB** - Base de datos NoSQL
- **Socket.io** - Comunicación en tiempo real
- **JWT** - Autenticación
- **bcryptjs** - Encriptación de contraseñas

### Frontend (React Native)
- **React Native** - Framework móvil
- **Expo** - Herramientas de desarrollo
- **React Navigation** - Navegación
- **Google Maps** - Mapas interactivos
- **AsyncStorage** - Almacenamiento local

## 🚀 Instalación

### Prerrequisitos
- Node.js (v16 o superior)
- MongoDB
- Expo CLI
- Android Studio / Xcode (para desarrollo móvil)

### Pasos de instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd smart-parking-finder
```

2. **Instalar dependencias del backend**
```bash
npm install
```

3. **Instalar dependencias del frontend**
```bash
cd client
npm install
```

4. **Configurar variables de entorno**
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

6. **Iniciar la aplicación móvil**
```bash
cd client
npm start
```

## 📱 Uso

1. Abre la aplicación en tu dispositivo móvil
2. Permite acceso a la ubicación
3. Explora el mapa para ver estacionamientos cercanos
4. Selecciona un estacionamiento para ver detalles
5. Recibe notificaciones cuando hay espacios disponibles

## 🔧 Configuración

### Variables de entorno (.env)
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/smart-parking
JWT_SECRET=your-secret-key
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
```

## 📊 Estructura del proyecto

```
smart-parking-finder/
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   └── index.js
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── screens/
│   │   ├── navigation/
│   │   ├── services/
│   │   └── utils/
│   ├── App.js
│   └── package.json
├── package.json
└── README.md
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para detalles.

## 👨‍💻 Autor

Benjamin Oscco Arias

## 🙏 Agradecimientos

- Google Maps API
- Expo team
- React Native community 
