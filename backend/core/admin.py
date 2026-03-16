from django.contrib import admin
from .models import Categorie, Transaction, Budget, Dette, Facture, Alerte

@admin.register(Categorie)
class CategorieAdmin(admin.ModelAdmin):
    list_display = ('nom', 'type', 'user')

@admin.register(Transaction)
class TransactionAdmin(admin.ModelAdmin):
    list_display = ('libelle', 'type', 'montant', 'date', 'user')
    list_filter = ('type', 'date')

@admin.register(Budget)
class BudgetAdmin(admin.ModelAdmin):
    list_display = ('categorie', 'montant_prevu', 'periode', 'annee', 'mois', 'user')

@admin.register(Dette)
class DetteAdmin(admin.ModelAdmin):
    list_display = ('libelle', 'type', 'montant', 'date_echance', 'user')

@admin.register(Facture)
class FactureAdmin(admin.ModelAdmin):
    list_display = ('numero', 'libelle', 'montant', 'type', 'payee', 'user')

@admin.register(Alerte)
class AlerteAdmin(admin.ModelAdmin):
    list_display = ('titre', 'type', 'severite', 'lue', 'created_at', 'user')
