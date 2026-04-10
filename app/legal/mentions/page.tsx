export default function LegalNoticePage() {
  return (
    <article className="mx-auto max-w-2xl text-sm text-stone-600">
      <h1 className="text-2xl font-light text-stone-900">Mentions légales</h1>
      <p className="mt-4">
        <strong className="text-stone-800">Éditeur :</strong> Tekach (démonstration
        technique — informations à compléter : raison sociale, siège, RCS).
      </p>
      <p className="mt-4">
        <strong className="text-stone-800">Hébergement :</strong> selon votre
        déploiement (Vercel, Firebase Hosting, etc.).
      </p>
      <p className="mt-4">
        Les appels automatisés doivent respecter la réglementation en vigueur
        (consentement, identification de l’appelant, possibilité de refus).
      </p>
    </article>
  );
}
