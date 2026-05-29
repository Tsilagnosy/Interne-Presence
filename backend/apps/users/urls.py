from django.urls import path
from .views import UserListView, UserRegisterView, UserProfileView

urlpatterns = [
    path('', UserListView.as_view()),
    path('register/', UserRegisterView.as_view()),
    path('me/', UserProfileView.as_view()),
]
