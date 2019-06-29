describe('storage', () => {

  it('should initialize storage on installation', async () => {
    const background = await loadBareBackground();
    expect(background.storage.local.preferences).to.deep.equal(
      background.storage.preferencesDefault
    );
  });

  it('should not initialize on installation unless storage got written', async () => {
    const background = await loadUninstalledBackground();
    background.initialize();
    expect(background.initialized).to.be.false;
    await nextTick();
    clock.tick(1000);
    await nextTick();
    clock.tick(1000);
    await nextTick();
    clock.tick(1000);
    await nextTick();
    expect(background.initialized).to.be.false;
    await background.runtime.onInstalled({
      reason: 'install'
    });
    await nextTick();
    clock.tick(1000);
    await nextTick();
    expect(background.initialized).to.be.true;
  });

  it('should not initialize on startup unless storage got loaded', async () => {
    const background = await loadUninstalledBackground();
    background.initialize();
    expect(background.initialized).to.be.false;
    await nextTick();
    clock.tick(1000);
    await nextTick();
    clock.tick(1000);
    await nextTick();
    clock.tick(1000);
    await nextTick();
    expect(background.initialized).to.be.false;
    browser.storage.local.get.resolves({
      tempContainerCounter: 0,
      tempContainers: {},
      tabContainerMap: {},
      preferences: background.storage.preferencesDefault,
      statistics: {}
    });
    clock.tick(1000);
    await nextTick();
    expect(background.initialized).to.be.true;
  });

  it('should not load storage if its already loading', async () => {
    const background = await loadUninstalledBackground();
    background.initialize();
    await nextTick();
    clock.tick(1000);
    const promise = background.storage.load();
    await nextTick();
    expect(browser.storage.local.get).to.have.been.calledTwice;
    browser.storage.local.get.resolves({
      tempContainerCounter: 0,
      tempContainers: {},
      tabContainerMap: {},
      preferences: background.storage.preferencesDefault,
      statistics: {}
    });
    clock.tick(1000);
    await nextTick();
    clock.tick(1000);
    await nextTick();
    await promise;
  });

  it('should add missing preferences', async () => {
    const background = await loadUninstalledBackground();
    browser.storage.local.get.resolves({
      tempContainerCounter: 0,
      tempContainers: {},
      tabContainerMap: {},
      preferences: {...background.storage.preferencesDefault},
      statistics: {}
    });
    background.storage.preferencesDefault.newPreference = true;
    await background.initialize();
    expect(background.storage.local.preferences.newPreference).to.be.true;
  });

});