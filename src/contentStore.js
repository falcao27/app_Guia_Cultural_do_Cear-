import { events, places, stories } from './data';

export const initialContent = { places, stories, events };

export const API_URL = process.env.EXPO_PUBLIC_API_URL || (
  typeof window !== 'undefined' && window.location
    ? `${window.location.protocol}//${window.location.hostname}:4000`
    : 'http://10.0.2.2:4000'
);

export async function loadContent() {
  try {
    const response = await fetch(`${API_URL}/api/content`);
    if (!response.ok) throw new Error('API indisponível');
    const remote = await response.json();
    const absoluteMedia = item => ({
      ...item,
      ...(item.image?.startsWith('/') ? { image: `${API_URL}${item.image}` } : {}),
      ...(item.video?.startsWith('/') ? { video: `${API_URL}${item.video}` } : {}),
    });
    return {
      places: (remote.places || initialContent.places).map(absoluteMedia),
      stories: (remote.stories || initialContent.stories).map(absoluteMedia),
      events: remote.events || initialContent.events,
    };
  } catch {
    return initialContent;
  }
}
