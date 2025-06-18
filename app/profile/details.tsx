import { View, Text, StyleSheet } from 'react-native';
import BackHeader from '../../src/components/layout/BackHeader';

const ProfileDetailsScreen = () => {
  return (
    <View style={styles.container}>
      <BackHeader title="Edit Profile" />
      <View style={styles.content}>
        <Text style={styles.label}>Name</Text>
        <Text style={styles.value}>Moayed Al-Ashoor</Text>
        {/* Add more editable fields here */}
      </View>
    </View>
  );
};

export default ProfileDetailsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  value: {
    fontSize: 18,
    marginBottom: 16,
  },
});
