import General from '../src/services/LightService';
import Light from '../src/components/basicSettings';
import AdvanceSettings from '../src/components/advanceSettings';

// Mock Chart.js globally
(global as any).Chart = jest.fn().mockImplementation(() => ({
  update: jest.fn(),
}));

// ----------------------------
// General Light Service Tests
// ----------------------------
describe('General Light Service', () => {
  let generalService: General;

  beforeEach(() => {
    generalService = new General();

    document.body.innerHTML = `
      <div class="application_container">
        <div class="rooms hall">
          <p>Hall</p>
          <img src="./assets/svgs/hall.svg" alt="hall svg">
          <div class="basic_settings_buttons">
            <button class="light-switch">
              <img src="./assets/svgs/light_bulb_off.svg" alt="light bulb svg">
            </button>
          </div>
          <input id="light_intensity" type="range" min="0" max="10" value="5">
        </div>
      </div>
    `;
  });

  test('getComponent should return correct data', () => {
    const component = generalService.getComponent('hall');
    expect(component).toBeDefined();
    expect(component?.name).toBe('hall');
    expect(component?.numOfLights).toBe(6);
  });

  test('getComponent should return undefined for nonexistent room', () => {
    const component = generalService.getComponent('nonexistent');
    expect(component).toBeUndefined();
  });

  test('getWifi should return all connections', () => {
    const connections = generalService.getWifi();
    expect(connections).toHaveLength(4);
    expect(connections[0].wifiName).toBe('Inet service');
  });

  test('getSelectedComponentName should return correct name', () => {
    const element = document.querySelector('.light-switch') as HTMLElement;
    const name = generalService.getSelectedComponentName(element);
    expect(name).toBe('hall');
  });

  test('handleLightIntensity sets correct brightness', () => {
    const element = document.querySelector('img') as HTMLElement;
    generalService.handleLightIntensity(element, 0.7);
    expect(element.style.filter).toBe('brightness(0.7)');
  });

  test('toggleHidden toggles hidden class', () => {
    const element = document.querySelector('.rooms') as HTMLElement;
    generalService.toggleHidden(element);
    expect(element.classList.contains('hidden')).toBe(true);

    generalService.toggleHidden(element);
    expect(element.classList.contains('hidden')).toBe(false);
  });
});

// ----------------------------
// Light Basic Settings Tests
// ----------------------------
describe('Light Basic Settings', () => {
  let lightController: Light;

  beforeEach(() => {
    lightController = new Light();

    document.body.innerHTML = `
      <div class="application_container">
        <div class="rooms hall">
          <p>Hall</p>
          <img src="./assets/svgs/hall.svg" alt="hall svg">
          <div class="basic_settings_buttons">
            <button class="light-switch">
              <img src="./assets/svgs/light_bulb_off.svg" data-lightOn="./assets/svgs/light_bulb.svg" alt="light bulb svg">
            </button>
          </div>
          <input id="light_intensity" type="range" min="0" max="10" value="5">
        </div>
      </div>
    `;
  });

  test('notification returns proper HTML structure', () => {
    const html = lightController.notification('Test message');
    expect(html).toContain('Test message');
    expect(html).toContain('<div class="notification">');
    expect(html).toContain('<button class="close-notification">');
  });

  test('lightSwitchOn changes image src', () => {
    const btn = document.querySelector('.light-switch') as HTMLElement;
    lightController.lightSwitchOn(btn);
    const img = btn.querySelector('img');
    expect(img?.getAttribute('src')).toBe('./assets/svgs/light_bulb.svg');
    expect(img?.getAttribute('data-lightOn')).toBe('./assets/svgs/light_bulb_off.svg');
  });

  test('lightSwitchOff changes image src', () => {
    const btn = document.querySelector('.light-switch') as HTMLElement;
    lightController.lightSwitchOn(btn);
    lightController.lightSwitchOff(btn);
    const img = btn.querySelector('img');
    expect(img?.getAttribute('src')).toBe('./assets/svgs/light_bulb_off.svg');
    expect(img?.getAttribute('data-lightOn')).toBe('./assets/svgs/light_bulb.svg');
  });

  test('toggleLightSwitch toggles light state', () => {
    const btn = document.querySelector('.light-switch') as HTMLElement;
    lightController.toggleLightSwitch(btn);
    const hall = lightController.getComponent('hall');
    expect(hall?.isLightOn).toBe(true);
    lightController.toggleLightSwitch(btn);
    expect(hall?.isLightOn).toBe(false);
  });

  test('toggleAllLights turns all lights on and off', () => {
    document.body.innerHTML += `
      <div class="rooms bedroom">
        <p>Bedroom</p>
        <img src="./assets/svgs/bedroom.svg" alt="bedroom svg">
        <div class="basic_settings_buttons">
          <button class="light-switch">
            <img src="./assets/svgs/light_bulb_off.svg" alt="light bulb svg">
          </button>
        </div>
        <input id="light_intensity" type="range" min="0" max="10" value="5">
      </div>
    `;
    lightController.toggleAllLights(true, true);
    const hall = lightController.getComponent('hall');
    const bedroom = lightController.getComponent('bedroom');
    expect(hall?.isLightOn).toBe(true);
    expect(bedroom?.isLightOn).toBe(true);

    lightController.toggleAllLights(false, true);
    expect(hall?.isLightOn).toBe(false);
    expect(bedroom?.isLightOn).toBe(false);
  });

  test('toggleAllLights does not work when WiFi is inactive', () => {
    const btn = document.querySelector('.light-switch') as HTMLElement;
    lightController.toggleLightSwitch(btn);
    const hall = lightController.getComponent('hall');
    expect(hall?.isLightOn).toBe(true);
    lightController.toggleAllLights(false, false);
    expect(hall?.isLightOn).toBe(true); // Still on
  });
});

// ----------------------------
// Advanced Settings Tests
// ----------------------------
describe('Advanced Settings', () => {
  let advancedSettings: AdvanceSettings;

  beforeEach(() => {
    advancedSettings = new AdvanceSettings();

    document.body.innerHTML = `
      <div class="application_container">
        <div class="rooms hall">
          <p>Hall</p>
          <img src="./assets/svgs/hall.svg" alt="hall svg">
          <div class="basic_settings_buttons">
            <button class="light-switch">
              <img src="./assets/svgs/light_bulb_off.svg" alt="light bulb svg">
            </button>
          </div>
          <button class="advance-settings_modal">Advanced Settings</button>
        </div>
        <div class="advanced_features_container hidden"></div>
      </div>
    `;
  });

  test('modalPopUp renders advanced features', () => {
    const btn = document.querySelector('.advance-settings_modal') as HTMLElement;
    advancedSettings.modalPopUp(btn);
    expect(document.querySelector('.advanced_features_container')?.classList.contains('hidden')).toBe(false);
    expect(document.querySelector('.advanced_features')).not.toBeNull();
    expect(document.querySelector('.component_name')?.textContent).toBe('Hall');
  });

  test('closeModalPopUp hides advanced features', () => {
    const btn = document.querySelector('.advance-settings_modal') as HTMLElement;
    advancedSettings.modalPopUp(btn);
    advancedSettings.closeModalPopUp();
    expect(document.querySelector('.advanced_features_container')?.classList.contains('hidden')).toBe(true);
    expect(document.querySelector('.advanced_features')).toBeNull();
  });

  test('capFirstLetter capitalizes correctly', () => {
    expect(advancedSettings.capFirstLetter('hall')).toBe('Hall');
    expect(advancedSettings.capFirstLetter('guest room')).toBe('Guest room');
    expect(advancedSettings.capFirstLetter('')).toBe('');
  });

  test('formatTime returns correct Date object', () => {
    const date = advancedSettings.formatTime('14:30');
    expect(date.getHours()).toBe(14);
    expect(date.getMinutes()).toBe(30);
    expect(date.getSeconds()).toBe(0);
  });

  test('customizeAutomaticOnPreset updates autoOn time', () => {
    const btn = document.querySelector('.advance-settings_modal') as HTMLElement;
    advancedSettings.modalPopUp(btn);
    const container = document.querySelector('.customization-details');
    if (container) {
      container.innerHTML = `
        <div class="defaultOn">
          <label for="autoOnTime">Turn on</label>
          <input type="time" name="autoOnTime" id="autoOnTime" value="05:30">
          <div>
            <button class="defaultOn-okay">Okay</button>
            <button class="defaultOn-cancel">Cancel</button>
          </div>
        </div>
      `;
    }
    const okayBtn = document.querySelector('.defaultOn-okay') as HTMLElement;
    advancedSettings.customizeAutomaticOnPreset(okayBtn);
    const hall = advancedSettings.getComponent('hall');
    expect(hall?.autoOn).toBe('05:30');
  });

  test('customizationCancelled clears input', () => {
    const btn = document.querySelector('.advance-settings_modal') as HTMLElement;
    advancedSettings.modalPopUp(btn);
    const container = document.querySelector('.customization-details');
    if (container) {
      container.innerHTML = `
        <div class="defaultOn">
          <label for="autoOnTime">Turn on</label>
          <input type="time" name="autoOnTime" id="autoOnTime" value="05:30">
          <div>
            <button class="defaultOn-okay">Okay</button>
            <button class="defaultOn-cancel">Cancel</button>
          </div>
        </div>
      `;
    }
    const cancelBtn = document.querySelector('.defaultOn-cancel') as HTMLElement;
    advancedSettings.customizationCancelled(cancelBtn, '.defaultOn');
    const input = document.querySelector('#autoOnTime') as HTMLInputElement;
    expect(input.value).toBe('');
  });
});
