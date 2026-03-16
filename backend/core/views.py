"""
API REST : tableau de bord, transactions, budgets, dettes, factures, alertes.
"""
from django.db.models import Sum, Q
from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework.views import APIView
from django.contrib.auth.models import User

from .models import Categorie, Transaction, Budget, Dette, Facture, Alerte
from .serializers import (
    CategorieSerializer, TransactionSerializer, BudgetSerializer,
    DetteSerializer, FactureSerializer, AlerteSerializer, UserSerializer,
)


class CategorieViewSet(viewsets.ModelViewSet):
    serializer_class = CategorieSerializer

    def get_queryset(self):
        return Categorie.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class TransactionViewSet(viewsets.ModelViewSet):
    serializer_class = TransactionSerializer
    filterset_fields = ['type', 'date', 'categorie']

    def get_queryset(self):
        return Transaction.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class BudgetViewSet(viewsets.ModelViewSet):
    serializer_class = BudgetSerializer

    def get_queryset(self):
        return Budget.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class DetteViewSet(viewsets.ModelViewSet):
    serializer_class = DetteSerializer
    filterset_fields = ['type']

    def get_queryset(self):
        return Dette.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FactureViewSet(viewsets.ModelViewSet):
    serializer_class = FactureSerializer
    filterset_fields = ['type', 'payee']

    def get_queryset(self):
        return Facture.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class AlerteViewSet(viewsets.ModelViewSet):
    serializer_class = AlerteSerializer
    http_method_names = ['get', 'patch', 'head', 'options']

    def get_queryset(self):
        return Alerte.objects.filter(user=self.request.user)

    @action(detail=True, methods=['patch'])
    def marquer_lue(self, request, pk=None):
        alerte = self.get_object()
        alerte.lue = True
        alerte.save()
        return Response(AlerteSerializer(alerte).data)


class InscriptionView(APIView):
    """Inscription d'un nouvel utilisateur (endpoint public)."""
    permission_classes = []  # pas d'auth requise

    def post(self, request):
        username = request.data.get('username')
        password = request.data.get('password')
        email = request.data.get('email', '')
        if not username or not password:
            return Response(
                {'erreur': 'username et password requis'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        if User.objects.filter(username=username).exists():
            return Response(
                {'erreur': "Ce nom d'utilisateur existe déjà"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        user = User.objects.create_user(username=username, password=password, email=email)
        return Response(UserSerializer(user).data, status=status.HTTP_201_CREATED)


class TableauBordView(APIView):
    """Vue agrégée : trésorerie, résumé du mois, alertes."""
    def get(self, request):
        user = request.user
        today = timezone.now().date()

        # Trésorerie globale (toutes les transactions)
        entrees = Transaction.objects.filter(user=user, type='entree').aggregate(
            total=Sum('montant'))['total'] or 0
        sorties = Transaction.objects.filter(user=user, type='sortie').aggregate(
            total=Sum('montant'))['total'] or 0
        tresorerie = float(entrees - sorties)

        # Ce mois
        debut_mois = today.replace(day=1)
        entrees_mois = Transaction.objects.filter(
            user=user, type='entree', date__gte=debut_mois, date__lte=today
        ).aggregate(total=Sum('montant'))['total'] or 0
        sorties_mois = Transaction.objects.filter(
            user=user, type='sortie', date__gte=debut_mois, date__lte=today
        ).aggregate(total=Sum('montant'))['total'] or 0

        # Alertes non lues
        alertes = Alerte.objects.filter(user=user, lue=False).order_by('-created_at')[:10]
        alertes_data = AlerteSerializer(alertes, many=True).data

        return Response({
            'tresorerie': round(tresorerie, 2),
            'entrees_mois': round(float(entrees_mois), 2),
            'sorties_mois': round(float(sorties_mois), 2),
            'solde_mois': round(float(entrees_mois - sorties_mois), 2),
            'alertes': alertes_data,
        })


class RapportsView(APIView):
    """Rapports : journalier, mensuel (résumés)."""
    def get(self, request):
        user = request.user
        periode = request.query_params.get('periode', 'mois')  # jour | mois
        annee = request.query_params.get('annee', timezone.now().year)
        mois = request.query_params.get('mois', timezone.now().month)

        if periode == 'jour':
            date_jour = timezone.now().date()
            entrees = Transaction.objects.filter(
                user=user, type='entree', date=date_jour
            ).aggregate(total=Sum('montant'))['total'] or 0
            sorties = Transaction.objects.filter(
                user=user, type='sortie', date=date_jour
            ).aggregate(total=Sum('montant'))['total'] or 0
            transactions = Transaction.objects.filter(
                user=user, date=date_jour
            ).order_by('-created_at')[:50]
            libelle_periode = str(date_jour)
        else:
            annee, mois = int(annee), int(mois)
            debut = timezone.datetime(annee, mois, 1).date()
            fin = timezone.datetime(annee + 1, 1, 1).date() if mois == 12 else timezone.datetime(annee, mois + 1, 1).date()
            entrees = Transaction.objects.filter(
                user=user, type='entree', date__gte=debut, date__lt=fin
            ).aggregate(total=Sum('montant'))['total'] or 0
            sorties = Transaction.objects.filter(
                user=user, type='sortie', date__gte=debut, date__lt=fin
            ).aggregate(total=Sum('montant'))['total'] or 0
            transactions = Transaction.objects.filter(
                user=user, date__gte=debut, date__lt=fin
            ).order_by('-date', '-created_at')[:200]
            libelle_periode = f"{annee}-{int(mois):02d}"

        data = {
            'periode': periode,
            'libelle_periode': libelle_periode,
            'entrees': round(float(entrees), 2),
            'sorties': round(float(sorties), 2),
            'solde': round(float(entrees - sorties), 2),
            'transactions': TransactionSerializer(transactions, many=True).data,
        }
        return Response(data)
