// src/components/advanceSettings.ts
'use strict'

// import General from '../services/LightService';
import Light from './basicSettings';
import { ComponentData } from '../types';
declare const Chart: any; // Declaration for Chart.js

class AdvanceSettings extends Light {
    constructor () {
        super();
    }

    #markup (component: ComponentData): string {
        const {name, numOfLights, autoOn, autoOff} = component;
        return `
        <div class="advanced_features">
            <h3>Advanced features</h3>
            <section class="component_summary">
                <div>
                    <p class="component_name">${this.capFirstLetter(name)}</p>
                    <p class="number_of_lights">${numOfLights}</p>
                </div>
                <div>

                    <p class="auto_on">
                        <span>Automatic turn on:</span>
                        <span>${autoOn}</span>
                    </p>
                    <p class="auto_off">
                        <span>Automatic turn off:</span>
                        <span>${autoOff}</span>
                    </p>
                </div>
            </section>
            <section class="customization">
                <div class="edit">
                    <p>Customize</p>
                    <button class="customization-btn">
                        <img src="./assets/svgs/edit.svg" alt="customize settings svg icon">
                    </button>
                </div>
                <section class="customization-details hidden">
                    <div>
                        <h4>Automatic on/off settings</h4>
                        <div class="defaultOn">
                            <label for="autoOnTime">Turn on</label>
                            <input type="time" name="autoOnTime" id="autoOnTime">
                            <div>
                                <button class="defaultOn-okay">Okay</button>
                                <button class="defaultOn-cancel">Cancel</button>
                            </div>
                        </div>
                        <div class="defaultOff">
                            <label for="autoOffTime">Go off</label>
                            <input type="time" name="autoOffTime" id="autoOffTime">
                            <div>
                                <button class="defaultOff-okay">Okay</button>
                                <button class="defaultOff-cancel">Cancel</button>
                            </div>
                        </div>

                    </div>
                </section>
                <section class="summary">
                    <h3>Summary</h3>
                    <div class="chart-container">
                        <canvas id="myChart"></canvas>
                    </div>
                </section>
                <button class="close-btn">
                    <img src="./assets/svgs/close.svg" alt="close button svg icon">
                </button>
            </section>
            <button class="close-btn">
                <img src="./assets/svgs/close.svg" alt="close button svg icon">
            </button>
        </div>
        `;
    }

    #analyticsUsage(data: number[]): void {
        const ctx = this.selector('#myChart') as HTMLCanvasElement;
        if (!ctx) return;
        
        new Chart(ctx, {
            type: 'line',
            data: {
              labels: ['Sun', 'Mon', 'Tue', 'Wed', 'Thur', 'Fri', 'Sat'],
              datasets: [{
                label: 'Hours of usage',
                data: data,
                borderWidth: 1
              }]
            },
            options: {
              scales: {
                y: {
                  beginAtZero: true
                }
              }
            }
        });
    }

    /**
     * Updates the text content of an HTML element with the provided value
     * @param element The HTML element to update
     * @param value The new value to set
     */
    updateMarkupValue(element: HTMLElement, value: string): void {
        if (element) {
            element.textContent = value;
        }
    }

    /**
     * Refreshes the advanced features display to show updated component data
     * @param component The component data to display
     */
    refreshAdvancedFeatures(component: ComponentData): void {
        const parentElement = this.selector('.advanced_features_container') as HTMLElement;
        if (!parentElement) return;
        
        // Remove existing content
        const existingFeatures = this.selector('.advanced_features') as HTMLElement;
        if (existingFeatures) {
            existingFeatures.remove();
        }
        
        // Re-render with updated data
        this.renderHTML(this.#markup(component), 'afterbegin', parentElement);
        
        // Re-initialize graph
        this.#analyticsUsage(component['usage']);
    }

    modalPopUp(element: HTMLElement): void {
        const selectedRoom = this.getSelectedComponentName(element);
        const componentData = this.getComponent(selectedRoom);
        if (!componentData) return;
        
        const parentElement = this.selector('.advanced_features_container') as HTMLElement;
        if (!parentElement) return;
        
        this.removeHidden(parentElement);
        
        // display modal view
        this.renderHTML(this.#markup(componentData), 'afterbegin', parentElement);

        // graph display
        this.#analyticsUsage(componentData['usage']);
    }

    displayCustomization(selectedElement: HTMLElement): void {
        const element = this.closestSelector(selectedElement, '.customization', '.customization-details') as HTMLElement;
        if (!element) return;
        
        this.toggleHidden(element);
    }

    closeModalPopUp(): void {
        const parentElement = this.selector('.advanced_features_container') as HTMLElement;
        const childElement = this.selector('.advanced_features') as HTMLElement;
        if (!parentElement || !childElement) return;

        // remove child element from the DOM
        childElement.remove();
        // hide parent element
        this.addHidden(parentElement);
    }

    customizationCancelled(selectedElement: HTMLElement, parentSelectorIdentifier: string): void {
        const element = this.closestSelector(selectedElement, parentSelectorIdentifier, 'input') as HTMLInputElement;
        if (!element) return;
        
        element.value = '';
    }

    customizeAutomaticOnPreset(selectedElement: HTMLElement): void {
        const element = this.closestSelector(selectedElement, '.defaultOn', 'input') as HTMLInputElement;
        if (!element) return;
        
        const { value } = element;
        
        // Skip if value is empty
        if (!value) return;
        
        const component = this.getComponentData(element, '.advanced_features', '.component_name');
        if (!component) return;
        
        component.autoOn = value;
        element.value = '';

        // Update the UI by refreshing the entire advanced features section
        this.refreshAdvancedFeatures(component);

        // update room data with element
        this.setComponentElement(component);
        
        // handle light on automation
        this.automateLight(component.autoOn, component);
        
        // Display notification
        const container = document.querySelector('.application_container') as HTMLElement;
        if (container) {
            this.displayNotification(`${component.name} light scheduled to turn on at ${component.autoOn}`, 'beforeend', container);
        }
    }

    customizeAutomaticOffPreset(selectedElement: HTMLElement): void {
        const element = this.closestSelector(selectedElement, '.defaultOff', 'input') as HTMLInputElement;
        if (!element) return;
        
        const { value } = element;

        // Skip if value is empty
        if (!value) return;
        
        const component = this.getComponentData(element, '.advanced_features', '.component_name');
        if (!component) return;
        
        component.autoOff = value;
        element.value = '';

        // Update the UI by refreshing the entire advanced features section
        this.refreshAdvancedFeatures(component);

        // update room data with element
        this.setComponentElement(component);
        
        // handle light off automation
        this.automateLight(component.autoOff, component);
        
        // Display notification
        const container = document.querySelector('.application_container') as HTMLElement;
        if (container) {
            this.displayNotification(`${component.name} light scheduled to turn off at ${component.autoOff}`, 'beforeend', container);
        }
    }

    getSelectedComponent(componentName?: string): ComponentData | ComponentData[] {
        if (!componentName) {
            // Use Object.keys().map() instead of Object.values() for compatibility
            return Object.keys(this.componentsData).map(key => this.componentsData[key]);
        }
        const component = this.componentsData[componentName.toLowerCase()];
        return component;
    }

    getSelectedSettings(componentName: string): string {
        return this.#markup(this.getSelectedComponent(componentName) as ComponentData);
    }

    setNewData<T extends keyof ComponentData>(component: string, key: T, data: ComponentData[T]): ComponentData[T] | null {
        const selectedComponent = this.componentsData[component.toLowerCase()];
        if (!selectedComponent) return null;
        return selectedComponent[key] = data;
    }

    capFirstLetter(word: string): string {
        if (!word || word.length === 0) return word;
        // Use charAt instead of at for compatibility
        return word.replace(word.charAt(0), word.charAt(0).toUpperCase());
    }

    getObjectDetails(): this {
        return this;
    }

    formatTime(time: string): Date {
        const [hour, min] = time.split(':');
        
        const dailyAlarmTime = new Date();
        dailyAlarmTime.setHours(parseInt(hour)); 
        dailyAlarmTime.setMinutes(parseInt(min));
        dailyAlarmTime.setSeconds(0);
        
        return dailyAlarmTime;
    }

    timeDifference(selectedTime: string): number {
        const now = new Date();
        const setTime = this.formatTime(selectedTime).getTime() - now.getTime();
        return setTime;
    }

    async timer(time: Date, message: boolean, component: ComponentData): Promise<void> {
        return new Promise((resolve, reject) => {
            const checkAndTriggerAlarm = () => {
                const now = new Date();
                
                if (
                    now.getHours() === time.getHours() &&
                    now.getMinutes() === time.getMinutes() &&
                    now.getSeconds() === time.getSeconds()
                ) {
                    if (component['element']) {
                        resolve(this.toggleLightSwitch(component['element']));
                    }

                    // stop timer
                    clearInterval(intervalId);
                }
            };
        
            // Check every second
            const intervalId = setInterval(checkAndTriggerAlarm, 1000);
        });
    }

    async automateLight(time: string, component: ComponentData): Promise<void> {
        const formattedTime = this.formatTime(time);
        return await this.timer(formattedTime, true, component);
    }
}

export default AdvanceSettings;