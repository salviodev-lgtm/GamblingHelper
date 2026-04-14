# Changelog

All notable changes to this application will be documented in this file.

## [0.0.1] - 2026-04-14

### Added
- **Splash Screen**: App now displays a splash screen with the GAMBLING HELPER logo for 2 seconds before transitioning to the main menu
- **Persistent Mute Toggle**: Added a mute button (🔊/🔇) in the top-right corner of the main menu to toggle background music. The mute state is saved and persists across app restarts
- **Dice Roll Countdown**: Reduced countdown duration from 5 seconds to 3 seconds
- **Roulette Animation**: Updated wheel animation to use smooth exponential deceleration (Easing.out) for a more realistic spinning effect
- **App Identity**: 
  - App name changed to "Porcaccio" for the Android launcher
  - Menu wallpaper set as app icon
- **Version Display**: Added version number (v0.0.1) below the GAMBLING HELPER title on the main menu
- **Hidden Header**: Expo-router header band is now hidden on all screens

### Features
- Splash screen with 2-second delay
- Persistent audio mute state (saved to AsyncStorage)
- Smooth roulette wheel deceleration animation
- Delete individual history records
