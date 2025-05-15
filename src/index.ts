// src/index.ts
'use strict';
// Elements declarations
const homepageButton = document.querySelector('.entry_point') as HTMLButtonElement | null;
const homepage = document.querySelector('main') as HTMLElement | null;
const mainRoomsContainer = document.querySelector('.application_container') as HTMLElement | null;
const advanceFeaturesContainer = document.querySelector('.advanced_features_container') as HTMLElement | null;
const nav = document.querySelector('nav') as HTMLElement | null;
const loader = document.querySelector('.loader-container') as HTMLElement | null;
const networkContainer = document.querySelector('.network-container') as HTMLButtonElement | null;
const generalLightSwitch = document.querySelector('.general_light_switch') as HTMLButtonElement | null;
const wifiContainer = document.querySelector('.wifi-container') as HTMLElement | null;
const wifiConnectionList = document.querySelector('.wifi_connection_list_container') as HTMLElement | null;
const wifiNotificationText = document.querySelector('.wifi_notification p') as HTMLElement | null;
const wifiIcon = document.querySelector('.img_svg-container img') as HTMLImageElement | null;


// imports
import Light from './components/basicSettings';
import AdvanceSettings from './components/advanceSettings';
import { WiFiConnection } from './types';


// object creation  
const lightController = new Light();
const advancedSettings = new AdvanceSettings();

// global variables
let isWifiActive: boolean = true;
let currentWifiConnection: WiFiConnection | null = null;
// Function to render WiFi connections
function renderWifiConnections(connections: WiFiConnection[]): void {
    if (!wifiConnectionList) return;
    
    wifiConnectionList.innerHTML = '';
    
    connections.forEach(connection => {
        const wifiItem = document.createElement('p');
        wifiItem.classList.add('wifi_connections_list');
        wifiItem.dataset.id = connection.id.toString();
        wifiItem.dataset.signal = connection.signal;
        wifiItem.innerHTML = `
            ${connection.wifiName}
            <img src="./assets/svgs/wifi.svg" alt="wifi signal strength">
        `;
        
        // Add error handling to the click event
        wifiItem.addEventListener('click', () => {
            connectToWifi(connection)
                .catch(error => {
                    // Error is already handled within connectToWifi
                    console.log(`Connection attempt failed: ${error.message}`);
                });
        });
        
        wifiConnectionList.appendChild(wifiItem);
    });
}
// Function to connect to a WiFi network
async function connectToWifi(connection: WiFiConnection): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        // Check if WiFi is active first
        if (!isWifiActive) {
            if (mainRoomsContainer) {
                lightController.displayNotification(`Cannot connect: WiFi is turned off`, 'beforeend', mainRoomsContainer);
            }
            reject(new Error('WiFi is turned off'));
            return;
        }
        
        // Then check signal strength
        if (connection.signal === 'poor') {
            if (mainRoomsContainer) {
                lightController.displayNotification(`Cannot connect to ${connection.wifiName}: Signal too weak`, 'beforeend', mainRoomsContainer);
            }
            reject(new Error('Poor connection'));
            return;
        }
        
        // Update current connection
        currentWifiConnection = connection;
        
        if (mainRoomsContainer) {
            lightController.displayNotification(`Connected to ${connection.wifiName}`, 'beforeend', mainRoomsContainer);
        }
        
        // Close the WiFi list
        if (wifiConnectionList) {
            lightController.addHidden(wifiConnectionList);
        }
        
        resolve();
    });
}


// Function to toggle WiFi on/off
function toggleWifi(): void {
    isWifiActive = !isWifiActive;
    
    if (wifiIcon) {
        if (isWifiActive) {
            wifiIcon.src = './assets/svgs/wifi.svg';
        } else {
            wifiIcon.src = './assets/svgs/wifi-disconnected.svg';
            currentWifiConnection = null;
        }
    }
    
    if (wifiNotificationText) {
        if (isWifiActive) {
            wifiNotificationText.textContent = 'WiFi connections available';
            lightController.removeHidden(wifiNotificationText);
        } else {
            wifiNotificationText.textContent = 'WiFi is currently not available';
            lightController.removeHidden(wifiNotificationText);
        }
    }
    
    // Display notification
    if (mainRoomsContainer) {
        const message = isWifiActive ? 'WiFi turned on' : 'WiFi turned off';
        lightController.displayNotification(message, 'beforeend', mainRoomsContainer);
    }
    
    // If WiFi is turned off, disable all lights
    if (!isWifiActive) {
        // Display notification about light control being disabled
        if (mainRoomsContainer) {
            lightController.displayNotification('Light control disabled: No WiFi connection', 'beforeend', mainRoomsContainer);
        }
    }
}
// Function to randomize WiFi connection
async function randomizeWiFiConnection(): Promise<void> {
    if (!isWifiActive) return;
    
    const availableConnections = lightController.getWifi().filter(conn => conn.signal !== 'poor');
    if (availableConnections.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * availableConnections.length);
    const newConnection = availableConnections[randomIndex];
    
    // Skip if it's the same as current connection
    if (currentWifiConnection && currentWifiConnection.id === newConnection.id) return;
    
    try {
        await connectToWifi(newConnection);
    } catch (error) {
        console.error('Failed to connect:', error);
        // No need to re-throw - we're already handling the error
    }
}
// Event handlers
// hide homepage after button is clicked
homepageButton?.addEventListener('click', function (e: Event): void {
  if (!homepage || !loader || !mainRoomsContainer || !nav) return;
    lightController.addHidden(homepage);
    lightController.removeHidden(loader);
    
    setTimeout(() => {
        lightController.removeHidden(mainRoomsContainer);
        lightController.removeHidden(nav);
        
        // Initialize with a random WiFi connection
        randomizeWiFiConnection();
        
        // Set up 5-minute interval for WiFi randomization
        setInterval(randomizeWiFiConnection, 5 * 60 * 1000);
    }, 1000);
});
// WiFi container click event
wifiContainer?.addEventListener('click', function(e: Event): void {
    if (!wifiConnectionList) return;
    
    // Toggle WiFi connection list
    lightController.toggleHidden(wifiConnectionList);
    
    // Render connections if visible
    if (!wifiConnectionList.classList.contains('hidden')) {
        renderWifiConnections(lightController.getWifi());
    }
});
// Network container (WiFi toggle) click event
networkContainer?.addEventListener('click', function(e: Event): void {
    toggleWifi();
});
// General light switch click event
generalLightSwitch?.addEventListener('click', function(e: Event): void {
    // Toggle all lights based on current state
    lightController.toggleAllLights(!lightController.isLightOn, isWifiActive);
});
mainRoomsContainer?.addEventListener('click', (e: Event): void => {
  const selectedElement = e.target as HTMLElement;
  // when click occurs on light switch
  const lightSwitch = selectedElement.closest(".light-switch");
  if (lightSwitch) {
    // Check if WiFi is active
    if (!isWifiActive) {
      if (mainRoomsContainer) {
        lightController.displayNotification("Cannot control lights: WiFi is not active", 'beforeend', mainRoomsContainer);
      }
      return;
    }
    
    const buttonsWrapper = lightSwitch.closest(".basic_settings_buttons");
    const switchElement = buttonsWrapper?.firstElementChild as HTMLElement;
    if (switchElement) lightController.toggleLightSwitch(switchElement);
    return;
  }
  // when click occurs on advance modal
  const modal = selectedElement.closest('.advance-settings_modal');
  if (modal) {
    // Check if WiFi is active
    if (!isWifiActive) {
      if (mainRoomsContainer) {
        lightController.displayNotification("Cannot access settings: WiFi is not active", 'beforeend', mainRoomsContainer);
      }
      return;
    }
    
    advancedSettings.modalPopUp(modal as HTMLElement);
  }
  
  // Close notification if clicked
  if (selectedElement.closest('.close-notification')) {
    const notification = selectedElement.closest('.notification');
    if (notification) {
      notification.remove();
    }
  }
});
mainRoomsContainer?.addEventListener('change', (e: Event): void => {
  // Check if WiFi is active
  if (!isWifiActive) {
    if (mainRoomsContainer) {
      lightController.displayNotification("Cannot control lights: WiFi is not active", 'beforeend', mainRoomsContainer);
    }
    return;
  }
  
  const slider = e.target as HTMLInputElement;
  const value = slider.value;
  lightController.handleLightIntensitySlider(slider, value);
});
// advance settings modal
advanceFeaturesContainer?.addEventListener('click', (e: Event): void => {
  const selectedElement = e.target as HTMLElement;
    if (selectedElement.closest('.close-btn')) {
       advancedSettings.closeModalPopUp();
    }
    // display customization markup
    if (selectedElement.closest('.customization-btn')) {
        advancedSettings.displayCustomization(selectedElement);
    }
    // set light on time customization
    if (selectedElement.matches('.defaultOn-okay')) {
        advancedSettings.customizeAutomaticOnPreset(selectedElement);
    }
    
    // set light off time customization
    if (selectedElement.matches('.defaultOff-okay')) {
        advancedSettings.customizeAutomaticOffPreset(selectedElement);
    }
    // cancel light time customization
    if (selectedElement.textContent?.includes("Cancel")) {
        if (selectedElement.matches('.defaultOn-cancel')) {
            advancedSettings.customizationCancelled(selectedElement, '.defaultOn');
        } else if (selectedElement.matches('.defaultOff-cancel')) {
            advancedSettings.customizationCancelled(selectedElement, '.defaultOff');
        }
    }
});