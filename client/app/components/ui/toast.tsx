'use client';

import { toast } from 'react-toastify';

const toastConfig = {
  position: "top-right" as const,
  autoClose: 3000,
  hideProgressBar: false, 
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "light" as const,
};

type ToastType = 'success' | 'error' | 'warning' | 'info';

export const showToast = (type: ToastType, message: string) => {
  if (typeof window !== 'undefined') {
    toast[type](message, {
      ...toastConfig,
      toastId: `${type}-${message}`,
    });
  }
};

export const successToast = (message: string) => showToast('success', message);
export const errorToast = (message: string) => showToast('error', message);
export const warningToast = (message: string) => showToast('warning', message);
export const infoToast = (message: string) => showToast('info', message);