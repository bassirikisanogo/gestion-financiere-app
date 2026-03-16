"""
Commande : python manage.py generer_alertes
À lancer en cron pour générer les alertes (dépassement budget, trésorerie basse, dettes en retard).
"""
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from core.services_alertes import generer_alertes_utilisateur


class Command(BaseCommand):
    help = 'Génère les alertes pour tous les utilisateurs'

    def add_arguments(self, parser):
        parser.add_argument('--seuil', type=float, default=1000, help='Seuil trésorerie basse (F CFA)')

    def handle(self, *args, **options):
        seuil = options['seuil']
        for user in User.objects.all():
            try:
                generer_alertes_utilisateur(user, seuil_tresorerie=seuil)
                self.stdout.write(self.style.SUCCESS(f'Alertes générées pour {user.username}'))
            except Exception as e:
                self.stdout.write(self.style.ERROR(f'{user.username}: {e}'))
