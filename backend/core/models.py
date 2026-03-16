"""
Modèles pour la gestion financière : transactions, budgets, dettes, factures, alertes.
"""
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone


class Categorie(models.Model):
    """Catégorie pour classer les entrées/sorties (ex: Ventes, Salaires, Fournitures)."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='categories')
    nom = models.CharField(max_length=100)
    type_choix = [('entree', 'Entrée'), ('sortie', 'Sortie')]
    type = models.CharField(max_length=10, choices=type_choix)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ('user', 'nom', 'type')
        ordering = ['nom']

    def __str__(self):
        return f"{self.nom} ({self.get_type_display()})"


class Transaction(models.Model):
    """Enregistrement d'une entrée ou sortie d'argent."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='transactions')
    type_choix = [('entree', 'Entrée'), ('sortie', 'Sortie')]
    type = models.CharField(max_length=10, choices=type_choix)
    montant = models.DecimalField(max_digits=12, decimal_places=2)
    libelle = models.CharField(max_length=255)
    categorie = models.ForeignKey(
        Categorie, on_delete=models.SET_NULL, null=True, blank=True, related_name='transactions'
    )
    date = models.DateField(default=timezone.now)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date', '-created_at']

    def __str__(self):
        return f"{self.get_type_display()} {self.montant} - {self.libelle}"


class Budget(models.Model):
    """Budget prévisionnel par catégorie (pour alertes de dépassement)."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='budgets')
    categorie = models.ForeignKey(Categorie, on_delete=models.CASCADE, related_name='budgets')
    montant_prevu = models.DecimalField(max_digits=12, decimal_places=2)
    periode_choix = [('mois', 'Mensuel'), ('trimestre', 'Trimestriel'), ('annee', 'Annuel')]
    periode = models.CharField(max_length=20, choices=periode_choix, default='mois')
    annee = models.IntegerField()
    mois = models.IntegerField(null=True, blank=True)  # 1-12 pour mensuel
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-annee', '-mois']
        unique_together = ('user', 'categorie', 'annee', 'mois', 'periode')

    def __str__(self):
        return f"Budget {self.categorie.nom} - {self.annee}/{self.mois or ''}"


class Dette(models.Model):
    """Dettes à recevoir (créances) ou à payer."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='dettes')
    type_choix = [('a_recevoir', 'À recevoir'), ('a_payer', 'À payer')]
    type = models.CharField(max_length=20, choices=type_choix)
    libelle = models.CharField(max_length=255)
    montant = models.DecimalField(max_digits=12, decimal_places=2)
    date_echance = models.DateField(null=True, blank=True)
    partiellement_paye = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['date_echance', '-created_at']

    @property
    def restant(self):
        return self.montant - self.partiellement_paye

    def __str__(self):
        return f"{self.get_type_display()} - {self.libelle} ({self.montant})"


class Facture(models.Model):
    """Facture (entrée ou sortie) liée éventuellement à une transaction."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='factures')
    numero = models.CharField(max_length=100)
    libelle = models.CharField(max_length=255)
    montant = models.DecimalField(max_digits=12, decimal_places=2)
    type_choix = [('client', 'Facture client'), ('fournisseur', 'Facture fournisseur')]
    type = models.CharField(max_length=20, choices=type_choix)
    date_emission = models.DateField(null=True, blank=True)
    date_echeance = models.DateField(null=True, blank=True)
    payee = models.BooleanField(default=False)
    transaction = models.OneToOneField(
        Transaction, on_delete=models.SET_NULL, null=True, blank=True, related_name='facture'
    )
    notes = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-date_emission', '-created_at']

    def __str__(self):
        return f"{self.numero} - {self.libelle}"


class Alerte(models.Model):
    """Alertes intelligentes (dépassement budget, trésorerie basse, client en retard)."""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='alertes')
    type_choix = [
        ('depassement_budget', 'Dépassement de budget'),
        ('tresorerie_basse', 'Trésorerie basse'),
        ('dette_retard', 'Dette / client en retard'),
        ('echeance_proche', 'Échéance proche'),
    ]
    type = models.CharField(max_length=30, choices=type_choix)
    titre = models.CharField(max_length=200)
    message = models.TextField()
    severite_choix = [('info', 'Info'), ('attention', 'Attention'), ('critique', 'Critique')]
    severite = models.CharField(max_length=20, choices=severite_choix, default='attention')
    lue = models.BooleanField(default=False)
    lien_objet = models.CharField(max_length=100, blank=True)  # ex: budget_12, dette_5
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.get_type_display()}: {self.titre}"
