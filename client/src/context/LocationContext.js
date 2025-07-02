import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Location from 'expo-location';

const LocationContext = createContext();

export const useLocation = () => {
  const context = useContext(LocationContext);
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
};

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [permissionStatus, setPermissionStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkLocationPermission();
  }, []);

  const checkLocationPermission = async () => {
    try {
      setLoading(true);
      const { status } = await Location.getForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        await getCurrentLocation();
      } else {
        setErrorMsg('Permiso de ubicación denegado');
      }
    } catch (error) {
      console.error('Error checking location permission:', error);
      setErrorMsg('Error al verificar permisos de ubicación');
    } finally {
      setLoading(false);
    }
  };

  const requestLocationPermission = async () => {
    try {
      setLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      setPermissionStatus(status);

      if (status === 'granted') {
        await getCurrentLocation();
        return { success: true };
      } else {
        setErrorMsg('Permiso de ubicación denegado');
        return { success: false, error: 'Permiso de ubicación denegado' };
      }
    } catch (error) {
      console.error('Error requesting location permission:', error);
      setErrorMsg('Error al solicitar permisos de ubicación');
      return { success: false, error: 'Error al solicitar permisos' };
    } finally {
      setLoading(false);
    }
  };

  const getCurrentLocation = async () => {
    try {
      setLoading(true);
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
        timeInterval: 5000,
        distanceInterval: 10,
      });

      setLocation({
        latitude: currentLocation.coords.latitude,
        longitude: currentLocation.coords.longitude,
        accuracy: currentLocation.coords.accuracy,
        timestamp: currentLocation.timestamp,
      });

      setErrorMsg(null);
    } catch (error) {
      console.error('Error getting current location:', error);
      setErrorMsg('Error al obtener ubicación actual');
    } finally {
      setLoading(false);
    }
  };

  const watchLocation = async (callback) => {
    try {
      if (permissionStatus !== 'granted') {
        const permissionResult = await requestLocationPermission();
        if (!permissionResult.success) {
          return null;
        }
      }

      const locationSubscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 10,
        },
        (newLocation) => {
          const locationData = {
            latitude: newLocation.coords.latitude,
            longitude: newLocation.coords.longitude,
            accuracy: newLocation.coords.accuracy,
            timestamp: newLocation.timestamp,
          };

          setLocation(locationData);
          if (callback) {
            callback(locationData);
          }
        }
      );

      return locationSubscription;
    } catch (error) {
      console.error('Error watching location:', error);
      setErrorMsg('Error al monitorear ubicación');
      return null;
    }
  };

  const getAddressFromCoords = async (latitude, longitude) => {
    try {
      const reverseGeocode = await Location.reverseGeocodeAsync({
        latitude,
        longitude,
      });

      if (reverseGeocode.length > 0) {
        const address = reverseGeocode[0];
        return {
          street: address.street,
          city: address.city,
          state: address.region,
          country: address.country,
          postalCode: address.postalCode,
          fullAddress: `${address.street}, ${address.city}, ${address.region}`,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting address from coordinates:', error);
      return null;
    }
  };

  const getCoordsFromAddress = async (address) => {
    try {
      const geocode = await Location.geocodeAsync(address);

      if (geocode.length > 0) {
        const coords = geocode[0];
        return {
          latitude: coords.latitude,
          longitude: coords.longitude,
        };
      }

      return null;
    } catch (error) {
      console.error('Error getting coordinates from address:', error);
      return null;
    }
  };

  const calculateDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) *
        Math.cos(lat2 * Math.PI / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c; // Distance in kilometers
    return distance;
  };

  const value = {
    location,
    errorMsg,
    permissionStatus,
    loading,
    requestLocationPermission,
    getCurrentLocation,
    watchLocation,
    getAddressFromCoords,
    getCoordsFromAddress,
    calculateDistance,
  };

  return (
    <LocationContext.Provider value={value}>
      {children}
    </LocationContext.Provider>
  );
}; 