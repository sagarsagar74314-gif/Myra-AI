import { HighAccuracyGpsData } from '../types';

/**
 * HighAccuracyLocationService
 * Real-time GPS with precision accuracy, altitude, speed, and reverse geocoding
 */
export async function getHighAccuracyLocation(): Promise<HighAccuracyGpsData> {
  return new Promise((resolve, reject) => {
    if (!('geolocation' in navigator)) {
      reject(new Error('Geolocation is not supported by this browser'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude, accuracy, altitude, speed, heading } = pos.coords;
        let address = `सटीक निर्देशांक: ${latitude.toFixed(5)}°, ${longitude.toFixed(5)}°`;
        let city = 'नई दिल्ली';
        let state = 'दिल्ली';
        let country = 'भारत';

        try {
          // Free OpenStreetMap reverse geocoding
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
            {
              headers: {
                'Accept-Language': 'hi,en',
              },
            }
          );
          if (response.ok) {
            const data = await response.json();
            if (data.display_name) {
              address = data.display_name;
              city =
                data.address?.city ||
                data.address?.town ||
                data.address?.suburb ||
                data.address?.county ||
                city;
              state = data.address?.state || state;
              country = data.address?.country || country;
            }
          }
        } catch (e) {
          console.warn('Reverse geocoding error:', e);
        }

        const gpsData: HighAccuracyGpsData = {
          lat: latitude,
          lng: longitude,
          accuracy: Math.round(accuracy),
          altitude: altitude ? Math.round(altitude) : null,
          speed: speed ? Math.round(speed * 3.6) : null, // km/h
          heading: heading ? Math.round(heading) : null,
          address,
          city,
          state,
          country,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        };

        resolve(gpsData);
      },
      (err) => reject(err),
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  });
}

// Watch location continuously
export function watchHighAccuracyLocation(
  onUpdate: (data: HighAccuracyGpsData) => void,
  onError?: (err: GeolocationPositionError) => void
): number | null {
  if (!('geolocation' in navigator)) return null;

  return navigator.geolocation.watchPosition(
    async (pos) => {
      const { latitude, longitude, accuracy, altitude, speed, heading } = pos.coords;
      const gpsData: HighAccuracyGpsData = {
        lat: latitude,
        lng: longitude,
        accuracy: Math.round(accuracy),
        altitude: altitude ? Math.round(altitude) : null,
        speed: speed ? Math.round(speed * 3.6) : null,
        heading: heading ? Math.round(heading) : null,
        address: `सटीक निर्देशांक: ${latitude.toFixed(5)}°, ${longitude.toFixed(5)}°`,
        city: 'स्थानीय क्षेत्र',
        state: '',
        country: 'भारत',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      };
      onUpdate(gpsData);
    },
    onError,
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 3000,
    }
  );
}
