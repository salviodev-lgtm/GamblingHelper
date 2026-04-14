# Changelog

All notable changes to this application will be documented in this file.

## [0.0.4] - 2026-04-14

### Added
- **Keyboard Scrolling**: Added KeyboardAvoidingView to all screens with text inputs (Custom Game modal, Characters screen, Coin Flip, Dice Roll, Roulette, Random Picker). When the keyboard opens, the view is pushed up so users can see what they're typing.
- **New Meme Phrase**: Added "ADESSO PAGO IO" to the achievement popup meme phrases

### Changed
- **Reduced Header Margins**: Moved title text closer to the top of the screen on the main menu (GAMBLING HELPER) and Roulette screen for a more compact layout

## [0.0.3] - 2026-04-14

### Added
- **Meme Phrases in Achievement Popup**: The achievement popup now displays random meme phrases instead of "ACHIEVEMENT UNLOCKED!". Phrases include: "AFAMMOKK!", "blud caccia i soldi", "meglio che non venivi", "VERAMENTE?!", "TUNGTUNGTUNGTUNG", "BRR BRR PATAPIM"
- **Screen Transition Animation**: Added smooth slide-from-right animation when navigating between screens
- **Dark Background for Transitions**: Wrapped Stack navigator in dark container to prevent white flash during back navigation

### Fixed
- **Babel Configuration**: Created babel.config.js with react-native-reanimated plugin for proper animation support

## [0.0.2] - 2026-04-14

### Fixed
- **Roulette Normal Mode - Payout Screen Skipped**: Fixed issue where the payout screen was being skipped after spinning. The AchievementPopup auto-hide was incorrectly unmounting the payout UI. Now uses separate state for popup visibility vs payout screen.
- **Roulette Eliminazione Mode - Buttons Not Working**: Fixed issue where EXIT and CONFIRM buttons didn't work on the final payout screen. The AchievementPopup was remaining mounted invisibly and blocking touch events due to improper onHide handler. Now properly manages popup lifecycle.
- **Persistent Audio Mute State**: Fixed race condition where audio would play even when muted after app restart. Audio now only initializes after mute state is loaded from AsyncStorage, and volume is set correctly from the start.

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
