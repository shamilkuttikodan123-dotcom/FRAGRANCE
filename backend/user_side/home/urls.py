from django.urls import path
from .views import MainBannerView, OtherBannerView

urlpatterns = [
    path("banners/main/", MainBannerView.as_view()),
    path("banners/main/<int:pk>/", MainBannerView.as_view()),
    path("banners/other/", OtherBannerView.as_view()),
    path("banners/other/<int:pk>/", OtherBannerView.as_view()),
]