import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker, Callout, PROVIDER_GOOGLE } from 'react-native-maps';
import { Surface, Card, Button, Chip, FAB } from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useLocation } from '../context/LocationContext';
import { parkingAPI } from '../services/api';
import { theme } from '../theme/theme';

const { width, height } = Dimensions.get('window');

const MapScreen = ({ navigation }) => {
  const { location, requestLocationPermission } = useLocation();
  const [parkingLots, setParkingLots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedParkingLot, setSelectedParkingLot] = useState(null);
  const [region, setRegion] = useState({
    latitude: 37.78825,
    longitude: -122.4324,
    latitudeDelta: 0.0922,
    longitudeDelta: 0.0421,
  });
  const mapRef = useRef(null);

  useEffect(() => {
    if (location) {
      setRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
      fetchNearbyParkingLots();
    } else {
      requestLocationPermission();
    }
  }, [location]);

  const fetchNearbyParkingLots = async () => {
    try {
      setLoading(true);
      if (!location) return;

      const response = await parkingAPI.getNearby({
        latitude: location.latitude,
        longitude: location.longitude,
        distance: 5, // 5km radius
      });

      setParkingLots(response.data.data || []);
    } catch (error) {
      console.error('Error fetching parking lots:', error);
      Alert.alert('Error', 'No se pudieron cargar los estacionamientos');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkerPress = (parkingLot) => {
    setSelectedParkingLot(parkingLot);
  };

  const handleCalloutPress = () => {
    if (selectedParkingLot) {
      navigation.navigate('ParkingDetail', { parkingLot: selectedParkingLot });
    }
  };

  const getMarkerColor = (parkingLot) => {
    if (!parkingLot.isOpen) return theme.colors.parking.maintenance;
    if (parkingLot.availableSpots === 0) return theme.colors.parking.occupied;
    if (parkingLot.availableSpots < parkingLot.totalSpots * 0.2) return theme.colors.parking.reserved;
    return theme.colors.parking.available;
  };

  const centerOnUser = () => {
    if (location && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const refreshData = () => {
    fetchNearbyParkingLots();
  };

  if (!location) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={styles.loadingText}>Obteniendo tu ubicación...</Text>
        <Button mode="contained" onPress={requestLocationPermission}>
          Permitir Ubicación
        </Button>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        provider={PROVIDER_GOOGLE}
        style={styles.map}
        region={region}
        onRegionChangeComplete={setRegion}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass
        showsScale
      >
        {parkingLots.map((parkingLot) => (
          <Marker
            key={parkingLot._id}
            coordinate={{
              latitude: parkingLot.location.coordinates[1],
              longitude: parkingLot.location.coordinates[0],
            }}
            onPress={() => handleMarkerPress(parkingLot)}
            pinColor={getMarkerColor(parkingLot)}
          >
            <Callout onPress={handleCalloutPress}>
              <View style={styles.callout}>
                <Text style={styles.calloutTitle}>{parkingLot.name}</Text>
                <Text style={styles.calloutSubtitle}>
                  {parkingLot.availableSpots} espacios disponibles
                </Text>
                <Text style={styles.calloutPrice}>
                  ${parkingLot.hourlyRate}/hora
                </Text>
                <TouchableOpacity
                  style={styles.calloutButton}
                  onPress={handleCalloutPress}
                >
                  <Text style={styles.calloutButtonText}>Ver Detalles</Text>
                </TouchableOpacity>
              </View>
            </Callout>
          </Marker>
        ))}
      </MapView>

      {/* Floating Action Buttons */}
      <View style={styles.fabContainer}>
        <FAB
          style={styles.fab}
          icon="crosshairs-gps"
          onPress={centerOnUser}
          color="white"
        />
        <FAB
          style={[styles.fab, styles.refreshFab]}
          icon="refresh"
          onPress={refreshData}
          color="white"
        />
      </View>

      {/* Selected Parking Lot Card */}
      {selectedParkingLot && (
        <Surface style={styles.selectedCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{selectedParkingLot.name}</Text>
            <TouchableOpacity
              onPress={() => setSelectedParkingLot(null)}
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.cardContent}>
            <View style={styles.infoRow}>
              <Ionicons name="location" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoText} numberOfLines={2}>
                {selectedParkingLot.address.street}, {selectedParkingLot.address.city}
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="car" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>
                {selectedParkingLot.availableSpots} de {selectedParkingLot.totalSpots} espacios disponibles
              </Text>
            </View>
            
            <View style={styles.infoRow}>
              <Ionicons name="cash" size={16} color={theme.colors.textSecondary} />
              <Text style={styles.infoText}>
                ${selectedParkingLot.hourlyRate}/hora
              </Text>
            </View>
          </View>
          
          <View style={styles.cardActions}>
            <Chip
              icon={selectedParkingLot.isOpen ? 'check-circle' : 'close-circle'}
              mode="outlined"
              style={[
                styles.statusChip,
                {
                  backgroundColor: selectedParkingLot.isOpen 
                    ? theme.colors.status.open + '20' 
                    : theme.colors.status.closed + '20'
                }
              ]}
            >
              {selectedParkingLot.isOpen ? 'Abierto' : 'Cerrado'}
            </Chip>
            
            <Button
              mode="contained"
              onPress={handleCalloutPress}
              style={styles.detailsButton}
            >
              Ver Detalles
            </Button>
          </View>
        </Surface>
      )}

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={styles.loadingText}>Cargando estacionamientos...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  loadingText: {
    marginTop: theme.spacing.md,
    fontSize: 16,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  fabContainer: {
    position: 'absolute',
    right: theme.spacing.md,
    bottom: theme.spacing.xl,
  },
  fab: {
    backgroundColor: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  refreshFab: {
    backgroundColor: theme.colors.accent,
  },
  selectedCard: {
    position: 'absolute',
    bottom: theme.spacing.lg,
    left: theme.spacing.lg,
    right: theme.spacing.lg,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.md,
    ...theme.shadows.large,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text,
    flex: 1,
  },
  closeButton: {
    padding: theme.spacing.xs,
  },
  cardContent: {
    marginBottom: theme.spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xs,
  },
  infoText: {
    marginLeft: theme.spacing.sm,
    fontSize: 14,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusChip: {
    borderColor: theme.colors.primary,
  },
  detailsButton: {
    borderRadius: theme.borderRadius.md,
  },
  callout: {
    width: 200,
    padding: theme.spacing.sm,
  },
  calloutTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  calloutSubtitle: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xs,
  },
  calloutPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.primary,
    marginBottom: theme.spacing.sm,
  },
  calloutButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
    alignItems: 'center',
  },
  calloutButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default MapScreen; 