import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Upload Rate Limiter
 * 
 * Implements session-based upload count limiting to prevent accidental DoS attacks
 * and overloading of Firebase Firestore with base64 image uploads.
 * 
 * Features:
 * - Max 50 uploads per session
 * - Automatic reset after 2 hours
 * - Persistent tracking across app restarts using AsyncStorage
 * - User-friendly error messages with remaining upload counts
 */

const UPLOAD_LIMITS = {
  MAX_UPLOADS_PER_SESSION: 50,
  RESET_INTERVAL_HOURS: 2,
};

const STORAGE_KEYS = {
  UPLOAD_COUNT: '@upload_limiter_count',
  LAST_RESET_TIME: '@upload_limiter_reset_time',
};

interface UploadLimitStatus {
  allowed: boolean;
  currentCount: number;
  maxCount: number;
  remainingUploads: number;
  resetTime?: Date;
  hoursUntilReset?: number;
  error?: string;
}

/**
 * Get the current upload count and last reset time from storage
 */
const getStoredData = async (): Promise<{ count: number; lastResetTime: number }> => {
  try {
    const [countStr, resetTimeStr] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.UPLOAD_COUNT),
      AsyncStorage.getItem(STORAGE_KEYS.LAST_RESET_TIME),
    ]);

    const count = countStr ? parseInt(countStr, 10) : 0;
    const lastResetTime = resetTimeStr ? parseInt(resetTimeStr, 10) : Date.now();

    return { count, lastResetTime };
  } catch (error) {
    console.error('Error reading upload limiter data from storage:', error);
    return { count: 0, lastResetTime: Date.now() };
  }
};

/**
 * Save upload count and reset time to storage
 */
const saveStoredData = async (count: number, lastResetTime: number): Promise<void> => {
  try {
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEYS.UPLOAD_COUNT, count.toString()),
      AsyncStorage.setItem(STORAGE_KEYS.LAST_RESET_TIME, lastResetTime.toString()),
    ]);
  } catch (error) {
    console.error('Error saving upload limiter data to storage:', error);
  }
};

/**
 * Check if the reset interval has passed
 */
const shouldReset = (lastResetTime: number): boolean => {
  const now = Date.now();
  const resetIntervalMs = UPLOAD_LIMITS.RESET_INTERVAL_HOURS * 60 * 60 * 1000;
  return now - lastResetTime >= resetIntervalMs;
};

/**
 * Calculate hours until reset
 */
const getHoursUntilReset = (lastResetTime: number): number => {
  const now = Date.now();
  const resetIntervalMs = UPLOAD_LIMITS.RESET_INTERVAL_HOURS * 60 * 60 * 1000;
  const timeSinceReset = now - lastResetTime;
  const timeUntilReset = resetIntervalMs - timeSinceReset;
  const hoursUntilReset = Math.ceil(timeUntilReset / (60 * 60 * 1000));
  return Math.max(0, hoursUntilReset);
};

/**
 * Check if an upload is allowed based on current limits
 * 
 * @returns UploadLimitStatus object with details about the upload limit status
 */
export const checkUploadAllowed = async (): Promise<UploadLimitStatus> => {
  try {
    let { count, lastResetTime } = await getStoredData();

    // Check if we should reset the counter
    if (shouldReset(lastResetTime)) {
      count = 0;
      lastResetTime = Date.now();
      await saveStoredData(count, lastResetTime);
    }

    const remainingUploads = UPLOAD_LIMITS.MAX_UPLOADS_PER_SESSION - count;
    const allowed = count < UPLOAD_LIMITS.MAX_UPLOADS_PER_SESSION;

    if (!allowed) {
      const hoursUntilReset = getHoursUntilReset(lastResetTime);
      const resetTime = new Date(lastResetTime + UPLOAD_LIMITS.RESET_INTERVAL_HOURS * 60 * 60 * 1000);
      
      return {
        allowed: false,
        currentCount: count,
        maxCount: UPLOAD_LIMITS.MAX_UPLOADS_PER_SESSION,
        remainingUploads: 0,
        resetTime,
        hoursUntilReset,
        error: `Upload limit reached. You've used ${count}/${UPLOAD_LIMITS.MAX_UPLOADS_PER_SESSION} uploads this session. The limit will reset in ${hoursUntilReset} hour${hoursUntilReset !== 1 ? 's' : ''} or when you restart the app.`,
      };
    }

    return {
      allowed: true,
      currentCount: count,
      maxCount: UPLOAD_LIMITS.MAX_UPLOADS_PER_SESSION,
      remainingUploads,
    };
  } catch (error) {
    console.error('Error checking upload limit:', error);
    // On error, allow the upload but log the issue
    return {
      allowed: true,
      currentCount: 0,
      maxCount: UPLOAD_LIMITS.MAX_UPLOADS_PER_SESSION,
      remainingUploads: UPLOAD_LIMITS.MAX_UPLOADS_PER_SESSION,
    };
  }
};

/**
 * Increment the upload count after a successful upload
 * 
 * @returns The new upload count
 */
export const incrementUploadCount = async (): Promise<number> => {
  try {
    let { count, lastResetTime } = await getStoredData();

    // Check if we should reset the counter before incrementing
    if (shouldReset(lastResetTime)) {
      count = 0;
      lastResetTime = Date.now();
    }

    count += 1;
    await saveStoredData(count, lastResetTime);

    return count;
  } catch (error) {
    console.error('Error incrementing upload count:', error);
    return 0;
  }
};

/**
 * Manually reset the upload counter (useful for testing or admin purposes)
 */
export const resetUploadCounter = async (): Promise<void> => {
  try {
    await saveStoredData(0, Date.now());
  } catch (error) {
    console.error('Error resetting upload counter:', error);
  }
};

/**
 * Get the remaining number of uploads allowed in this session
 * 
 * @returns Number of remaining uploads
 */
export const getRemainingUploads = async (): Promise<number> => {
  const status = await checkUploadAllowed();
  return status.remainingUploads;
};

/**
 * Get detailed upload limit information
 * 
 * @returns Current count, max count, and remaining uploads
 */
export const getUploadLimitInfo = async (): Promise<{
  currentCount: number;
  maxCount: number;
  remainingUploads: number;
  hoursUntilReset?: number;
}> => {
  const { count, lastResetTime } = await getStoredData();
  
  // Check if we should reset
  if (shouldReset(lastResetTime)) {
    return {
      currentCount: 0,
      maxCount: UPLOAD_LIMITS.MAX_UPLOADS_PER_SESSION,
      remainingUploads: UPLOAD_LIMITS.MAX_UPLOADS_PER_SESSION,
      hoursUntilReset: UPLOAD_LIMITS.RESET_INTERVAL_HOURS,
    };
  }

  return {
    currentCount: count,
    maxCount: UPLOAD_LIMITS.MAX_UPLOADS_PER_SESSION,
    remainingUploads: Math.max(0, UPLOAD_LIMITS.MAX_UPLOADS_PER_SESSION - count),
    hoursUntilReset: getHoursUntilReset(lastResetTime),
  };
};

/**
 * Get a user-friendly message about upload limit status
 * Useful for displaying info to users proactively
 * 
 * @returns A friendly message string about current upload status
 * 
 * @example
 * const message = await getUploadLimitMessage();
 * console.log(message); // "You have 45 uploads remaining (resets in 1 hour)"
 */
export const getUploadLimitMessage = async (): Promise<string> => {
  const info = await getUploadLimitInfo();
  
  if (info.remainingUploads === info.maxCount) {
    return `You have ${info.remainingUploads} uploads available this session.`;
  }
  
  if (info.remainingUploads === 0) {
    const hours = info.hoursUntilReset || 0;
    return `Upload limit reached (${info.currentCount}/${info.maxCount}). Resets in ${hours} hour${hours !== 1 ? 's' : ''}.`;
  }
  
  const hours = info.hoursUntilReset || 0;
  return `You have ${info.remainingUploads} uploads remaining (resets in ${hours} hour${hours !== 1 ? 's' : ''}).`;
};

