const useWindowOpener = () => {
  const openBasicWindow = (url: string) => {
    window.open(url, '_blank');
  };

  const openSecureWindow = (url: string) => {
    window.open(url, '_blank', 'noopener=yes,noreferrer=yes');
  };

  const openCustomWindow = (url: string) => {
    window.open(
      url,
      '_blank',
      'width=800,height=600,noopener=yes,noreferrer=yes,toolbar=no,menubar=no'
    );
  };

  return {
    openBasicWindow,
    openSecureWindow,
    openCustomWindow
  }
}

export default useWindowOpener;
