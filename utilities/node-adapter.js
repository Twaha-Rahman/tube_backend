module.exports = function nodeEndpoint(nep) {
  const listeners = new WeakMap();
  return {
    postMessage: nep.postMessage.bind(nep),
    addEventListener: (_, eh) => {
      const l = (data) => {
        if ('handleEvent' in eh) {
          eh.handleEvent({ data });
        } else {
          eh({ data });
        }
      };
      nep.on('message', l);
      listeners.set(eh, l);
    },
    removeEventListener: (_, eh) => {
      const l = listeners.get(eh);
      if (!l) {
        return;
      }
      nep.off('message', l);
      listeners.delete(eh);
    },
    start: nep.start && nep.start.bind(nep),
  };
};
