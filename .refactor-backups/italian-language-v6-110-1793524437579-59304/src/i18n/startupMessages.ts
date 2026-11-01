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
  },
  "fr": {
    "uiMapillaryExplorer": "Mapillary Explorer",
    "uiAWiderWorldOneStreetAtATime": "Un monde plus vaste. Une rue à la fois.",
    "uiFindYourPointOfView": "Trouvez votre point de vue.",
    "uiStreetImageryConnectedByTheMap": "Des images de rue reliées par la carte.",
    "uiStartExploring": "Commencer l’exploration",
    "uiReadyToExplore": "Prêt à explorer",
    "uiPreparingYourTools": "Préparation de vos outils",
    "language": "Langue",
    "automatic": "Valeur par défaut du widget",
    "languageLoading": "Chargement de la langue…",
    "languageError": "Impossible de charger la langue. L’anglais est affiché.",
    "retryLanguage": "Relancer le téléchargement de la langue"
  },
  "de": {
    "uiMapillaryExplorer": "Mapillary Explorer",
    "uiAWiderWorldOneStreetAtATime": "Eine größere Welt. Straße für Straße.",
    "uiFindYourPointOfView": "Entdecken Sie Ihre Perspektive.",
    "uiStreetImageryConnectedByTheMap": "Straßenaufnahmen, verbunden durch die Karte.",
    "uiStartExploring": "Erkundung starten",
    "uiReadyToExplore": "Bereit zum Erkunden",
    "uiPreparingYourTools": "Werkzeuge werden vorbereitet",
    "language": "Sprache",
    "automatic": "Widget-Vorgabe",
    "languageLoading": "Sprache wird geladen…",
    "languageError": "Sprache konnte nicht geladen werden. Englisch wird angezeigt.",
    "retryLanguage": "Sprachdownload erneut versuchen"
  },
  "pt-BR": {
    "uiMapillaryExplorer": "Mapillary Explorer",
    "uiAWiderWorldOneStreetAtATime": "Um mundo mais amplo. Uma rua de cada vez.",
    "uiFindYourPointOfView": "Encontre seu ponto de vista.",
    "uiStreetImageryConnectedByTheMap": "Imagens de rua conectadas pelo mapa.",
    "uiStartExploring": "Começar a explorar",
    "uiReadyToExplore": "Pronto para explorar",
    "uiPreparingYourTools": "Preparando suas ferramentas",
    "language": "Idioma",
    "automatic": "Padrão do widget",
    "languageLoading": "Carregando idioma…",
    "languageError": "Não foi possível carregar o idioma. O inglês é exibido.",
    "retryLanguage": "Tentar baixar o idioma novamente"
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
  },
  "fr": {
    "source": "Source",
    "selectMapWidget": "Sélectionner le Widget Carte",
    "languagePilot": "Langue",
    "defaultWidgetLanguage": "Langue par Défaut du Widget",
    "appLanguage": "Langue de l’application",
    "allowUsersToChangeLanguage": "Autoriser les Utilisateurs à Changer de Langue",
    "generalSettings": "Paramètres Généraux",
    "appearanceSettings": "Paramètres d’Apparence",
    "advancedSettings": "Paramètres Avancés",
    "fieldNotesSettings": "Paramètres des Notes de Terrain",
    "routing": "Itinéraires"
  },
  "de": {
    "source": "Quelle",
    "selectMapWidget": "Karten-Widget auswählen",
    "languagePilot": "Sprache",
    "defaultWidgetLanguage": "Standard-Widgetsprache",
    "appLanguage": "Anwendungssprache",
    "allowUsersToChangeLanguage": "Sprachwechsel durch Benutzer erlauben",
    "generalSettings": "Allgemeine Einstellungen",
    "appearanceSettings": "Darstellungseinstellungen",
    "advancedSettings": "Erweiterte Einstellungen",
    "fieldNotesSettings": "Feldnotiz-Einstellungen",
    "routing": "Routenplanung"
  },
  "pt-BR": {
    "source": "Origem",
    "selectMapWidget": "Selecionar Widget de Mapa",
    "languagePilot": "Idioma",
    "defaultWidgetLanguage": "Idioma Padrão do Widget",
    "appLanguage": "Idioma do aplicativo",
    "allowUsersToChangeLanguage": "Permitir que os Usuários Alterem o Idioma",
    "generalSettings": "Configurações Gerais",
    "appearanceSettings": "Configurações de Aparência",
    "advancedSettings": "Configurações Avançadas",
    "fieldNotesSettings": "Configurações de Notas de Campo",
    "routing": "Rotas"
  }
};
const names:Record<WidgetLanguage,Record<WidgetLanguage,string>>={"en":{"en":"English","tr":"Turkish","es":"Spanish","fr":"French","de":"German","pt-BR":"Portuguese (Brazil)"},"tr":{"en":"İngilizce","tr":"Türkçe","es":"İspanyolca","fr":"Fransızca","de":"Almanca","pt-BR":"Portekizce (Brezilya)"},"es":{"en":"Inglés","tr":"Turco","es":"Español","fr":"Francés","de":"Alemán","pt-BR":"Portugués (Brasil)"},"fr":{"en":"Anglais","tr":"Turc","es":"Espagnol","fr":"Français","de":"Allemand","pt-BR":"Portugais (Brésil)"},"de":{"en":"Englisch","tr":"Türkisch","es":"Spanisch","fr":"Französisch","de":"Deutsch","pt-BR":"Portugiesisch (Brasilien)"},"pt-BR":{"en":"Inglês","tr":"Turco","es":"Espanhol","fr":"Francês","de":"Alemão","pt-BR":"Português (Brasil)"}};
export function languageName(locale:WidgetLanguage,language:WidgetLanguage):string{return names[locale][language]}
