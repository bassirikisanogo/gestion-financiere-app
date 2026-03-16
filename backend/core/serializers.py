from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Categorie, Transaction, Budget, Dette, Facture, Alerte


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']


class CategorieSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categorie
        fields = ['id', 'nom', 'type', 'created_at']
        read_only_fields = ['created_at']


class TransactionSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)

    class Meta:
        model = Transaction
        fields = [
            'id', 'type', 'montant', 'libelle', 'categorie', 'categorie_nom',
            'date', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at']


class BudgetSerializer(serializers.ModelSerializer):
    categorie_nom = serializers.CharField(source='categorie.nom', read_only=True)

    class Meta:
        model = Budget
        fields = [
            'id', 'categorie', 'categorie_nom', 'montant_prevu', 'periode',
            'annee', 'mois', 'created_at'
        ]
        read_only_fields = ['created_at']


class DetteSerializer(serializers.ModelSerializer):
    restant = serializers.DecimalField(max_digits=12, decimal_places=2, read_only=True)

    class Meta:
        model = Dette
        fields = [
            'id', 'type', 'libelle', 'montant', 'restant', 'partiellement_paye',
            'date_echance', 'notes', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']


class FactureSerializer(serializers.ModelSerializer):
    class Meta:
        model = Facture
        fields = [
            'id', 'numero', 'libelle', 'montant', 'type', 'date_emission',
            'date_echeance', 'payee', 'transaction', 'notes', 'created_at'
        ]
        read_only_fields = ['created_at']


class AlerteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alerte
        fields = [
            'id', 'type', 'titre', 'message', 'severite', 'lue',
            'lien_objet', 'created_at'
        ]
        read_only_fields = ['created_at']
