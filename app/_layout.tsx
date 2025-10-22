import "../firebase"
import { Slot } from 'expo-router';
import { AppProvider } from '@/context/AppContext';
export default function Root() {
  return (
    <AppProvider>
      <Slot />
    </AppProvider>
  );
}