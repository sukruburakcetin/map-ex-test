/** @jsx jsx */
import { React, jsx } from 'jimu-core';
import { useWidgetLocale } from '../../i18n/WidgetLocale';
import { enterpriseAccount, type EnterpriseIdentityManager } from './enterpriseAccount';
export interface EnterpriseAccountIndicatorProps { url: string; loadManager: () => Promise<EnterpriseIdentityManager>; }
/** Mounted only for the open Notes list. No polling, authentication prompt or role guesses. */
export const EnterpriseAccountIndicator = React.memo(function EnterpriseAccountIndicator({ url, loadManager }: EnterpriseAccountIndicatorProps) {
  const { t } = useWidgetLocale();
  const [account, setAccount] = React.useState<{ url: string; user: string | null } | null>(null);
  const [retry, setRetry] = React.useState(0);
  const read = React.useRef<(() => void) | null>(null);
  React.useEffect(() => {
    let disposed = false;
    let handle: { remove(): void } | undefined;
    const refresh = () => read.current?.();
    const visible = () => { if (document.visibilityState !== 'hidden') refresh(); };
    setAccount(null);
    void loadManager().then(manager => {
      if (disposed) return;
      read.current = () => { if (!disposed) setAccount({ url, user: enterpriseAccount(manager, url) }); };
      try { handle = manager.on?.('credential-create', refresh); } catch { /* Manual refresh remains available. */ }
      window.addEventListener('focus', refresh);
      document.addEventListener('visibilitychange', visible);
      refresh();
    }, () => { if (!disposed) setAccount({ url, user: null }); });
    return () => { disposed = true; read.current = null; handle?.remove(); window.removeEventListener('focus', refresh); document.removeEventListener('visibilitychange', visible); };
  }, [url, loadManager, retry]);
  const user = account?.url === url ? account.user : null;
  return <div className="mly-enterprise-account" style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '3px 8px', padding: '3px 8px', color: '#b8cfc1', font: 'inherit', fontSize: 10, minWidth: 0 }}>
    <span role="status" title={t('enterpriseAccountHint')} style={{ overflowWrap: 'anywhere', minWidth: 0 }}>{t('enterpriseAccountLabel')} <bdi>{user || t('enterpriseAccountUnknown')}</bdi></span>
    <button type="button" className="mly-text-action" onClick={() => { if (read.current) read.current(); else setRetry(value => value + 1); }} title={t('enterpriseAccountHint')} style={{ background: 'transparent', color: 'inherit', border: '1px solid #7fae944d', borderRadius: 4, padding: '2px 5px', font: 'inherit', cursor: 'pointer' }}>{t('uiRefresh')}</button>
  </div>;
});
