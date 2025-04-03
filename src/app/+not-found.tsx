import { View, StyleSheet, Text } from 'react-native';
import { Link, Stack } from 'expo-router';
import { nfound_styles } from '@styles/nfound_styles';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <View style={nfound_styles.container}>
          <Link href="/(tabs)/home" style={nfound_styles.message}>
              This screen doesn't exist. Go to Home?
          </Link>
      </View>
    </>
  );
}


