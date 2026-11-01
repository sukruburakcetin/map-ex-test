import { languageName } from '../i18n/startupMessages';
/** @jsx jsx */
import { OwnedMessage } from '../i18n/WidgetLocale';
import { WidgetLocaleProvider } from '../i18n/WidgetLocale';
import { SettingsCatalogProvider, SettingsLocaleContext } from '../i18n/SettingsLocale';
import { React, jsx } from "jimu-core";
import { AllWidgetSettingProps } from "jimu-for-builder";
import { SettingSection, SettingRow } from "jimu-ui/advanced/setting-components";
import { MapWidgetSelector } from "jimu-ui/advanced/setting-components";
import { Switch, TextInput, NumericInput, Select, Option } from "jimu-ui";
import { placesServiceUrl } from "../features/places/placesModel";
import { IMConfig } from "../config";
import { organizationFilterId } from "../utils/organizationFilter";
import { FIELD_NOTE_CATEGORIES } from "../components/types";

class Setting extends React.PureComponent<AllWidgetSettingProps<IMConfig>, any> {
  static contextType = SettingsLocaleContext;
  declare context: React.ContextType<typeof SettingsLocaleContext>;
  state = {
    newCategoryText: "",
  };

  onMapWidgetSelected = (useMapWidgetIds: string[]) => {
    this.props.onSettingChange({
      id: this.props.id,
      useMapWidgetIds: useMapWidgetIds,
    });
  };

  onToggleTrafficSigns = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("enableTrafficSigns", evt.target.checked),
    });
  };

  onToggleObjects = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("enableMapillaryObjects", evt.target.checked),
    });
  };

  onToggleHideTurboFilter = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("hideTurboFilter", evt.target.checked),
    });
  };

  // Handle Creator Input
  onCreatorChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value;
    let config = this.props.config.set("turboCreator", value);
    this.props.onSettingChange({ id: this.props.id, config });
  };

  onOrganizationChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value.trim();
    this.props.onSettingChange({ id: this.props.id, config: this.props.config.set("turboOrganization", value) });
  };

  // Turbo Preset Handlers
  onTurboDefaultStartDateChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value || undefined;
    let config = this.props.config.set("turboDefaultStartDate", value);
    this.props.onSettingChange({ id: this.props.id, config });
  };

  onTurboDefaultEndDateChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const value = evt.target.value || undefined;
    let config = this.props.config.set("turboDefaultEndDate", value);
    this.props.onSettingChange({ id: this.props.id, config });
  };

  /**
   * Cycles the Is Pano preset through three states via a <Select>:
   *   ''      → no filter (undefined)
   *   'true'  → panoramas only
   *   'false' → non-panoramas only
   */
  onTurboDefaultIsPanoChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const raw = evt.target.value;
    const value = raw === "true" ? true : raw === "false" ? false : null;
    let config = this.props.config.set("turboDefaultIsPano", value);
    this.props.onSettingChange({ id: this.props.id, config });
  };

  onToggleTurboDefaultColorByDate = (evt: React.ChangeEvent<HTMLInputElement>) => {
    let config = this.props.config.set("turboDefaultColorByDate", evt.target.checked);
    this.props.onSettingChange({ id: this.props.id, config });
  };

  onToggleHideLegend = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("hideLegend", evt.target.checked),
    });
  };

  onToggleHideInfoBox = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("hideInfoBox", evt.target.checked),
    });
  };

  onToggleHideImageDownload = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("hideImageDownload", evt.target.checked),
    });
  };

  onToggleHideTimeTravel = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("hideTimeTravel", evt.target.checked),
    });
  };

  onToggleHideShareButton = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("hideShareButton", evt.target.checked),
    });
  };

  onToggleHideSyncHeadingButton = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("hideSyncHeadingButton", evt.target.checked),
    });
  };

  onToggleHideCenterMapButton = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("hideCenterMapButton", evt.target.checked),
    });
  };

  onToggleHideCoverageAnalysis = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("hideCoverageAnalysis", evt.target.checked),
    });
  };

  onToggleHidePointCloud = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("hidePointCloud", evt.target.checked),
    });
  };

  // Handler for Render Mode
  onRenderModeChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("renderMode", parseInt(evt.target.value, 10)),
    });
  };

  // Handler for Transition Mode
  onTransitionModeChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("transitionMode", parseInt(evt.target.value, 10)),
    });
  };

  // Handler for Sync Map Position (West, East, Center, etc.)
  onSyncPositionChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("syncMapPosition", evt.target.value),
    });
  };

  onCameraXChange = (value: number) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("cameraX", value),
    });
  };

  onCameraYChange = (value: number) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("cameraY", value),
    });
  };

  onToggleDebugMode = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("debugMode", evt.target.checked),
    });
  };

  onToggleImageTiling = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({ id: this.props.id, config: this.props.config.set("imageTiling", evt.target.checked) });
  };

  getFieldNoteCategories = (): string[] => {
    const custom = this.props.config.fieldNoteCategories;
    if (custom && custom.length > 0) {
      return Array.from(custom);
    }
    return Array.from(FIELD_NOTE_CATEGORIES);
  };

  onAddCategory = () => {
    const text = (this.state.newCategoryText || "").trim();
    if (!text) return;
    const current = this.getFieldNoteCategories();
    if (!current.includes(text)) {
      const updated = [...current, text];
      this.props.onSettingChange({
        id: this.props.id,
        config: this.props.config.set("fieldNoteCategories", updated),
      });
    }
    this.setState({ newCategoryText: "" });
  };

  onRemoveCategory = (index: number) => {
    const current = this.getFieldNoteCategories();
    const updated = current.filter((_, i) => i !== index);
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("fieldNoteCategories", updated),
    });
  };

  onCategoryChange = (index: number, val: string) => {
    const current = [...this.getFieldNoteCategories()];
    current[index] = val;
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("fieldNoteCategories", current),
    });
  };

  onResetCategories = () => {
    this.props.onSettingChange({
      id: this.props.id,
      config: this.props.config.set("fieldNoteCategories", Array.from(FIELD_NOTE_CATEGORIES)),
    });
  };

  onRoutingEngineChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const engine = evt.target.value;

    let config = this.props.config.set("routingEngine", engine);

    /*
     * Portal routing always uses the current
     * portal / organization authentication.
     */
    if (engine === "portal") {
      config = config.set("routingAuthMode", "user");
    }

    this.props.onSettingChange({
      id: this.props.id,
      config,
    });
  };

  onRoutingAuthModeChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onSettingChange({
      id: this.props.id,

      config: this.props.config.set("routingAuthMode", evt.target.value),
    });
  };

  onRoutingApiKeyChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,

      config: this.props.config.set("routingApiKey", evt.target.value),
    });
  };

  onRoutingServiceUrlChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,

      config: this.props.config.set("routingServiceUrl", evt.target.value),
    });
  };

  onOSRMServerModeChange = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    this.props.onSettingChange({
      id: this.props.id,

      config: this.props.config.set("osrmServerMode", evt.target.value),
    });
  };

  onOSRMServerUrlChange = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.props.onSettingChange({
      id: this.props.id,

      config: this.props.config.set("osrmServerUrl", evt.target.value),
    });
  };

  // Helper: converts stored boolean | null | undefined to the <Select> string value
  private isPanoSelectValue(): string {
    const v = this.props.config.turboDefaultIsPano;
    if (v === true) return "true";
    if (v === false) return "false";
    return "";
  }

  render() {
    const { t, locale } = this.context;
    const config = this.props.config;
    const routingEngine = config.routingEngine || "world";

    const routingAuthMode = config.routingAuthMode || "auto";

    const hasRoutingApiKey = !!config.routingApiKey?.trim();

    const osrmServerMode = config.osrmServerMode || "public";

    const hasCustomOSRMUrl = !!config.osrmServerUrl?.trim();

    return (
      <div lang={locale} className="widget-setting-mapillary jimu-widget-setting">
        <SettingSection title={t('source')}>
          <SettingRow>
            <div style={{ width: "100%" }}>
              <div style={{ marginBottom: "8px", fontWeight: 500 }}> {t('selectMapWidget')} </div>
              <MapWidgetSelector onSelect={this.onMapWidgetSelected} useMapWidgetIds={this.props.useMapWidgetIds} />
            </div>
          </SettingRow>

          <SettingRow label={t('lockMapToView')} flow="wrap">
            <div className="d-flex justify-content-between w-100 align-items-center">
              <span title={t('syncsTheMapCenterToTheCurrentImageLocation')}> {t('enableSync')} </span>
              <Switch
                checked={this.props.config.syncMapWithImage === true}
                onChange={(evt) => {
                  this.props.onSettingChange({
                    id: this.props.id,
                    config: this.props.config.set("syncMapWithImage", evt.target.checked),
                  });
                }}
              />
            </div>

            {/* Extended Position Options */}
            {this.props.config.syncMapWithImage && (
              <div className="mt-2 w-100" style={{ paddingLeft: "0px" }}>
                <div style={{ fontSize: "12px", fontWeight: 500, marginBottom: "4px" }}> {t('recenterPosition')} </div>
                <Select size="sm" value={config.syncMapPosition || "center"} onChange={this.onSyncPositionChange} style={{ width: "100%" }}>
                  <Option value="center"> {t('centerDefault')} </Option>
                  <Option value="west"> {t('westFocusLeft')} </Option>
                  <Option value="east"> {t('eastFocusRight')} </Option>
                  <Option value="north"> {t('northFocusTop')} </Option>
                  <Option value="south"> {t('southFocusBottom')} </Option>
                </Select>

                <div className="text mt-2" style={{ fontSize: "10px", fontStyle: "italic", lineHeight: "1.3", opacity: "0.3" }}>
                  {config.syncMapPosition === "east" && <OwnedMessage source={"Best if your widget is docked on the Left."}/>}
                  {config.syncMapPosition === "west" && <OwnedMessage source={"Best if your widget is docked on the Right."}/>}
                  {config.syncMapPosition === "north" && <OwnedMessage source={"Best if your widget is docked on the Bottom."}/>}
                  {config.syncMapPosition === "south" && <OwnedMessage source={"Best if your widget is docked on the Top."}/>}
                  {(!config.syncMapPosition || config.syncMapPosition === "center") && <OwnedMessage source={"Recenters here when the image leaves view. Use Lock to image for continuous following."}/>}
                </div>
              </div>
            )}
          </SettingRow>
        </SettingSection>
        <SettingSection title={t('languagePilot')}>
          <SettingRow label={t('defaultWidgetLanguage')} flow="wrap">
            <Select className="w-100" aria-label={t('defaultWidgetLanguage')} value={config.widgetLanguage || "auto"}
              onChange={event => this.props.onSettingChange({ id: this.props.id,
                config: config.set("widgetLanguage", event.target.value === "pt-BR" ? "pt-BR" : event.target.value === "de" ? "de" : event.target.value === "fr" ? "fr" : event.target.value === "es" ? "es" : event.target.value === "tr" ? "tr" : event.target.value === "en" ? "en" : "auto") })}>
              <Option value="auto"> {t('appLanguage')} </Option><Option value="en">{languageName(this.context.locale,'en')}</Option><Option value="tr">{languageName(this.context.locale,'tr')}</Option><Option value="es">{languageName(this.context.locale,'es')}</Option><Option value="fr">{languageName(this.context.locale,'fr')}</Option><Option value="de">{languageName(this.context.locale,'de')}</Option><Option value="pt-BR">{languageName(this.context.locale,'pt-BR')}</Option>
            </Select>
          </SettingRow>
          <SettingRow label={t('allowUsersToChangeLanguage')}>
            <Switch aria-label={t('allowUsersToChangeLanguage')} checked={config.allowUserLanguageChoice !== false}
              onChange={event => this.props.onSettingChange({id:this.props.id,config:config.set("allowUserLanguageChoice",event.target.checked)})}/>
          </SettingRow>
          <p style={{fontSize:12,margin:'8px 0'}}> {t('appliesToTranslatedImageActionsFiltersDatesAndTime')} </p>
        </SettingSection>
        <SettingSection title={t('generalSettings')}>
          {/*Default Creator Field */}
          <SettingRow flow="wrap">
            <div style={{ width: "100%" }}>
              <div style={{ marginBottom: "5px", fontWeight: 500 }}> {t('defaultCreator')} </div>
              <TextInput className="w-100" placeholder={t('eGMapillaryUser')} value={config.turboCreator || ""} onChange={this.onCreatorChange} />
            </div>
          </SettingRow>
          <SettingRow flow="wrap">
            <div style={{ width: "100%" }}>
              <div style={{ marginBottom: "5px", fontWeight: 500 }}> {t('organizationId')} </div>
              <TextInput className="w-100" aria-label={t('defaultMapillaryOrganizationId')} placeholder={t('numericMapillaryOrganizationId')}
                value={config.turboOrganization || ""} onChange={this.onOrganizationChange}
                aria-invalid={organizationFilterId(config.turboOrganization) === -1} />
              <div style={{ marginTop: 4, fontSize: 11 }}>
                {organizationFilterId(config.turboOrganization) === -1
                  ? t('enterAValidPositiveNumericMapillaryOrganizationId')
                  : t('optionalLocksTheOrganizationFilterAtRuntimeAndCombines')}
              </div>
            </div>
          </SettingRow>
        {/* Coverage defaults are part of General Settings. */}
          <SettingRow>
            <span className="text" style={{ fontSize: "12px", fontStyle: "italic", opacity: "0.4" }}>
               {t('theseValuesPrePopulateTheCoverageFilterPanelWhen')} </span>
          </SettingRow>

          {/* Start Date */}
          <SettingRow flow="wrap">
            <div style={{ width: "100%" }}>
              <div style={{ marginBottom: "5px", fontWeight: 500 }}> {t('defaultStartDate')} </div>
              <input
                type="date"
                value={config.turboDefaultStartDate || ""}
                onChange={this.onTurboDefaultStartDateChange}
                style={{
                  width: "100%",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid var(--border-color, #ccc)",
                  background: "var(--input-bg, #fff)",
                  color: "var(--input-color, #333)",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
              {config.turboDefaultStartDate && (
                <button
                  onClick={() => {
                    let config = this.props.config.set("turboDefaultStartDate", undefined);
                                    this.props.onSettingChange({ id: this.props.id, config });
                  }}
                  style={{
                    marginTop: "4px",
                    fontSize: "11px",
                    background: "none",
                    border: "none",
                    color: "var(--danger-color, #c00)",
                    cursor: "pointer",
                    padding: "0",
                  }}
                >
                   {t('clearStartDate')} </button>
              )}
            </div>
          </SettingRow>

          {/* End Date */}
          <SettingRow flow="wrap">
            <div style={{ width: "100%" }}>
              <div style={{ marginBottom: "5px", fontWeight: 500 }}> {t('defaultEndDate')} </div>
              <input
                type="date"
                value={config.turboDefaultEndDate || ""}
                onChange={this.onTurboDefaultEndDateChange}
                style={{
                  width: "100%",
                  padding: "4px 8px",
                  borderRadius: "4px",
                  border: "1px solid var(--border-color, #ccc)",
                  background: "var(--input-bg, #fff)",
                  color: "var(--input-color, #333)",
                  fontSize: "13px",
                  boxSizing: "border-box",
                }}
              />
              {config.turboDefaultEndDate && (
                <button
                  onClick={() => {
                    let config = this.props.config.set("turboDefaultEndDate", undefined);
                                    this.props.onSettingChange({ id: this.props.id, config });
                  }}
                  style={{
                    marginTop: "4px",
                    fontSize: "11px",
                    background: "none",
                    border: "none",
                    color: "var(--danger-color, #c00)",
                    cursor: "pointer",
                    padding: "0",
                  }}
                >
                   {t('clearEndDate')} </button>
              )}
            </div>
          </SettingRow>

          {/* Date range validation hint */}
          {config.turboDefaultStartDate && config.turboDefaultEndDate && config.turboDefaultStartDate > config.turboDefaultEndDate && (
            <SettingRow>
              <span style={{ fontSize: "11px", color: "var(--danger-color, #c00)", fontWeight: 500 }}> {t('startDateIsAfterEndDateNoImagesWill')} </span>
            </SettingRow>
          )}

          {/* Is Pano Filter */}
          <SettingRow flow="wrap">
            <div style={{ width: "100%" }}>
              <div style={{ marginBottom: "5px", fontWeight: 500 }}> {t('defaultPanoramaFilter')} </div>
              <Select size="sm" value={this.isPanoSelectValue()} onChange={this.onTurboDefaultIsPanoChange} style={{ width: "100%" }}>
                <Option value=""> {t('allImagesNoFilter')} </Option>
                <Option value="true"> {t('panoramasOnly')} </Option>
                <Option value="false"> {t('nonPanoramasOnly')} </Option>
              </Select>
              <div style={{ fontSize: "11px", fontStyle: "italic", marginTop: "4px", opacity: "0.4" }}> {t('restrictsCoverageToPanoramicOrFlatImagesOnly')} </div>
            </div>
          </SettingRow>

          {/* Color by Date */}
          <SettingRow label={t('defaultColorByCaptureYear')}>
            <Switch checked={config.turboDefaultColorByDate === true} onChange={this.onToggleTurboDefaultColorByDate} />
          </SettingRow>
          <SettingRow>
            <span className="text" style={{ fontSize: "11px", fontStyle: "italic", opacity: "0.4" }}>
               {t('whenEnabledCoveragePointsAreColouredByTheirCapture')} </span>
          </SettingRow>
        </SettingSection>
        <SettingSection title={t('appearanceSettings')}>
          <SettingRow>
            <span className="text" style={{ fontSize: "12px", marginTop: "5px", opacity: "0.3", fontStyle: "italic" }}>
               {t('toggleUiElementsAndActionToolsToSimplifyThe')} </span>
          </SettingRow>

          {/* UI Toggles */}
          <SettingRow label={t('hideMapillaryMapLegend')}>
            <Switch checked={config.hideLegend === true} onChange={this.onToggleHideLegend} />
          </SettingRow>

          <SettingRow label={t('hideInfoBox')}>
            <Switch checked={config.hideInfoBox === true} onChange={this.onToggleHideInfoBox} />
          </SettingRow>

          <SettingRow label={t('hideCoverageFilterButton')}>
            <Switch checked={config.hideTurboFilter === true} onChange={this.onToggleHideTurboFilter} />
          </SettingRow>

          <SettingRow label={t('hideAnalysisStreetgapQualityView')}>
            <Switch checked={config.hideCoverageAnalysis === true} onChange={this.onToggleHideCoverageAnalysis} />
          </SettingRow>

          <SettingRow label={t('hidePointCloud3dOnly')}>
            <Switch checked={config.hidePointCloud === true} onChange={this.onToggleHidePointCloud} />
          </SettingRow>

          <SettingRow label={t('hideImageDownload')}>
            <Switch checked={config.hideImageDownload === true} onChange={this.onToggleHideImageDownload} />
          </SettingRow>

          <SettingRow label={t('hideTimeTravel')}>
            <Switch checked={config.hideTimeTravel === true} onChange={this.onToggleHideTimeTravel} />
          </SettingRow>

          <SettingRow label={t('hideShareButton')}>
            <Switch checked={config.hideShareButton === true} onChange={this.onToggleHideShareButton} />
          </SettingRow>
          <SettingRow label={t('hideLockMapRotationButton3d')}>
            <Switch
              checked={config.hideSyncHeadingButton === true}
              onChange={(evt) =>
                this.props.onSettingChange({
                  id: this.props.id,
                  config: this.props.config.set("hideSyncHeadingButton", evt.target.checked),
                })
              }
            />
          </SettingRow>

          <SettingRow label={t('hideCenterMapButton')}>
            <Switch
              checked={config.hideCenterMapButton === true}
              onChange={(evt) =>
                this.props.onSettingChange({
                  id: this.props.id,
                  config: this.props.config.set("hideCenterMapButton", evt.target.checked),
                })
              }
            />
          </SettingRow>
        </SettingSection>

        <SettingSection title={t('nearbyPlacesOverturePilot')}>
          <SettingRow label={t('offerPlacesLayer')}><Switch checked={config.enablePlaces === true} onChange={evt => this.props.onSettingChange({ id: this.props.id, config: config.set("enablePlaces", evt.target.checked) })}/></SettingRow>
          <SettingRow flow="wrap" label={t('placesFeatureserverLayerUrl')}><TextInput value={config.placesServiceUrl || ""} placeholder="https://…/FeatureServer/0" onChange={event => this.props.onSettingChange({ id: this.props.id, config: config.set("placesServiceUrl", event.target.value) })}/></SettingRow>
          {!!config.placesServiceUrl && !placesServiceUrl(config.placesServiceUrl) && <p role="status"> {t('useAnHttpsFeatureserverLayerUrlWithoutQueryParameters')} </p>}
          <p style={{ fontSize: 12, opacity: .8 }}> {t('requiresAPublishedPilotLayerPreparedWithToolsOverture')} </p>
        </SettingSection>

        <SettingSection title={t('featureDetectionLayers')}>
          <SettingRow label={t('enableTrafficSigns')}>
            <Switch checked={config.enableTrafficSigns !== false} onChange={this.onToggleTrafficSigns} />
          </SettingRow>

          <SettingRow label={t('enableMapillaryObjects')}>
            <Switch checked={config.enableMapillaryObjects !== false} onChange={this.onToggleObjects} />
          </SettingRow>

          <SettingRow>
            <span className="text" style={{ fontSize: "12px", fontStyle: "italic", marginTop: "5px", opacity: "0.3" }}>
               {t('disablingTheseWillHideTheSignAndObjectLayer')} </span>
          </SettingRow>
        </SettingSection>

        <SettingSection title={t('advancedSettings')}>
          <SettingRow label={t('enableSolarModeling')}>
            <Switch checked={config.enableSolar === true} onChange={evt => this.props.onSettingChange({ id: this.props.id, config: config.set("enableSolar", evt.target.checked) })} />
          </SettingRow>
          <SettingRow label={t('enable3dTerrain')}>
            <Switch checked={config.enable3DTerrain === true} onChange={evt => this.props.onSettingChange({ id: this.props.id, config: config.set("enable3DTerrain", evt.target.checked) })} />
          </SettingRow>
          <SettingRow>
            <span style={{ fontSize: "12px", opacity: 0.7 }}> {t('usesExistingMapTerrainOrAddsWorldElevationIn')} </span>
          </SettingRow>
          <SettingRow label={t('enableElevationProfiler')}>
            <Switch checked={config.enableElevationProfile === true} onChange={evt => this.props.onSettingChange({ id: this.props.id, config: config.set("enableElevationProfile", evt.target.checked) })} />
          </SettingRow>
          <SettingRow label={t('renderMode')}>
            <Select
              size="sm"
              // Fallback to '1' (Fill) if renderMode is undefined
              value={String(config.renderMode ?? 1)}
              onChange={(evt) =>
                this.props.onSettingChange({
                  id: this.props.id,
                  config: this.props.config.set("renderMode", parseInt(evt.target.value, 10)),
                })
              }
              style={{ width: "130px" }}
            >
              <Option value="1"> {t('fillDefault')} </Option>
              <Option value="0"> {t('letterbox')} </Option>
            </Select>
          </SettingRow>
          <SettingRow>
            <span className="text" style={{ fontSize: "11px", fontStyle: "italic", marginTop: "-5px", opacity: "0.3" }}>
              <b> {t('fill')} </b>  {t('fillsTheWindow')} <br />
              <b> {t('letterboxExtra')} </b>  {t('showsTheFullOriginalImageMayShowBlackBars')} </span>
          </SettingRow>

          <SettingRow label={t('transitionMode')}>
            <Select size="sm" value={String(config.transitionMode ?? 0)} onChange={this.onTransitionModeChange} style={{ width: "130px" }}>
              <Option value="0"> {t('smoothDefault')} </Option>
              <Option value="1"> {t('instantaneous')} </Option>
            </Select>
          </SettingRow>
          <SettingRow>
            <span className="text" style={{ fontSize: "11px", fontStyle: "italic", marginTop: "-5px", opacity: "0.3" }}>
              <b> {t('default')} </b>  {t('usesMotionBlendingBetweenFrames')} <br />
              <b> {t('instantaneousExtra')} </b>  {t('jumpsImmediatelyToTheNextFrameSnappier')} </span>
          </SettingRow>
          <SettingRow flow="wrap">
            <div className="w-100">
              <div style={{ fontWeight: 500, marginBottom: "5px" }}> {t('defaultCameraAngleNormalized01')} </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: "12px" }}> {t('horizontalX')} </span>
                <NumericInput
                  size="sm"
                  style={{ width: "80px" }}
                  value={config.cameraX}
                  min={0}
                  max={1}
                  step={0.05}
                  placeholder="0.5" // Shows 0.5 when empty
                  onChange={this.onCameraXChange}
                />
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span style={{ fontSize: "12px" }}> {t('verticalY')} </span>
                <NumericInput
                  size="sm"
                  style={{ width: "80px" }}
                  value={config.cameraY}
                  min={0}
                  max={1}
                  step={0.05}
                  placeholder="0.5" // Shows 0.5 when empty
                  onChange={this.onCameraYChange}
                />
              </div>
              <div className="text" style={{ fontSize: "11px", fontStyle: "italic", opacity: "0.3" }}>
                 {t('standardIs05ForBothRefersToCenter')} <br />
                <b> {t('x')} </b>  {t('horizontalAxisMeaning')} <br />
                <b> {t('y')} </b>  {t('verticalAxisMeaning')} </div>
            </div>
          </SettingRow>
          <SettingRow label={t('loadImageryInTiles')}>
            <Switch checked={config.imageTiling === true} onChange={this.onToggleImageTiling} />
          </SettingRow>
          <SettingRow>
            <span className="text" style={{ fontSize: "12px" }}>
               {t('compareLoadingOnYourImagesAndConnectionReopenThe')} </span>
          </SettingRow>
          <SettingRow label={t('debugMode')}>
            <Switch checked={config.debugMode === true} onChange={this.onToggleDebugMode} />
          </SettingRow>
          <SettingRow>
            <span className="text" style={{ fontSize: "12px", fontStyle: "italic", marginTop: "0px", opacity: "0.3" }}>
               {t('enablesDeveloperLoggingInTheBrowserConsoleF12')} </span>
          </SettingRow>
        </SettingSection>

        <SettingSection title={t('fieldNotesSettings')}>
          <SettingRow label={t('enterpriseNotesLayer')}>
            <Switch checked={config.sharedFieldNotesEnabled === true} onChange={event => this.props.onSettingChange({ id: this.props.id, config: config.set("sharedFieldNotesEnabled", event.target.checked) })} />
          </SettingRow>
          <SettingRow flow="wrap" label={t('editableLayerUrl')}>
            <TextInput className="w-100" placeholder="https://.../FeatureServer/0" value={config.sharedFieldNotesUrl || ""} onChange={event => this.props.onSettingChange({ id: this.props.id, config: config.set("sharedFieldNotesUrl", event.target.value.trim()) })} />
          </SettingRow>
          <SettingRow flow="wrap" label={t('readOnlyLayerViewUrlOptional')}>
            <TextInput className="w-100" placeholder="https://.../FeatureServer/0" value={config.sharedFieldNotesReadUrl || ""} onChange={event => this.props.onSettingChange({ id: this.props.id, config: config.set("sharedFieldNotesReadUrl", event.target.value.trim()) })} />
          </SettingRow>
          <SettingRow><span style={{ fontSize: 11 }}> {t('localNotesRemainAvailablePublishingIsExplicitUsersAuthenticate')} </span></SettingRow>
          <SettingRow flow="wrap">
            <div style={{ width: "100%" }}>
              <div style={{ marginBottom: "6px", fontWeight: 500 }}> {t('fieldNoteCategories')} </div>
              <div style={{ fontSize: "11px", fontStyle: "italic", opacity: 0.5, marginBottom: "8px" }}> {t('customizeTheOptionsShownWhenUsersAddAField')} </div>

              {/* Category Items List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "8px" }}>
                {this.getFieldNoteCategories().map((cat, idx) => (
                  <div key={idx} style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                    <TextInput size="sm" value={cat} onChange={(e) => this.onCategoryChange(idx, e.target.value)} style={{ flex: 1 }} />
                    <button
                      type="button"
                      onClick={() => this.onRemoveCategory(idx)}
                      title={t('removeCategory')}
                      style={{
                        width: "24px",
                        height: "24px",
                        background: "rgba(255, 0, 0, 0.1)",
                        border: "1px solid rgba(255, 0, 0, 0.3)",
                        borderRadius: "4px",
                        color: "var(--danger-color, #f44)",
                        cursor: "pointer",
                        padding: 0,
                        lineHeight: 1,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Category Row */}
              <div style={{ display: "flex", gap: "5px", marginBottom: "8px" }}>
                <TextInput
                  size="sm"
                  placeholder={t('newCategory')}
                  value={this.state.newCategoryText}
                  onChange={(e) => this.setState({ newCategoryText: e.target.value })}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      this.onAddCategory();
                    }
                  }}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={this.onAddCategory}
                  style={{
                    padding: "4px 10px",
                    background: "var(--primary-color, #05a056)",
                    border: "none",
                    borderRadius: "4px",
                    color: "#fff",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                   {t('add')} </button>
              </div>

              {/* Reset to Default Button */}
              <button
                type="button"
                onClick={this.onResetCategories}
                style={{
                  fontSize: "11px",
                  background: "none",
                  border: "none",
                  color: "var(--primary-color, #05a056)",
                  cursor: "pointer",
                  padding: 0,
                  textDecoration: "underline",
                }}
              >
                 {t('resetToDefaultCategories')} </button>
            </div>
          </SettingRow>
        </SettingSection>
        <SettingSection title={t('routing')}>
          <SettingRow>
            <div
              style={{
                width: "100%",
                fontSize: "12px",
                lineHeight: 1.4,
                opacity: 0.6,
              }}
            >
               {t('configureTheNetworkRoutingEngineUsedByCaptureRoute')} </div>
          </SettingRow>

          {/* ROUTING ENGINE */}
          <SettingRow flow="wrap">
            <div style={{ width: "100%" }}>
              <div
                style={{
                  marginBottom: "5px",
                  fontWeight: 500,
                }}
              >
                 {t('routeEngine')} </div>

              <Select size="sm" value={routingEngine} onChange={this.onRoutingEngineChange} style={{ width: "100%" }}>
                <Option value="world"> {t('esriWorldRoute')} </Option>

                <Option value="osrm"> {t('osrmOpenSource')} </Option>

                <Option value="portal"> {t('organizationPortalRoute')} </Option>

                <Option value="custom"> {t('customArcgisRouteService')} </Option>
              </Select>

              <div
                style={{
                  fontSize: "11px",
                  fontStyle: "italic",
                  marginTop: "5px",
                  opacity: 0.4,
                  lineHeight: 1.35,
                }}
              >
                {routingEngine === "world" && <> {t('usesEsriWorldRouteTheRoutingEngineMapillaryExplorer')} </>}

                {routingEngine === "osrm" && <> {t('usesTheOpenSourceOsrmRoutingEngineWithOpenstreetmap')} </>}

                {routingEngine === "portal" && (
                  <> {t('usesTheRouteServiceConfiguredByTheCurrentArcgis')} </>
                )}

                {routingEngine === "custom" && <> {t('usesAManuallyConfiguredArcgisNetworkAnalystRouteService')} </>}
              </div>
            </div>
          </SettingRow>

          {/* WORLD ROUTE AUTHENTICATION */}
          {routingEngine === "world" && (
            <SettingRow flow="wrap">
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    marginBottom: "5px",
                    fontWeight: 500,
                  }}
                >
                   {t('worldRouteAccess')} </div>

                <Select size="sm" value={routingAuthMode} onChange={this.onRoutingAuthModeChange} style={{ width: "100%" }}>
                  <Option value="auto"> {t('automaticRecommended')} </Option>

                  <Option value="api-key"> {t('apiKey')} </Option>

                  <Option value="user"> {t('arcgisUserSignIn')} </Option>
                </Select>

                <div
                  style={{
                    fontSize: "11px",
                    fontStyle: "italic",
                    marginTop: "5px",
                    opacity: 0.4,
                    lineHeight: 1.35,
                  }}
                >
                  {routingAuthMode === "auto" && (
                    <> {t('usesTheConfiguredApiKeyWhenAvailableOtherwiseThe')} </>
                  )}

                  {routingAuthMode === "api-key" && <> {t('requiresAnArcgisLocationServicesApiKeyConfiguredBy')} </>}

                  {routingAuthMode === "user" && <> {t('requiresTheUserToAuthenticateWithAnArcgisAccount')} </>}
                </div>
              </div>
            </SettingRow>
          )}

          {/* WORLD ROUTE API KEY */}
          {routingEngine === "world" && (routingAuthMode === "auto" || routingAuthMode === "api-key") && (
            <SettingRow flow="wrap">
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    marginBottom: "5px",
                    fontWeight: 500,
                  }}
                >
                   {t('routingApiKey')} </div>

                <TextInput type="password" className="w-100" placeholder={t('arcgisRoutingApiKey')} value={config.routingApiKey || ""} onChange={this.onRoutingApiKeyChange} />

                <div
                  style={{
                    fontSize: "10px",
                    fontStyle: "italic",
                    marginTop: "4px",
                    opacity: 0.4,
                    lineHeight: 1.35,
                  }}
                >
                   {t('recommendedForPublicExperiencesRestrictTheKeyToRouting')} </div>
              </div>
            </SettingRow>
          )}

          {/* OSRM SERVER */}
          {routingEngine === "osrm" && (
            <SettingRow flow="wrap">
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    marginBottom: "5px",
                    fontWeight: 500,
                  }}
                >
                   {t('osrmServer')} </div>

                <Select size="sm" value={osrmServerMode} onChange={this.onOSRMServerModeChange} style={{ width: "100%" }}>
                  <Option value="public"> {t('publicOsrmDemo')} </Option>

                  <Option value="custom"> {t('customSelfHosted')} </Option>
                </Select>

                <div
                  style={{
                    fontSize: "11px",
                    fontStyle: "italic",
                    marginTop: "5px",
                    opacity: 0.4,
                    lineHeight: 1.35,
                  }}
                >
                  {osrmServerMode === "public" && <> {t('usesRouterProjectOsrmOrgSuitableForTestingAnd')} </>}

                  {osrmServerMode === "custom" && <> {t('usesYourOwnOsrmCompatibleServerRecommendedWhenYou')} </>}
                </div>
              </div>
            </SettingRow>
          )}

          {/* CUSTOM OSRM URL */}
          {routingEngine === "osrm" && osrmServerMode === "custom" && (
            <SettingRow flow="wrap">
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    marginBottom: "5px",
                    fontWeight: 500,
                  }}
                >
                   {t('osrmServerUrl')} </div>

                <TextInput className="w-100" placeholder="https://routing.example.org" value={config.osrmServerUrl || ""} onChange={this.onOSRMServerUrlChange} />

                <div
                  style={{
                    fontSize: "10px",
                    fontStyle: "italic",
                    marginTop: "4px",
                    opacity: 0.4,
                    lineHeight: 1.35,
                  }}
                >
                   {t('enterTheOsrmBaseUrlOnlyDoNotInclude')} </div>
              </div>
            </SettingRow>
          )}

          {routingEngine === "osrm" && (
            <>
              <strong> {t('osrmOpenSourceRouting')} </strong>

              <br />

              {osrmServerMode === "public"
                ? t('publicOsrmDemoServerSelectedNoAuthenticationRequired')
                : hasCustomOSRMUrl
                  ? t('customOsrmServerConfiguredNoArcgisAuthenticationRequired')
                  : t('customOsrmServerUrlRequired')}
            </>
          )}

          {/* PORTAL ROUTING INFO */}
          {routingEngine === "portal" && (
            <SettingRow>
              <div
                style={{
                  width: "100%",
                  padding: "7px 8px",
                  borderRadius: "4px",

                  background: "rgba(243, 156, 18, 0.08)",

                  border: "1px solid rgba(243, 156, 18, 0.25)",

                  fontSize: "11px",
                  lineHeight: 1.4,
                }}
              >
                <strong> {t('organizationRoute')} </strong>
                <br />
                 {t('mapillaryExplorerWillUseTheRoutingServiceAdvertisedBy')} <br />
                <br />
                 {t('makeSureThisServiceSupportsTheRoutingBehaviorRequired')} </div>
            </SettingRow>
          )}

          {/* CUSTOM ROUTE URL */}
          {routingEngine === "custom" && (
            <SettingRow flow="wrap">
              <div style={{ width: "100%" }}>
                <div
                  style={{
                    marginBottom: "5px",
                    fontWeight: 500,
                  }}
                >
                   {t('routeServiceUrl')} </div>

                <TextInput className="w-100" placeholder="https://.../NAServer/Route" value={config.routingServiceUrl || ""} onChange={this.onRoutingServiceUrlChange} />

                <div
                  style={{
                    fontSize: "10px",
                    fontStyle: "italic",
                    marginTop: "4px",
                    opacity: 0.4,
                    lineHeight: 1.35,
                  }}
                >
                   {t('enterTheFullArcgisNetworkAnalystRouteServiceUrl')} </div>
              </div>
            </SettingRow>
          )}

          {/* STATUS */}
          <SettingRow>
            <div
              style={{
                width: "100%",
                padding: "7px 8px",

                borderRadius: "4px",

                background: routingEngine === "world" && routingAuthMode === "api-key" && !hasRoutingApiKey ? "rgba(231, 76, 60, 0.08)" : "rgba(46, 204, 113, 0.08)",

                border: routingEngine === "world" && routingAuthMode === "api-key" && !hasRoutingApiKey ? "1px solid rgba(231,76,60,.25)" : "1px solid rgba(46,204,113,.25)",

                fontSize: "11px",
                lineHeight: 1.4,
              }}
            >
              {routingEngine === "world" && routingAuthMode === "auto" && (
                <>
                  <strong> {t('esriWorldRoute')} </strong>

                  <br />

                  {hasRoutingApiKey
                    ? t('apiKeyConfiguredUsersCanRouteWithoutSigningIn')
                    : t('noApiKeyConfiguredArcgisSignInWillBe')}
                </>
              )}

              {routingEngine === "world" && routingAuthMode === "api-key" && (
                <>
                  <strong>{hasRoutingApiKey ? t('apiKeyConfigured') : t('apiKeyRequired')}</strong>
                </>
              )}

              {routingEngine === "world" && routingAuthMode === "user" && (
                <>
                  <strong> {t('arcgisUserAuthentication')} </strong>
                  <br />
                   {t('usersWillAuthenticateWhenTheyRequestCaptureRoute')} </>
              )}

              {routingEngine === "portal" && (
                <>
                  <strong> {t('organizationRouting')} </strong>
                  <br />
                   {t('thePortalSConfiguredRouteServiceWillBeDiscovered')} </>
              )}

              {routingEngine === "custom" && (
                <>
                  <strong> {t('customRoutingService')} </strong>

                  <br />

                  {config.routingServiceUrl?.trim() ? t('routeServiceUrlConfigured') : t('routeServiceUrlRequired')}
                </>
              )}
            </div>
          </SettingRow>
        </SettingSection>
      </div>
    );
  }
}

/** The editor follows builder policy, never a viewer's local language override. */
const LocalizedSetting: React.FC<AllWidgetSettingProps<IMConfig>> = props => (
 <WidgetLocaleProvider key={props.id} appLocale={props.intl?.locale} widgetId={props.id}
   defaultLanguage={props.config.widgetLanguage || 'auto'} allowUserChoice={false}>
  <SettingsCatalogProvider><Setting {...props}/></SettingsCatalogProvider>
 </WidgetLocaleProvider>
);
export default LocalizedSetting;
