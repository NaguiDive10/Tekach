export default function PrivacyPage() {
  return (
    <article className="mx-auto max-w-2xl text-sm leading-relaxed">
      <h1 className="text-2xl font-light text-stone-900">
        Politique de confidentialité & RGPD
      </h1>
      <p className="text-stone-600">
        Tekach traite les données nécessaires au traitement des commandes et,
        avec votre consentement distinct, aux relances par email et appel
        téléphonique automatisé concernant un panier non finalisé.
      </p>
      <h2 className="mt-8 text-lg font-medium">Finalités</h2>
      <ul className="list-disc text-stone-600">
        <li>Exécution du contrat (commande, facturation, livraison).</li>
        <li>
          Relances panier abandonné (email / appel IA) uniquement si case
          dédiée cochée.
        </li>
        <li>Mesure d’audience et analyse du tunnel (événements techniques).</li>
      </ul>
      <h2 className="mt-8 text-lg font-medium">Durée de conservation</h2>
      <p className="text-stone-600">
        Données de commande : durée légale comptable. Données de relance :
        suppression ou anonymisation sous 24 mois après dernier contact, sauf
        opposition ou suppression demandée.
      </p>
      <h2 className="mt-8 text-lg font-medium">Vos droits</h2>
      <p className="text-stone-600">
        Accès, rectification, effacement, limitation, portabilité, opposition —
        contact : privacy@tekach.demo (à remplacer par votre DPO / contact
        réel).
      </p>
    </article>
  );
}
