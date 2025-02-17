<template>
  <v-container grid-list-md fluid>
    <v-layout wrap style="padding: 6px; 8px;" fill-height>
      <v-flex d-flex xs12 tag="h1" style="margin-bottom: 20px; " class="white--text">
        <span class="headline">{{ $tc('setting.name', 2) }}</span>
      </v-flex>
      <v-flex d-flex xs6 grow>
        <v-select v-model="selectedLang" dark :label="$t('setting.language')" :items="langs" />
      </v-flex>
      <v-flex d-flex xs6>
        <v-combobox v-model="rootLocation" dark :label="$t('setting.location')" readonly append-icon="arrow_right"
                    append-outer-icon="folder" @click:append="showRootDir" @click:append-outer="browseRootDir" />
      </v-flex>
      <v-flex d-flex xs6 style="flex-direction: column;">
        <v-checkbox v-model="autoInstallOnAppQuit" dark :label="$t('setting.autoInstallOnAppQuit')" />
        <v-checkbox v-model="autoDownload" dark :label="$t('setting.autoDownload')" />
        <v-checkbox v-model="allowPrerelease" dark :label="$t('setting.allowPrerelease')" />
      </v-flex>

      <v-flex d-flex xs6 grow style="color: white;">
        <v-tooltip top>
          <template v-slot:activator="{ on }">
            <v-card v-if="updateInfo" dark v-on="on">
              <v-card-title>
                <h3>
                  <a href="https://github.com/voxelum/VoxeLauncher/releases">
                    {{ updateInfo.releaseName }}
                  </a>
                </h3>
                <div class="grey--text">
                  {{ updateInfo.releaseDate }}
                </div>
                <v-spacer />
                <v-chip small>
                  v{{ updateInfo.version }}
                </v-chip>
              </v-card-title>
              <v-divider />
              <v-card-text>
                <div v-html="updateInfo.releaseNotes" />
              </v-card-text>
              <v-card-actions>
                <v-btn v-if="!readyToUpdate" block color="primary" flat :loading="downloadingUpdate" :disabled="downloadingUpdate" @click="downloadThisUpdate">
                  <v-icon color="white" left>
                    cloud_download
                  </v-icon>
                  {{ $t('setting.updateToThisVersion') }}
                </v-btn>
                <v-btn v-else block color="primary" @click="installThisUpdate">
                  <v-icon color="white" left>
                    refresh
                  </v-icon>
                  {{ $t('setting.installAndQuit') }}
                </v-btn>
              </v-card-actions>
            </v-card>
            <v-card v-else hover dark style="width: 100%" to="https://github.com/voxelum/VoxeLauncher/releases"
                    replace>
              <v-container fill-height>
                <v-layout fill-height justify-space-around align-center>
                  <h3 v-if="!checkingUpdate">
                    {{ $t('setting.noUpdateAvailable') }}
                  </h3>
                  <v-progress-circular v-else indeterminate />
                </v-layout>
              </v-container>
            </v-card>
          </template>
          {{ $t('setting.latestVersion') }}
        </v-tooltip>
      </v-flex>
      <v-flex d-flex xs6>
        <v-btn large dark :loading="checkingUpdate" :disabled="checkingUpdate" @click="checkUpdate">
          {{ $t('setting.checkUpdate') }}
        </v-btn>
      </v-flex>

      <p class="white--text" style="position: absolute; bottom: 35px; right: 315px;">
        <a href="https://github.com/voxelum/voxelauncher"> Github Repo</a>
      </p>

      <p class="white--text" style="position: absolute; bottom: 10px; right: 300px;">
        Present by <a href="https://github.com/ci010"> CI010 </a>
      </p>
    </v-layout>

    <v-dialog :value="reloadDialog" :persistent="!reloadError">
      <v-card v-if="!reloading" dark>
        <v-card-title>
          <h2 style="display: block; min-width: 100%">
            {{ $t('setting.setRootTitle') }}
          </h2>
          <div style="color: grey;">
            {{ rootLocation }}
          </div>
        </v-card-title>
        <v-card-text>
          <p>
            {{ $t('setting.setRootDescription') }}
          </p>
          <p>
            {{ $t('setting.setRootCause') }}
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions>
          <v-checkbox v-model="clearData" style="margin-left: 10px" persistent-hint :hint="$t('setting.cleanOldDataHint')"
                      :label="$t('setting.cleanOldData')" />
          <v-checkbox v-model="migrateData" persistent-hint :hint="$t('setting.copyOldToNewHint')"
                      :label="$t('setting.copyOldToNew')" />
        </v-card-actions>
        <v-card-actions>
          <v-btn flat large @click="doCancelApplyRoot">
            {{ $t('cancel') }}
          </v-btn>
          <v-spacer />
          <v-btn flat large @click="doApplyRoot(rootLocation, true)">
            {{ $t('setting.apply') }}
          </v-btn>
        </v-card-actions>
      </v-card>
      <v-card v-else dark>
        <v-card-title>
          <h2>
            {{ $t('setting.waitReload') }}
          </h2>
        </v-card-title>
        <v-spacer />
        <v-progress-circular v-if="!reloadError" indeterminate />
        <v-card-text v-else>
          {{ $t('setting.reloadFailed') }}:
          {{ reloadError }}
        </v-card-text>
        <v-card-actions v-if="reloadError">
          <v-btn>
            Ok
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      rootLocation: this.$repo.state.root,

      clearData: false,
      migrateData: false,

      reloadDialog: false,
      reloading: false,
      reloadError: undefined,
    };
  },
  computed: {
    selectedLang: {
      get() {
        return this.langs.find(l => l === this.$repo.state.config.locale) || 'en';
      },
      set(v) { this.$repo.commit('locale', v); },
    },
    allowPrerelease: {
      get() { return this.$repo.state.config.allowPrerelease; },
      set(v) { this.$repo.commit('allowPrerelease', v); },
    },
    autoInstallOnAppQuit: {
      get() { return this.$repo.state.config.autoInstallOnAppQuit; },
      set(v) { this.$repo.commit('autoInstallOnAppQuit', v); },
    },
    autoDownload: {
      get() { return this.$repo.state.config.autoDownload; },
      set(v) { this.$repo.commit('autoDownload', v); },
    },
    checkingUpdate() { return this.$repo.state.config.checkingUpdate; },
    downloadingUpdate() { return this.$repo.state.config.downloadingUpdate; },
    updateInfo() { return this.$repo.state.config.updateInfo; },
    readyToUpdate() { return this.$repo.state.config.readyToUpdate; },
    langs() { return this.$repo.state.config.locales; },
  },
  methods: {
    checkUpdate() {
      this.$repo.dispatch('checkUpdate').then((result) => {
        console.log(result);
      });
    },
    showRootDir() {
      this.$electron.remote.shell.openItem(this.rootLocation);
    },
    browseRootDir() {
      this.$electron.remote.dialog.showOpenDialog({
        title: this.$t('setting.selectRootDirectory'),
        defaultPath: this.rootLocation,
        properties: ['openDirectory', 'createDirectory'],
      }, (paths, bookmarks) => {
        if (paths && paths.length !== 0) {
          this.rootLocation = paths[0];
          this.reloadDialog = true;
        }
      });
    },
    doCancelApplyRoot() {
      this.reloadDialog = false;
      this.rootLocation = this.$repo.state.root;
    },
    downloadThisUpdate() {
      this.$repo.dispatch('downloadUpdate');
      this.$notify('info', this.$t('setting.startDownloadUpdate'));
    },
    installThisUpdate() {
      this.$repo.dispatch('quitAndInstall');
    },
    doApplyRoot(defer) {
      this.reloading = true;
      this.$electron.ipcRenderer.once('root', (error) => {
        this.reloading = false;
        if (error) {
          this.reloadError = error;
        } else {
          this.reloadDialog = false;
        }
      });
      this.$electron.ipcRenderer.send('root', { path: this.rootLocation, migrate: this.migrateData, clear: this.clearData });
    },
  },
};
</script>

<style>
</style>
