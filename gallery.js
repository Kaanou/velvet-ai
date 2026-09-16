/* Velvet AI — companion galleries */
(() => {
  const galleryData = {
    maya: { photos:[1,2,3,4,5,6].map(n=>`https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=900&q=85`), videos:[] },
    luna: { photos:[1,2,3,4,5,6].map(n=>`https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=85`), videos:[] },
    sofia:{ photos:[1,2,3,4,5,6].map(n=>`https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=85`), videos:[] },
    emma:{ photos:[1,2,3,4,5,6].map(n=>`https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=900&q=85`), videos:[] },
    naomi:{ photos:[1,2,3,4,5,6].map(n=>`https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=85`), videos:[] },
    jade:{ photos:[1,2,3,4,5,6].map(n=>`https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=900&q=85`), videos:[] },
    chloe:{ photos:[1,2,3,4,5,6].map(n=>`https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=900&q=90`), videos:[] },
    alice:{ photos:[1,2,3,4,5,6].map(n=>`https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=900&q=90`), videos:[] },
    ines:{ photos:[1,2,3,4,5,6].map(n=>`https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=900&q=90`), videos:[] },
    clara:{ photos:[1,2,3,4,5,6].map(n=>`https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=900&q=90`), videos:[] },
    zoe:{ photos:[1,2,3,4,5,6].map(n=>`https://images.unsplash.com/photo-1496440737103-cd596325d314?auto=format&fit=crop&w=900&q=90`), videos:[] },
    lea:{ photos:[1,2,3,4,5,6].map(n=>`https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=900&q=90`), videos:[] },
    nina:{ photos:[1,2,3,4,5,6].map(n=>`https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=900&q=90`), videos:[] },
    eva:{ photos:[1,2,3,4,5,6].map(n=>`https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=900&q=90`), videos:[] }
  };
  window.velvetGallery = id => galleryData[id] || {photos:[],videos:[]};
  window.velvetSelfiePrompt = (g, context='selfie du moment') => `Photographie photoréaliste prise avec un smartphone, femme adulte fictive ${g.name}, ${g.age} ans. ${g.bio}. ${context}. Même identité visuelle que son profil, visage cohérent, peau naturelle avec texture et petites imperfections, cheveux réalistes, expression spontanée, lumière ambiante, exposition légèrement imparfaite, perspective de téléphone crédible, profondeur de champ naturelle, arrière-plan quotidien détaillé, tenue adulte élégante et séduisante mais non explicite, aucune esthétique CGI, aucun rendu plastique, photographie documentaire moderne.`;
})();