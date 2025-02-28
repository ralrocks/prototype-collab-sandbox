
/**
 * Service for destination information
 */
import { makePerplexityRequest } from './api/perplexityClient';

/**
 * Get information about a destination
 */
export const getDestinationInfo = async (destination: string): Promise<string> => {
  try {
    // Check if API key exists
    const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
    if (!apiKey) {
      console.log('No Perplexity API key found, using fallback data');
      return getFallbackDestinationInfo(destination);
    }
    
    const systemPrompt = 'You are a travel guide API. Provide concise and informative summaries about travel destinations.';
    const userPrompt = `Provide a short paragraph about ${destination} as a travel destination. Include key attractions, best time to visit, and a brief description of the atmosphere. Keep it under 150 words and focused on travel information.`;
    
    const content = await makePerplexityRequest(systemPrompt, userPrompt, 0.3, 300);
    return content.trim();
  } catch (error) {
    console.error('Error getting destination info:', error);
    return getFallbackDestinationInfo(destination);
  }
};

/**
 * Get fallback destination information
 */
const getFallbackDestinationInfo = (destination: string): string => {
  const fallbackInfo: Record<string, string> = {
    'New York': 'New York City offers iconic attractions like Times Square, Central Park, and the Statue of Liberty. The city that never sleeps has world-class museums, Broadway shows, and diverse neighborhoods to explore. Best visited in spring or fall to avoid extreme temperatures. Known for its energy, diverse food scene, and cultural experiences.',
    'Los Angeles': 'Los Angeles is home to Hollywood, beautiful beaches, and year-round sunshine. Visit attractions like Universal Studios, the Getty Center, and the Hollywood Walk of Fame. The sprawling city offers diverse neighborhoods from Beverly Hills to Venice Beach. Best time to visit is May to October for perfect beach weather.',
    'Miami': 'Miami features stunning beaches, vibrant nightlife, and Latin American influences. South Beach is famous for its Art Deco architecture and beach scene. Explore Wynwood Walls for street art or Everglades National Park nearby. Winter months offer perfect weather while avoiding hurricane season.',
    'Chicago': 'Chicago boasts impressive architecture, world-class museums, and a stunning lakefront. The Windy City offers attractions like Millennium Park, Navy Pier, and the Art Institute. Known for deep-dish pizza, blues music, and sports culture. Best visited in summer and early fall for pleasant weather and outdoor activities.',
    'San Francisco': 'San Francisco features iconic attractions like the Golden Gate Bridge, cable cars, and Alcatraz Island. The city is known for distinctive neighborhoods, Victorian architecture, and nearby wine country. Bring layers as weather can be foggy and cool year-round. Famous for its progressive culture and food scene.'
  };
  
  return fallbackInfo[destination] || 
    `${destination} is a popular travel destination with various attractions and experiences for visitors. Research specific points of interest before your trip and check the best seasons to visit for optimal weather conditions.`;
};
