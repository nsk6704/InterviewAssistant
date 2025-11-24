// Professional toast notification system with MUI icons
import ErrorIcon from '@mui/icons-material/Error';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InfoIcon from '@mui/icons-material/Info';
import { createElement } from 'react';
import { createRoot } from 'react-dom/client';

let toastContainer: HTMLDivElement | null = null;

const initToastContainer = () => {
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.style.cssText = `
      position: fixed;
      top: 24px;
      right: 24px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 12px;
    `;
        document.body.appendChild(toastContainer);
    }
    return toastContainer;
};

export const showToast = (message: string, type: 'error' | 'success' | 'info' = 'info') => {
    const container = initToastContainer();

    const toast = document.createElement('div');

    const styles = {
        error: {
            bg: 'linear-gradient(135deg, #dc2626 0%, #b91c1c 100%)',
            shadow: '0 4px 16px rgba(220, 38, 38, 0.3)',
            Icon: ErrorIcon
        },
        success: {
            bg: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
            shadow: '0 4px 16px rgba(22, 163, 74, 0.3)',
            Icon: CheckCircleIcon
        },
        info: {
            bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            shadow: '0 4px 16px rgba(59, 130, 246, 0.3)',
            Icon: InfoIcon
        },
    };

    const style = styles[type];

    toast.style.cssText = `
    background: ${style.bg};
    color: white;
    padding: 16px 20px;
    border-radius: 12px;
    box-shadow: ${style.shadow};
    min-width: 320px;
    max-width: 420px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    line-height: 1.5;
    animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    cursor: pointer;
    backdrop-filter: blur(8px);
    display: flex;
    align-items: start;
    gap: 12px;
    border: 1px solid rgba(255, 255, 255, 0.2);
  `;

    // Render icon using React
    const iconContainer = document.createElement('div');
    iconContainer.style.cssText = `
    flex-shrink: 0;
    line-height: 1;
  `;
    const root = createRoot(iconContainer);
    root.render(createElement(style.Icon, { sx: { fontSize: 20 } }));

    const messageSpan = document.createElement('span');
    messageSpan.textContent = message;
    messageSpan.style.cssText = `
    flex: 1;
  `;

    toast.appendChild(iconContainer);
    toast.appendChild(messageSpan);
    container.appendChild(toast);

    // Add animations
    const style_element = document.createElement('style');
    style_element.textContent = `
    @keyframes slideIn {
      from {
        transform: translateX(440px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOut {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(440px);
        opacity: 0;
      }
    }
  `;
    if (!document.getElementById('toast-styles')) {
        style_element.id = 'toast-styles';
        document.head.appendChild(style_element);
    }

    // Auto-remove after 5 seconds with animation
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s cubic-bezier(0.5, 0, 0.75, 0)';
        setTimeout(() => {
            container.removeChild(toast);
            root.unmount();
        }, 300);
    }, 5000);

    // Click to dismiss
    toast.addEventListener('click', () => {
        toast.style.animation = 'slideOut 0.3s cubic-bezier(0.5, 0, 0.75, 0)';
        setTimeout(() => {
            if (container.contains(toast)) {
                container.removeChild(toast);
                root.unmount();
            }
        }, 300);
    });
};
