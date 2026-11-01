import type { Messages } from './messages';
import type { SettingsMessages } from './settingsMessages';
import type { WidgetLanguage } from './core';
/** Only first-paint splash and language controls are eager; full catalogs stay lazy. */
export const startupMessages: Partial<Record<WidgetLanguage,Partial<Messages>>> = {
  "tr": {
    "uiMapillaryExplorer": "Mapillary Explorer",
    "uiAWiderWorldOneStreetAtATime": "Daha geniş bir dünya. Her seferinde yeni bir sokak.",
    "uiFindYourPointOfView": "Kendi bakış açınızı bulun.",
    "uiStreetImageryConnectedByTheMap": "Sokak görüntüleri, haritayla bağlantılı.",
    "uiStartExploring": "Keşfetmeye başla",
    "uiReadyToExplore": "Keşfetmeye hazır",
    "uiPreparingYourTools": "Araçlar hazırlanıyor",
    "language": "Dil",
    "automatic": "Bileşen varsayılanı",
    "languageLoading": "Dil yükleniyor…",
    "languageError": "Dil yüklenemedi. İngilizce gösteriliyor.",
    "retryLanguage": "Dili yeniden indir"
  },
  "es": {
    "uiMapillaryExplorer": "Mapillary Explorer",
    "uiAWiderWorldOneStreetAtATime": "Un mundo más amplio. Calle a calle.",
    "uiFindYourPointOfView": "Encuentra tu punto de vista.",
    "uiStreetImageryConnectedByTheMap": "Imágenes de calle conectadas por el mapa.",
    "uiStartExploring": "Empezar a explorar",
    "uiReadyToExplore": "Listo para explorar",
    "uiPreparingYourTools": "Preparando tus herramientas",
    "language": "Idioma",
    "automatic": "Predeterminado del widget",
    "languageLoading": "Cargando idioma…",
    "languageError": "No se pudo cargar el idioma. Se muestra el inglés.",
    "retryLanguage": "Reintentar descarga del idioma"
  }
};
export const startupSettings: Partial<Record<WidgetLanguage,Partial<SettingsMessages>>> = {
  "tr": {
    "source": "Kaynak",
    "selectMapWidget": "Harita Bileşeni Seç",
    "languagePilot": "Dil",
    "defaultWidgetLanguage": "Varsayılan Bileşen Dili",
    "appLanguage": "Uygulama dili",
    "allowUsersToChangeLanguage": "Kullanıcıların Dili Değiştirmesine İzin Ver",
    "generalSettings": "Genel Ayarlar",
    "appearanceSettings": "Görünüm Ayarları",
    "advancedSettings": "Gelişmiş Ayarlar",
    "fieldNotesSettings": "Saha Notları Ayarları",
    "routing": "Rota Oluşturma"
  },
  "es": {
    "source": "Origen",
    "selectMapWidget": "Seleccionar Widget de Mapa",
    "languagePilot": "Idioma",
    "defaultWidgetLanguage": "Idioma Predeterminado del Widget",
    "appLanguage": "Idioma de la aplicación",
    "allowUsersToChangeLanguage": "Permitir que los Usuarios Cambien el Idioma",
    "generalSettings": "Configuración General",
    "appearanceSettings": "Configuración de Apariencia",
    "advancedSettings": "Configuración Avanzada",
    "fieldNotesSettings": "Configuración de Notas de Campo",
    "routing": "Rutas"
  }
};
const names:Record<WidgetLanguage,Record<WidgetLanguage,string>>={en:{en:'English',tr:'Turkish',es:'Spanish'},tr:{en:'İngilizce',tr:'Türkçe',es:'İspanyolca'},es:{en:'Inglés',tr:'Turco',es:'Español'}};
export function languageName(locale:WidgetLanguage,language:WidgetLanguage):string{return names[locale][language]}
