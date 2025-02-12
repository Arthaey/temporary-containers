<script>
import DomainPattern from '../domainpattern';

export default {
  components: {
    DomainPattern
  },
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
      excludeDomainPattern: ''
    };
  },
  async mounted() {
    $('#advancedGeneral .ui.dropdown').dropdown();
    $('#advancedGeneral .ui.checkbox').checkbox();
    $('#advancedGeneral .ui.accordion').accordion({exclusive: false});

    $('#advancedIgnoreRequestsForm').form({
      fields: {
        advancedIgnoreRequestsPattern: 'empty'
      },
      onSuccess: (event) => {
        event.preventDefault();
        if (!this.preferences.ignoreRequests.includes(this.excludeDomainPattern)) {
          this.preferences.ignoreRequests.push(this.excludeDomainPattern);
        }
        this.excludeDomainPattern = '';
      }
    });
  },
  methods: {
    async resetStorage() {
      if (!window.confirm(`
        Wipe storage and reset it to default?\n
        This can't be undone.
      `)) {
        return;
      }

      let resetError;
      let reset = false;
      try {
        reset = await browser.runtime.sendMessage({
          method: 'resetStorage'
        });
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error('[resetStorage] failed', error);
        resetError = error;
      }

      if (!reset) {
        this.$root.$emit('showError', `Storage reset failed
          ${resetError ? `: ${resetError}` : ''}
        `);
      } else {
        this.$root.$emit('initialize', {showMessage: 'Storage successfully reset'});
      }
    },
    removeIgnoredDomain(ignoredPattern) {
      this.preferences.ignoreRequests = this.preferences.ignoreRequests.filter(_ignoredPattern =>
        ignoredPattern !== _ignoredPattern
      );
    }
  }
};
</script>

<style>
.m-b {
  margin-bottom: 20px;
}
</style>

<template>
  <div
    id="advancedGeneral"
    class="ui form"
  >
    <div
      id="advancedGeneralAccordion"
      class="ui accordion"
    >
      <div class="title">
        <h4>
          <i class="dropdown icon" />
          Automatic Mode
        </h4>
      </div>
      <div class="content">
        <div
          :data-tooltip="app.permissions.history ?
            '&quot;Deletes History Temporary Containers&quot; always reopen new tabs to avoid leaving traces in recently closed tabs' : false"
        >
          <select
            v-model="preferences.automaticMode.newTab"
            class="ui fluid dropdown"
          >
            <option value="created">
              Instantly reopen new tabs in Temporary Containers. You might lose the first few already typed characters in the
              address bar when reopening takes too long, but it prevents new tabs from writing and reading cookies
              in the default container (default)
            </option>
            <option value="navigation">
              Don't instantly reopen new tabs in Temporary Containers but instead when new tabs start to navigate to a website.
              Already typed characters in the address bar are never lost, but new tabs can set and read cookies in the default container
            </option>
          </select>
        </div>
        <div
          v-if="preferences.automaticMode.newTab === 'navigation'"
          class="ui small negative message"
        >
          <strong>Warning:</strong> New tabs (about:newtab and about:blank) can make network requests and set cookies, especially when you
          use the address bar for search engines.
          <br>
          If you have a Cookie-Deletion-Add-on that automatically keeps your default/permanent containers clean
          and you use privacy-oriented search-engines like Startpage.com or DuckDuckGo, then it should be no problem
          to use the "Don't instantly reopen new tabs" preference.
        </div>
        <div class="m-b" />
      </div>
      <div class="title">
        <h4>
          <i class="dropdown icon" />
          Popup
        </h4>
      </div>
      <div class="content">
        <div class="item field">
          <label>
            Default Tab
          </label>
          <select
            v-model="preferences.ui.popupDefaultTab"
            class="ui fluid dropdown"
          >
            <option value="isolation-global">
              Isolation Global
            </option>
            <option value="isolation-per-domain">
              Isolation Per Domain
            </option>
            <option value="isolation-mac">
              Isolation Multi-Account Containers
            </option>
            <option value="actions">
              Actions
            </option>
            <option value="statistics">
              Statistics
            </option>
          </select>
        </div>
        <div class="field">
          <div class="ui checkbox">
            <input
              v-model="preferences.pageAction"
              type="checkbox"
            >
            <label>Show icon in the address bar that reveals the popup</label>
          </div>
        </div>
        <div class="m-b" />
      </div>
      <div class="title">
        <h4>
          <i class="dropdown icon" />
          Context Menu
        </h4>
      </div>
      <div class="content">
        <div class="field">
          <div class="ui checkbox">
            <input
              v-model="preferences.contextMenu"
              type="checkbox"
            >
            <label>Show Temporary Container entry in the right click on links context menu</label>
          </div>
        </div>
        <div class="field">
          <div class="ui checkbox">
            <input
              v-model="preferences.contextMenuBookmarks"
              type="checkbox"
            >
            <label>Show Temporary Container entry in the right click on bookmarks context menu</label>
          </div>
        </div>
        <div class="m-b" />
      </div>
      <div class="title">
        <h4>
          <i class="dropdown icon" />
          Keyboard shortcuts
        </h4>
      </div>
      <div class="content">
        <div class="ui small message">
          Since Firefox 66 it's possible to reassign keyboard shortcuts on the Firefox Add-ons overview page (Ctrl+Shift+A) with the top-right cog icon.
        </div>
        <div class="field">
          <div class="ui checkbox">
            <input
              v-model="preferences.keyboardShortcuts.AltC"
              type="checkbox"
            >
            <label>Alt+C - Open a new tab in a new Temporary Container</label>
          </div>
        </div>
        <div
          class="field"
          :class="{hidden: !permissions.history}"
        >
          <div class="ui checkbox">
            <input
              v-model="preferences.keyboardShortcuts.AltP"
              type="checkbox"
            >
            <label>Alt+P - Open a new tab in a new 'Deletes History Temporary Container'</label>
          </div>
        </div>
        <div class="field">
          <div class="ui checkbox">
            <input
              v-model="preferences.keyboardShortcuts.AltN"
              type="checkbox"
            >
            <label>Alt+N - Open a new 'No Container' tab</label>
          </div>
        </div>
        <div class="field">
          <div class="ui checkbox">
            <input
              v-model="preferences.keyboardShortcuts.AltShiftC"
              type="checkbox"
            >
            <label>Alt+Shift+C - Open a new 'No Container' tab in a new window</label>
          </div>
        </div>
        <div class="field">
          <div class="ui checkbox">
            <input
              v-model="preferences.keyboardShortcuts.AltX"
              type="checkbox"
            >
            <label>Alt+X - Open a new tab in the same container as the current tab</label>
          </div>
        </div>
        <div class="field">
          <div class="ui checkbox">
            <input
              v-model="preferences.keyboardShortcuts.AltO"
              type="checkbox"
            >
            <label>Alt+O - Open current tab URL in a new Temporary Container tab</label>
          </div>
        </div>

        <div class="m-b" />
      </div>
      <div class="title">
        <h4>
          <i class="dropdown icon" />
          Ignoring requests to
        </h4>
      </div>
      <div class="content">
        <div class="ui small message">
          Note: To unignore Mozilla domains its needed to remove them from the <i>about:config</i>
          key <strong>extensions.webextensions.restrictedDomains</strong> list, if they're listed there.
          To fully unignore requests to addons.mozilla.org you need to configure <strong>privacy.resistFingerprinting.block_mozAddonManager</strong>
          in <i>about:config</i> to Boolean <i>true</i> as well.
        </div>
        <div style="margin-left: 20px">
          <div v-if="!preferences.ignoreRequests.length">
            No domains ignored
          </div>
          <div v-else>
            <div
              v-for="ignoredPattern in preferences.ignoreRequests"
              :key="ignoredPattern"
            >
              <div style="margin-top: 5px" />
              <span
                data-tooltip="Remove"
                style="color: red; cursor: pointer;"
                @click="removeIgnoredDomain(ignoredPattern)"
              >
                <i class="icon-trash-empty" />
              </span>
              {{ ignoredPattern }}
            </div>
          </div>
        </div>
        <form
          id="advancedIgnoreRequestsForm"
          class="ui form"
          style="margin-left: 20px; margin-top: 20px;"
        >
          <domain-pattern
            id="advancedIgnoreRequestsPattern"
            :domain-pattern.sync="excludeDomainPattern"
          />
          <div class="field">
            <button class="ui button primary">
              Ignore
            </button>
          </div>
        </form>
        <div class="m-b" />
      </div>
      <div class="title">
        <h4>
          <i class="dropdown icon" />
          Isolation
        </h4>
      </div>
      <div class="content">
        <div class="field">
          <div class="ui checkbox">
            <input
              v-model="preferences.replaceTabs"
              type="checkbox"
            >
            <label>Instead of creating a new tab replace the Current Tab</label>
          </div>
        </div>
        <div class="field">
          <div class="ui checkbox">
            <input
              v-model="preferences.closeRedirectorTabs.active"
              type="checkbox"
            >
            <label>Automatically close left-over redirector tabs after 2 seconds: <strong>t.co</strong> (Twitter), <strong>outgoing.prod.mozaws.net</strong> (AMO)</label>
          </div>
        </div>
        <div class="m-b" />
      </div>
      <div class="title">
        <h4>
          <i class="dropdown icon" />
          Reset Storage
        </h4>
      </div>
      <div class="content">
        <button
          class="ui negative button"
          @click="resetStorage"
        >
          Wipe local storage and reset it to default
        </button>
        <div class="m-b" />
      </div>
    </div>
    <div class="m-b" />
    <div class="field">
      <div class="ui checkbox">
        <input
          v-model="preferences.ui.expandPreferences"
          type="checkbox"
        >
        <label>Expand all preferences by default</label>
      </div>
    </div>
  </div>
</template>
