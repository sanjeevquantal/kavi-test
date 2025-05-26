
// import React, { useState, useEffect, useRef } from 'react';
// import { Clock } from 'lucide-react';

// interface CountdownTimerProps {
//   durationMinutes: number;
//   onEnd: () => void;
//   isActive: boolean;
// }

// const CountdownTimer: React.FC<CountdownTimerProps> = ({ durationMinutes, onEnd, isActive }) => {
//   const [timeLeft, setTimeLeft] = useState(durationMinutes * 60);
//   const startTimeRef = useRef<number | null>(null);
//   const endTimeRef = useRef<number | null>(null);
//   const timerRef = useRef<number | null>(null);
//   const hasEndedRef = useRef<boolean>(false);

//   // ENFORCE: Always use namespace for this timer so two agents do not "share" timer
//   const TIMER_STORAGE_KEY = 'conversationEndTime';

//   // When the timer becomes inactive (conversation ends) make sure timer AND storage is cleaned up
//   useEffect(() => {
//     if (isActive) {
//       // Conversation is (re)starting: reset timer
//       startTimeRef.current = Date.now();
//       endTimeRef.current = startTimeRef.current + durationMinutes * 60 * 1000;
//       setTimeLeft(durationMinutes * 60);
//       localStorage.setItem(TIMER_STORAGE_KEY, endTimeRef.current.toString());
//       hasEndedRef.current = false;
//     } else {
//       // Conversation ended or unmounted: clean up everything, reset timer
//       startTimeRef.current = null;
//       endTimeRef.current = null;
//       hasEndedRef.current = false;
//       setTimeLeft(durationMinutes * 60); // Reset to initial time
//       localStorage.removeItem(TIMER_STORAGE_KEY);

//       if (timerRef.current) {
//         window.clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//     }

//     return () => {
//       if (timerRef.current) {
//         window.clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//     };
//   }, [isActive, durationMinutes]);

//   // Main timer effect - this runs continuously as long as the conversation is active
//   useEffect(() => {
//     if (!isActive || !endTimeRef.current) return;

//     const updateRemainingTime = () => {
//       if (endTimeRef.current) {
//         const now = Date.now();
//         const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
//         setTimeLeft(remaining);

//         // If time is up and we haven't ended yet, call onEnd
//         if (remaining <= 0 && !hasEndedRef.current) {
//           hasEndedRef.current = true;

//           if (timerRef.current) {
//             window.clearInterval(timerRef.current);
//             timerRef.current = null;
//           }

//           // Clear localStorage on conversation end
//           localStorage.removeItem(TIMER_STORAGE_KEY);

//           // Call onEnd to terminate the conversation
//           onEnd();
//         }
//       }
//     };

//     // Do an initial update immediately
//     updateRemainingTime();

//     // Set up the interval only if it's not already running
//     if (timerRef.current === null) {
//       timerRef.current = window.setInterval(updateRemainingTime, 1000);
//     }

//     return () => {
//       if (timerRef.current) {
//         window.clearInterval(timerRef.current);
//         timerRef.current = null;
//       }
//     };
//   }, [isActive, onEnd]);

//   // When returning to the tab, ensure time left is correct and timer is reset if needed
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (!document.hidden && isActive && endTimeRef.current) {
//         // When returning to the tab, immediately update the time left
//         const now = Date.now();
//         const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
//         setTimeLeft(remaining);

//         if (remaining <= 0 && !hasEndedRef.current) {
//           hasEndedRef.current = true;
//           localStorage.removeItem(TIMER_STORAGE_KEY);
//           onEnd();
//         }
//       }
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//     };
//   }, [isActive, onEnd]);

//   // Format time as mm:ss
//   const minutes = Math.floor(timeLeft / 60);
//   const seconds = timeLeft % 60;
//   const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

//   // Calculate percentage for progress ring
//   const percentage = (timeLeft / (durationMinutes * 60)) * 100;

//   return (
//     <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-foreground border shadow-sm">
//       <Clock className="h-3.5 w-3.5 text-muted-foreground" />
//       <div>
//         <svg className="w-4 h-4 -ml-0.5 mr-1 inline" viewBox="0 0 36 36">
//           <path
//             className="stroke-muted-foreground/30 fill-none"
//             strokeWidth="3"
//             d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//           />
//           <path
//             className="stroke-primary fill-none"
//             strokeWidth="3"
//             strokeDasharray={`${percentage}, 100`}
//             d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//           />
//         </svg>
//         {formattedTime}
//       </div>
//     </div>
//   );
// };

// export default CountdownTimer;

//2nd time but is it working how i want but not resetting properly so check that please
// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Clock } from 'lucide-react';

// interface CountdownTimerProps {
//   durationMinutes: number;
//   onEnd: () => void;
//   isActive: boolean; // Controls whether the timer should be running
// }

// const TIMER_STORAGE_KEY = 'conversationEndTime';

// const CountdownTimer: React.FC<CountdownTimerProps> = ({ durationMinutes, onEnd, isActive }) => {
//   const durationSeconds = durationMinutes * 60;

//   // --- State Initialization ---
//   // Initialize timeLeft. Read storage ONLY if mounting as active.
//   const [timeLeft, setTimeLeft] = useState<number>(() => {
//     if (!isActive) {
//         console.log("CountdownTimer (Initial): Starting INACTIVE. Setting full duration.");
//         return durationSeconds; // If starting inactive, show full duration
//     }
//     // If starting ACTIVE, try to resume
//     const persistedEndTime = localStorage.getItem(TIMER_STORAGE_KEY);
//     if (persistedEndTime) {
//         const endTimeMs = parseInt(persistedEndTime, 10);
//         const now = Date.now();
//         if (!isNaN(endTimeMs) && endTimeMs > now) {
//             console.log("CountdownTimer (Initial): Starting ACTIVE with valid storage. Calculating remaining time.");
//             return Math.max(0, Math.floor((endTimeMs - now) / 1000));
//         } else {
//              console.log("CountdownTimer (Initial): Starting ACTIVE but storage is invalid/past. Clearing storage.");
//             localStorage.removeItem(TIMER_STORAGE_KEY); // Clean invalid storage found on init
//         }
//     }
//      console.log("CountdownTimer (Initial): Starting ACTIVE but no valid storage. Setting full duration.");
//     return durationSeconds; // Default to full duration if active but no valid storage
//   });

//   const endTimeRef = useRef<number | null>(null);
//   const timerRef = useRef<NodeJS.Timeout | null>(null);
//   const hasEndedRef = useRef<boolean>(false);
//   // Initialize ref with the initial prop value
//   const prevIsActiveRef = useRef<boolean>(isActive);

//   // Store onEnd in a ref
//   const onEndRef = useRef(onEnd);
//   useEffect(() => {
//     onEndRef.current = onEnd;
//   }, [onEnd]);

//   // --- Effect to Manage Timer Lifecycle ---
//   useEffect(() => {
//     const clearTimerInterval = () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//          console.log("CountdownTimer (Effect): Interval cleared.");
//       }
//     };

//     // --- Case 1: Timer should be ACTIVE ---
//     if (isActive) {
//       const wasPreviouslyInactive = !prevIsActiveRef.current;

//       // --- Subcase 1.A: Just activated (Transition from inactive to active) ---
//       if (wasPreviouslyInactive) {
//         console.log("CountdownTimer (Effect): Transitioning to ACTIVE - FORCING NEW TIMER.");
//         clearTimerInterval(); // Ensure no leftover interval
//         const now = Date.now();
//         const newEndTime = now + durationSeconds * 1000;
//         endTimeRef.current = newEndTime;
//         hasEndedRef.current = false;
//         localStorage.removeItem(TIMER_STORAGE_KEY); // *** Force clear any old storage ***
//         localStorage.setItem(TIMER_STORAGE_KEY, newEndTime.toString());
//         setTimeLeft(durationSeconds); // *** Force reset display state ***

//         // Start the new interval
//         timerRef.current = setInterval(() => {
//             if (!endTimeRef.current || hasEndedRef.current) {
//                 clearTimerInterval(); return; // Stop if ended or invalid state
//             }
//             const currentTime = Date.now();
//             const remaining = Math.max(0, Math.floor((endTimeRef.current - currentTime) / 1000));
//             setTimeLeft(remaining);

//             if (remaining <= 0 && !hasEndedRef.current) {
//                 console.log('CountdownTimer (Interval - New Start): Time ended.');
//                 hasEndedRef.current = true;
//                 clearTimerInterval();
//                 localStorage.removeItem(TIMER_STORAGE_KEY); // Clean storage on end
//                 onEndRef.current();
//             }
//         }, 1000);
//          console.log('CountdownTimer (Effect): New interval started.');

//       // --- Subcase 1.B: Already active (Continuing or resuming after remount/refresh) ---
//       } else {
//          console.log("CountdownTimer (Effect): Already ACTIVE - Resuming/Continuing.");
//          const now = Date.now();
//          let currentEndTime = endTimeRef.current; // Check ref first

//          // If ref is lost (remount), try storage
//          if (!currentEndTime) {
//              const persistedEndTime = localStorage.getItem(TIMER_STORAGE_KEY);
//              if (persistedEndTime) {
//                  const endTimeMs = parseInt(persistedEndTime, 10);
//                  if (!isNaN(endTimeMs) && endTimeMs > now) {
//                      currentEndTime = endTimeMs;
//                      endTimeRef.current = currentEndTime; // Restore ref
//                       console.log('CountdownTimer (Effect - Resume): Restored end time from storage.');
//                  } else {
//                       console.log('CountdownTimer (Effect - Resume): Stale storage found - Starting FRESH instead.');
//                      localStorage.removeItem(TIMER_STORAGE_KEY);
//                      // Treat stale storage during resume as needing a fresh start
//                      currentEndTime = now + durationSeconds * 1000;
//                      endTimeRef.current = currentEndTime;
//                      localStorage.setItem(TIMER_STORAGE_KEY, currentEndTime.toString());
//                      setTimeLeft(durationSeconds);
//                      hasEndedRef.current = false;
//                  }
//              } else {
//                   console.log('CountdownTimer (Effect - Resume): No ref, no storage - Starting FRESH.');
//                  // No ref, no storage? Start fresh.
//                  currentEndTime = now + durationSeconds * 1000;
//                  endTimeRef.current = currentEndTime;
//                  localStorage.setItem(TIMER_STORAGE_KEY, currentEndTime.toString());
//                  setTimeLeft(durationSeconds);
//                  hasEndedRef.current = false;
//              }
//          }

//          // Sync display and ensure interval is running if needed
//          if (currentEndTime) {
//              const remaining = Math.max(0, Math.floor((currentEndTime - now) / 1000));
//              setTimeLeft(prev => (prev !== remaining ? remaining : prev)); // Update if state differs

//              // Start interval ONLY if not running, and time > 0
//              if (timerRef.current === null && remaining > 0 && !hasEndedRef.current) {
//                   console.log('CountdownTimer (Effect - Resume): Interval was not running, starting it.');
//                  timerRef.current = setInterval(() => {
//                       if (!endTimeRef.current || hasEndedRef.current) {
//                          clearTimerInterval(); return;
//                       }
//                      const currentTime_resume = Date.now();
//                      const remaining_resume = Math.max(0, Math.floor((endTimeRef.current - currentTime_resume) / 1000));
//                      setTimeLeft(remaining_resume);

//                      if (remaining_resume <= 0 && !hasEndedRef.current) {
//                           console.log('CountdownTimer (Interval - Resume): Time ended.');
//                          hasEndedRef.current = true;
//                          clearTimerInterval();
//                          localStorage.removeItem(TIMER_STORAGE_KEY);
//                          onEndRef.current();
//                      }
//                  }, 1000);
//              } else if (remaining <= 0 && !hasEndedRef.current) {
//                  // Handle edge case: Time expired exactly on resume before interval check
//                   console.log('CountdownTimer (Effect - Resume): Time already ended upon resume.');
//                  hasEndedRef.current = true;
//                  clearTimerInterval();
//                  localStorage.removeItem(TIMER_STORAGE_KEY);
//                  onEndRef.current();
//              }
//          }
//       }
//     // --- Case 2: Timer should be INACTIVE ---
//     } else {
//         const wasPreviouslyActive = prevIsActiveRef.current;
//          // --- Subcase 2.A: Just deactivated (Transition from active to inactive) ---
//          if (wasPreviouslyActive) {
//              console.log("CountdownTimer (Effect): Transitioning to INACTIVE - Cleaning up.");
//              clearTimerInterval();
//              setTimeLeft(durationSeconds); // Reset display
//              endTimeRef.current = null;    // Clear end time state
//              hasEndedRef.current = false;  // Reset ended flag
//              // *** CRITICAL: Always clear storage on explicit stop ***
//              localStorage.removeItem(TIMER_STORAGE_KEY);
//          }
//          // If it was already inactive (Subcase 2.B), do nothing.
//     }

//     // Update the ref *after* all logic for the current render cycle
//     prevIsActiveRef.current = isActive;

//     // --- Effect Cleanup ---
//     // This runs when component unmounts OR before the effect re-runs due to dependency change
//     return () => {
//        console.log("CountdownTimer: Effect cleanup running.");
//       clearTimerInterval(); // Always clear interval on cleanup
//       // DO NOT clear localStorage here - rely on explicit stop logic or natural end
//     };
//   }, [isActive, durationSeconds]); // Dependencies drive effect execution


//   // --- Effect for Tab Visibility (Handles sync when tab regains focus) ---
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       // Only act if tab is visible, timer should be active, and hasn't already ended
//       if (!document.hidden && isActive && endTimeRef.current && !hasEndedRef.current) {
//         const now = Date.now();
//         const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
//         setTimeLeft(remaining); // Sync display immediately
//          console.log('CountdownTimer (Visibility): Tab became visible, syncing time:', remaining);

//         // Check if time ended while hidden and trigger end logic if necessary
//         if (remaining <= 0) {
//            console.log('CountdownTimer (Visibility): Time ended while tab was hidden.');
//            hasEndedRef.current = true;
//            // Interval should be stopped by its own check or the main effect cleanup,
//            // but ensure storage is cleared and callback is called.
//            localStorage.removeItem(TIMER_STORAGE_KEY);
//            onEndRef.current();
//         }
//       }
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//     };
//   }, [isActive]); // Re-attach listener if isActive changes


//   // --- Formatting and Rendering ---
//   const minutes = Math.floor(timeLeft / 60);
//   const seconds = timeLeft % 60;
//   const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   const initialDuration = durationMinutes * 60;
//   const percentage = initialDuration > 0 ? Math.min(100, Math.max(0, (timeLeft / initialDuration) * 100)) : 0;

//   return (
//     <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-foreground border shadow-sm">
//       <Clock className="h-3.5 w-3.5 text-muted-foreground" />
//       <div>
//         {/* SVG Progress Ring */}
//         <svg className="w-4 h-4 -ml-0.5 mr-1 inline align-middle" viewBox="0 0 36 36">
//           <path
//             className="stroke-muted-foreground/30 fill-none"
//             strokeWidth="3"
//             d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//           />
//           <path
//             className="stroke-primary fill-none"
//             strokeWidth="3"
//             strokeDasharray={`${percentage}, 100`}
//             strokeLinecap="round"
//             d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//             style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
//           />
//         </svg>
//         {/* Formatted Time */}
//         <span className="align-middle">{formattedTime}</span>
//       </div>
//     </div>
//   );
// };

// export default CountdownTimer;


// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import { Clock } from 'lucide-react';

// interface CountdownTimerProps {
//   durationMinutes: number;
//   onEnd: () => void;
//   isActive: boolean; // Controls whether the timer should be running
// }

// // Use a unique key for localStorage to avoid potential conflicts
// const TIMER_STORAGE_KEY = 'uniqueConversationEndTime_v1'; // Added versioning/uniqueness

// const CountdownTimer: React.FC<CountdownTimerProps> = ({ durationMinutes, onEnd, isActive }) => {
//   const durationSeconds = durationMinutes * 60;

//   // --- State Initialization: Always visually start at full duration ---
//   // useEffect will immediately sync it if resuming.
//   const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);
//   // console.log(`CountdownTimer (Mount/Render): Initializing state. isActive=${isActive}, Visual timeLeft=${durationSeconds}`);


//   const endTimeRef = useRef<number | null>(null);
//   const timerRef = useRef<NodeJS.Timeout | null>(null);
//   const hasEndedRef = useRef<boolean>(false);
//   // Initialize ref with the initial prop value - essential for the first effect run comparison
//   const prevIsActiveRef = useRef<boolean>(isActive);

//   // Store onEnd in a ref to prevent effect dependency issues if parent passes unstable function
//   const onEndRef = useRef(onEnd);
//   useEffect(() => {
//     onEndRef.current = onEnd;
//   }, [onEnd]);

//   // --- Effect to Manage Timer Lifecycle ---
//   useEffect(() => {
//      // console.log(`%cCountdownTimer (Effect Start): isActive=${isActive}, prevIsActive=${prevIsActiveRef.current}, hasEnded=${hasEndedRef.current}`, 'color: blue');

//     // Define helper scoped to this effect
//     const clearTimerInterval = () => {
//       if (timerRef.current) {
//         clearInterval(timerRef.current);
//         timerRef.current = null;
//          // console.log("CountdownTimer (Effect): Interval cleared.");
//       }
//     };

//     // --- Case 1: Timer should be ACTIVE ---
//     if (isActive) {
//       const wasPreviouslyInactive = !prevIsActiveRef.current; // Compare current prop with value from *previous* render cycle
//       const now = Date.now();
//       let calculatedEndTime: number | null = null;

//       // --- Subcase 1.A: Just activated (Transition from inactive to active) ---
//       if (wasPreviouslyInactive) {
//          console.log("%cCountdownTimer (Effect): << JUST ACTIVATED >> - Forcing NEW timer start.", 'color: green; font-weight: bold;');
//         clearTimerInterval(); // Ensure no leftover interval is running

//         calculatedEndTime = now + durationSeconds * 1000;
//         endTimeRef.current = calculatedEndTime;
//         hasEndedRef.current = false; // Reset ended flag for the new session

//         localStorage.removeItem(TIMER_STORAGE_KEY); // Force clear any old storage
//         localStorage.setItem(TIMER_STORAGE_KEY, calculatedEndTime.toString());
//          console.log(`%cCountdownTimer (Effect): Cleared storage, Set NEW EndTime=${new Date(calculatedEndTime)}`, 'color: green;');

//         setTimeLeft(durationSeconds); // Force reset the display state to full duration
//          console.log(`%cCountdownTimer (Effect): Display state FORCED to ${durationSeconds}`, 'color: green;');

//       // --- Subcase 1.B: Already active (Continuing/Resuming) ---
//       } else {
//          // console.log("%cCountdownTimer (Effect): << CONTINUING / RESUMING >> - Checking state.", 'color: orange;');
//          calculatedEndTime = endTimeRef.current; // Try ref first

//          if (!calculatedEndTime) { // Ref lost (likely due to unmount/remount), try localStorage
//              const persistedEndTime = localStorage.getItem(TIMER_STORAGE_KEY);
//              if (persistedEndTime) {
//                  const endTimeMs = parseInt(persistedEndTime, 10);
//                  if (!isNaN(endTimeMs) && endTimeMs > now) { // Validate persisted time
//                      calculatedEndTime = endTimeMs;
//                      endTimeRef.current = calculatedEndTime; // Restore ref
//                      const remaining = Math.max(0, Math.floor((calculatedEndTime - now) / 1000));
//                      setTimeLeft(prev => prev !== remaining ? remaining : prev); // Sync display
//                  } else { // Persisted time is invalid or in the past
//                       console.warn('%cCountdownTimer (Effect - Resume): Stale/invalid storage found - Starting FRESH instead.', 'color: red;');
//                      localStorage.removeItem(TIMER_STORAGE_KEY); // Clean up bad value
//                      calculatedEndTime = now + durationSeconds * 1000;
//                      endTimeRef.current = calculatedEndTime;
//                      localStorage.setItem(TIMER_STORAGE_KEY, calculatedEndTime.toString());
//                      setTimeLeft(durationSeconds); // Reset display
//                      hasEndedRef.current = false;
//                  }
//              } else { // No ref and no storage found
//                   console.warn('%cCountdownTimer (Effect - Resume): No ref, no storage - Starting FRESH.', 'color: red;');
//                  calculatedEndTime = now + durationSeconds * 1000;
//                  endTimeRef.current = calculatedEndTime;
//                  localStorage.setItem(TIMER_STORAGE_KEY, calculatedEndTime.toString());
//                  setTimeLeft(durationSeconds); // Reset display
//                  hasEndedRef.current = false;
//              }
//          } else { // Had a valid endTimeRef
//               const remaining = Math.max(0, Math.floor((calculatedEndTime - now) / 1000));
//               setTimeLeft(prev => prev !== remaining ? remaining : prev); // Ensure display sync
//           }
//       }

//       // --- Start/Manage Interval ---
//       if (timerRef.current === null && calculatedEndTime && calculatedEndTime > now && !hasEndedRef.current) {
//           // console.log('%cCountdownTimer (Effect): Starting interval loop.', 'color: purple');
//           timerRef.current = setInterval(() => {
//               if (!endTimeRef.current || hasEndedRef.current) { // Safety check
//                   clearTimerInterval(); return;
//               }
//               const intervalNow = Date.now();
//               const remaining = Math.max(0, Math.floor((endTimeRef.current - intervalNow) / 1000));
//               setTimeLeft(remaining); // Update display every second

//               if (remaining <= 0 && !hasEndedRef.current) { // Check if time ran out
//                    console.log('%cCountdownTimer (Interval): Time ended naturally.', 'color: red; font-weight: bold;');
//                   hasEndedRef.current = true;
//                   clearTimerInterval();
//                   localStorage.removeItem(TIMER_STORAGE_KEY);
//                   onEndRef.current();
//               }
//           }, 1000);
//       } else if (calculatedEndTime && calculatedEndTime <= now && !hasEndedRef.current) { // Edge case: Ended before interval start
//            console.warn('%cCountdownTimer (Effect): Time already ended before interval could start.', 'color: red;');
//            hasEndedRef.current = true;
//            localStorage.removeItem(TIMER_STORAGE_KEY);
//            onEndRef.current();
//        }

//     // --- Case 2: Timer should be INACTIVE ---
//     } else {
//         const wasPreviouslyActive = prevIsActiveRef.current; // Check the state from the *previous* render
//          // console.log(`%cCountdownTimer (Effect): INACTIVE. Was previously active? ${wasPreviouslyActive}`, 'color: blue');
//          if (wasPreviouslyActive) { // --- Subcase 2.A: Just deactivated ---
//              console.log("%cCountdownTimer (Effect): << JUST DEACTIVATED >> - Cleaning up state and storage.", 'color: red; font-weight: bold;');
//              clearTimerInterval(); // Stop any running interval
//              setTimeLeft(durationSeconds); // Reset display
//              endTimeRef.current = null; // Clear internal end time state
//              hasEndedRef.current = false; // Reset ended flag
//              localStorage.removeItem(TIMER_STORAGE_KEY); // CRITICAL: Clear storage
//              console.log("%cCountdownTimer (Effect): localStorage CLEARED due to deactivation.", 'color: red;');
//          }
//          // If it was already inactive (Subcase 2.B), no action needed.
//     }

//     // Update the ref *after* all logic for the current render cycle
//     prevIsActiveRef.current = isActive;

//     // --- Effect Cleanup Function ---
//     return () => {
//        // console.log("%cCountdownTimer: Effect cleanup running (unmount or deps change).", 'color: grey');
//       clearTimerInterval(); // Always clear interval on cleanup
//     };
//   }, [isActive, durationSeconds]); // Dependencies: Effect re-runs if isActive or durationSeconds changes.


//   // --- Effect for Tab Visibility ---
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (!document.hidden && isActive && endTimeRef.current && !hasEndedRef.current) {
//         const now = Date.now();
//         const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
//         setTimeLeft(remaining); // Sync display immediately
//          // console.log(`%cCountdownTimer (Visibility): Tab visible, syncing time: ${remaining}`, 'color: cyan');

//         if (remaining <= 0) { // Check if time ended while hidden
//            console.warn('%cCountdownTimer (Visibility): Time ended while tab was hidden.', 'color: red;');
//            hasEndedRef.current = true; // Mark as ended

//            // *** CORRECTED: Use global clearInterval with the ref ***
//            if (timerRef.current) {
//                clearInterval(timerRef.current); // Use global clearInterval
//                timerRef.current = null;         // Clear the ref after stopping
//                 console.log('%cCountdownTimer (Visibility): Interval cleared due to ending while hidden.', 'color: red;');
//            }

//            localStorage.removeItem(TIMER_STORAGE_KEY); // Clean storage
//             console.log('%cCountdownTimer (Visibility): Cleared storage due to ending while hidden.', 'color: red;');
//            onEndRef.current(); // Trigger end callback
//         }
//       }
//     };

//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     // console.log("%cCountdownTimer: Visibility listener attached.", 'color: blue');
//     return () => {
//       document.removeEventListener('visibilitychange', handleVisibilityChange);
//       // console.log("%cCountdownTimer: Visibility listener removed.", 'color: blue');
//     };
//   }, [isActive]); // Re-attach listener if isActive prop changes


//   // --- Formatting and Rendering ---
//   const minutes = Math.floor(timeLeft / 60);
//   const seconds = timeLeft % 60;
//   const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   const initialDuration = durationMinutes * 60;
//   const percentage = initialDuration > 0 ? Math.min(100, Math.max(0, (timeLeft / initialDuration) * 100)) : 0;

//   // console.log(`%cCountdownTimer (Render): timeLeft=${timeLeft}, formatted=${formattedTime}, percentage=${percentage}, isActive=${isActive}`, 'color: black');

//   return (
//     <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-foreground border shadow-sm">
//       <Clock className="h-3.5 w-3.5 text-muted-foreground" />
//       <div>
//         {/* SVG Progress Ring */}
//         <svg className="w-4 h-4 -ml-0.5 mr-1 inline align-middle" viewBox="0 0 36 36">
//           <path
//             className="stroke-muted-foreground/30 fill-none"
//             strokeWidth="3"
//             d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//           />
//           <path
//             className="stroke-primary fill-none"
//             strokeWidth="3"
//             strokeDasharray={`${percentage}, 100`}
//             strokeLinecap="round"
//             d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
//             style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }}
//           />
//         </svg>
//         {/* Formatted Time */}
//         <span className="align-middle">{formattedTime}</span>
//       </div>
//     </div>
//   );
// };

// export default CountdownTimer;

//3rd try 
// import React, { useState, useEffect, useRef } from 'react';
// import { Clock } from 'lucide-react';

// interface CountdownTimerProps {
//   durationMinutes: number;
//   onEnd: () => void;
//   isActive: boolean; // Controls whether the timer should be running
// }

// const TIMER_STORAGE_KEY = 'uniqueConversationEndTime_v6'; // Version bump

// const CountdownTimer: React.FC<CountdownTimerProps> = ({ durationMinutes, onEnd, isActive }) => {
//   const durationSeconds = durationMinutes * 60;

//   const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);
//   const endTimeRef = useRef<number | null>(null);
//   const timerRef = useRef<NodeJS.Timeout | null>(null);
//   const hasEndedRef = useRef<boolean>(false);
//   const prevIsActiveRef = useRef<boolean>(isActive); // Track previous prop value

//   // Store onEnd in a ref to avoid making the main effect dependent on its identity
//   const onEndRef = useRef(onEnd);
//   useEffect(() => {
//     onEndRef.current = onEnd;
//   }, [onEnd]);

//   // --- Clear Interval Helper ---
//   const clearTimerInterval = () => {
//       if (timerRef.current) {
//           clearInterval(timerRef.current);
//           timerRef.current = null;
//           console.log("%cFUNC: clearTimerInterval() called", 'color: #aaa');
//       }
//   };

//   // --- Main Timer Effect ---
//   useEffect(() => {
//     const wasActive = prevIsActiveRef.current;
//     console.log(`%cEFFECT RUN: isActive=${isActive}, wasActive=${wasActive}, timerRef=${timerRef.current}`, 'color: blue; font-size: 14px');

//     // --- Case 1: Timer SHOULD be ACTIVE ---
//     if (isActive) {
//       let targetEndTime: number | null = null;

//       // --- Subcase 1.A: JUST ACTIVATED (transition from inactive to active) ---
//       if (!wasActive) {
//         console.log("%cEFFECT: << ACTIVATING >> - Starting FRESH.", 'color: green; font-weight: bold;');
//         clearTimerInterval(); // Clear any remnants
//         localStorage.removeItem(TIMER_STORAGE_KEY); // Ensure clean storage start
//         hasEndedRef.current = false; // Reset ended state

//         const now = Date.now();
//         targetEndTime = now + durationSeconds * 1000;
//         endTimeRef.current = targetEndTime;
//         localStorage.setItem(TIMER_STORAGE_KEY, targetEndTime.toString());
//         setTimeLeft(durationSeconds); // Set visual state to full duration

//         console.log(`%cEFFECT: Set New EndTime = ${new Date(targetEndTime)}`, 'color: green');

//       // --- Subcase 1.B: CONTINUING / RESUMING (was already active) ---
//       } else {
//          console.log("%cEFFECT: << CONTINUING/RESUMING >>", 'color: orange;');
//          // If interval is NOT running (e.g., after remount/refresh), try to establish end time
//          if (timerRef.current === null && !hasEndedRef.current) {
//              console.log("%cEFFECT - Resume: No interval running. Checking state...", 'color: orange;');
//              targetEndTime = endTimeRef.current; // Try ref first

//              if (!targetEndTime) { // Ref lost? Try storage.
//                  const persisted = localStorage.getItem(TIMER_STORAGE_KEY);
//                  if (persisted) {
//                      const timeMs = parseInt(persisted, 10);
//                      const now = Date.now();
//                      if (!isNaN(timeMs) && timeMs > now) {
//                          targetEndTime = timeMs;
//                          endTimeRef.current = targetEndTime; // Restore ref
//                          console.log(`%cEFFECT - Resume: Restored from Storage: ${new Date(targetEndTime)}`, 'color: orange');
//                          // Sync display immediately based on restored time
//                          const remaining = Math.max(0, Math.floor((targetEndTime - now) / 1000));
//                          setTimeLeft(remaining);
//                      } else {
//                          console.warn("%cEFFECT - Resume: Invalid/Past Storage! Resetting.", 'color: red;');
//                          localStorage.removeItem(TIMER_STORAGE_KEY);
//                          // Force a fresh start state if storage was bad
//                          targetEndTime = Date.now() + durationSeconds * 1000;
//                          endTimeRef.current = targetEndTime;
//                          localStorage.setItem(TIMER_STORAGE_KEY, targetEndTime.toString());
//                          setTimeLeft(durationSeconds);
//                          hasEndedRef.current = false;
//                      }
//                  } else {
//                       console.warn("%cEFFECT - Resume: No Ref, No Storage! Resetting.", 'color: red;');
//                       // If active but no state found, force a fresh start
//                       targetEndTime = Date.now() + durationSeconds * 1000;
//                       endTimeRef.current = targetEndTime;
//                       localStorage.setItem(TIMER_STORAGE_KEY, targetEndTime.toString());
//                       setTimeLeft(durationSeconds);
//                       hasEndedRef.current = false;
//                   }
//              } else {
//                  // Had endTimeRef, ensure display is synced (might be redundant but safe)
//                   const now = Date.now();
//                   const remaining = Math.max(0, Math.floor((targetEndTime - now) / 1000));
//                   setTimeLeft(remaining);
//                   console.log("%cEFFECT - Continue: Had endTimeRef. Synced display.", 'color: orange;');
//               }
//          } else {
//              // Interval is already running OR timer has ended - do nothing here
//               // console.log("%cEFFECT - Continue: Interval running or ended. No resume action.", 'color: #aaa');
//              targetEndTime = endTimeRef.current; // Use the known end time
//           }
//       }

//       // --- Start Interval Logic (Common for Activation & Resume if needed) ---
//       // Only start if: not already running, have a valid future end time, hasn't ended
//       if (timerRef.current === null && targetEndTime && targetEndTime > Date.now() && !hasEndedRef.current) {
//         console.log(`%cEFFECT: Starting Interval Loop. Target End: ${new Date(targetEndTime)}`, 'color: purple; font-weight: bold;');
//         timerRef.current = setInterval(() => {
//             // --- Interval Callback ---
//             if (!endTimeRef.current || hasEndedRef.current) { // Safety check
//                 console.warn("Interval: Stopping - Condition met (no end time / ended).");
//                 clearTimerInterval();
//                 return;
//             }

//             const current = Date.now();
//             const remaining = Math.max(0, Math.floor((endTimeRef.current - current) / 1000));

//             // *** Ensure state update happens ***
//             setTimeLeft(remaining);
//              // console.log(`%cINTERVAL TICK: Remaining = ${remaining}`, 'color: purple'); // Verbose

//             if (remaining <= 0) { // Check end condition
//                 if (!hasEndedRef.current) { // Process end only once
//                     console.log('%cINTERVAL: Time ended!', 'color: red; font-weight: bold;');
//                     hasEndedRef.current = true;
//                     clearTimerInterval(); // Stop interval
//                     localStorage.removeItem(TIMER_STORAGE_KEY); // Clean storage
//                     onEndRef.current(); // Call parent callback
//                 }
//             }
//             // --- End Interval Callback ---
//         }, 1000); // Run every second
//       } else if (timerRef.current === null && targetEndTime && targetEndTime <= Date.now()) {
//            // Handle edge case where calculated end time is already past when effect runs
//            console.warn('%cEFFECT: Target time already past before interval start.', 'color: orange');
//            if (!hasEndedRef.current) {
//                hasEndedRef.current = true;
//                localStorage.removeItem(TIMER_STORAGE_KEY);
//                onEndRef.current();
//            }
//        }

//     // --- Case 2: Timer SHOULD be INACTIVE ---
//     } else {
//         // --- Subcase 2.A: JUST DEACTIVATED (transition from active to inactive) ---
//         if (wasActive) {
//             console.log("%cEFFECT: << DEACTIVATING >> - Cleaning up.", 'color: red; font-weight: bold;');
//             clearTimerInterval(); // Stop interval
//             localStorage.removeItem(TIMER_STORAGE_KEY); // Clear storage
//             endTimeRef.current = null; // Clear ref
//             hasEndedRef.current = false; // Reset ended state
//             setTimeLeft(durationSeconds); // Reset display
//         }
//         // --- Subcase 2.B: STILL INACTIVE (was already inactive) ---
//         // No action needed here. State should already be clean or default.
//     }

//     // Update previous state ref for the *next* effect run
//     prevIsActiveRef.current = isActive;

//     // --- Effect Cleanup ---
//     return () => {
//        console.log("%cEFFECT CLEANUP: Running.", 'color: grey');
//        // This ALWAYS runs before the effect runs again OR on unmount.
//        // Crucially, clear the interval here to prevent duplicates or leaks.
//        clearTimerInterval();
//     };
//   }, [isActive, durationSeconds]); // Effect dependencies


//   // --- Visibility Change Handler ---
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       // Only process if tab becomes visible
//       if (!document.hidden) {
//            console.log(`%cVISIBILITY CHANGE: Tab visible. isActive=${isActive}, hasEnded=${hasEndedRef.current}, endTimeRef=${endTimeRef.current ? new Date(endTimeRef.current) : 'null'}`, 'color: cyan');
//            // Only sync if timer should be active, has an end time, and hasn't already ended
//            if (isActive && endTimeRef.current && !hasEndedRef.current) {
//                const now = Date.now();
//                const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
//                console.log(`%cVISIBILITY: Syncing time to ${remaining}`, 'color: cyan');
//                setTimeLeft(remaining); // Sync display immediately

//                if (remaining <= 0) { // Time ended while hidden
//                    console.warn('%cVISIBILITY: Time ended while hidden.', 'color: red;');
//                    hasEndedRef.current = true;
//                    clearTimerInterval(); // Ensure interval is stopped
//                    localStorage.removeItem(TIMER_STORAGE_KEY);
//                    onEndRef.current();
//                }
//            }
//        }
//     };
//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
//   }, [isActive]); // Dependency only on isActive


//   // --- Formatting & Rendering ---
//   const minutes = Math.floor(timeLeft / 60);
//   const seconds = timeLeft % 60;
//   const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   const initialDuration = durationMinutes * 60;
//   const percentage = initialDuration > 0 ? Math.min(100, Math.max(0, (timeLeft / initialDuration) * 100)) : 0;

//   return (
//     <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-foreground border shadow-sm">
//       <Clock className="h-3.5 w-3.5 text-muted-foreground" />
//       <div>
//         <svg className="w-4 h-4 -ml-0.5 mr-1 inline align-middle" viewBox="0 0 36 36">
//           <path className="stroke-muted-foreground/30 fill-none" strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
//           <path className="stroke-primary fill-none" strokeWidth="3" strokeDasharray={`${percentage}, 100`} strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
//         </svg>
//         <span className="align-middle">{formattedTime}</span>
//       </div>
//     </div>
//   );
// };

// export default CountdownTimer;

//4th timer
// import React, { useState, useEffect, useRef } from 'react';
// import { Clock } from 'lucide-react';

// interface CountdownTimerProps {
//   durationMinutes: number;
//   onEnd: () => void;
//   isActive: boolean; // Controls whether the timer should be running
// }

// // Consider making the key specific to the *instance* if multiple timers could exist
// // For now, keeping v6 as per your original code.
// const TIMER_STORAGE_KEY = 'uniqueConversationEndTime_v6';

// const CountdownTimer: React.FC<CountdownTimerProps> = ({ durationMinutes, onEnd, isActive }) => {
//   // Calculate duration in seconds based on the prop
//   const durationSeconds = Math.max(0, Math.floor(durationMinutes * 60));

//   // State for the displayed time left
//   const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);

//   // Refs to manage timer state without causing re-renders on every change
//   const endTimeRef = useRef<number | null>(null); // Stores the absolute timestamp when the timer should end
//   const timerRef = useRef<NodeJS.Timeout | null>(null); // Holds the interval ID
//   const hasEndedRef = useRef<boolean>(false); // Tracks if onEnd has been called
//   const prevIsActiveRef = useRef<boolean>(isActive); // Tracks the previous value of isActive
//   const prevDurationSecondsRef = useRef<number>(durationSeconds); // Tracks the previous duration

//   // Ref for the onEnd callback to avoid dependency issues in the main effect
//   const onEndRef = useRef(onEnd);
//   useEffect(() => {
//     onEndRef.current = onEnd;
//   }, [onEnd]);

//   // --- Helper Function: Clear Interval ---
//   const clearTimerInterval = () => {
//     if (timerRef.current) {
//       clearInterval(timerRef.current);
//       timerRef.current = null;
//       console.log("%cFUNC: clearTimerInterval() called", 'color: #aaa');
//     }
//   };

//   // --- Helper Function: Reset Timer State (Internal & Visual) ---
//   // This is called when stopping or when needing a completely fresh start
//   const resetTimerState = (currentDurationSecs: number) => {
//     console.log(`%cFUNC: resetTimerState(duration=${currentDurationSecs}) called`, 'color: #f5a623');
//     clearTimerInterval();
//     localStorage.removeItem(TIMER_STORAGE_KEY);
//     endTimeRef.current = null;
//     hasEndedRef.current = false;
//     setTimeLeft(currentDurationSecs); // Reset display to the *current* full duration
//   }

//   // --- Main Timer Logic Effect ---
//   useEffect(() => {
//     const wasActive = prevIsActiveRef.current;
//     const durationChanged = durationSeconds !== prevDurationSecondsRef.current;

//     console.log(`%cEFFECT RUN: isActive=${isActive}, wasActive=${wasActive}, durationChanged=${durationChanged}, currentDuration=${durationSeconds}s`, 'color: blue; font-size: 14px');

//     // --- Case 1: Timer should be ACTIVE ---
//     if (isActive) {
//       let needsFreshStart = false;
//       let targetEndTime: number | null = null;

//       // --- Subcase 1.A: Needs a FRESH START ---
//       // This happens if:
//       //   - It just became active (!wasActive)
//       //   - Or, the duration prop changed while it was already active
//       if (!wasActive || (wasActive && durationChanged)) {
//           if (!wasActive) console.log("%cEFFECT: << ACTIVATING >> - Starting FRESH.", 'color: green; font-weight: bold;');
//           if (wasActive && durationChanged) console.log("%cEFFECT: << DURATION CHANGED >> - Restarting FRESH.", 'color: purple; font-weight: bold;');
//           needsFreshStart = true;
//       }
//       // --- Subcase 1.B: CONTINUING / RESUMING (Active, was active, duration same) ---
//       else {
//           // This runs if component remounts while active, or tab becomes visible etc.
//           // We only need to *potentially* restart the interval if it's not already running.
//           if (timerRef.current === null && !hasEndedRef.current) {
//               console.log("%cEFFECT: << CONTINUING/RESUMING >> - Interval check needed.", 'color: orange;');
//               targetEndTime = endTimeRef.current; // Try ref first (most reliable if component didn't unmount)

//               // If ref lost (e.g. remount), try storage
//               if (!targetEndTime) {
//                   const persisted = localStorage.getItem(TIMER_STORAGE_KEY);
//                   const now = Date.now();
//                   if (persisted) {
//                       const timeMs = parseInt(persisted, 10);
//                       if (!isNaN(timeMs) && timeMs > now) {
//                           targetEndTime = timeMs;
//                           endTimeRef.current = targetEndTime; // Restore ref
//                           console.log(`%cEFFECT - Resume: Restored from Storage: ${new Date(targetEndTime)}`, 'color: orange');
//                           // Sync display immediately
//                           const remaining = Math.max(0, Math.floor((targetEndTime - now) / 1000));
//                           setTimeLeft(remaining);
//                           // If time ran out while stored/hidden, end it now
//                           if (remaining <= 0 && !hasEndedRef.current) {
//                               console.warn('%cEFFECT - Resume: Time ended based on storage.', 'color: red;');
//                               hasEndedRef.current = true;
//                               localStorage.removeItem(TIMER_STORAGE_KEY); // Clean storage
//                               onEndRef.current(); // Call parent callback
//                               // No need to start interval
//                           }
//                       } else {
//                           console.warn("%cEFFECT - Resume: Invalid/Past Storage! Resetting.", 'color: red;');
//                           needsFreshStart = true; // Force a fresh start
//                       }
//                   } else {
//                       console.warn("%cEFFECT - Resume: No Ref, No Storage! Resetting.", 'color: red;');
//                       needsFreshStart = true; // Force a fresh start
//                   }
//               } else {
//                   // Had endTimeRef, ensure display is synced
//                    const now = Date.now();
//                    const remaining = Math.max(0, Math.floor((targetEndTime - now) / 1000));
//                    setTimeLeft(remaining);
//                    console.log("%cEFFECT - Continue: Had endTimeRef. Synced display.", 'color: orange;');
//                    // If time ran out while hidden/inactive interval, end it now
//                    if (remaining <= 0 && !hasEndedRef.current) {
//                       console.warn('%cEFFECT - Continue: Time ended based on ref.', 'color: red;');
//                       hasEndedRef.current = true;
//                       localStorage.removeItem(TIMER_STORAGE_KEY);
//                       onEndRef.current();
//                        // No need to start interval
//                    }
//                }
//           } else {
//               // Interval is already running or timer has ended, do nothing here
//               // console.log("%cEFFECT - Continue: Interval running or ended. No action.", 'color: #aaa');
//               targetEndTime = endTimeRef.current; // Keep existing target
//           }
//       }

//       // --- Perform Fresh Start (if needed) ---
//       if (needsFreshStart) {
//           resetTimerState(durationSeconds); // Clear everything and reset display
//           const now = Date.now();
//           targetEndTime = now + durationSeconds * 1000;
//           endTimeRef.current = targetEndTime;
//           localStorage.setItem(TIMER_STORAGE_KEY, targetEndTime.toString());
//           console.log(`%cEFFECT: Set New EndTime = ${new Date(targetEndTime)}`, 'color: green');
//       }

//       // --- Start/Manage Interval ---
//       // Only start if: not already running, have a valid future end time, hasn't ended
//       if (timerRef.current === null && targetEndTime && targetEndTime > Date.now() && !hasEndedRef.current) {
//           console.log(`%cEFFECT: Starting Interval Loop. Target End: ${new Date(targetEndTime)}`, 'color: purple; font-weight: bold;');
//           timerRef.current = setInterval(() => {
//               // Interval Callback
//               const currentEndTime = endTimeRef.current; // Use ref value inside interval
//               if (!currentEndTime || hasEndedRef.current) { // Safety checks
//                   console.warn("Interval: Stopping - No end time or already ended.");
//                   clearTimerInterval();
//                   return;
//               }

//               const now = Date.now();
//               const remaining = Math.max(0, Math.floor((currentEndTime - now) / 1000));
//               setTimeLeft(remaining); // Update display

//               if (remaining <= 0) {
//                   if (!hasEndedRef.current) { // Prevent multiple calls
//                       console.log('%cINTERVAL: Time ended!', 'color: red; font-weight: bold;');
//                       hasEndedRef.current = true;
//                       clearTimerInterval();
//                       localStorage.removeItem(TIMER_STORAGE_KEY);
//                       onEndRef.current();
//                   } else {
//                       // Already ended, but interval somehow still ran? Clear it.
//                       clearTimerInterval();
//                   }
//               }
//           }, 1000);
//       } else if (timerRef.current === null && targetEndTime && targetEndTime <= Date.now() && !hasEndedRef.current) {
//             // Edge case: Calculated end time is already past when this effect logic runs
//             console.warn('%cEFFECT: Target time already past before interval start.', 'color: orange');
//             hasEndedRef.current = true;
//             localStorage.removeItem(TIMER_STORAGE_KEY);
//             onEndRef.current();
//       }

//     // --- Case 2: Timer should be INACTIVE ---
//     } else {
//         // --- Subcase 2.A: JUST DEACTIVATED (transition from active to inactive) ---
//         if (wasActive) {
//             console.log("%cEFFECT: << DEACTIVATING >> - Resetting state.", 'color: red; font-weight: bold;');
//             resetTimerState(durationSeconds); // Use the helper to clean up and reset display
//         }
//         // --- Subcase 2.B: STILL INACTIVE (or duration changed while inactive) ---
//         else if (!wasActive && durationChanged) {
//              console.log("%cEFFECT: << INACTIVE DURATION CHANGE >> - Updating initial time.", 'color: #f5a623;');
//              // Just update the display to reflect the new potential start time
//              setTimeLeft(durationSeconds);
//         }
//     }

//     // --- Update Refs for Next Render ---
//     prevIsActiveRef.current = isActive;
//     prevDurationSecondsRef.current = durationSeconds;

//     // --- Effect Cleanup ---
//     // This ALWAYS runs before the effect runs again OR on unmount.
//     // Crucially, clear the interval here to prevent leaks.
//     return () => {
//       console.log("%cEFFECT CLEANUP: Running.", 'color: grey');
//       clearTimerInterval();
//     };
//     // Dependencies: Trigger effect if isActive or durationMinutes (-> durationSeconds) changes.
//   }, [isActive, durationSeconds]);


//   // --- Visibility Change Handler ---
//   // This handles the case where the tab is hidden and then shown again.
//   // It ensures the displayed time is accurate based on the stored end time.
//   useEffect(() => {
//     const handleVisibilityChange = () => {
//       if (!document.hidden) {
//            console.log(`%cVISIBILITY CHANGE: Tab visible. isActive=${isActive}, hasEnded=${hasEndedRef.current}, endTimeRef=${endTimeRef.current ? new Date(endTimeRef.current) : 'null'}`, 'color: cyan');
//            // Only sync if timer SHOULD be active, HAS an end time, and HASN'T already ended
//            if (isActive && endTimeRef.current && !hasEndedRef.current) {
//                const now = Date.now();
//                const remaining = Math.max(0, Math.floor((endTimeRef.current - now) / 1000));
//                console.log(`%cVISIBILITY: Syncing time to ${remaining}`, 'color: cyan');
//                setTimeLeft(remaining); // Sync display immediately

//                // Check if time ended while hidden and trigger end logic
//                if (remaining <= 0) {
//                    console.warn('%cVISIBILITY: Time ended while hidden.', 'color: red;');
//                    hasEndedRef.current = true; // Mark as ended
//                    clearTimerInterval();       // Ensure interval is stopped if it was running
//                    localStorage.removeItem(TIMER_STORAGE_KEY); // Clean storage
//                    onEndRef.current();         // Call the callback
//                }
//                // **Important**: We don't restart the *interval* here. The main effect
//                // handles restarting the interval if needed (e.g., after a resume).
//                // This handler just syncs the *display*.
//            }
//        }
//     };
//     document.addEventListener('visibilitychange', handleVisibilityChange);
//     return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
//   }, [isActive]); // Depends only on isActive (and implicitly on refs)


//   // --- Formatting & Rendering ---
//   const minutes = Math.floor(timeLeft / 60);
//   const seconds = timeLeft % 60;
//   const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
//   const initialDurationForPercentage = prevDurationSecondsRef.current > 0 ? prevDurationSecondsRef.current : durationSeconds; // Use last known good duration for percentage calc
//   const percentage = initialDurationForPercentage > 0 ? Math.min(100, Math.max(0, (timeLeft / initialDurationForPercentage) * 100)) : 0;

//   return (
//     <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-foreground border shadow-sm">
//       <Clock className="h-3.5 w-3.5 text-muted-foreground" />
//       <div>
//         <svg className="w-4 h-4 -ml-0.5 mr-1 inline align-middle" viewBox="0 0 36 36">
//           <path className="stroke-muted-foreground/30 fill-none" strokeWidth="3" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
//           <path className="stroke-primary fill-none" strokeWidth="3" strokeDasharray={`${percentage}, 100`} strokeLinecap="round" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" style={{ transform: 'rotate(-90deg)', transformOrigin: 'center' }} />
//         </svg>
//         <span className="align-middle">{formattedTime}</span>
//       </div>
//     </div>
//   );
// };

// export default CountdownTimer;

//5th try 
import React, { useState, useEffect, useRef } from "react";
import { Clock } from "lucide-react";

interface CountdownTimerProps {
  durationMinutes: number;
  onEnd: () => void;
  isActive: boolean;
}

const TIMER_STORAGE_KEY = "uniqueConversationEndTime_v6";

const CountdownTimer: React.FC<CountdownTimerProps> = ({
  durationMinutes,
  onEnd,
  isActive,
}) => {
  const durationSeconds = Math.max(0, Math.floor(durationMinutes * 60));
  const [timeLeft, setTimeLeft] = useState<number>(durationSeconds);

  /* ───── refs that shouldn’t cause re‑render ───── */
  const endTimeRef = useRef<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const hasEndedRef = useRef(false);

  /*  🚨 KEY FIX: start as “previously inactive” so first activation is fresh */
  const prevIsActiveRef = useRef(false);
  const prevDurationSecondsRef = useRef(durationSeconds);

  /* keep latest onEnd without effect deps hell */
  const onEndRef = useRef(onEnd);
  useEffect(() => {
    onEndRef.current = onEnd;
  }, [onEnd]);

  /* helper */
  const clearTimerInterval = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };
  const resetTimerState = (currentDurationSecs: number) => {
    clearTimerInterval();
    localStorage.removeItem(TIMER_STORAGE_KEY);
    endTimeRef.current = null;
    hasEndedRef.current = false;
    setTimeLeft(currentDurationSecs);
  };

  /* ───── main effect ───── */
  useEffect(() => {
    const wasActive = prevIsActiveRef.current;
    const durationChanged =
      durationSeconds !== prevDurationSecondsRef.current;

    /* ── ACTIVE ──────────────────────────────── */
    if (isActive) {
      let needsFreshStart = false;
      let targetEndTime: number | null = null;

      if (!wasActive || durationChanged) needsFreshStart = true;

      /* resume path */
      if (!needsFreshStart) {
        targetEndTime = endTimeRef.current;
        if (!targetEndTime) {
          const persisted = localStorage.getItem(TIMER_STORAGE_KEY);
          if (persisted && !isNaN(+persisted) && +persisted > Date.now()) {
            targetEndTime = +persisted;
            endTimeRef.current = targetEndTime;
          } else {
            needsFreshStart = true;
          }
        }
      }

      /* fresh start branch */
      if (needsFreshStart) {
        resetTimerState(durationSeconds);
        targetEndTime = Date.now() + durationSeconds * 1000;
        endTimeRef.current = targetEndTime;
        localStorage.setItem(TIMER_STORAGE_KEY, targetEndTime.toString());
      }

      /* make sure an interval is running */
      if (
        timerRef.current === null &&
        targetEndTime &&
        targetEndTime > Date.now() &&
        !hasEndedRef.current
      ) {
        timerRef.current = setInterval(() => {
          const now = Date.now();
          const remaining = Math.max(
            0,
            Math.floor(((endTimeRef.current ?? now) - now) / 1000)
          );
          setTimeLeft(remaining);
          if (remaining <= 0 && !hasEndedRef.current) {
            hasEndedRef.current = true;
            clearTimerInterval();
            localStorage.removeItem(TIMER_STORAGE_KEY);
            onEndRef.current();
          }
        }, 1000);
      }
    }
    /* ── INACTIVE ─────────────────────────────── */
    else if (wasActive) {
      resetTimerState(durationSeconds);
    } else if (!wasActive && durationChanged) {
      setTimeLeft(durationSeconds);
    }

    /* remember for next run */
    prevIsActiveRef.current = isActive;
    prevDurationSecondsRef.current = durationSeconds;

    /* cleanup (also runs on unmount) */
    return () => {
      clearTimerInterval();
      /* extra safety: wipe persisted end‑time when component unmounts */
      if (!isActive) localStorage.removeItem(TIMER_STORAGE_KEY);
    };
  }, [isActive, durationSeconds]);

  /* sync when tab becomes visible */
  useEffect(() => {
    const vis = () => {
      if (!document.hidden && isActive && endTimeRef.current) {
        const remaining = Math.max(
          0,
          Math.floor((endTimeRef.current - Date.now()) / 1000)
        );
        setTimeLeft(remaining);
        if (remaining <= 0 && !hasEndedRef.current) {
          hasEndedRef.current = true;
          clearTimerInterval();
          localStorage.removeItem(TIMER_STORAGE_KEY);
          onEndRef.current();
        }
      }
    };
    document.addEventListener("visibilitychange", vis);
    return () => document.removeEventListener("visibilitychange", vis);
  }, [isActive]);

  /* ───── render ───── */
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formatted = `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`;
  const pct =
    durationSeconds > 0
      ? Math.min(100, Math.max(0, (timeLeft / durationSeconds) * 100))
      : 0;

  return (
    <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-full px-2 py-1 text-xs font-medium text-foreground border shadow-sm">
      <Clock className="h-3.5 w-3.5 text-muted-foreground" />
      <div>
        <svg
          className="w-4 h-4 -ml-0.5 mr-1 inline align-middle"
          viewBox="0 0 36 36"
        >
          <path
            className="stroke-muted-foreground/30 fill-none"
            strokeWidth="3"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className="stroke-primary fill-none"
            strokeWidth="3"
            strokeDasharray={`${pct}, 100`}
            strokeLinecap="round"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            style={{ transform: "rotate(-90deg)", transformOrigin: "center" }}
          />
        </svg>
        <span className="align-middle">{formatted}</span>
      </div>
    </div>
  );
};

export default CountdownTimer;
