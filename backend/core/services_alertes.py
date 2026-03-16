"""
Génération d'alertes intelligentes : dépassement budget, trésorerie basse, dettes en retard.
À appeler périodiquement (cron ou tâche planifiée) ou après une transaction.
"""
from django.db.models import Sum, F
from django.utils import timezone
from decimal import Decimal

from .models import Transaction, Budget, Dette, Alerte


def creer_alerte(user, type_alerte, titre, message, severite='attention', lien_objet=''):
    Alerte.objects.get_or_create(
        user=user,
        type=type_alerte,
        titre=titre,
        message=message,
        severite=severite,
        lien_objet=lien_objet,
        defaults={'lue': False},
    )


def verifier_depassement_budget(user):
    """Vérifie les budgets du mois en cours et crée des alertes si dépassement."""
    today = timezone.now().date()
    budgets = Budget.objects.filter(
        user=user, annee=today.year, mois=today.month, periode='mois'
    )
    for b in budgets:
        depense = Transaction.objects.filter(
            user=user, type='sortie', categorie=b.categorie,
            date__year=today.year, date__month=today.month
        ).aggregate(total=Sum('montant'))['total'] or Decimal('0')
        if depense >= b.montant_prevu:
            creer_alerte(
                user,
                'depassement_budget',
                f"Budget dépassé : {b.categorie.nom}",
                f"Le budget de {b.montant_prevu} F CFA pour '{b.categorie.nom}' a été atteint ou dépassé (dépenses : {depense} F CFA).",
                'attention',
                f'budget_{b.id}',
            )


def verifier_tresorerie_basse(user, seuil=1000):
    """Alerte si la trésorerie tombe sous le seuil (ex. 1000 F CFA)."""
    entrees = Transaction.objects.filter(user=user, type='entree').aggregate(
        total=Sum('montant'))['total'] or Decimal('0')
    sorties = Transaction.objects.filter(user=user, type='sortie').aggregate(
        total=Sum('montant'))['total'] or Decimal('0')
    tresorerie = float(entrees - sorties)
    if tresorerie < seuil:
        creer_alerte(
            user,
            'tresorerie_basse',
            'Trésorerie basse',
            f"Votre trésorerie actuelle est de {tresorerie:.2f} F CFA (seuil d'alerte : {seuil} F CFA). Pensez à anticiper les échéances.",
            'critique' if tresorerie < 0 else 'attention',
        )


def verifier_dettes_retard(user):
    """Alerte pour dettes à échéance dépassée ou créances en retard."""
    today = timezone.now().date()
    dettes_retard = Dette.objects.filter(
        user=user, date_echance__lt=today, date_echance__isnull=False
    ).filter(partiellement_paye__lt=F('montant'))
    for d in dettes_retard:
        creer_alerte(
            user,
            'dette_retard',
            f"{'Créance' if d.type == 'a_recevoir' else 'Dette'} en retard : {d.libelle}",
            f"Montant restant : {d.restant} F CFA. Échéance était le {d.date_echance}. Pensez à relancer.",
            'attention',
            f'dette_{d.id}',
        )


def generer_alertes_utilisateur(user, seuil_tresorerie=1000):
    """Lance toutes les vérifications d'alertes pour un utilisateur."""
    verifier_depassement_budget(user)
    verifier_tresorerie_basse(user, seuil=seuil_tresorerie)
    verifier_dettes_retard(user)
