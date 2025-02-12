<script>
String.prototype.capitalize = function() {
  return this.charAt(0).toUpperCase() + this.slice(1);
};

export default {
  props: {
    app: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      preferences: this.app.preferences,
      permissions: this.app.permissions,
      initialized: false,
      show: false,
      containerColors: [
        'blue',
        'turquoise',
        'green',
        'yellow',
        'orange',
        'red',
        'pink',
        'purple',
      ],
      containerIcons: [
        'fingerprint',
        'briefcase',
        'dollar',
        'cart',
        'circle',
        'gift',
        'vacation',
        'food',
        'fruit',
        'pet',
        'tree',
        'chill'
      ],
      toolbarIconColors: [
        'default',
        'black-simple',
        'blue-simple',
        'red-simple',
        'white-simple'
      ]
    };
  },
  async mounted() {
    if (parseInt((await browser.runtime.getBrowserInfo()).version) >= 67) {
      this.containerColors.push('toolbar');
      this.containerIcons.push('fence');
    }

    this.containerColors = this.containerColors.map(containerColor => ({
      id: containerColor,
      text: this.t(`optionsGeneralContainerColor${containerColor.capitalize()}`)
    }));

    this.containerIcons = this.containerIcons.map(containerIcon => ({
      id: containerIcon,
      text: this.t(`optionsGeneralContainerIcon${containerIcon.capitalize()}`)
    }));

    this.toolbarIconColors = this.toolbarIconColors.map(toolbarIconColor => ({
      id: toolbarIconColor,
      text: this.t(`optionsGeneralToolbarIconColor${toolbarIconColor.capitalize().replace('-s', 'S')}`)
    }));

    this.initialized = true;

    this.$nextTick(async () => {
      $('#general .ui.dropdown').dropdown();
      $('#general .ui.checkbox').checkbox();


      $('#containerColorRandomExcluded').dropdown({
        placeholder: 'Select colors to exclude from random selection',
        values: this.containerColors.map(color => {
          return {
            name: color.text,
            value: color.id,
            selected: !!this.preferences.container.colorRandomExcluded.includes(color.id)
          };
        }),
        maxSelections: this.containerColors.length - 1,
        onAdd: (addedColor) => {
          if (this.preferences.container.colorRandomExcluded.includes(addedColor)) {
            return;
          }
          this.preferences.container.colorRandomExcluded.push(addedColor);
        },
        onRemove: (removedColor) => {
          this.$delete(this.preferences.container.colorRandomExcluded,
            this.preferences.container.colorRandomExcluded.findIndex(excludedColor =>
              excludedColor === removedColor
            )
          );
        }
      });


      $('#containerIconRandomExcluded').dropdown({
        placeholder: 'Select icons to exclude from random selection',
        values: this.containerIcons.map(icon => {
          return {
            name: icon.text,
            value: icon.id,
            selected: !!this.preferences.container.iconRandomExcluded.includes(icon.id)
          };
        }),
        maxSelections: this.containerIcons.length - 1,
        onAdd: (addedIcon) => {
          if (this.preferences.container.iconRandomExcluded.includes(addedIcon)) {
            return;
          }
          this.preferences.container.iconRandomExcluded.push(addedIcon);
        },
        onRemove: (removedIcon) => {
          this.$delete(this.preferences.container.iconRandomExcluded,
            this.preferences.container.iconRandomExcluded.findIndex(excludedIcon =>
              excludedIcon === removedIcon
            )
          );
        }
      });

      this.show = true;
    });
  }
};
</script>

<template>
  <div
    v-if="initialized"
    v-show="show"
    id="general"
  >
    <div class="ui form">
      <div
        id="automaticModeField"
        class="field"
      >
        <div class="ui checkbox">
          <input
            id="automaticMode"
            v-model="preferences.automaticMode.active"
            type="checkbox"
          >
          <label><span
            data-glossary="Automatic Mode"
            :data-glossary-label="t('automaticMode')"
          /></label>
        </div>
      </div>
      <div
        id="popupField"
        class="field"
      >
        <div class="ui checkbox">
          <input
            id="browserActionPopup"
            v-model="preferences.browserActionPopup"
            type="checkbox"
          >
          <label><span
            id="popupbug"
            data-glossary="Toolbar Popup"
            data-glossary-label="Show popup when pressing the toolbar icon"
          /></label>
        </div>
      </div>
      <div class="field">
        <div
          id="notifications"
          class="ui checkbox"
        >
          <input
            id="notificationsCheckbox"
            v-model="preferences.notifications"
            type="checkbox"
          >
          <label>{{ t('optionsGeneralNotifications') }}</label>
        </div>
      </div>
      <div class="field">
        <label>{{ t('optionsGeneralContainerNamePrefix') }}</label>
        <input
          id="containerNamePrefix"
          v-model="preferences.container.namePrefix"
          type="text"
        >
      </div>
      <div
        id="containerColor"
        class="field"
      >
        <label v-if="!preferences.container.colorRandom">
          {{ t('optionsGeneralContainerColor') }}
        </label>
        <label v-else>
          Container Colors excluded from random selection
        </label>
        <div v-show="!preferences.container.colorRandom">
          <select
            v-model="preferences.container.color"
            class="ui fluid dropdown"
          >
            <option
              v-for="containerColor in containerColors"
              :key="containerColor.id"
              :value="containerColor.id"
            >
              {{ containerColor.text }}
            </option>
          </select>
        </div>
        <div
          v-show="preferences.container.colorRandom"
          id="containerColorRandomExcluded"
          class="ui dropdown fluid selection multiple"
        >
          <div class="text" />
          <i class="dropdown icon" />
        </div>
      </div>
      <div class="field">
        <div class="ui checkbox">
          <input
            id="containerColorRandom"
            v-model="preferences.container.colorRandom"
            type="checkbox"
          >
          <label>{{ t('optionsGeneralContainerRandomColor') }}</label>
        </div>
      </div>
      <div
        id="containerIcon"
        class="field"
      >
        <label v-if="!preferences.container.iconRandom">
          {{ t('optionsGeneralContainerIcon') }}
        </label>
        <label v-else>
          Container Icons excluded from random selection
        </label>
        <div v-show="!preferences.container.iconRandom">
          <select
            v-model="preferences.container.icon"
            class="ui fluid dropdown"
          >
            <option
              v-for="containerIcon in containerIcons"
              :key="containerIcon.id"
              :value="containerIcon.id"
            >
              {{ containerIcon.text }}
            </option>
          </select>
        </div>
        <div
          v-show="preferences.container.iconRandom"
          id="containerIconRandomExcluded"
          class="ui dropdown fluid selection multiple"
        >
          <div class="text" />
          <i class="dropdown icon" />
        </div>
      </div>
      <div class="field">
        <div class="ui checkbox">
          <input
            id="containerIconRandom"
            v-model="preferences.container.iconRandom"
            type="checkbox"
          >
          <label>{{ t('optionsGeneralContainerIconRandom') }}</label>
        </div>
      </div>
      <div class="field">
        <label>{{ t('optionsGeneralContainerNumber') }}</label>
        <select
          id="containerNumberMode"
          v-model="preferences.container.numberMode"
          class="ui fluid dropdown"
        >
          <option value="keep">
            {{ t('optionsGeneralContainerNumberKeepCounting') }}
          </option>
          <option value="reuse">
            {{ t('optionsGeneralContainerNumberReuseNumbers') }}
          </option>
        </select>
      </div>
      <div
        class="field"
        :data-tooltip="t('optionsGeneralContainerRemovalTooltip')"
      >
        <label>{{ t('optionsGeneralContainerRemoval') }}</label>
        <select
          id="containerRemoval"
          v-model="preferences.container.removal"
          class="ui fluid dropdown"
        >
          <option value="15minutes">
            {{ t('optionsGeneralContainerRemoval15Minutes') }}
          </option>
          <option value="5minutes">
            {{ t('optionsGeneralContainerRemoval5Minutes') }}
          </option>
          <option value="2minutes">
            {{ t('optionsGeneralContainerRemoval2Minutes') }}
          </option>
          <option value="instant">
            {{ t('optionsGeneralContainerRemovalInstant') }}
          </option>
        </select>
      </div>
      <div
        class="field"
        :data-tooltip="t('optionsGeneralToolbarIconColorTooltip')"
      >
        <label>{{ t('optionsGeneralToolbarIconColor') }}</label>
        <select
          id="iconColor"
          v-model="preferences.iconColor"
          class="ui fluid dropdown"
        >
          <option
            v-for="toolbarIconColor in toolbarIconColors"
            :key="toolbarIconColor.id"
            :value="toolbarIconColor.id"
          >
            {{ toolbarIconColor.text }}
          </option>
        </select>
      </div>
    </div>
  </div>
</template>
