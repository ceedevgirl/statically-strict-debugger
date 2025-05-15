// src/components/basicSettings.ts
'use strict'

import General from "../services/LightService.js";
import { ComponentData } from "../types";

class Light extends General {
    constructor() {
        super();
    }

    notification(message: string): string {
        return `
            <div class="notification">
                <div>
                    <img src="./assets/svgs/checked.svg" alt="checked svg icon on notifications" >
                </div>
                <p>${message}</p>
                <button class="close-notification">
                    <img src="./assets/svgs/close.svg" alt="close button svg icon">
                </button>
            </div>
        `;
    }

    displayNotification(message: string, position: InsertPosition, container: HTMLElement): void {
        const html = this.notification(message);
        this.renderHTML(html, position, container);
        
        // Auto-remove notification after a second
        const notificationElement = container.querySelector('.notification') as HTMLElement;
        if (notificationElement) {
            this.removeNotification(notificationElement);
            
            // Add click event for manual close
            const closeBtn = notificationElement.querySelector('.close-notification');
            closeBtn?.addEventListener('click', () => {
                notificationElement.remove();
            });
        }
    }

    removeNotification(element: HTMLElement): void {
        setTimeout(() => {
            if (element && element.parentNode) {
                element.remove();
            }
        }, 1000);
    }

    lightSwitchOn(lightButtonElement: HTMLElement): void {
        const imgElement = lightButtonElement.querySelector('img');
        if (!imgElement) return;
        
        imgElement.setAttribute('src', './assets/svgs/light_bulb.svg');
        imgElement.setAttribute('data-lightOn', './assets/svgs/light_bulb_off.svg');
    }

    lightSwitchOff(lightButtonElement: HTMLElement): void {
        const imgElement = lightButtonElement.querySelector('img');
        if (!imgElement) return;
        
        imgElement.setAttribute('src', './assets/svgs/light_bulb_off.svg');
        imgElement.setAttribute('data-lightOn', './assets/svgs/light_bulb.svg');
    }

    lightComponentSelectors(lightButtonElement: HTMLElement): { 
        room: string, 
        componentData: ComponentData | undefined, 
        childElement: HTMLElement | null, 
        background: HTMLElement | null 
    } {
        const room = this.getSelectedComponentName(lightButtonElement);
        const componentData = this.getComponent(room);
        const childElement = lightButtonElement.querySelector('img');
        const background = this.closestSelector(lightButtonElement, '.rooms', 'img');
        return { room, componentData, childElement, background };
    }

    toggleLightSwitch(lightButtonElement: HTMLElement): void {
        if (!lightButtonElement) return;
        
        const { componentData: component, childElement, background } = this.lightComponentSelectors(lightButtonElement);
        if (!component || !childElement || !background) return;
        
        const slider = this.closestSelector(lightButtonElement, '.rooms', '#light_intensity') as HTMLInputElement;
        if (!slider) return;

        component.isLightOn = !component.isLightOn;

        if (component.isLightOn) {
            this.lightSwitchOn(lightButtonElement);
            component.lightIntensity = 5;
            const lightIntensity = component.lightIntensity / 10;
            this.handleLightIntensity(background, lightIntensity);
            slider.value = component.lightIntensity.toString();
            
            // Add notification
            const container = document.querySelector('.application_container') as HTMLElement;
            if (container) {
                this.displayNotification(`${component.name} light turned on`, 'beforeend', container);
            }
        } else {
            this.lightSwitchOff(lightButtonElement);
            this.handleLightIntensity(background, 0);
            slider.value = '0';
            
            // Add notification
            const container = document.querySelector('.application_container') as HTMLElement;
            if (container) {
                this.displayNotification(`${component.name} light turned off`, 'beforeend', container);
            }
        }
    }

    handleLightIntensitySlider(element: HTMLInputElement, intensity: string): void {
        if (!element) return;
        
        const { componentData } = this.lightComponentSelectors(element);
        if (!componentData) return;

        const intensityValue = parseInt(intensity);
        if (isNaN(intensityValue)) return;

        componentData.lightIntensity = intensityValue; 
        
        // Get background element to adjust brightness
        const background = this.closestSelector(element, '.rooms', 'img');
        if (!background) return;
        
        // Adjust brightness based on intensity
        const lightIntensity = intensityValue / 10;
        this.handleLightIntensity(background, lightIntensity);

        const lightSwitch = this.closestSelector(element, '.rooms', '.light-switch') as HTMLElement;
        if (!lightSwitch) return;

        if (intensityValue === 0) {
            componentData.isLightOn = false;
            this.lightSwitchOff(lightSwitch);
        } else {
            componentData.isLightOn = true;
            this.lightSwitchOn(lightSwitch);
        }
    }

    sliderLight(isLightOn: boolean, lightButtonElement: HTMLElement): void {
        if (!lightButtonElement) return;
        
        const { componentData: component, childElement, background } = this.lightComponentSelectors(lightButtonElement);
        if (!component || !childElement || !background) return;
        
        if (isLightOn) {
            this.lightSwitchOn(lightButtonElement);
            const lightIntensity = component.lightIntensity / 10;
            this.handleLightIntensity(background, lightIntensity);
        } else {
            this.lightSwitchOff(lightButtonElement);
            this.handleLightIntensity(background, 0);
        }
    }
    
    // New method to toggle all lights based on WiFi state
    toggleAllLights(isOn: boolean, isWifiActive: boolean): void {
        if (!isWifiActive) {
            const container = document.querySelector('.application_container') as HTMLElement;
            if (container) {
                this.displayNotification("Cannot control lights: WiFi is not active", 'beforeend', container);
            }
            return;
        }
        
        // Get all rooms
        const rooms = document.querySelectorAll('.rooms');
        rooms.forEach(room => {
            const lightSwitch = room.querySelector('.light-switch') as HTMLElement;
            if (!lightSwitch) return;
            
            const { componentData } = this.lightComponentSelectors(lightSwitch);
            if (!componentData) return;
            
            // Only toggle if current state doesn't match target state
            if (componentData.isLightOn !== isOn) {
                this.toggleLightSwitch(lightSwitch);
            }
        });
        
        // Update global light state
        this.isLightOn = isOn;
        
        // Notification
        const container = document.querySelector('.application_container') as HTMLElement;
        if (container) {
            const message = isOn ? "All lights turned on" : "All lights turned off";
            this.displayNotification(message, 'beforeend', container);
        }
    }
}

export default Light;