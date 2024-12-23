export interface DownloadFileOptions {
    filename?: string,
    newTab?: boolean
}

export const downloadFile = (url: string, options: DownloadFileOptions) => {
    if (options.newTab) {
        const newWindow = window.open(url, '_blank');
        if (newWindow) {
            newWindow.focus();
        }
    } else {
        const link = document.createElement('a');
        link.href = url;
        if (options.filename) {
            link.download = options.filename;
        }
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
  };
  