from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from . import views

router = DefaultRouter()
router.register('categories', views.CategorieViewSet, basename='categorie')
router.register('transactions', views.TransactionViewSet, basename='transaction')
router.register('budgets', views.BudgetViewSet, basename='budget')
router.register('dettes', views.DetteViewSet, basename='dette')
router.register('factures', views.FactureViewSet, basename='facture')
router.register('alertes', views.AlerteViewSet, basename='alerte')

urlpatterns = [
    path('auth/inscription/', views.InscriptionView.as_view(), name='inscription'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('tableau-bord/', views.TableauBordView.as_view(), name='tableau_bord'),
    path('rapports/', views.RapportsView.as_view(), name='rapports'),
    path('', include(router.urls)),
]
