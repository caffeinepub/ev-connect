# EV Connect

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- EV car registration: each car registers with a nickname, car model, and current battery level
- Live nearby cars list: shows other registered EVs currently "on the road" with their battery level and status
- Low battery alert system: when a car's battery drops below a threshold (20%), it broadcasts a low-battery alert visible to all nearby cars
- Car-to-car messaging: drivers can send short text messages to other specific cars or broadcast to all nearby
- Battery level updater: simple control for driver to update their current battery percentage
- Status indicator: online/driving/parked status per car
- Alert feed: real-time feed of low battery alerts from nearby cars

### Modify
- N/A (new project)

### Remove
- N/A (new project)

## Implementation Plan
1. Backend (Motoko):
   - Data types: Car profile (id, nickname, model, battery %, status, last updated)
   - Register/update car profile
   - Update battery level
   - Get all active cars
   - Send message to a car or broadcast
   - Get messages/alerts for a car
   - Low battery alert: triggered automatically when battery is updated to <= 20%
   - Get alert feed

2. Frontend:
   - Onboarding screen: register car (nickname, model)
   - Dashboard: shows own car stats + battery level slider/input
   - Nearby cars panel: list of all connected EVs with battery indicators
   - Alert banner: prominent warning when own battery is low or nearby car sends alert
   - Messages panel: send and receive messages from other cars
   - Alert feed: scrollable list of recent low-battery broadcasts
   - Simple mobile-friendly layout (easy to use while in a car)
