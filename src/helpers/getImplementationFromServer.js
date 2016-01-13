function getImplementationFromServer(url) {
  return fetch(url)
    .catch(() => {
      return;
    });
}

export default getImplementationFromServer;