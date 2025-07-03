# 🚀 Smart Parking Finder - Guía de Instalación

## 📋 Prerrequisitos

Antes de comenzar, asegúrate de tener instalado:

- **Node.js** (v16 o superior)
- **npm** o **yarn**
- **MongoDB** (local o MongoDB Atlas)
- **Expo CLI** (`npm install -g @expo/cli`)
- **Git**

## 🛠️ Instalación Paso a Paso

### 1. Clonar el Repositorio 

```bash
git clone <tu-repositorio> 
cd smart-parking-finder
```

### 2. Configurar el Backend

```bash
# Instalar dependencias del servidor
npm install

# Crear archivo de variables de entorno
cp env.example .env
```

Edita el archivo `.env` con tus configuraciones:

```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/smart-parking
JWT_SECRET=tu-super-secret-jwt-key-aqui
GOOGLE_MAPS_API_KEY=tu-google-maps-api-key-aqui
```

### 3. Configurar la Base de Datos

Asegúrate de que MongoDB esté ejecutándose:

```bash
# Iniciar MongoDB (si es local)
mongod

# O usar MongoDB Atlas (recomendado para producción)
```

### 4. Configurar el Frontend

```bash
# Navegar al directorio del cliente
cd client

# Instalar dependencias
npm install

# Crear archivo de configuración de Expo
cp app.json.example app.json
```

Edita `client/app.json` con tu configuración de Expo.

### 5. Obtener API Keys

#### Google Maps API Key
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las APIs:
   - Maps SDK for Android
   - Maps SDK for iOS
   - Places API
   - Geocoding API
4. Crea credenciales (API Key)
5. Restringe la API key por seguridad

#### Expo Push Notifications (Opcional)
1. Crea una cuenta en [Expo](https://expo.dev/)
2. Configura tu proyecto en Expo Dashboard
3. Obtén las credenciales de push notifications

## 🚀 Ejecutar el Proyecto

### Backend

```bash
# Desde la raíz del proyecto
npm run dev
```

El servidor estará disponible en `http://localhost:5000`

### Frontend

```bash
# Desde el directorio client
cd client
npm start
```

Esto abrirá Expo DevTools en tu navegador.

## 📱 Probar la Aplicación

### En el Emulador
1. Instala Android Studio o Xcode
2. Configura un emulador
3. Presiona `a` en Expo DevTools para abrir en Android
4. Presiona `i` para abrir en iOS

### En tu Dispositivo
1. Instala la app Expo Go en tu dispositivo
2. Escanea el código QR que aparece en Expo DevTools
3. La app se cargará en tu dispositivo

## 🗄️ Estructura de la Base de Datos

El proyecto creará automáticamente las siguientes colecciones en MongoDB:

- **users** - Información de usuarios
- **parkinglots** - Estacionamientos
- **reviews** - Reseñas de estacionamientos

## 🔧 Configuración Adicional

### Variables de Entorno del Cliente

Crea un archivo `client/.env`:

```env
API_URL=http://localhost:5000/api
GOOGLE_MAPS_API_KEY=tu-api-key-aqui
```

### Configurar Notificaciones Push

1. En `client/app.json`, actualiza la configuración de notificaciones
2. Configura las credenciales en Expo Dashboard
3. Actualiza el token en el backend

## 🧪 Datos de Prueba

Para agregar datos de prueba, puedes usar el siguiente script:

```javascript
// scripts/seed.js
const mongoose = require('mongoose');
const ParkingLot = require('../server/models/ParkingLot');

const sampleParkingLots = [
  {
    name: "Estacionamiento Centro Comercial",
    description: "Estacionamiento seguro en el centro comercial",
    address: {
      street: "Av. Principal 123",
      city: "Ciudad",
      state: "Estado",
      zipCode: "12345",
      country: "México"
    },
    location: {
      type: "Point",
      coordinates: [-99.1332, 19.4326] // Coordenadas de ejemplo
    },
    totalSpots: 100,
    availableSpots: 45,
    hourlyRate: 25,
    dailyRate: 200,
    amenities: ["security", "covered", "24-7-access"],
    isOpen: true,
    isActive: true
  }
  // Agrega más estacionamientos aquí
];

// Ejecutar: node scripts/seed.js
```

## 🚨 Solución de Problemas

### Error de Conexión a MongoDB
```bash
# Verificar que MongoDB esté ejecutándose
mongod --version
# Reiniciar MongoDB
sudo systemctl restart mongod
```

### Error de Permisos de Ubicación
- Asegúrate de que la app tenga permisos de ubicación
- En iOS: Configuración > Privacidad > Ubicación
- En Android: Configuración > Aplicaciones > Permisos

### Error de Google Maps
- Verifica que la API key sea válida
- Asegúrate de que las APIs estén habilitadas
- Revisa las restricciones de la API key

### Error de Expo
```bash
# Limpiar cache de Expo
expo r -c
# Reinstalar dependencias
rm -rf node_modules && npm install
```

## 📚 Recursos Adicionales

- [Documentación de Expo](https://docs.expo.dev/)
- [Documentación de React Native](https://reactnative.dev/)
- [Documentación de MongoDB](https://docs.mongodb.com/)
- [Google Maps Platform](https://developers.google.com/maps)

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature
3. Commit tus cambios
4. Push a la rama
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

¡Listo! Tu aplicación Smart Parking Finder debería estar funcionando correctamente. 🎉 
