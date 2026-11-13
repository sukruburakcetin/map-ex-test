import { Place, placesWebsite } from './placesModel';
import { Presentation, englishPresentation } from '../../i18n/PresentationText';
import { PlaceImagery, placeImageryChoiceMeta, placeImageryDirectionLabel } from './nearbyPlaceImagery';

/** One selected tile POI. No feature collection, marker graphics or background searches. */
export class TilesPlacePopup {
  private content: HTMLDivElement | null = null;
  private abort: AbortController | null = null;
  private watch: { remove(): void } | null = null;
  constructor(private host: {
    view: any; presentation?: Presentation;
    explore(place: Place, radius: number, signal: AbortSignal): Promise<PlaceImagery[]>;
    open(image: PlaceImagery): void;
  }) {}

  show(attributes: any, location: any): void {
    this.clear();
    const view = this.host.view, lon = Number(location.longitude ?? location.x), lat = Number(location.latitude ?? location.y);
    if (!attributes?.gers_id || !Number.isFinite(lon) || !Number.isFinite(lat) || Math.abs(lon) > 180 || Math.abs(lat) > 85.051129 || view.destroyed) return;
    const l10n = this.host.presentation || englishPresentation;
    const text = (value: string) => l10n.text(value);
    const place: Place = { id: String(attributes.gers_id), name: String(attributes.place_name || attributes.gers_id),
      category: String(attributes.category || ''), group: 'services', confidence: typeof attributes.confidence === 'number' ? attributes.confidence : 0,
      address: String(attributes.address || ''), website: placesWebsite(attributes.website), release: String(attributes.data_release || ''), lon, lat };
    const content = this.content = document.createElement('div');
    content.style.cssText = 'max-width:300px;line-height:1.5';
    content.dir = l10n.locale === 'ar' ? 'rtl' : 'ltr';
    const title = document.createElement('strong'); title.textContent = place.name; content.appendChild(title);
    for (const [label, value] of [['Category', attributes.category ?? 'Not provided'], ['Confidence', attributes.confidence ?? 'Not provided'], ['Operating status', attributes.operating_status ?? 'Not provided'], ['Address', place.address]]) {
      if (value === '') continue;
      const line = document.createElement('div'); line.textContent = `${label}: ${value}`; content.appendChild(line);
    }
    if (place.website) { const link = document.createElement('a'); link.textContent = text('Website'); link.href = place.website; link.target = '_blank'; link.rel = 'noopener noreferrer'; content.appendChild(link); }
    const button = document.createElement('button'); button.type = 'button'; button.className = 'mly-text-action'; button.style.cssText = 'display:block;margin-top:8px'; button.textContent = text('Find imagery within 75 m'); content.appendChild(button);
    const status = document.createElement('p'); status.setAttribute('role', 'status'); content.appendChild(status);
    const alternatives = document.createElement('div'); content.appendChild(alternatives);
    const caveat = document.createElement('small'); caveat.textContent = text('Direction is estimated. Visibility isn’t confirmed.'); caveat.hidden = true; content.appendChild(caveat);
    const source = document.createElement('p'); source.textContent = `Overture Maps · ${place.release}`; content.appendChild(source);
    const active = () => this.content === content && !view.destroyed && view.popup?.content === content;
    let radius = 75, candidate: PlaceImagery | null = null;
    button.onclick = async () => {
      if (!active() || button.disabled) return;
      if (candidate) { this.host.open(candidate); return; }
      const controller = this.abort = new AbortController(); button.disabled = true;
      status.textContent = l10n.text('Looking within {value0} m…', { value0: String(radius) });
      try {
        const found = await this.host.explore(place, radius, controller.signal);
        if (controller.signal.aborted || !active()) return;
        if (found.length) {
          candidate = found[0]; button.textContent = l10n.text('Suggested view · {value0}', { value0: placeImageryDirectionLabel(candidate, l10n) });
          status.textContent = placeImageryChoiceMeta(candidate, l10n); caveat.hidden = false;
          for (const image of found.slice(1, 3)) {
            const option = document.createElement('button'); option.type = 'button'; option.className = 'mly-text-action'; option.style.cssText = 'display:block;margin-top:5px';
            option.textContent = `${l10n.text('Open view · {value0}', { value0: placeImageryDirectionLabel(image, l10n) })} · ${placeImageryChoiceMeta(image, l10n)}`;
            option.onclick = () => { if (active()) this.host.open(image); }; alternatives.appendChild(option);
          }
        } else if (radius === 75) {
          radius = 250; button.textContent = text('Search within 250 m'); status.textContent = text('No nearby imagery found within 75 m. Search a wider area if you’d like.');
        } else {
          button.textContent = text('Search again · within 250 m'); status.textContent = text('No suitable imagery found within 250 m. Try another place or search again later.');
        }
      } catch (error) {
        if (!controller.signal.aborted && active()) { button.textContent = l10n.text('Retry search · within {value0} m', { value0: String(radius) }); status.textContent = text('Imagery search could not finish. Please try again.'); }
      } finally {
        if (this.abort === controller) this.abort = null;
        if (active()) button.disabled = false;
      }
    };
    view.openPopup({ title: text('Nearby place'), content, location });
    this.watch = view.watch(['popup.visible', 'popup.content'], () => { if (!view.popup?.visible || view.popup?.content !== content) this.clear(); });
  }

  clear(): void {
    this.abort?.abort(); this.abort = null;
    this.watch?.remove(); this.watch = null;
    if (this.content && !this.host.view.destroyed && this.host.view.popup?.content === this.content) this.host.view.closePopup();
    this.content = null;
  }
}
