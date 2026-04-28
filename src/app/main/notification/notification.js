function ensureFallbackRoot() {
    let root = document.getElementById('humant-inline-notification-root');

    if (root) {
        return root;
    }

    root = document.createElement('div');
    root.id = 'humant-inline-notification-root';
    root.style.position = 'fixed';
    root.style.top = '24px';
    root.style.right = '24px';
    root.style.zIndex = '9999';
    root.style.display = 'grid';
    root.style.gap = '12px';
    root.style.maxWidth = '360px';

    document.body.appendChild(root);
    return root;
}

function resolveFallbackTheme(typeMsg) {
    switch ((typeMsg || '').toLowerCase()) {
        case 'success':
            return {
                background: '#e8f7ef',
                border: '#8bc5a2',
                color: '#185534'
            };
        case 'warning':
            return {
                background: '#fff4e5',
                border: '#efc38b',
                color: '#7a4d12'
            };
        case 'error':
            return {
                background: '#fdecec',
                border: '#e3a3a3',
                color: '#7f1d1d'
            };
        default:
            return {
                background: '#eef3fb',
                border: '#b7c7e6',
                color: '#1f3b63'
            };
    }
}

function showFallbackNotification(title, message, typeMsg) {
    const root = ensureFallbackRoot();
    const theme = resolveFallbackTheme(typeMsg);
    const notification = document.createElement('article');
    const heading = document.createElement('strong');
    const copy = document.createElement('div');

    notification.style.background = theme.background;
    notification.style.border = '1px solid ' + theme.border;
    notification.style.color = theme.color;
    notification.style.borderRadius = '16px';
    notification.style.boxShadow = '0 18px 45px rgba(15, 23, 42, 0.16)';
    notification.style.padding = '14px 16px';
    notification.style.fontFamily = 'Segoe UI, sans-serif';

    heading.textContent = title || 'Notice';
    heading.style.display = 'block';
    heading.style.marginBottom = '4px';
    heading.style.fontSize = '14px';

    copy.textContent = message || '';
    copy.style.fontSize = '13px';
    copy.style.lineHeight = '1.45';

    notification.appendChild(heading);
    notification.appendChild(copy);
    root.appendChild(notification);

    window.setTimeout(function () {
        notification.remove();
        if (!root.childElementCount) {
            root.remove();
        }
    }, 4500);
}

export default function showMessage(title, message, typeMsg) {
    if (typeof window !== 'undefined' && typeof window.createNotification === 'function') {
        const myNotification = window.createNotification({
            displayCloseButton: true,
            closeOnClick: true,
            positionClass: 'nfc-top-right',
            onclick: false,
            theme: typeMsg
        });

        myNotification({
            title: title,
            message: message,
        });
        return;
    }

    showFallbackNotification(title, message, typeMsg);
}