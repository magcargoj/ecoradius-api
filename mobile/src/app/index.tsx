import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, ActivityIndicator, SafeAreaView, StatusBar } from 'react-native';
import Constants from 'expo-constants';

export default function App() {
  const [zipcode, setZipcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const fetchSpecies = async () => {
    if (!zipcode) return;
    setLoading(true);
    setError('');
    try {
      // Dynamically resolve the host IP address (Steam Deck) from Expo Constants
      const hostUri = Constants.expoConfig?.hostUri || '';
      const ip = hostUri ? hostUri.split(':')[0] : '127.0.0.1';
      const response = await fetch(`http://${ip}:8000/api/v1/endangered/by-zip?zipcode=${zipcode}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch data. Ensure API is running locally.');
      }
      
      const result = await response.json();
      setData(result);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.commonName}>{item.common_name || 'Unknown Common Name'}</Text>
      <Text style={styles.scientificName}>{item.scientific_name}</Text>
      <View style={styles.badgeContainer}>
        <View style={[styles.badge, { backgroundColor: item.status.includes('Critically') ? '#ffebee' : '#fff3e0' }]}>
          <Text style={[styles.badgeText, { color: item.status.includes('Critically') ? '#c62828' : '#e65100' }]}>
            {item.status}
          </Text>
        </View>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{item.kingdom}</Text>
        </View>
      </View>
      <Text style={styles.occurrences}>Documented Sightings: {item.occurrences_found}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />
      <View style={styles.header}>
        <Text style={styles.title}>EcoRadius</Text>
        <Text style={styles.subtitle}>Discover Endangered Species Near You</Text>
      </View>

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter Zip Code (e.g. 90210)"
          placeholderTextColor="#999"
          value={zipcode}
          onChangeText={setZipcode}
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.button} onPress={fetchSpecies} disabled={loading}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.legendContainer}>
        <Text style={styles.legendText}>
          Legend: EN = Endangered • CR = Critically Endangered
        </Text>
      </View>


      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {loading ? (
        <ActivityIndicator size="large" color="#2ecc71" style={{ marginTop: 40 }} />
      ) : data ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.resultsTitle}>
            Found {data.total_unique_species} species near {data.query_location.zipcode}
          </Text>
          <FlatList
            data={data.species}
            keyExtractor={(item) => item.scientific_name}
            renderItem={renderItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            showsVerticalScrollIndicator={false}
          />
        </View>
      ) : (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Enter a zip code to see wildlife around you.</Text>
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>Data provided by the Global Biodiversity Information Facility (GBIF)</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#2ecc71',
    padding: 24,
    paddingTop: 40,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#2ecc71',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#ffffff',
    letterSpacing: 1,
  },
  subtitle: {
    fontSize: 14,
    color: '#e8f8f5',
    marginTop: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    padding: 20,
    marginTop: 10,
  },
  legendContainer: {
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 10,
  },
  legendText: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  input: {
    flex: 1,
    backgroundColor: '#ffffff',
    height: 50,
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  button: {
    backgroundColor: '#27ae60',
    height: 50,
    paddingHorizontal: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#27ae60',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  errorText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
  },
  resultsContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  resultsTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34495e',
    marginBottom: 16,
    marginTop: 8,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#f1f2f6',
  },
  commonName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  scientificName: {
    fontSize: 14,
    color: '#7f8c8d',
    fontStyle: 'italic',
    marginBottom: 12,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  badge: {
    backgroundColor: '#f1f2f6',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    marginRight: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#34495e',
  },
  occurrences: {
    fontSize: 12,
    color: '#95a5a6',
    fontWeight: '500',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 16,
    color: '#95a5a6',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    padding: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderColor: '#eee',
    backgroundColor: '#fff',
  },
  footerText: {
    fontSize: 12,
    color: '#bdc3c7',
  },
});
