import { useEffect } from 'react';
import * as Linking from 'expo-linking';

export function useDeepLink(onReceive: (url: string) => void) {
  useEffect(() => {
    const handle = ({ url }: { url: string }) => {
      onReceive(url);
    };

    // listen when app is open
    const sub = Linking.addEventListener('url', handle);

    // handle when app is opened from closed state
    Linking.getInitialURL().then((url) => {
      if (url) onReceive(url);
    });

    return () => {
      sub.remove();
    };
  }, [onReceive]);
}