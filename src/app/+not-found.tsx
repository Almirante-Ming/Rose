import { View } from 'react-native';
import { Link, Stack } from 'expo-router';
import { nfd_styles } from '@/styles/nfd_styles';

export default function NotFoundScreen() {
  return (
    <>
      <Stack.Screen options={{ title: 'Oops! Not Found' }} />
      <View style={nfd_styles.container}>
          <Link href="/(tabs)/home" style={nfd_styles.message}>
              This screen doesn't exist. Go to Home?
          </Link>
      </View>
    </>
  );
}


