/* Velvet AI — modèle dédié par usage
   Chat/conversation: Unity
   Selfies/photos: FLUX
   Ce module expose la configuration sans modifier la clé API. */
(() => {
  window.VELVET_MODELS = Object.freeze({ chat: 'unity', image: 'flux' });
  window.VELVET_MODEL_ROUTING = Object.freeze({
    chat: 'Unity',
    images: 'FLUX'
  });
})();
