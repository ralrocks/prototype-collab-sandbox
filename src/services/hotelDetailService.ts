
import { Hotel } from '@/types';
import { makePerplexityRequest, extractJsonFromResponse } from './api/perplexityClient';
import { toast } from 'sonner';

/**
 * Get more details about a specific hotel
 */
export const getHotelDetails = async (hotel: Hotel): Promise<any> => {
  // Check if we have a valid API key
  const apiKey = localStorage.getItem('PERPLEXITY_API_KEY');
  if (!apiKey) {
    toast.error('API key required', { description: 'Please add your Perplexity API key in settings' });
    throw new Error('Perplexity API key not found');
  }
  
  const systemPrompt = 'You are a hotel information API. Provide detailed information about the requested hotel in JSON format.';
  const userPrompt = `Provide detailed information about ${hotel.name} in ${hotel.location}.
  Include details about amenities, location details, check-in/check-out policies, nearby attractions, and any other relevant information.
  Also include a website URL for the hotel if available. If not available, provide a best guess for the official hotel website URL.
  Return the information in JSON format with these properties: locationDetails, checkIn, checkOut, policies, nearbyAttractions, publicTransport, parking, internetAccess, breakfastDetails, roomTypes, specialFeatures, websiteUrl.
  Return only a valid JSON object without any explanations.`;
  
  try {
    const content = await makePerplexityRequest(systemPrompt, userPrompt);
    return extractJsonFromResponse(content);
  } catch (error) {
    console.error('Error fetching hotel details:', error);
    throw error;
  }
};
