let initialSplashComplete = false;

export function hasCompletedInitialSplash() {
  return initialSplashComplete;
}

export function markInitialSplashComplete() {
  initialSplashComplete = true;
}
