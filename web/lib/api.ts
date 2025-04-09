/**
 * API utility functions to communicate with the door controller
 */

console.log('API_URL', process.env.NEXT_PUBLIC_API_URL);
console.log('API_KEY', process.env.NEXT_PUBLIC_API_KEY);

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://192.168.2.40';
const API_KEY = process.env.NEXT_PUBLIC_API_KEY || 'G4nd0lf-Th3-W1z4rd-1234';
const MAX_RETRIES = 0;  // Maximum number of retry attempts
const RETRY_DELAY = 1000;  // Delay between retries in ms

// Possible API error types for better error handling
export enum ApiErrorType {
  NETWORK = 'network',
  SERVER = 'server',
  UNAUTHORIZED = 'unauthorized',
  TIMEOUT = 'timeout',
  UNKNOWN = 'unknown',
}

export interface ApiResponse {
  success: boolean;
  message: string;
  errorType?: ApiErrorType;
}

/**
 * Helper function to delay execution (used for retries)
 */
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * Generic API request function with robust error handling and retry mechanism
 */
async function apiRequest(
  endpoint: string, 
  timeout = 10000, 
  retries = MAX_RETRIES
): Promise<ApiResponse> {
  // Create an AbortController for timeout handling
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const url = `http://${API_URL}${endpoint}?key=${API_KEY}`;
    
    const response = await fetch(url, {
      method: 'GET',
      cache: 'no-store',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
      signal: controller.signal,
    });

    // Clear the timeout since the request completed
    clearTimeout(timeoutId);

    if (!response.ok) {
      // Handle different HTTP error codes
      let errorType = ApiErrorType.SERVER;
      
      if (response.status === 401 || response.status === 403) {
        errorType = ApiErrorType.UNAUTHORIZED;
      }
      
      const errorText = await response.text();
      return { 
        success: false, 
        message: `Failed to communicate with door system: ${errorText || response.statusText}`,
        errorType
      };
    }

    const text = await response.text();
    return { success: true, message: text };
  } catch (error) {
    // Clear the timeout to prevent memory leaks
    clearTimeout(timeoutId);
    
    // Determine if this error is retryable
    let shouldRetry = retries > 0;
    let isNetworkError = false;
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      // Timeout errors can be retried
      isNetworkError = true;
      console.log(`Request timed out. Retries left: ${retries}`);
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      // Network errors can be retried
      isNetworkError = true;
      console.log(`Network error. Retries left: ${retries}`);
    } else {
      // Other errors typically shouldn't be retried
      shouldRetry = false;
    }
    
    // Retry logic for network-related errors
    if (shouldRetry && isNetworkError) {
      console.log(`Retrying request in ${RETRY_DELAY}ms...`);
      await delay(RETRY_DELAY);
      return apiRequest(endpoint, timeout, retries - 1);
    }
    
    // If we're out of retries or not a retryable error, return the error response
    console.error('API request failed after retries:', error);
    
    // Determine error type based on the error instance
    let errorType = ApiErrorType.UNKNOWN;
    let errorMessage = 'An unexpected error occurred. Please try again or contact support.';
    
    if (error instanceof DOMException && error.name === 'AbortError') {
      errorType = ApiErrorType.TIMEOUT;
      errorMessage = 'The request timed out. The door controller may be offline or unreachable.';
    } else if (error instanceof TypeError && error.message.includes('fetch')) {
      errorType = ApiErrorType.NETWORK;
      errorMessage = 'Network connection error. Please check your connection and try again.';
    }
    
    return { 
      success: false, 
      message: errorMessage,
      errorType
    };
  }
}

/**
 * Open the first door
 */
export function openFirstDoor(): Promise<ApiResponse> {
  return apiRequest('/openFirstDoor');
}

/**
 * Open the second door
 */
export function openSecondDoor(): Promise<ApiResponse> {
  return apiRequest('/openSecondDoor');
}

/**
 * Open both doors in sequence
 */
export function openBothDoors(): Promise<ApiResponse> {
  return apiRequest('/openBothDoors');
} 